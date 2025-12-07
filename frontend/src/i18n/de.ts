export default {
  // Common
  common: {
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolg',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    save: 'Speichern',
    delete: 'Löschen',
    back: 'Zurück',
    next: 'Weiter',
    yes: 'Ja',
    no: 'Nein',
    ok: 'OK',
    close: 'Schließen',
    search: 'Suchen',
    settings: 'Einstellungen',
    help: 'Hilfe',
    version: 'Version',
  },

  // Welcome Screen
  welcome: {
    title1: 'EINGEFROREN',
    title2: 'AUFGETAUT',
    subtitle: 'Kinder-Einfrierspiel',
    login: 'Anmelden',
    register: 'Registrieren',
    features: {
      multiplayer: 'Mehrspieler',
      bluetooth: 'Bluetooth-Berührung',
      ranking: 'Rangliste',
    },
  },

  // Auth
  auth: {
    welcomeBack: 'Willkommen zurück!',
    loginSubtitle: 'Melde dich an, um weiterzuspielen',
    createAccount: 'Konto erstellen',
    joinPlayers: 'Tritt tausenden Spielern bei!',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    username: 'Benutzername',
    forgotPassword: 'Passwort vergessen?',
    noAccount: 'Kein Konto?',
    hasAccount: 'Bereits ein Konto?',
    loginButton: 'Anmelden',
    registerButton: 'Registrieren',
    loginLink: 'Anmelden',
    registerLink: 'Registrieren',
    errors: {
      fillAll: 'Bitte alle Felder ausfüllen',
      emailPassword: 'Bitte E-Mail und Passwort eingeben',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      passwordLength: 'Passwort muss mindestens 6 Zeichen haben',
      loginFailed: 'Anmeldung fehlgeschlagen',
      registerFailed: 'Registrierung fehlgeschlagen',
    },
    registerSuccess: 'Erfolgreich registriert!',
  },

  // Home
  home: {
    greeting: 'Hallo',
    readyToPlay: 'Bereit zum Spielen?',
    createRoom: 'Raum erstellen',
    joinRoom: 'Beitreten',
    howToPlay: 'Wie spielt man?',
    publicRooms: 'Öffentliche Räume',
    noRooms: 'Keine aktiven öffentlichen Räume',
    createYourRoom: 'Erstelle deinen Raum!',
    roomCode: 'Code',
    steps: {
      step1: '"Frost" jagt andere Spieler',
      step2: 'Berührung mit Handschuhen friert Spieler ein',
      step3: 'Andere Spieler können Eingefrorene auftauen',
      step4: 'Spiel endet, wenn alle eingefroren sind!',
    },
    createRoomModal: {
      title: 'Neuen Raum erstellen',
      roomName: 'Raumname',
      private: 'Privater Raum',
      public: 'Öffentlicher Raum',
      create: 'Erstellen',
    },
    joinRoomModal: {
      title: 'Raum beitreten',
      enterCode: 'Code eingeben (z.B. ABC123)',
      join: 'Beitreten',
    },
    errors: {
      enterRoomName: 'Bitte Raumnamen eingeben',
      enterRoomCode: 'Bitte Raumcode eingeben',
      createFailed: 'Raumerstellung fehlgeschlagen',
      joinFailed: 'Beitritt fehlgeschlagen',
      roomNotFound: 'Raum nicht gefunden',
    },
  },

  // Shop
  shop: {
    title: 'Shop',
    tabs: {
      powers: 'Kräfte',
      skins: 'Skins',
      premium: 'Premium',
    },
    purchased: 'Gekauft',
    rarity: {
      common: 'GEWÖHNLICH',
      rare: 'SELTEN',
      epic: 'EPISCH',
      legendary: 'LEGENDÄR',
    },
    confirmPurchase: 'Kauf bestätigen',
    purchaseQuestion: 'Möchtest du {item} für {price} {currency} kaufen?',
    buy: 'Kaufen',
    currencies: {
      coins: 'Münzen',
      gems: 'Edelsteine',
    },
    insufficientFunds: 'Unzureichende Mittel',
    notEnoughCoins: 'Nicht genug Münzen',
    notEnoughGems: 'Nicht genug Edelsteine',
    purchaseSuccess: '{item} erfolgreich gekauft!',
    purchaseError: 'Kauf fehlgeschlagen',
    premium: {
      active: 'Premium Aktiv!',
      enjoyBenefits: 'Genieße alle Premium-Vorteile.',
      oneTime: 'einmalig',
      monthly: 'monatlich',
      yearly: 'jährlich (33% sparen)',
      recommended: 'EMPFOHLEN',
      features: {
        noAds: 'Keine Werbung',
        privateRooms: 'Private Räume',
        basicStats: 'Basis-Statistiken',
        fullStats: 'Vollständige Statistiken',
        premiumSkins: 'Premium-Skins',
        xpBoost: 'XP-Boost (+50%)',
        priorityMatching: 'Prioritäts-Matchmaking',
        specialBadge: 'Spezielles Abzeichen',
        exclusiveSkin: 'Exklusiver Jahres-Skin',
        savings: '20 EUR sparen!',
        allFromBasic: 'Alles aus BASIC',
        allFromPro: 'Alles aus PRO',
      },
    },
    subscription: 'Abonnement',
    activateSubscription: 'Abonnement aktivieren',
    subscriptionActivated: 'Abonnement aktiviert!',
  },

  // Leaderboard
  leaderboard: {
    title: 'Rangliste',
    categories: {
      xp: 'XP',
      wins: 'Siege',
      rescuer: 'Retter',
    },
    noData: 'Keine Daten',
    playToAppear: 'Spiele, um in der Rangliste zu erscheinen!',
    you: 'Du',
    level: 'Level',
  },

  // Profile
  profile: {
    coins: 'Münzen',
    gems: 'Edelsteine',
    stats: 'Statistiken',
    inventory: 'Inventar',
    powers: 'Kräfte',
    skins: 'Skins',
    gamesPlayed: 'Gespielt',
    gamesWon: 'Gewonnen',
    timesFrozen: 'Eingefroren',
    timesUnfrozen: 'Aufgetaut',
    timesAsMraz: 'Als Frost',
    record: 'Rekord',
    settings: 'Einstellungen',
    help: 'Hilfe',
    terms: 'Nutzungsbedingungen',
    logout: 'Abmelden',
    logoutConfirm: 'Möchtest du dich wirklich abmelden?',
    language: 'Sprache',
    selectLanguage: 'Sprache wählen',
  },

  // Game Lobby
  lobby: {
    loadingRoom: 'Raum wird geladen...',
    playersInRoom: 'Spieler im Raum',
    host: 'Host',
    ready: 'Bereit',
    waiting: 'Warten...',
    waitingForPlayer: 'Warte auf Spieler...',
    startGame: 'Spiel starten',
    imReady: 'Ich bin bereit!',
    cancelReady: 'Bereit abbrechen',
    leaveRoom: 'Raum verlassen',
    leaveConfirm: 'Bist du sicher?',
    leave: 'Verlassen',
    info: 'Ein Spieler wird zufällig als "Frost" ausgewählt. Er muss alle anderen Spieler durch Berühren ihrer Handschuhe einfrieren!',
    notEnoughPlayers: 'Nicht genug Spieler',
    needAtLeast2: 'Mindestens 2 bereite Spieler benötigt',
    shareMessage: 'Mach mit bei "Eingefroren-Aufgetaut"! Raumcode:',
  },

  // Game Play
  game: {
    youAreMraz: 'DU BIST FROST!',
    youAreFrozen: 'DU BIST EINGEFROREN!',
    run: 'LAUF!',
    frozen: 'EINGEFROREN',
    waitToUnfreeze: 'Warte, bis dich jemand auftaut!',
    freeze: 'EINFRIEREN!',
    unfreeze: 'AUFTAUEN!',
    approachPlayer: 'Nähere dich einem Spieler',
    instructions: {
      mraz: 'Nähere dich anderen Spielern mit deinem Handschuh, um sie einzufrieren!',
      frozen: 'Steh still! Andere Spieler können dich auftauen.',
      player: 'Flieh vor Frost! Taue eingefrorene Spieler durch Berühren auf.',
    },
    bluetoothActive: 'Bluetooth-Scan aktiv',
    gameOver: 'Spiel beendet!',
    youWon: 'Du hast gewonnen!',
    mrazWon: 'Frost gewinnt!',
    gameTime: 'Spielzeit',
    frozenCount: 'Eingefroren',
    backToHome: 'Zurück zum Start',
    leaveGame: 'Spiel verlassen',
    leaveGameConfirm: 'Möchtest du das Spiel wirklich verlassen?',
    simulateTouch: 'Berührung simulieren',
    choosePlayerFreeze: 'Wähle Spieler zum Einfrieren (im echten Spiel automatisch via Bluetooth)',
    choosePlayerUnfreeze: 'Wähle eingefrorenen Spieler zum Auftauen',
    testFreezeUnfreeze: 'Einfrieren/Auftauen testen',
  },

  // Powers
  powers: {
    superFreeze: {
      name: 'Super-Einfrieren',
      description: 'Friere jeden sofort aus bis zu 5m Entfernung ein!',
    },
    ultraThaw: {
      name: 'Ultra-Auftauen',
      description: 'Automatisches Auftauen nach 5 Sekunden!',
    },
    shield: {
      name: 'Schild',
      description: 'Schutzschild - kann 10 Sekunden nicht eingefroren werden!',
    },
    secondChance: {
      name: 'Zweite Chance',
      description: 'Du hast 2 Sekunden zum Entkommen nach der Berührung!',
    },
    ghostMode: {
      name: 'Geistermodus',
      description: 'Gehe 15 Sekunden lang durch Spieler, ohne einzufrieren!',
    },
  },

  // Skins
  skins: {
    fire: {
      name: 'Feuer-Skin',
      description: 'Spezielle Feueranimation und Sounds!',
    },
    iceKing: {
      name: 'Eiskönig',
      description: 'Königliches eisiges Aussehen mit Krone!',
    },
    neon: {
      name: 'Neon-Glühen',
      description: 'Leuchtende Neon-Effekte!',
    },
    rainbow: {
      name: 'Regenbogen',
      description: 'Regenbogenfarben, die sich ändern!',
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
