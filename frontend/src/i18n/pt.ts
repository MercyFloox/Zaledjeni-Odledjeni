export default {
  // Common
  common: {
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Salvar',
    delete: 'Excluir',
    back: 'Voltar',
    next: 'Próximo',
    yes: 'Sim',
    no: 'Não',
    ok: 'OK',
    close: 'Fechar',
    search: 'Pesquisar',
    settings: 'Configurações',
    help: 'Ajuda',
    version: 'Versão',
  },

  // Welcome Screen
  welcome: {
    title1: 'CONGELADO',
    title2: 'DESCONGELADO',
    subtitle: 'Jogo infantil de congelamento',
    login: 'Entrar',
    register: 'Cadastrar',
    features: {
      multiplayer: 'Multijogador',
      bluetooth: 'Toque Bluetooth',
      ranking: 'Ranking',
    },
  },

  // Auth
  auth: {
    welcomeBack: 'Bem-vindo de volta!',
    loginSubtitle: 'Entre para continuar jogando',
    createAccount: 'Criar Conta',
    joinPlayers: 'Junte-se a milhares de jogadores!',
    email: 'Endereço de e-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar senha',
    username: 'Nome de usuário',
    forgotPassword: 'Esqueceu a senha?',
    noAccount: 'Não tem conta?',
    hasAccount: 'Já tem conta?',
    loginButton: 'Entrar',
    registerButton: 'Cadastrar',
    loginLink: 'Entre',
    registerLink: 'Cadastre-se',
    errors: {
      fillAll: 'Por favor, preencha todos os campos',
      emailPassword: 'Por favor, insira email e senha',
      passwordMismatch: 'As senhas não coincidem',
      passwordLength: 'A senha deve ter pelo menos 6 caracteres',
      loginFailed: 'Falha no login',
      registerFailed: 'Falha no cadastro',
    },
    registerSuccess: 'Cadastrado com sucesso!',
  },

  // Home
  home: {
    greeting: 'Olá',
    readyToPlay: 'Pronto para jogar?',
    createRoom: 'Criar Sala',
    joinRoom: 'Entrar',
    howToPlay: 'Como jogar?',
    publicRooms: 'Salas Públicas',
    noRooms: 'Nenhuma sala pública ativa',
    createYourRoom: 'Crie sua sala!',
    roomCode: 'Código',
    steps: {
      step1: '"Gelo" persegue os outros jogadores',
      step2: 'O toque com luvas congela o jogador',
      step3: 'Outros jogadores podem descongelar os congelados',
      step4: 'O jogo termina quando todos estão congelados!',
    },
    createRoomModal: {
      title: 'Criar Nova Sala',
      roomName: 'Nome da sala',
      private: 'Sala privada',
      public: 'Sala pública',
      create: 'Criar',
    },
    joinRoomModal: {
      title: 'Entrar na Sala',
      enterCode: 'Digite o código (ex. ABC123)',
      join: 'Entrar',
    },
    errors: {
      enterRoomName: 'Digite o nome da sala',
      enterRoomCode: 'Digite o código da sala',
      createFailed: 'Falha ao criar sala',
      joinFailed: 'Falha ao entrar',
      roomNotFound: 'Sala não encontrada',
    },
  },

  // Shop
  shop: {
    title: 'Loja',
    tabs: {
      powers: 'Poderes',
      skins: 'Skins',
      premium: 'Premium',
    },
    purchased: 'Comprado',
    rarity: {
      common: 'COMUM',
      rare: 'RARO',
      epic: 'ÉPICO',
      legendary: 'LENDÁRIO',
    },
    confirmPurchase: 'Confirmar Compra',
    purchaseQuestion: 'Quer comprar {item} por {price} {currency}?',
    buy: 'Comprar',
    currencies: {
      coins: 'moedas',
      gems: 'gemas',
    },
    insufficientFunds: 'Fundos insuficientes',
    notEnoughCoins: 'Moedas insuficientes',
    notEnoughGems: 'Gemas insuficientes',
    purchaseSuccess: '{item} comprado com sucesso!',
    purchaseError: 'Falha na compra',
    premium: {
      active: 'Premium Ativo!',
      enjoyBenefits: 'Aproveitando todos os benefícios premium.',
      oneTime: 'pagamento único',
      monthly: 'mensal',
      yearly: 'anual (economize 33%)',
      recommended: 'RECOMENDADO',
      features: {
        noAds: 'Sem anúncios',
        privateRooms: 'Salas privadas',
        basicStats: 'Estatísticas básicas',
        fullStats: 'Estatísticas completas',
        premiumSkins: 'Skins premium',
        xpBoost: 'Boost de XP (+50%)',
        priorityMatching: 'Matchmaking prioritário',
        specialBadge: 'Emblema especial',
        exclusiveSkin: 'Skin exclusiva anual',
        savings: 'Economize 20 EUR!',
        allFromBasic: 'Tudo do BASIC',
        allFromPro: 'Tudo do PRO',
      },
    },
    subscription: 'Assinatura',
    activateSubscription: 'Ativar assinatura',
    subscriptionActivated: 'Assinatura ativada!',
  },

  // Leaderboard
  leaderboard: {
    title: 'Ranking',
    categories: {
      xp: 'XP',
      wins: 'Vitórias',
      rescuer: 'Salvador',
    },
    noData: 'Sem dados',
    playToAppear: 'Jogue para aparecer no ranking!',
    you: 'Você',
    level: 'Nível',
  },

  // Profile
  profile: {
    coins: 'Moedas',
    gems: 'Gemas',
    stats: 'Estatísticas',
    inventory: 'Inventário',
    powers: 'Poderes',
    skins: 'Skins',
    gamesPlayed: 'Jogados',
    gamesWon: 'Vencidos',
    timesFrozen: 'Congelado',
    timesUnfrozen: 'Descongelou',
    timesAsMraz: 'Como Gelo',
    record: 'Recorde',
    settings: 'Configurações',
    help: 'Ajuda',
    terms: 'Termos de uso',
    logout: 'Sair',
    logoutConfirm: 'Tem certeza que quer sair?',
    language: 'Idioma',
    selectLanguage: 'Selecionar idioma',
  },

  // Game Lobby
  lobby: {
    loadingRoom: 'Carregando sala...',
    playersInRoom: 'Jogadores na sala',
    host: 'Anfitrião',
    ready: 'Pronto',
    waiting: 'Aguardando...',
    waitingForPlayer: 'Aguardando jogador...',
    startGame: 'Iniciar Jogo',
    imReady: 'Estou pronto!',
    cancelReady: 'Cancelar pronto',
    leaveRoom: 'Sair da sala',
    leaveConfirm: 'Tem certeza?',
    leave: 'Sair',
    info: 'Um jogador será escolhido aleatoriamente como "Gelo". Ele deve congelar todos os outros tocando suas luvas!',
    notEnoughPlayers: 'Jogadores insuficientes',
    needAtLeast2: 'Necessário pelo menos 2 jogadores prontos',
    shareMessage: 'Jogue "Congelado-Descongelado" comigo! Código da sala:',
  },

  // Game Play
  game: {
    youAreMraz: 'VOCÊ É O GELO!',
    youAreFrozen: 'VOCÊ ESTÁ CONGELADO!',
    run: 'CORRA!',
    frozen: 'CONGELADO',
    waitToUnfreeze: 'Espere alguém te descongelar!',
    freeze: 'CONGELAR!',
    unfreeze: 'DESCONGELAR!',
    approachPlayer: 'Aproxime-se de um jogador',
    instructions: {
      mraz: 'Aproxime-se dos outros jogadores com sua luva para congelá-los!',
      frozen: 'Fique parado! Outros jogadores podem te descongelar.',
      player: 'Fuja do Gelo! Descongele jogadores congelados tocando neles.',
    },
    bluetoothActive: 'Varredura Bluetooth ativa',
    gameOver: 'Fim de Jogo!',
    youWon: 'Você venceu!',
    mrazWon: 'Gelo venceu!',
    gameTime: 'Tempo de jogo',
    frozenCount: 'Congelados',
    backToHome: 'Voltar ao início',
    leaveGame: 'Sair do jogo',
    leaveGameConfirm: 'Tem certeza que quer sair do jogo?',
    simulateTouch: 'Simular toque',
    choosePlayerFreeze: 'Escolha jogador para congelar (no jogo real seria automático via Bluetooth)',
    choosePlayerUnfreeze: 'Escolha jogador congelado para descongelar',
    testFreezeUnfreeze: 'Testar congelar/descongelar',
  },

  // Powers
  powers: {
    superFreeze: {
      name: 'Super Congelamento',
      description: 'Congele qualquer um instantaneamente de até 5m!',
    },
    ultraThaw: {
      name: 'Ultra Descongelamento',
      description: 'Descongele automaticamente após 5 segundos!',
    },
    shield: {
      name: 'Escudo',
      description: 'Escudo protetor - não pode ser congelado por 10 segundos!',
    },
    secondChance: {
      name: 'Segunda Chance',
      description: 'Você tem 2 segundos para escapar após o toque!',
    },
    ghostMode: {
      name: 'Modo Fantasma',
      description: 'Passe através dos jogadores sem congelar por 15 segundos!',
    },
  },

  // Skins
  skins: {
    fire: {
      name: 'Skin de Fogo',
      description: 'Animação e sons de fogo especiais!',
    },
    iceKing: {
      name: 'Rei do Gelo',
      description: 'Visual real gelado com coroa!',
    },
    neon: {
      name: 'Neon Brilhante',
      description: 'Efeitos neon brilhantes!',
    },
    rainbow: {
      name: 'Arco-íris',
      description: 'Cores do arco-íris que mudam!',
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
