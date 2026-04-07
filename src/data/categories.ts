export interface TwitterAccount {
  handle: string;
  name: string;
  avatar: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string; // tailwind gradient from color
  accounts: TwitterAccount[];
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "ai",
    name: "Yapay Zeka",
    emoji: "🤖",
    color: "from-violet-500 to-purple-700",
    accounts: [
      { handle: "sama", name: "Sam Altman", avatar: "https://unavatar.io/twitter/sama" },
      { handle: "ylecun", name: "Yann LeCun", avatar: "https://unavatar.io/twitter/ylecun" },
      { handle: "karpathy", name: "Andrej Karpathy", avatar: "https://unavatar.io/twitter/karpathy" },
      { handle: "demishassabis", name: "Demis Hassabis", avatar: "https://unavatar.io/twitter/demishassabis" },
    ],
  },
  {
    id: "tech",
    name: "Teknoloji",
    emoji: "💻",
    color: "from-blue-500 to-cyan-600",
    accounts: [
      { handle: "elonmusk", name: "Elon Musk", avatar: "https://unavatar.io/twitter/elonmusk" },
      { handle: "paulg", name: "Paul Graham", avatar: "https://unavatar.io/twitter/paulg" },
      { handle: "naval", name: "Naval", avatar: "https://unavatar.io/twitter/naval" },
      { handle: "pmarca", name: "Marc Andreessen", avatar: "https://unavatar.io/twitter/pmarca" },
    ],
  },
  {
    id: "crypto",
    name: "Kripto",
    emoji: "₿",
    color: "from-orange-500 to-yellow-600",
    accounts: [
      { handle: "saylor", name: "Michael Saylor", avatar: "https://unavatar.io/twitter/saylor" },
      { handle: "VitalikButerin", name: "Vitalik Buterin", avatar: "https://unavatar.io/twitter/VitalikButerin" },
      { handle: "cz_binance", name: "CZ Binance", avatar: "https://unavatar.io/twitter/cz_binance" },
      { handle: "cdixon", name: "Chris Dixon", avatar: "https://unavatar.io/twitter/cdixon" },
    ],
  },
  {
    id: "economy",
    name: "Ekonomi",
    emoji: "📈",
    color: "from-green-500 to-emerald-700",
    accounts: [
      { handle: "elonmusk", name: "Elon Musk", avatar: "https://unavatar.io/twitter/elonmusk" },
      { handle: "RayDalio", name: "Ray Dalio", avatar: "https://unavatar.io/twitter/RayDalio" },
      { handle: "nouriel", name: "Nouriel Roubini", avatar: "https://unavatar.io/twitter/nouriel" },
      { handle: "paulkrugman", name: "Paul Krugman", avatar: "https://unavatar.io/twitter/paulkrugman" },
    ],
  },
  {
    id: "turkey",
    name: "Türkiye",
    emoji: "🇹🇷",
    color: "from-red-500 to-rose-700",
    accounts: [
      { handle: "RTErdogan", name: "Erdoğan", avatar: "https://unavatar.io/twitter/RTErdogan" },
      { handle: "memetsimsek", name: "Mehmet Şimşek", avatar: "https://unavatar.io/twitter/memetsimsek" },
      { handle: "fatihaltayli", name: "Fatih Altaylı", avatar: "https://unavatar.io/twitter/fatihaltayli" },
      { handle: "nevzaterdog", name: "Nevzat Erdoğan", avatar: "https://unavatar.io/twitter/nevzaterdog" },
    ],
  },
  {
    id: "science",
    name: "Bilim",
    emoji: "🔬",
    color: "from-teal-500 to-sky-600",
    accounts: [
      { handle: "neiltyson", name: "Neil deGrasse Tyson", avatar: "https://unavatar.io/twitter/neiltyson" },
      { handle: "elonmusk", name: "Elon Musk", avatar: "https://unavatar.io/twitter/elonmusk" },
      { handle: "BrianCox", name: "Brian Cox", avatar: "https://unavatar.io/twitter/BrianCox" },
      { handle: "RichardDawkins", name: "Richard Dawkins", avatar: "https://unavatar.io/twitter/RichardDawkins" },
    ],
  },
  {
    id: "design",
    name: "Tasarım",
    emoji: "🎨",
    color: "from-pink-500 to-fuchsia-700",
    accounts: [
      { handle: "figma", name: "Figma", avatar: "https://unavatar.io/twitter/figma" },
      { handle: "jnd_ux", name: "Don Norman", avatar: "https://unavatar.io/twitter/jnd_ux" },
      { handle: "rsms", name: "Rasmus Andersson", avatar: "https://unavatar.io/twitter/rsms" },
      { handle: "jonathan_ive", name: "Jony Ive", avatar: "https://unavatar.io/twitter/jonathan_ive" },
    ],
  },
];
