export default {
  // Common
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    back: 'Atrás',
    next: 'Siguiente',
    yes: 'Sí',
    no: 'No',
    ok: 'OK',
    close: 'Cerrar',
    search: 'Buscar',
    settings: 'Configuración',
    help: 'Ayuda',
    version: 'Versión',
  },

  // Welcome Screen
  welcome: {
    title1: 'CONGELADO',
    title2: 'DESCONGELADO',
    subtitle: 'Juego infantil de congelación',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    features: {
      multiplayer: 'Multijugador',
      bluetooth: 'Toque Bluetooth',
      ranking: 'Clasificación',
    },
  },

  // Auth
  auth: {
    welcomeBack: '¡Bienvenido de nuevo!',
    loginSubtitle: 'Inicia sesión para continuar jugando',
    createAccount: 'Crear Cuenta',
    joinPlayers: '¡Únete a miles de jugadores!',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    username: 'Nombre de usuario',
    forgotPassword: '¿Olvidaste tu contraseña?',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    loginButton: 'Iniciar Sesión',
    registerButton: 'Registrarse',
    loginLink: 'Inicia sesión',
    registerLink: 'Regístrate',
    errors: {
      fillAll: 'Por favor completa todos los campos',
      emailPassword: 'Por favor ingresa email y contraseña',
      passwordMismatch: 'Las contraseñas no coinciden',
      passwordLength: 'La contraseña debe tener al menos 6 caracteres',
      loginFailed: 'Error al iniciar sesión',
      registerFailed: 'Error al registrarse',
    },
    registerSuccess: '¡Registrado exitosamente!',
  },

  // Home
  home: {
    greeting: 'Hola',
    readyToPlay: '¿Listo para jugar?',
    createRoom: 'Crear Sala',
    joinRoom: 'Unirse',
    howToPlay: '¿Cómo jugar?',
    publicRooms: 'Salas Públicas',
    noRooms: 'No hay salas públicas activas',
    createYourRoom: '¡Crea tu sala!',
    roomCode: 'Código',
    steps: {
      step1: '"Escarcha" persigue a otros jugadores',
      step2: 'El toque con guantes congela al jugador',
      step3: 'Otros jugadores pueden descongelar a los congelados',
      step4: '¡El juego termina cuando todos están congelados!',
    },
    createRoomModal: {
      title: 'Crear Nueva Sala',
      roomName: 'Nombre de la sala',
      private: 'Sala privada',
      public: 'Sala pública',
      create: 'Crear',
    },
    joinRoomModal: {
      title: 'Unirse a Sala',
      enterCode: 'Ingresa el código (ej. ABC123)',
      join: 'Unirse',
    },
    errors: {
      enterRoomName: 'Ingresa el nombre de la sala',
      enterRoomCode: 'Ingresa el código de la sala',
      createFailed: 'Error al crear la sala',
      joinFailed: 'Error al unirse',
      roomNotFound: 'Sala no encontrada',
    },
  },

  // Shop
  shop: {
    title: 'Tienda',
    tabs: {
      powers: 'Poderes',
      skins: 'Skins',
      premium: 'Premium',
    },
    purchased: 'Comprado',
    rarity: {
      common: 'COMÚN',
      rare: 'RARO',
      epic: 'ÉPICO',
      legendary: 'LEGENDARIO',
    },
    confirmPurchase: 'Confirmar Compra',
    purchaseQuestion: '¿Quieres comprar {item} por {price} {currency}?',
    buy: 'Comprar',
    currencies: {
      coins: 'monedas',
      gems: 'gemas',
    },
    insufficientFunds: 'Fondos insuficientes',
    notEnoughCoins: 'No tienes suficientes monedas',
    notEnoughGems: 'No tienes suficientes gemas',
    purchaseSuccess: '¡Compraste {item} exitosamente!',
    purchaseError: 'Error en la compra',
    premium: {
      active: '¡Premium Activo!',
      enjoyBenefits: 'Disfrutas de todos los beneficios premium.',
      oneTime: 'único pago',
      monthly: 'mensual',
      yearly: 'anual (ahorra 33%)',
      recommended: 'RECOMENDADO',
      features: {
        noAds: 'Sin anuncios',
        privateRooms: 'Salas privadas',
        basicStats: 'Estadísticas básicas',
        fullStats: 'Estadísticas completas',
        premiumSkins: 'Skins premium',
        xpBoost: 'Boost de XP (+50%)',
        priorityMatching: 'Matchmaking prioritario',
        specialBadge: 'Insignia especial',
        exclusiveSkin: 'Skin exclusivo anual',
        savings: '¡Ahorra 20 EUR!',
        allFromBasic: 'Todo de BASIC',
        allFromPro: 'Todo de PRO',
      },
    },
    subscription: 'Suscripción',
    activateSubscription: 'Activar suscripción',
    subscriptionActivated: '¡Suscripción activada!',
  },

  // Leaderboard
  leaderboard: {
    title: 'Clasificación',
    categories: {
      xp: 'XP',
      wins: 'Victorias',
      rescuer: 'Rescatador',
    },
    noData: 'Sin datos',
    playToAppear: '¡Juega para aparecer en la clasificación!',
    you: 'Tú',
    level: 'Nivel',
  },

  // Profile
  profile: {
    coins: 'Monedas',
    gems: 'Gemas',
    stats: 'Estadísticas',
    inventory: 'Inventario',
    powers: 'Poderes',
    skins: 'Skins',
    gamesPlayed: 'Jugados',
    gamesWon: 'Ganados',
    timesFrozen: 'Congelado',
    timesUnfrozen: 'Descongeló',
    timesAsMraz: 'Como Escarcha',
    record: 'Récord',
    settings: 'Configuración',
    help: 'Ayuda',
    terms: 'Términos de servicio',
    logout: 'Cerrar sesión',
    logoutConfirm: '¿Estás seguro de que quieres cerrar sesión?',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',
  },

  // Game Lobby
  lobby: {
    loadingRoom: 'Cargando sala...',
    playersInRoom: 'Jugadores en la sala',
    host: 'Anfitrión',
    ready: 'Listo',
    waiting: 'Esperando...',
    waitingForPlayer: 'Esperando jugador...',
    startGame: 'Iniciar Juego',
    imReady: '¡Estoy listo!',
    cancelReady: 'Cancelar listo',
    leaveRoom: 'Salir de la sala',
    leaveConfirm: '¿Estás seguro?',
    leave: 'Salir',
    info: '¡Un jugador será seleccionado al azar como "Escarcha". Debe congelar a todos los demás tocando sus guantes!',
    notEnoughPlayers: 'No hay suficientes jugadores',
    needAtLeast2: 'Se necesitan al menos 2 jugadores listos',
    shareMessage: '¡Únete a "Congelado-Descongelado"! Código de sala:',
  },

  // Game Play
  game: {
    youAreMraz: '¡ERES ESCARCHA!',
    youAreFrozen: '¡ESTÁS CONGELADO!',
    run: '¡CORRE!',
    frozen: 'CONGELADO',
    waitToUnfreeze: '¡Espera a que alguien te descongele!',
    freeze: '¡CONGELAR!',
    unfreeze: '¡DESCONGELAR!',
    approachPlayer: 'Acércate a un jugador',
    instructions: {
      mraz: '¡Acércate a otros jugadores con tu guante para congelarlos!',
      frozen: '¡Quédate quieto! Otros jugadores pueden descongelarte.',
      player: '¡Huye de Escarcha! Descongela a los jugadores tocándolos.',
    },
    bluetoothActive: 'Escaneo Bluetooth activo',
    gameOver: '¡Juego Terminado!',
    youWon: '¡Ganaste!',
    mrazWon: '¡Escarcha gana!',
    gameTime: 'Tiempo de juego',
    frozenCount: 'Congelados',
    backToHome: 'Volver al inicio',
    leaveGame: 'Salir del juego',
    leaveGameConfirm: '¿Estás seguro de que quieres salir del juego?',
    simulateTouch: 'Simular toque',
    choosePlayerFreeze: 'Elige jugador para congelar (en el juego real sería automático vía Bluetooth)',
    choosePlayerUnfreeze: 'Elige jugador congelado para descongelar',
    testFreezeUnfreeze: 'Probar congelar/descongelar',
  },

  // Powers
  powers: {
    superFreeze: {
      name: 'Super Congelación',
      description: '¡Congela a cualquiera al instante desde hasta 5m!',
    },
    ultraThaw: {
      name: 'Ultra Descongelación',
      description: '¡Descongélate automáticamente después de 5 segundos!',
    },
    shield: {
      name: 'Escudo',
      description: '¡Escudo protector - no puedes ser congelado por 10 segundos!',
    },
    secondChance: {
      name: 'Segunda Oportunidad',
      description: '¡Tienes 2 segundos para escapar después del toque!',
    },
    ghostMode: {
      name: 'Modo Fantasma',
      description: '¡Atraviesa jugadores sin congelarte por 15 segundos!',
    },
  },

  // Skins
  skins: {
    fire: {
      name: 'Skin de Fuego',
      description: '¡Animación y sonidos de fuego especiales!',
    },
    iceKing: {
      name: 'Rey del Hielo',
      description: '¡Aspecto real helado con corona!',
    },
    neon: {
      name: 'Neón Brillante',
      description: '¡Efectos neón brillantes!',
    },
    rainbow: {
      name: 'Arcoíris',
      description: '¡Colores arcoíris que cambian!',
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
