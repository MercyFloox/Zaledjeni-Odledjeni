#!/usr/bin/env python3
"""
Additional Backend API Testing for existing endpoints
"""

import requests
import json

# Backend URL from environment
BACKEND_URL = "https://freezetag-game.preview.emergentagent.com/api"

def test_existing_endpoints():
    """Test some existing endpoints to ensure they're working"""
    print("🔍 Testing Additional Backend Endpoints...")
    
    # Test shop items
    try:
        shop_response = requests.get(f"{BACKEND_URL}/shop/items", timeout=10)
        if shop_response.status_code == 200:
            data = shop_response.json()
            items = data.get("items", [])
            print(f"✅ Shop Items: Found {len(items)} items")
        else:
            print(f"❌ Shop Items failed: {shop_response.status_code}")
    except Exception as e:
        print(f"❌ Shop Items error: {e}")
    
    # Test premium plans
    try:
        premium_response = requests.get(f"{BACKEND_URL}/shop/premium", timeout=10)
        if premium_response.status_code == 200:
            data = premium_response.json()
            plans = data.get("plans", {})
            print(f"✅ Premium Plans: Found {len(plans)} plans")
        else:
            print(f"❌ Premium Plans failed: {premium_response.status_code}")
    except Exception as e:
        print(f"❌ Premium Plans error: {e}")
    
    # Test leaderboard
    try:
        leaderboard_response = requests.get(f"{BACKEND_URL}/leaderboard", timeout=10)
        if leaderboard_response.status_code == 200:
            data = leaderboard_response.json()
            leaderboard = data.get("leaderboard", [])
            print(f"✅ Leaderboard: Found {len(leaderboard)} entries")
        else:
            print(f"❌ Leaderboard failed: {leaderboard_response.status_code}")
    except Exception as e:
        print(f"❌ Leaderboard error: {e}")
    
    # Test public rooms
    try:
        rooms_response = requests.get(f"{BACKEND_URL}/rooms/public", timeout=10)
        if rooms_response.status_code == 200:
            data = rooms_response.json()
            print(f"✅ Public Rooms: Found {len(data)} rooms")
        else:
            print(f"❌ Public Rooms failed: {rooms_response.status_code}")
    except Exception as e:
        print(f"❌ Public Rooms error: {e}")

if __name__ == "__main__":
    test_existing_endpoints()