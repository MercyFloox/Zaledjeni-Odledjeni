from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import socketio
import bcrypt
import jwt
from bson import ObjectId
import random
import string

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'frozen_game')]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'frozen-game-secret-key-2025')
JWT_ALGORITHM = "HS256"

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

# Create FastAPI app
app = FastAPI(title="Zaledjen-Odledjen Game API")
api_router = APIRouter(prefix="/api")

# Wrap with Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# In-memory game state
active_games: Dict[str, Dict] = {}
player_connections: Dict[str, str] = {}  # sid -> player_id

# ==================== MODELS ====================

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    coins: int = 0
    gems: int = 0
    is_premium: bool = False
    subscription_type: Optional[str] = None
    owned_powers: List[str] = []
    owned_skins: List[str] = []
    equipped_skin: str = "default"
    stats: Dict[str, Any] = {}
    created_at: datetime

class GameRoom(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    name: str
    host_id: str
    players: List[Dict] = []
    status: str = "waiting"  # waiting, playing, finished
    current_mraz: Optional[str] = None
    frozen_players: List[str] = []
    settings: Dict = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CreateRoomRequest(BaseModel):
    name: str
    max_players: int = 10
    is_private: bool = False

class JoinRoomRequest(BaseModel):
    room_code: str

class ShopItem(BaseModel):
    id: str
    name: str
    description: str
    type: str  # power, skin, bundle
    price_coins: int = 0
    price_gems: int = 0
    price_real: float = 0.0
    icon: str = ""
    rarity: str = "common"  # common, rare, epic, legendary
    effect: Optional[Dict] = None

class PurchaseRequest(BaseModel):
    item_id: str
    currency: str = "coins"  # coins, gems, real

class SubscriptionRequest(BaseModel):
    plan: str  # monthly, yearly

# ==================== HELPERS ====================

def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except:
        return None

async def get_current_user(token: str) -> Optional[dict]:
    user_id = decode_token(token)
    if not user_id:
        return None
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return user

# ==================== SHOP DATA ====================

SHOP_ITEMS = [
    # Powers
    {
        "id": "super_freeze",
        "name": "Super Freeze",
        "description": "Zamrzni bilo koga trenutno sa udaljenosti do 5m!",
        "type": "power",
        "price_coins": 500,
        "price_gems": 50,
        "icon": "snowflake",
        "rarity": "epic",
        "effect": {"range": 5, "instant": True}
    },
    {
        "id": "ultra_thaw",
        "name": "Ultra Thaw",
        "description": "Automatski se odledi nakon 5 sekundi!",
        "type": "power",
        "price_coins": 300,
        "price_gems": 30,
        "icon": "fire",
        "rarity": "rare",
        "effect": {"auto_thaw": 5}
    },
    {
        "id": "shield",
        "name": "Shield",
        "description": "Zastitni stit - ne mozes biti zaledjen 10 sekundi!",
        "type": "power",
        "price_coins": 400,
        "price_gems": 40,
        "icon": "shield",
        "rarity": "epic",
        "effect": {"immunity": 10}
    },
    {
        "id": "second_chance",
        "name": "Second Chance",
        "description": "Imas 2 sekunde da pobegnes nakon dodira!",
        "type": "power",
        "price_coins": 250,
        "price_gems": 25,
        "icon": "clock",
        "rarity": "rare",
        "effect": {"escape_time": 2}
    },
    {
        "id": "ghost_mode",
        "name": "Ghost Mode",
        "description": "Prolazis kroz igrace bez zamrzavanja 15 sekundi!",
        "type": "power",
        "price_coins": 600,
        "price_gems": 60,
        "icon": "ghost",
        "rarity": "legendary",
        "effect": {"ghost": 15}
    },
    # Skins
    {
        "id": "skin_fire",
        "name": "Vatreni Skin",
        "description": "Specijalna vatrena animacija i zvukovi!",
        "type": "skin",
        "price_coins": 1000,
        "price_gems": 100,
        "icon": "fire",
        "rarity": "epic"
    },
    {
        "id": "skin_ice_king",
        "name": "Ice King",
        "description": "Kraljevski ledeni izgled sa krunom!",
        "type": "skin",
        "price_coins": 1500,
        "price_gems": 150,
        "icon": "crown",
        "rarity": "legendary"
    },
    {
        "id": "skin_neon",
        "name": "Neon Glow",
        "description": "Svetleci neon efekti!",
        "type": "skin",
        "price_coins": 800,
        "price_gems": 80,
        "icon": "flash",
        "rarity": "rare"
    },
    {
        "id": "skin_rainbow",
        "name": "Rainbow",
        "description": "Dugine boje koje se menjaju!",
        "type": "skin",
        "price_coins": 2000,
        "price_gems": 200,
        "icon": "color-palette",
        "rarity": "legendary"
    },
]

PREMIUM_FEATURES = {
    "basic": {
        "price": 2.99,
        "features": ["no_ads", "private_rooms", "basic_stats"]
    },
    "pro_monthly": {
        "price": 4.99,
        "features": ["no_ads", "private_rooms", "full_stats", "premium_skins", "xp_boost", "priority_matching", "special_badge"]
    },
    "pro_yearly": {
        "price": 39.99,
        "features": ["no_ads", "private_rooms", "full_stats", "premium_skins", "xp_boost", "priority_matching", "special_badge", "exclusive_yearly_skin"]
    }
}

# ==================== HEALTH CHECK ====================

import time

# Store server start time
SERVER_START_TIME = time.time()

@api_router.get("/health")
async def health_check():
    """Health check endpoint with MongoDB connectivity test"""
    try:
        # Test MongoDB connection with ping
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        db_status = "disconnected"
    
    # Calculate uptime
    uptime_seconds = int(time.time() - SERVER_START_TIME)
    
    return {
        "status": "ok",
        "database": db_status,
        "uptime": uptime_seconds,
        "version": "1.0"
    }

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing:
        raise HTTPException(status_code=400, detail="Korisnik vec postoji")
    
    # Create user
    user_doc = {
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "coins": 100,  # Starting coins
        "gems": 10,    # Starting gems
        "is_premium": False,
        "subscription_type": None,
        "owned_powers": [],
        "owned_skins": ["default"],
        "equipped_skin": "default",
        "stats": {
            "games_played": 0,
            "games_won": 0,
            "times_frozen": 0,
            "times_unfrozen_others": 0,
            "times_as_mraz": 0,
            "total_play_time": 0,
            "longest_survival": 0,
            "xp": 0,
            "level": 1
        },
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    token = create_token(str(result.inserted_id))
    
    return {
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "username": user.username,
            "email": user.email,
            "coins": user_doc["coins"],
            "gems": user_doc["gems"],
            "is_premium": False,
            "stats": user_doc["stats"]
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Pogresni podaci za prijavu")
    
    token = create_token(str(user["_id"]))
    
    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "coins": user.get("coins", 0),
            "gems": user.get("gems", 0),
            "is_premium": user.get("is_premium", False),
            "subscription_type": user.get("subscription_type"),
            "owned_powers": user.get("owned_powers", []),
            "owned_skins": user.get("owned_skins", ["default"]),
            "equipped_skin": user.get("equipped_skin", "default"),
            "stats": user.get("stats", {})
        }
    }

@api_router.get("/auth/me")
async def get_me(token: str):
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "coins": user.get("coins", 0),
        "gems": user.get("gems", 0),
        "is_premium": user.get("is_premium", False),
        "subscription_type": user.get("subscription_type"),
        "owned_powers": user.get("owned_powers", []),
        "owned_skins": user.get("owned_skins", ["default"]),
        "equipped_skin": user.get("equipped_skin", "default"),
        "stats": user.get("stats", {})
    }

# ==================== GAME ROUTES ====================

@api_router.post("/rooms/create")
async def create_room(request: CreateRoomRequest, token: str):
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    
    room_code = generate_room_code()
    room_doc = {
        "code": room_code,
        "name": request.name,
        "host_id": str(user["_id"]),
        "players": [{
            "id": str(user["_id"]),
            "username": user["username"],
            "is_host": True,
            "is_ready": False,
            "is_frozen": False,
            "equipped_skin": user.get("equipped_skin", "default")
        }],
        "status": "waiting",
        "current_mraz": None,
        "frozen_players": [],
        "max_players": request.max_players,
        "is_private": request.is_private,
        "settings": {
            "freeze_duration": 0,  # 0 = until unfrozen
            "game_duration": 300,  # 5 minutes
            "powers_enabled": True
        },
        "created_at": datetime.utcnow()
    }
    
    result = await db.rooms.insert_one(room_doc)
    
    # Create clean response without ObjectId
    room_response = {
        "id": str(result.inserted_id),
        "code": room_code,
        "name": request.name,
        "host_id": str(user["_id"]),
        "players": room_doc["players"],
        "status": "waiting",
        "current_mraz": None,
        "frozen_players": [],
        "max_players": request.max_players,
        "is_private": request.is_private,
        "settings": room_doc["settings"],
        "created_at": room_doc["created_at"].isoformat()
    }
    
    # Store in active games
    active_games[room_code] = room_response
    
    return {"room": room_response}

@api_router.post("/rooms/join")
async def join_room(request: JoinRoomRequest, token: str):
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    
    room = await db.rooms.find_one({"code": request.room_code.upper(), "status": "waiting"})
    if not room:
        raise HTTPException(status_code=404, detail="Soba nije pronadjena ili je igra vec pocela")
    
    if len(room["players"]) >= room.get("max_players", 10):
        raise HTTPException(status_code=400, detail="Soba je puna")
    
    # Check if already in room
    for p in room["players"]:
        if p["id"] == str(user["_id"]):
            # Return clean response
            room_response = {
                "id": str(room["_id"]),
                "code": room["code"],
                "name": room["name"],
                "host_id": room.get("host_id", ""),
                "players": room["players"],
                "status": room["status"],
                "current_mraz": room.get("current_mraz"),
                "frozen_players": room.get("frozen_players", []),
                "max_players": room.get("max_players", 10),
                "is_private": room.get("is_private", False),
                "settings": room.get("settings", {}),
                "created_at": room.get("created_at").isoformat() if room.get("created_at") else None
            }
            return {"room": room_response}
    
    new_player = {
        "id": str(user["_id"]),
        "username": user["username"],
        "is_host": False,
        "is_ready": False,
        "is_frozen": False,
        "equipped_skin": user.get("equipped_skin", "default")
    }
    
    await db.rooms.update_one(
        {"_id": room["_id"]},
        {"$push": {"players": new_player}}
    )
    
    # Create clean response
    room_response = {
        "id": str(room["_id"]),
        "code": room["code"],
        "name": room["name"],
        "host_id": room.get("host_id", ""),
        "players": room["players"] + [new_player],
        "status": room["status"],
        "current_mraz": room.get("current_mraz"),
        "frozen_players": room.get("frozen_players", []),
        "max_players": room.get("max_players", 10),
        "is_private": room.get("is_private", False),
        "settings": room.get("settings", {}),
        "created_at": room.get("created_at").isoformat() if room.get("created_at") else None
    }
    
    # Update active games
    active_games[request.room_code.upper()] = room_response
    
    return {"room": room_response}

@api_router.get("/rooms/public")
async def get_public_rooms():
    try:
        rooms = await db.rooms.find({"is_private": False, "status": "waiting"}).to_list(20)
        
        # Convert ObjectId to string and clean data
        cleaned_rooms = []
        for room in rooms:
            cleaned_room = {
                "id": str(room["_id"]),
                "code": room.get("code", ""),
                "name": room.get("name", ""),
                "host": room.get("host", {}),
                "players": room.get("players", []),
                "max_players": room.get("max_players", 10),
                "status": room.get("status", "waiting"),
                "is_private": room.get("is_private", False),
                "created_at": room.get("created_at").isoformat() if room.get("created_at") else None,
            }
            cleaned_rooms.append(cleaned_room)
        
        return cleaned_rooms
    except Exception as e:
        print(f"Error fetching public rooms: {e}")
        # Return empty list if error occurs
        return []

@api_router.get("/rooms/{room_code}")
async def get_room(room_code: str):
    room = await db.rooms.find_one({"code": room_code.upper()})
    if not room:
        raise HTTPException(status_code=404, detail="Soba nije pronadjena")
    room["id"] = str(room["_id"])
    return room

# ==================== SHOP ROUTES ====================

@api_router.get("/shop/items")
async def get_shop_items():
    return {"items": SHOP_ITEMS}

@api_router.get("/shop/premium")
async def get_premium_plans():
    return {"plans": PREMIUM_FEATURES}

@api_router.post("/shop/purchase")
async def purchase_item(request: PurchaseRequest, token: str):
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    
    item = next((i for i in SHOP_ITEMS if i["id"] == request.item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Proizvod nije pronadjen")
    
    # Check if already owned
    if item["type"] == "power" and request.item_id in user.get("owned_powers", []):
        raise HTTPException(status_code=400, detail="Vec posedujete ovu moc")
    if item["type"] == "skin" and request.item_id in user.get("owned_skins", []):
        raise HTTPException(status_code=400, detail="Vec posedujete ovaj skin")
    
    # Check currency
    if request.currency == "coins":
        if user.get("coins", 0) < item["price_coins"]:
            raise HTTPException(status_code=400, detail="Nemate dovoljno novcica")
        update = {"$inc": {"coins": -item["price_coins"]}}
    elif request.currency == "gems":
        if user.get("gems", 0) < item["price_gems"]:
            raise HTTPException(status_code=400, detail="Nemate dovoljno dragulja")
        update = {"$inc": {"gems": -item["price_gems"]}}
    else:
        # Real money purchase - would integrate with payment gateway
        update = {}
    
    # Add item to inventory
    if item["type"] == "power":
        update["$push"] = {"owned_powers": request.item_id}
    elif item["type"] == "skin":
        update["$push"] = {"owned_skins": request.item_id}
    
    await db.users.update_one({"_id": user["_id"]}, update)
    
    return {"success": True, "message": f"Uspesno ste kupili {item['name']}!"}

@api_router.post("/shop/subscribe")
async def subscribe(request: SubscriptionRequest, token: str):
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    
    plan = PREMIUM_FEATURES.get(request.plan)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan nije pronadjen")
    
    # In real app, integrate with payment gateway here
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "is_premium": True,
                "subscription_type": request.plan,
                "subscription_started": datetime.utcnow()
            }
        }
    )
    
    return {"success": True, "message": f"Uspesno ste aktivirali {request.plan} pretplatu!"}

@api_router.post("/shop/equip-skin")
async def equip_skin(skin_id: str, token: str):
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    
    if skin_id not in user.get("owned_skins", ["default"]):
        raise HTTPException(status_code=400, detail="Ne posedujete ovaj skin")
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"equipped_skin": skin_id}}
    )
    
    return {"success": True}

# ==================== BLE DEVICE ====================

class BLEDeviceRequest(BaseModel):
    device_id: str
    device_name: str

@api_router.post("/ble/save-device")
async def save_ble_device(request: BLEDeviceRequest, token: str):
    """Save connected BLE device to user profile"""
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "ble_device": {
                    "device_id": request.device_id,
                    "device_name": request.device_name,
                    "connected_at": datetime.utcnow()
                }
            }
        }
    )
    
    return {"success": True, "message": f"Uređaj {request.device_name} je sačuvan"}

@api_router.delete("/ble/remove-device")
async def remove_ble_device(token: str):
    """Remove BLE device from user profile"""
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$unset": {"ble_device": ""}}
    )
    
    return {"success": True, "message": "Uređaj je uklonjen"}

@api_router.get("/ble/device")
async def get_ble_device(token: str):
    """Get saved BLE device for user"""
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    
    ble_device = user.get("ble_device")
    return {"device": ble_device}

# ==================== GAME TEST ====================

@api_router.post("/game/freeze-test")
async def freeze_test(token: str):
    """Test freeze functionality - simulates a freeze event"""
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Neautorizovan pristup")
    
    # Check if user has BLE device connected
    ble_device = user.get("ble_device")
    has_ble = ble_device is not None
    
    # Log test event
    test_event = {
        "user_id": str(user["_id"]),
        "username": user["username"],
        "event_type": "freeze_test",
        "has_ble_device": has_ble,
        "ble_device_id": ble_device.get("device_id") if ble_device else None,
        "timestamp": datetime.utcnow()
    }
    
    # Optionally store test events in a collection
    await db.test_events.insert_one(test_event)
    
    return {
        "success": True,
        "message": "Test freeze event triggered!",
        "user": user["username"],
        "has_ble_device": has_ble,
        "device_name": ble_device.get("device_name") if ble_device else None
    }

# ==================== LEADERBOARD ====================

@api_router.get("/leaderboard")
async def get_leaderboard(category: str = "xp"):
    sort_field = f"stats.{category}" if category != "wins" else "stats.games_won"
    users = await db.users.find().sort(sort_field, -1).limit(100).to_list(100)
    
    return {
        "leaderboard": [
            {
                "rank": i + 1,
                "username": u["username"],
                "value": u.get("stats", {}).get(category if category != "wins" else "games_won", 0),
                "level": u.get("stats", {}).get("level", 1)
            }
            for i, u in enumerate(users)
        ]
    }

# ==================== STATS ====================

@api_router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=400, detail="Neispravan ID korisnika")
    
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronadjen")
    
    return {
        "username": user["username"],
        "stats": user.get("stats", {}),
        "level": user.get("stats", {}).get("level", 1),
        "xp": user.get("stats", {}).get("xp", 0)
    }

# ==================== SOCKET.IO EVENTS ====================

@sio.event
async def connect(sid, environ):
    logging.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logging.info(f"Client disconnected: {sid}")
    # Remove from active games
    if sid in player_connections:
        del player_connections[sid]

@sio.event
async def join_game(sid, data):
    """Player joins a game room via socket"""
    room_code = data.get("room_code")
    player_id = data.get("player_id")
    
    if room_code and player_id:
        player_connections[sid] = player_id
        await sio.enter_room(sid, room_code)
        await sio.emit('player_joined', {'player_id': player_id}, room=room_code)
        logging.info(f"Player {player_id} joined room {room_code}")

@sio.event
async def leave_game(sid, data):
    """Player leaves a game room"""
    room_code = data.get("room_code")
    player_id = data.get("player_id")
    
    if room_code:
        await sio.leave_room(sid, room_code)
        await sio.emit('player_left', {'player_id': player_id}, room=room_code)

@sio.event
async def player_ready(sid, data):
    """Player marks themselves as ready"""
    room_code = data.get("room_code")
    player_id = data.get("player_id")
    is_ready = data.get("is_ready", True)
    
    await sio.emit('player_ready_update', {
        'player_id': player_id,
        'is_ready': is_ready
    }, room=room_code)

@sio.event
async def start_game(sid, data):
    """Host starts the game"""
    room_code = data.get("room_code")
    
    # Update room status in DB
    room = await db.rooms.find_one({"code": room_code})
    if room:
        # Randomly select first Mraz
        players = room.get("players", [])
        if players:
            mraz = random.choice(players)
            
            # Initialize player statuses
            player_statuses = {}
            for player in players:
                if player["id"] == mraz["id"]:
                    player_statuses[player["id"]] = "mraz"
                else:
                    player_statuses[player["id"]] = "active"
            
            await db.rooms.update_one(
                {"code": room_code},
                {
                    "$set": {
                        "status": "playing",
                        "current_mraz": mraz["id"],
                        "frozen_players": [],
                        "player_statuses": player_statuses,
                        "game_started_at": datetime.utcnow(),
                        "round_number": room.get("round_number", 0) + 1,
                        "first_frozen": None
                    }
                }
            )
            
            # Increment games_played for all players
            for player in players:
                await db.users.update_one(
                    {"_id": ObjectId(player["id"])},
                    {"$inc": {"stats.games_played": 1}}
                )
            
            await sio.emit('game_started', {
                'mraz_id': mraz["id"],
                'mraz_username': mraz["username"],
                'player_statuses': player_statuses,
                'round_number': room.get("round_number", 0) + 1
            }, room=room_code)

@sio.event
async def freeze_player(sid, data):
    """Mraz freezes a player"""
    room_code = data.get("room_code")
    frozen_player_id = data.get("frozen_player_id")
    mraz_id = data.get("mraz_id")
    
    # Update frozen list
    await db.rooms.update_one(
        {"code": room_code},
        {"$addToSet": {"frozen_players": frozen_player_id}}
    )
    
    # Update player stats
    await db.users.update_one(
        {"_id": ObjectId(frozen_player_id)},
        {"$inc": {"stats.times_frozen": 1}}
    )
    
    await sio.emit('player_frozen', {
        'frozen_player_id': frozen_player_id,
        'mraz_id': mraz_id
    }, room=room_code)
    
    # Check if all players are frozen
    room = await db.rooms.find_one({"code": room_code})
    if room:
        non_mraz_players = [p["id"] for p in room["players"] if p["id"] != room.get("current_mraz")]
        frozen = room.get("frozen_players", [])
        
        if set(non_mraz_players) <= set(frozen):
            # All players frozen - game over
            await sio.emit('game_over', {
                'winner': room.get("current_mraz"),
                'frozen_players': frozen
            }, room=room_code)

@sio.event
async def unfreeze_player(sid, data):
    """Player unfreezes another player"""
    room_code = data.get("room_code")
    frozen_player_id = data.get("frozen_player_id")
    unfreezer_id = data.get("unfreezer_id")
    
    # Remove from frozen list
    await db.rooms.update_one(
        {"code": room_code},
        {"$pull": {"frozen_players": frozen_player_id}}
    )
    
    # Update stats
    await db.users.update_one(
        {"_id": ObjectId(unfreezer_id)},
        {"$inc": {"stats.times_unfrozen_others": 1}}
    )
    
    await sio.emit('player_unfrozen', {
        'unfrozen_player_id': frozen_player_id,
        'unfreezer_id': unfreezer_id
    }, room=room_code)

@sio.event
async def use_power(sid, data):
    """Player uses a special power"""
    room_code = data.get("room_code")
    player_id = data.get("player_id")
    power_id = data.get("power_id")
    
    await sio.emit('power_used', {
        'player_id': player_id,
        'power_id': power_id
    }, room=room_code)

@sio.event
async def proximity_detected(sid, data):
    """Two devices detected proximity (Bluetooth)"""
    room_code = data.get("room_code")
    player1_id = data.get("player1_id")
    player2_id = data.get("player2_id")
    
    await sio.emit('proximity_event', {
        'player1_id': player1_id,
        'player2_id': player2_id
    }, room=room_code)

@sio.event
async def update_location(sid, data):
    """Player updates their location (for proximity detection)"""
    room_code = data.get("room_code")
    player_id = data.get("player_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    
    await sio.emit('location_update', {
        'player_id': player_id,
        'latitude': latitude,
        'longitude': longitude
    }, room=room_code)

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# For running with socket.io
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8001)
