export default {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    close: 'Close',
    search: 'Search',
    settings: 'Settings',
    help: 'Help',
    version: 'Version',
  },

  // Welcome Screen
  welcome: {
    title1: 'FROZEN',
    title2: 'UNFROZEN',
    subtitle: "Children's freezing game",
    login: 'Sign In',
    register: 'Sign Up',
    features: {
      multiplayer: 'Multiplayer',
      bluetooth: 'Bluetooth touch',
      ranking: 'Rankings',
    },
  },

  // Auth
  auth: {
    welcomeBack: 'Welcome back!',
    loginSubtitle: 'Sign in to continue playing',
    createAccount: 'Create Account',
    joinPlayers: 'Join thousands of players!',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm password',
    username: 'Username',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    loginButton: 'Sign In',
    registerButton: 'Sign Up',
    loginLink: 'Sign in',
    registerLink: 'Sign up',
    errors: {
      fillAll: 'Please fill in all fields',
      emailPassword: 'Please enter email and password',
      passwordMismatch: 'Passwords do not match',
      passwordLength: 'Password must be at least 6 characters',
      loginFailed: 'Login failed',
      registerFailed: 'Registration failed',
    },
    registerSuccess: 'Successfully registered!',
  },

  // Home
  home: {
    greeting: 'Hello',
    readyToPlay: 'Ready to play?',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',
    howToPlay: 'How to play?',
    publicRooms: 'Public Rooms',
    noRooms: 'No active public rooms',
    createYourRoom: 'Create your room!',
    roomCode: 'Code',
    steps: {
      step1: '"Frost" chases other players',
      step2: 'Touch with gloves freezes a player',
      step3: 'Other players can unfreeze frozen players',
      step4: 'Game ends when everyone is frozen!',
    },
    createRoomModal: {
      title: 'Create New Room',
      roomName: 'Room name',
      private: 'Private room',
      public: 'Public room',
      create: 'Create',
    },
    joinRoomModal: {
      title: 'Join Room',
      enterCode: 'Enter room code (e.g., ABC123)',
      join: 'Join',
    },
    errors: {
      enterRoomName: 'Please enter room name',
      enterRoomCode: 'Please enter room code',
      createFailed: 'Failed to create room',
      joinFailed: 'Failed to join room',
      roomNotFound: 'Room not found',
    },
  },

  // Shop
  shop: {
    title: 'Shop',
    tabs: {
      powers: 'Powers',
      skins: 'Skins',
      premium: 'Premium',
    },
    purchased: 'Purchased',
    rarity: {
      common: 'COMMON',
      rare: 'RARE',
      epic: 'EPIC',
      legendary: 'LEGENDARY',
    },
    confirmPurchase: 'Confirm Purchase',
    purchaseQuestion: 'Do you want to buy {item} for {price} {currency}?',
    buy: 'Buy',
    currencies: {
      coins: 'coins',
      gems: 'gems',
    },
    insufficientFunds: 'Insufficient funds',
    notEnoughCoins: 'Not enough coins',
    notEnoughGems: 'Not enough gems',
    purchaseSuccess: 'Successfully purchased {item}!',
    purchaseError: 'Purchase failed',
    premium: {
      active: 'Premium Active!',
      enjoyBenefits: 'Enjoying all premium benefits.',
      oneTime: 'one-time',
      monthly: 'monthly',
      yearly: 'yearly (save 33%)',
      recommended: 'RECOMMENDED',
      features: {
        noAds: 'No ads',
        privateRooms: 'Private rooms',
        basicStats: 'Basic statistics',
        fullStats: 'Full statistics',
        premiumSkins: 'Premium skins',
        xpBoost: 'XP Boost (+50%)',
        priorityMatching: 'Priority matchmaking',
        specialBadge: 'Special badge',
        exclusiveSkin: 'Exclusive yearly skin',
        savings: 'Save 20 EUR!',
        allFromBasic: 'Everything from BASIC',
        allFromPro: 'Everything from PRO',
      },
    },
    subscription: 'Subscription',
    activateSubscription: 'Activate subscription',
    subscriptionActivated: 'Subscription activated!',
  },

  // Leaderboard
  leaderboard: {
    title: 'Leaderboard',
    categories: {
      xp: 'XP',
      wins: 'Wins',
      rescuer: 'Rescuer',
    },
    noData: 'No data',
    playToAppear: 'Play to appear on the leaderboard!',
    you: 'You',
    level: 'Level',
  },

  // Profile
  profile: {
    coins: 'Coins',
    gems: 'Gems',
    stats: 'Statistics',
    inventory: 'Inventory',
    powers: 'Powers',
    skins: 'Skins',
    gamesPlayed: 'Played',
    gamesWon: 'Won',
    timesFrozen: 'Frozen',
    timesUnfrozen: 'Unfroze',
    timesAsMraz: 'As Frost',
    record: 'Record',
    settings: 'Settings',
    help: 'Help',
    terms: 'Terms of Service',
    logout: 'Log out',
    logoutConfirm: 'Are you sure you want to log out?',
    language: 'Language',
    selectLanguage: 'Select language',
  },

  // Game Lobby
  lobby: {
    loadingRoom: 'Loading room...',
    playersInRoom: 'Players in room',
    host: 'Host',
    ready: 'Ready',
    waiting: 'Waiting...',
    waitingForPlayer: 'Waiting for player...',
    startGame: 'Start Game',
    imReady: "I'm ready!",
    cancelReady: 'Cancel ready',
    leaveRoom: 'Leave room',
    leaveConfirm: 'Are you sure?',
    leave: 'Leave',
    info: 'One player will be randomly selected as "Frost". They must freeze all other players by touching their gloves!',
    notEnoughPlayers: 'Not enough players',
    needAtLeast2: 'Need at least 2 ready players',
    shareMessage: 'Join me in "Frozen-Unfrozen"! Room code:',
  },

  // Game Play
  game: {
    youAreMraz: 'YOU ARE FROST!',
    youAreFrozen: 'YOU ARE FROZEN!',
    run: 'RUN!',
    frozen: 'FROZEN',
    waitToUnfreeze: 'Wait for someone to unfreeze you!',
    freeze: 'FREEZE!',
    unfreeze: 'UNFREEZE!',
    approachPlayer: 'Approach a player',
    instructions: {
      mraz: 'Approach other players with your glove to freeze them!',
      frozen: 'Stand still! Other players can unfreeze you.',
      player: 'Run from Frost! Unfreeze frozen players by touching.',
    },
    bluetoothActive: 'Bluetooth scanning active',
    gameOver: 'Game Over!',
    youWon: 'You won!',
    mrazWon: 'Frost wins!',
    gameTime: 'Game time',
    frozenCount: 'Frozen',
    backToHome: 'Back to home',
    leaveGame: 'Leave game',
    leaveGameConfirm: 'Are you sure you want to leave the game?',
    simulateTouch: 'Simulate touch',
    choosePlayerFreeze: 'Choose player to freeze (in real game this would be automatic via Bluetooth)',
    choosePlayerUnfreeze: 'Choose frozen player to unfreeze',
    testFreezeUnfreeze: 'Test freeze/unfreeze',
  },

  // Powers
  powers: {
    superFreeze: {
      name: 'Super Freeze',
      description: 'Freeze anyone instantly from up to 5m away!',
    },
    ultraThaw: {
      name: 'Ultra Thaw',
      description: 'Automatically unfreeze after 5 seconds!',
    },
    shield: {
      name: 'Shield',
      description: "Protective shield - can't be frozen for 10 seconds!",
    },
    secondChance: {
      name: 'Second Chance',
      description: 'You have 2 seconds to escape after being touched!',
    },
    ghostMode: {
      name: 'Ghost Mode',
      description: 'Pass through players without freezing for 15 seconds!',
    },
  },

  // Skins
  skins: {
    fire: {
      name: 'Fire Skin',
      description: 'Special fire animation and sounds!',
    },
    iceKing: {
      name: 'Ice King',
      description: 'Royal icy look with a crown!',
    },
    neon: {
      name: 'Neon Glow',
      description: 'Glowing neon effects!',
    },
    rainbow: {
      name: 'Rainbow',
      description: 'Rainbow colors that change!',
    },
  },

  // Languages
  languages: {
    sr: 'Srpski',
    en: 'English',
    es: 'Español',
    de: 'Deutsch',
    fr: 'Français',
    pt: 'Português (Brasil)',
  },
};
