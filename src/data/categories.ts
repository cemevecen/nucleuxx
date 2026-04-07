export interface TwitterAccount {
  handle: string;
  name: string;
  avatar: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  accounts: TwitterAccount[];
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "ai",
    name: "Yapay Zeka",
    emoji: "🤖",
    color: "from-violet-500 to-purple-700",
    accounts: [
      { handle: "emrekiciman",    name: "Emre Kıcıman",         avatar: "https://unavatar.io/twitter/emrekiciman" },
      { handle: "deeplearningtr", name: "Deep Learning TR",      avatar: "https://unavatar.io/twitter/deeplearningtr" },
      { handle: "yapayzekalab",   name: "Yapay Zeka Lab",        avatar: "https://unavatar.io/twitter/yapayzekalab" },
      { handle: "aibulten",       name: "AI Bülten",             avatar: "https://unavatar.io/twitter/aibulten" },
      { handle: "verilab_tr",     name: "Veri Lab TR",           avatar: "https://unavatar.io/twitter/verilab_tr" },
      { handle: "mlhaber",        name: "ML Haber",              avatar: "https://unavatar.io/twitter/mlhaber" },
      { handle: "yzteknoloji",    name: "YZ Teknoloji",          avatar: "https://unavatar.io/twitter/yzteknoloji" },
      { handle: "roboturkey",     name: "Robo Turkey",           avatar: "https://unavatar.io/twitter/roboturkey" },
      { handle: "datascience_tr", name: "Data Science TR",       avatar: "https://unavatar.io/twitter/datascience_tr" },
      { handle: "airesearch_tr",  name: "AI Research Türkiye",   avatar: "https://unavatar.io/twitter/airesearch_tr" },
    ],
  },
  {
    id: "tech",
    name: "Teknoloji",
    emoji: "💻",
    color: "from-blue-500 to-cyan-600",
    accounts: [
      { handle: "webrazzi",       name: "Webrazzi",              avatar: "https://unavatar.io/twitter/webrazzi" },
      { handle: "shiftdelete_net",name: "ShiftDelete",           avatar: "https://unavatar.io/twitter/shiftdelete_net" },
      { handle: "technopat",      name: "Technopat",             avatar: "https://unavatar.io/twitter/technopat" },
      { handle: "donanimhaber",   name: "Donanım Haber",         avatar: "https://unavatar.io/twitter/donanimhaber" },
      { handle: "SerdarKaplan",   name: "Serdar Kaplan",         avatar: "https://unavatar.io/twitter/SerdarKaplan" },
      { handle: "chip_online_tr", name: "Chip Online TR",        avatar: "https://unavatar.io/twitter/chip_online_tr" },
      { handle: "mobilsahne",     name: "Mobil Sahne",           avatar: "https://unavatar.io/twitter/mobilsahne" },
      { handle: "teknolojioku",   name: "Teknoloji Oku",         avatar: "https://unavatar.io/twitter/teknolojioku" },
      { handle: "hwp_tr",         name: "HWP Türkiye",           avatar: "https://unavatar.io/twitter/hwp_tr" },
      { handle: "tr_teknoloji",   name: "TR Teknoloji",          avatar: "https://unavatar.io/twitter/tr_teknoloji" },
    ],
  },
  {
    id: "crypto",
    name: "Kripto",
    emoji: "₿",
    color: "from-orange-500 to-yellow-600",
    accounts: [
      { handle: "kriptokoin",     name: "Kripto Koin",           avatar: "https://unavatar.io/twitter/kriptokoin" },
      { handle: "cointurk_net",   name: "CoinTurk",              avatar: "https://unavatar.io/twitter/cointurk_net" },
      { handle: "btchaber",       name: "BTC Haber",             avatar: "https://unavatar.io/twitter/btchaber" },
      { handle: "borsabitcoin",   name: "Borsa Bitcoin",         avatar: "https://unavatar.io/twitter/borsabitcoin" },
      { handle: "kriptopara_tr",  name: "Kripto Para TR",        avatar: "https://unavatar.io/twitter/kriptopara_tr" },
      { handle: "altcointurkey",  name: "Altcoin Turkey",        avatar: "https://unavatar.io/twitter/altcointurkey" },
      { handle: "defiturkiye",    name: "DeFi Türkiye",          avatar: "https://unavatar.io/twitter/defiturkiye" },
      { handle: "blockchaingrup", name: "Blockchain Grup",       avatar: "https://unavatar.io/twitter/blockchaingrup" },
      { handle: "web3turkey",     name: "Web3 Turkey",           avatar: "https://unavatar.io/twitter/web3turkey" },
      { handle: "kriptobulten",   name: "Kripto Bülten",         avatar: "https://unavatar.io/twitter/kriptobulten" },
    ],
  },
  {
    id: "economy",
    name: "Ekonomi",
    emoji: "📈",
    color: "from-green-500 to-emerald-700",
    accounts: [
      { handle: "mahfiegilmez",   name: "Mahfi Eğilmez",         avatar: "https://unavatar.io/twitter/mahfiegilmez" },
      { handle: "ugurses",        name: "Uğur Gürses",           avatar: "https://unavatar.io/twitter/ugurses" },
      { handle: "memetsimsek",    name: "Mehmet Şimşek",         avatar: "https://unavatar.io/twitter/memetsimsek" },
      { handle: "borsagundem",    name: "Borsa Gündem",          avatar: "https://unavatar.io/twitter/borsagundem" },
      { handle: "borsaistanbul",  name: "Borsa İstanbul",        avatar: "https://unavatar.io/twitter/borsaistanbul" },
      { handle: "hazinemaliye",   name: "Hazine ve Maliye",      avatar: "https://unavatar.io/twitter/hazinemaliye" },
      { handle: "tcmb",           name: "TCMB",                  avatar: "https://unavatar.io/twitter/tcmb" },
      { handle: "yatirimhaber",   name: "Yatırım Haber",         avatar: "https://unavatar.io/twitter/yatirimhaber" },
      { handle: "parasiyaset",    name: "Para & Siyaset",        avatar: "https://unavatar.io/twitter/parasiyaset" },
      { handle: "ekonomianaliz",  name: "Ekonomi Analiz",        avatar: "https://unavatar.io/twitter/ekonomianaliz" },
    ],
  },
  {
    id: "turkey",
    name: "Türkiye",
    emoji: "🇹🇷",
    color: "from-red-500 to-rose-700",
    accounts: [
      { handle: "fatihaltayli",   name: "Fatih Altaylı",         avatar: "https://unavatar.io/twitter/fatihaltayli" },
      { handle: "anadoluajansi",  name: "Anadolu Ajansı",        avatar: "https://unavatar.io/twitter/anadoluajansi" },
      { handle: "hurriyet",       name: "Hürriyet",              avatar: "https://unavatar.io/twitter/hurriyet" },
      { handle: "ntv",            name: "NTV",                   avatar: "https://unavatar.io/twitter/ntv" },
      { handle: "cnnturk",        name: "CNN Türk",              avatar: "https://unavatar.io/twitter/cnnturk" },
      { handle: "haberturk",      name: "Habertürk",             avatar: "https://unavatar.io/twitter/haberturk" },
      { handle: "sozcu_com",      name: "Sözcü",                 avatar: "https://unavatar.io/twitter/sozcu_com" },
      { handle: "cumhuriyetgzt",  name: "Cumhuriyet",            avatar: "https://unavatar.io/twitter/cumhuriyetgzt" },
      { handle: "milliyet",       name: "Milliyet",              avatar: "https://unavatar.io/twitter/milliyet" },
      { handle: "sabah",          name: "Sabah",                 avatar: "https://unavatar.io/twitter/sabah" },
    ],
  },
  {
    id: "science",
    name: "Bilim",
    emoji: "🔬",
    color: "from-teal-500 to-sky-600",
    accounts: [
      { handle: "tubitak_gov_tr", name: "TÜBİTAK",              avatar: "https://unavatar.io/twitter/tubitak_gov_tr" },
      { handle: "itu_edu_tr",     name: "İTÜ",                  avatar: "https://unavatar.io/twitter/itu_edu_tr" },
      { handle: "odtu_tr",        name: "ODTÜ",                  avatar: "https://unavatar.io/twitter/odtu_tr" },
      { handle: "bilimakademisi", name: "Bilim Akademisi",       avatar: "https://unavatar.io/twitter/bilimakademisi" },
      { handle: "populerbilim",   name: "Popüler Bilim",         avatar: "https://unavatar.io/twitter/populerbilim" },
      { handle: "uzayhaber",      name: "Uzay Haber",            avatar: "https://unavatar.io/twitter/uzayhaber" },
      { handle: "biyoteknoloji_tr", name: "Biyoteknoloji TR",    avatar: "https://unavatar.io/twitter/biyoteknoloji_tr" },
      { handle: "bilimveteknoloji", name: "Bilim ve Teknoloji",  avatar: "https://unavatar.io/twitter/bilimveteknoloji" },
      { handle: "fizikdergisi",   name: "Fizik Dergisi",         avatar: "https://unavatar.io/twitter/fizikdergisi" },
      { handle: "matematikhaber", name: "Matematik Haber",       avatar: "https://unavatar.io/twitter/matematikhaber" },
    ],
  },
  {
    id: "design",
    name: "Tasarım",
    emoji: "🎨",
    color: "from-pink-500 to-fuchsia-700",
    accounts: [
      { handle: "uxturkiye",      name: "UX Türkiye",            avatar: "https://unavatar.io/twitter/uxturkiye" },
      { handle: "tasarimhaber",   name: "Tasarım Haber",         avatar: "https://unavatar.io/twitter/tasarimhaber" },
      { handle: "kolektifhouse",  name: "Kolektif House",        avatar: "https://unavatar.io/twitter/kolektifhouse" },
      { handle: "designistanbul", name: "Design İstanbul",       avatar: "https://unavatar.io/twitter/designistanbul" },
      { handle: "uxbirlik",       name: "UX Birlik",             avatar: "https://unavatar.io/twitter/uxbirlik" },
      { handle: "creativelabtr",  name: "Creative Lab TR",       avatar: "https://unavatar.io/twitter/creativelabtr" },
      { handle: "brandingturkey", name: "Branding Turkey",       avatar: "https://unavatar.io/twitter/brandingturkey" },
      { handle: "typographytr",   name: "Typography TR",         avatar: "https://unavatar.io/twitter/typographytr" },
      { handle: "motiondesigntr", name: "Motion Design TR",      avatar: "https://unavatar.io/twitter/motiondesigntr" },
      { handle: "ui_ux_tr",       name: "UI/UX TR",              avatar: "https://unavatar.io/twitter/ui_ux_tr" },
    ],
  },
];
