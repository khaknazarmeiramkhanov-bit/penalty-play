import { useEffect, useState, useCallback } from "react";
import { syncPlayer } from "./leaderboard";

export type ItemKind = "glove" | "boot" | "wristband" | "sock" | "ball";

export type Rarity = "common" | "rare" | "legendary";

export type ShopItem = {
  id: string;
  kind: ItemKind;
  name: string;
  price: number;
  rarity: Rarity;
  // visual props applied to PlayerFigure
  color: string; // primary color
  accent?: string; // secondary highlight
  // Optional pattern key for ball skins
  pattern?: string;
};

// ---------------- Ball skins (100 combinations) ----------------
const BALL_PATTERNS: { key: string; ru: string; priceMod: number }[] = [
  { key: "classic", ru: "Классик", priceMod: 0 },
  { key: "stripes", ru: "Полосы", priceMod: 20 },
  { key: "swirl", ru: "Вихрь", priceMod: 40 },
  { key: "star", ru: "Звезда", priceMod: 60 },
  { key: "dots", ru: "Горошек", priceMod: 30 },
  { key: "checker", ru: "Шахматы", priceMod: 50 },
  { key: "flame", ru: "Пламя", priceMod: 80 },
  { key: "gradient", ru: "Градиент", priceMod: 40 },
  { key: "hex", ru: "Соты", priceMod: 70 },
  { key: "ring", ru: "Кольца", priceMod: 50 },
];

const BALL_PALETTES: {
  key: string;
  name: string;
  color: string;
  accent: string;
  rarity: Rarity;
  price: number;
}[] = [
  {
    key: "classic",
    name: "Классика",
    color: "#ffffff",
    accent: "#0a0a0a",
    rarity: "common",
    price: 0,
  },
  { key: "coal", name: "Уголь", color: "#0a0a0a", accent: "#ffffff", rarity: "common", price: 80 },
  { key: "fire", name: "Огонь", color: "#ef4444", accent: "#facc15", rarity: "common", price: 140 },
  {
    key: "ocean",
    name: "Океан",
    color: "#0ea5e9",
    accent: "#e0f2fe",
    rarity: "common",
    price: 120,
  },
  { key: "forest", name: "Лес", color: "#16a34a", accent: "#dcfce7", rarity: "common", price: 120 },
  { key: "sunset", name: "Закат", color: "#f97316", accent: "#fde68a", rarity: "rare", price: 240 },
  {
    key: "galaxy",
    name: "Галактика",
    color: "#1e1b4b",
    accent: "#a78bfa",
    rarity: "rare",
    price: 300,
  },
  { key: "neon", name: "Неон", color: "#a3e635", accent: "#0a0a0a", rarity: "rare", price: 320 },
  {
    key: "gold",
    name: "Золото",
    color: "#facc15",
    accent: "#7c2d12",
    rarity: "legendary",
    price: 1000,
  },
  {
    key: "void",
    name: "Пустота",
    color: "#020617",
    accent: "#22d3ee",
    rarity: "legendary",
    price: 1400,
  },
];

function buildBallItems(): ShopItem[] {
  const items: ShopItem[] = [];
  for (const pal of BALL_PALETTES) {
    for (const pat of BALL_PATTERNS) {
      const isDefault = pal.key === "classic" && pat.key === "classic";
      items.push({
        id: `ball_${pal.key}_${pat.key}`,
        kind: "ball",
        name: `${pal.name} · ${pat.ru}`,
        price: isDefault ? 0 : pal.price + pat.priceMod,
        rarity: pal.rarity,
        color: pal.color,
        accent: pal.accent,
        pattern: pat.key,
      });
    }
  }
  return items;
}

export const ITEMS: ShopItem[] = [
  // Gloves
  {
    id: "glove_orange",
    kind: "glove",
    name: "Классика",
    price: 0,
    rarity: "common",
    color: "#ff7a1a",
    accent: "#ffb066",
  },
  {
    id: "glove_neon",
    kind: "glove",
    name: "Неон",
    price: 80,
    rarity: "common",
    color: "#39ff14",
    accent: "#a7ffb1",
  },
  {
    id: "glove_royal",
    kind: "glove",
    name: "Роял",
    price: 120,
    rarity: "common",
    color: "#1e3a8a",
    accent: "#60a5fa",
  },
  {
    id: "glove_crimson",
    kind: "glove",
    name: "Кровь",
    price: 150,
    rarity: "common",
    color: "#b91c1c",
    accent: "#fca5a5",
  },
  {
    id: "glove_gold",
    kind: "glove",
    name: "Золото",
    price: 300,
    rarity: "rare",
    color: "#facc15",
    accent: "#fff7c2",
  },
  {
    id: "glove_carbon",
    kind: "glove",
    name: "Карбон",
    price: 220,
    rarity: "rare",
    color: "#1f2937",
    accent: "#7dd3fc",
  },
  {
    id: "glove_ice",
    kind: "glove",
    name: "Лёд",
    price: 180,
    rarity: "common",
    color: "#7dd3fc",
    accent: "#e0f2fe",
  },
  {
    id: "glove_fire",
    kind: "glove",
    name: "Пламя",
    price: 250,
    rarity: "rare",
    color: "#ef4444",
    accent: "#fde047",
  },
  {
    id: "glove_purple",
    kind: "glove",
    name: "Аметист",
    price: 200,
    rarity: "rare",
    color: "#7c3aed",
    accent: "#c4b5fd",
  },
  {
    id: "glove_mint",
    kind: "glove",
    name: "Мята",
    price: 140,
    rarity: "common",
    color: "#10b981",
    accent: "#a7f3d0",
  },
  {
    id: "glove_shadow",
    kind: "glove",
    name: "Тень",
    price: 350,
    rarity: "rare",
    color: "#020617",
    accent: "#a855f7",
  },
  {
    id: "glove_dragon",
    kind: "glove",
    name: "Дракон",
    price: 1200,
    rarity: "legendary",
    color: "#7f1d1d",
    accent: "#f59e0b",
  },
  {
    id: "glove_void",
    kind: "glove",
    name: "Пустота",
    price: 1500,
    rarity: "legendary",
    color: "#0f0f23",
    accent: "#c084fc",
  },
  {
    id: "glove_aurora",
    kind: "glove",
    name: "Полярное сияние",
    price: 1050,
    rarity: "legendary",
    color: "#06b6d4",
    accent: "#d946ef",
  },

  // Boots
  {
    id: "boot_black",
    kind: "boot",
    name: "Чёрные",
    price: 0,
    rarity: "common",
    color: "#0a0a0a",
    accent: "#ffffff",
  },
  {
    id: "boot_white",
    kind: "boot",
    name: "Белые",
    price: 60,
    rarity: "common",
    color: "#f4f4f5",
    accent: "#0a0a0a",
  },
  {
    id: "boot_red",
    kind: "boot",
    name: "Алые",
    price: 120,
    rarity: "common",
    color: "#dc2626",
    accent: "#fff7c2",
  },
  {
    id: "boot_gold",
    kind: "boot",
    name: "Золотые",
    price: 280,
    rarity: "rare",
    color: "#facc15",
    accent: "#0a0a0a",
  },
  {
    id: "boot_neon",
    kind: "boot",
    name: "Лазер",
    price: 200,
    rarity: "rare",
    color: "#ec4899",
    accent: "#fde68a",
  },
  {
    id: "boot_blue",
    kind: "boot",
    name: "Сапфир",
    price: 140,
    rarity: "common",
    color: "#2563eb",
    accent: "#ffffff",
  },
  {
    id: "boot_green",
    kind: "boot",
    name: "Изумруд",
    price: 160,
    rarity: "common",
    color: "#16a34a",
    accent: "#bbf7d0",
  },
  {
    id: "boot_violet",
    kind: "boot",
    name: "Фиолет",
    price: 180,
    rarity: "common",
    color: "#7c3aed",
    accent: "#fde047",
  },
  {
    id: "boot_chrome",
    kind: "boot",
    name: "Хром",
    price: 260,
    rarity: "rare",
    color: "#cbd5e1",
    accent: "#0f172a",
  },
  {
    id: "boot_lava",
    kind: "boot",
    name: "Лава",
    price: 320,
    rarity: "rare",
    color: "#dc2626",
    accent: "#facc15",
  },
  {
    id: "boot_galaxy",
    kind: "boot",
    name: "Галактика",
    price: 400,
    rarity: "rare",
    color: "#1e1b4b",
    accent: "#a78bfa",
  },
  {
    id: "boot_titan",
    kind: "boot",
    name: "Титан",
    price: 1200,
    rarity: "legendary",
    color: "#374151",
    accent: "#60a5fa",
  },
  {
    id: "boot_abyss",
    kind: "boot",
    name: "Бездна",
    price: 1400,
    rarity: "legendary",
    color: "#020617",
    accent: "#22d3ee",
  },
  {
    id: "boot_magma",
    kind: "boot",
    name: "Магма",
    price: 1100,
    rarity: "legendary",
    color: "#7c2d12",
    accent: "#f97316",
  },

  // Wristbands
  {
    id: "band_white",
    kind: "wristband",
    name: "Белая",
    price: 0,
    rarity: "common",
    color: "#ffffff",
    accent: "#000",
  },
  {
    id: "band_team",
    kind: "wristband",
    name: "Командная",
    price: 50,
    rarity: "common",
    color: "TEAM",
    accent: "#000",
  },
  {
    id: "band_gold",
    kind: "wristband",
    name: "Золото",
    price: 180,
    rarity: "rare",
    color: "#facc15",
    accent: "#000",
  },
  {
    id: "band_rainbow",
    kind: "wristband",
    name: "Радуга",
    price: 220,
    rarity: "rare",
    color: "RAINBOW",
    accent: "#000",
  },
  {
    id: "band_black",
    kind: "wristband",
    name: "Чёрная",
    price: 40,
    rarity: "common",
    color: "#0a0a0a",
    accent: "#fff",
  },
  {
    id: "band_red",
    kind: "wristband",
    name: "Алая",
    price: 90,
    rarity: "common",
    color: "#dc2626",
    accent: "#fff",
  },
  {
    id: "band_neon",
    kind: "wristband",
    name: "Кислота",
    price: 150,
    rarity: "common",
    color: "#ccff00",
    accent: "#000",
  },
  {
    id: "band_ice",
    kind: "wristband",
    name: "Лёд",
    price: 130,
    rarity: "common",
    color: "#7dd3fc",
    accent: "#000",
  },
  {
    id: "band_legend",
    kind: "wristband",
    name: "Легенда",
    price: 900,
    rarity: "legendary",
    color: "#b45309",
    accent: "#facc15",
  },
  {
    id: "band_void",
    kind: "wristband",
    name: "Пустота",
    price: 1100,
    rarity: "legendary",
    color: "#1e1b4b",
    accent: "#c084fc",
  },
  {
    id: "band_crown",
    kind: "wristband",
    name: "Корона",
    price: 800,
    rarity: "legendary",
    color: "#fef08a",
    accent: "#ca8a04",
  },

  // Socks
  {
    id: "sock_black",
    kind: "sock",
    name: "Чёрные",
    price: 0,
    rarity: "common",
    color: "#0c0c10",
    accent: "TEAM",
  },
  {
    id: "sock_white",
    kind: "sock",
    name: "Белые",
    price: 50,
    rarity: "common",
    color: "#e5e7eb",
    accent: "TEAM",
  },
  {
    id: "sock_navy",
    kind: "sock",
    name: "Военные",
    price: 100,
    rarity: "common",
    color: "#0f172a",
    accent: "#22c55e",
  },
  {
    id: "sock_neon",
    kind: "sock",
    name: "Кислота",
    price: 180,
    rarity: "common",
    color: "#ccff00",
    accent: "#000",
  },
  {
    id: "sock_red",
    kind: "sock",
    name: "Красные",
    price: 120,
    rarity: "common",
    color: "#dc2626",
    accent: "TEAM",
  },
  {
    id: "sock_blue",
    kind: "sock",
    name: "Синие",
    price: 110,
    rarity: "common",
    color: "#2563eb",
    accent: "#fff",
  },
  {
    id: "sock_gold",
    kind: "sock",
    name: "Золото",
    price: 240,
    rarity: "rare",
    color: "#facc15",
    accent: "#0a0a0a",
  },
  {
    id: "sock_purple",
    kind: "sock",
    name: "Пурпур",
    price: 160,
    rarity: "common",
    color: "#7c3aed",
    accent: "#fde047",
  },
  {
    id: "sock_stripe",
    kind: "sock",
    name: "Полоски",
    price: 200,
    rarity: "rare",
    color: "#0a0a0a",
    accent: "#ffffff",
  },
  {
    id: "sock_nova",
    kind: "sock",
    name: "Сверхновая",
    price: 900,
    rarity: "legendary",
    color: "#4c1d95",
    accent: "#facc15",
  },
  {
    id: "sock_eclipse",
    kind: "sock",
    name: "Затмение",
    price: 1200,
    rarity: "legendary",
    color: "#020617",
    accent: "#f43f5e",
  },
  {
    id: "sock_aurora",
    kind: "sock",
    name: "Сияние",
    price: 1000,
    rarity: "legendary",
    color: "#164e63",
    accent: "#67e8f9",
  },
  // Balls — generated below
  ...buildBallItems(),
];

export const DEFAULT_EQUIPPED: Record<ItemKind, string> = {
  glove: "glove_orange",
  boot: "boot_black",
  wristband: "band_white",
  sock: "sock_black",
  ball: "ball_classic_classic",
};

// ---------------- Perks (бонусы за кристаллы) ----------------
export type PerkId = "saveBoost" | "goalBoost" | "coinBoost" | "accuracy";

export type Perk = {
  id: PerkId;
  name: string;
  desc: string;
  icon: string;
  pricePerLevel: number; // в кристаллах
  maxLevel: number;
  /** Численный эффект одного уровня (для отображения) */
  step: string;
};

export const PERKS: Perk[] = [
  {
    id: "saveBoost",
    name: "Реакция вратаря",
    desc: "Шанс автосейва на любом ударе соперника",
    icon: "🧤",
    pricePerLevel: 3,
    maxLevel: 4,
    step: "+5% за уровень",
  },
  {
    id: "goalBoost",
    name: "Удар по углам",
    desc: "Шанс что вратарь соперника прыгнет не туда",
    icon: "🎯",
    pricePerLevel: 3,
    maxLevel: 4,
    step: "+5% за уровень",
  },
  {
    id: "coinBoost",
    name: "Спонсорский контракт",
    desc: "Бонусные монеты за гол и сейв",
    icon: "💼",
    pricePerLevel: 2,
    maxLevel: 3,
    step: "+5 монет за уровень",
  },
  {
    id: "accuracy",
    name: "Точность",
    desc: "Уменьшает шанс пробить мимо ворот",
    icon: "📏",
    pricePerLevel: 2,
    maxLevel: 5,
    step: "−2% за уровень",
  },
];

export function getPerk(id: PerkId): Perk {
  return PERKS.find((p) => p.id === id)!;
}

// ---------------- Sponsors (открываются за победы) ----------------
export type Sponsor = {
  id: string;
  name: string; // короткое имя на футболке
  minWins: number;
  color: string; // фон бейджа
  textColor: string;
};

export const SPONSORS: Sponsor[] = [
  { id: "none", name: "—", minWins: 0, color: "transparent", textColor: "#fff" },
  { id: "pizza", name: "PIZZA+", minWins: 3, color: "#dc2626", textColor: "#fff" },
  { id: "turbo", name: "TURBO", minWins: 8, color: "#0f172a", textColor: "#fde047" },
  { id: "neon", name: "NEON", minWins: 15, color: "#0a0a0a", textColor: "#ccff00" },
  { id: "lava", name: "LAVA", minWins: 25, color: "#7c2d12", textColor: "#fdba74" },
  { id: "gold", name: "GOLD CO", minWins: 40, color: "#facc15", textColor: "#0a0a0a" },
  { id: "apex", name: "APEX", minWins: 60, color: "#020617", textColor: "#22d3ee" },
  { id: "royal", name: "ROYAL", minWins: 90, color: "#581c87", textColor: "#fbbf24" },
];

export function getSponsor(id: string): Sponsor {
  return SPONSORS.find((s) => s.id === id) ?? SPONSORS[0];
}

// ---------------- Rating milestones (награды за рейтинг) ----------------
export type RatingMilestone = {
  rating: number;
  coins: number;
  crystals: number;
  title: string;
  icon: string;
};

export const RATING_MILESTONES: RatingMilestone[] = [
  { rating: 1050, coins: 100, crystals: 0, title: "Новичок+", icon: "🥉" },
  { rating: 1100, coins: 200, crystals: 1, title: "Любитель", icon: "🎖️" },
  { rating: 1200, coins: 400, crystals: 2, title: "Опытный", icon: "🏅" },
  { rating: 1300, coins: 700, crystals: 3, title: "Профи", icon: "⭐" },
  { rating: 1500, coins: 1200, crystals: 5, title: "Мастер", icon: "🌟" },
  { rating: 1750, coins: 2000, crystals: 8, title: "Эксперт", icon: "💎" },
  { rating: 2000, coins: 3500, crystals: 12, title: "Элита", icon: "👑" },
  { rating: 2500, coins: 6000, crystals: 20, title: "Легенда", icon: "🏆" },
];

const STORAGE_KEY = "penalty-shop-v2";

type Store = {
  coins: number;
  crystals: number;
  owned: string[];
  equipped: Record<ItemKind, string>;
  perks: Record<PerkId, number>;
  ownedTeams: string[];
  wins: number;
  losses: number;
  matches: number;
  spentCoins: number;
  sponsor: string;
  playerName: string | null;
  tournamentStage: number; // 0=1/16, 1=1/8, 2=1/4, 3=1/2, 4=Финал, 5=Чемпион
  tournamentTitles: number; // сколько раз дошёл до чемпиона
  rating: number; // рейтинг в рейтинговых матчах
  ratingClaimed: number[]; // полученные награды-рейтинги
  dailyLastClaim: string | null; // YYYY-MM-DD последнего получения подарка
  dailyStreak: number; // текущая серия дней подряд (1..7, потом цикл)
  achievementsClaimed: string[]; // id полученных достижений
};

const initial: Store = {
  coins: 50,
  crystals: 0,
  owned: ITEMS.filter((i) => i.price === 0).map((i) => i.id),
  equipped: { ...DEFAULT_EQUIPPED },
  perks: { saveBoost: 0, goalBoost: 0, coinBoost: 0, accuracy: 0 },
  ownedTeams: [],
  wins: 0,
  losses: 0,
  matches: 0,
  spentCoins: 0,
  sponsor: "none",
  playerName: null,
  tournamentStage: 0,
  tournamentTitles: 0,
  rating: 1000,
  ratingClaimed: [],
  dailyLastClaim: null,
  dailyStreak: 0,
  achievementsClaimed: [],
};

function cloneInitial(): Store {
  return {
    ...initial,
    owned: [...initial.owned],
    equipped: { ...initial.equipped },
    perks: { ...initial.perks },
    ownedTeams: [...initial.ownedTeams],
    ratingClaimed: [...initial.ratingClaimed],
    achievementsClaimed: [...initial.achievementsClaimed],
  };
}

function safeNumber(value: unknown, fallback: number, min = 0): number {
  return typeof value === "number" && Number.isFinite(value) && value >= min ? value : fallback;
}

function read(): Store {
  if (typeof window === "undefined") return cloneInitial();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneInitial();
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      coins: safeNumber(parsed.coins, initial.coins),
      crystals: safeNumber(parsed.crystals, initial.crystals),
      owned: Array.from(new Set([...initial.owned, ...(parsed.owned ?? [])])),
      equipped: { ...DEFAULT_EQUIPPED, ...(parsed.equipped ?? {}) },
      perks: { ...initial.perks, ...(parsed.perks ?? {}) },
      ownedTeams: parsed.ownedTeams ?? initial.ownedTeams,
      wins: safeNumber(parsed.wins, initial.wins),
      losses: safeNumber(parsed.losses, initial.losses),
      matches: safeNumber(parsed.matches, initial.matches),
      spentCoins: safeNumber(parsed.spentCoins, initial.spentCoins),
      sponsor: parsed.sponsor ?? initial.sponsor,
      playerName: parsed.playerName ?? initial.playerName,
      tournamentStage: safeNumber(parsed.tournamentStage, initial.tournamentStage),
      tournamentTitles: safeNumber(parsed.tournamentTitles, initial.tournamentTitles),
      rating: safeNumber(parsed.rating, initial.rating),
      ratingClaimed: parsed.ratingClaimed ?? initial.ratingClaimed,
      dailyLastClaim: parsed.dailyLastClaim ?? initial.dailyLastClaim,
      dailyStreak: Math.min(7, safeNumber(parsed.dailyStreak, initial.dailyStreak)),
      achievementsClaimed: parsed.achievementsClaimed ?? initial.achievementsClaimed,
    };
  } catch {
    return cloneInitial();
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("penalty-shop-change"));
}

export function getItem(id: string): ShopItem | undefined {
  return ITEMS.find((i) => i.id === id);
}

export function useInventory() {
  const [store, setStore] = useState<Store>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(read());
    setHydrated(true);
    const onChange = () => setStore(read());
    window.addEventListener("penalty-shop-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("penalty-shop-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // Синхронизируем рейтинг с облаком при изменениях
  useEffect(() => {
    if (!store.playerName) return;
    const t = window.setTimeout(() => {
      syncPlayer({
        name: store.playerName!,
        wins: store.wins,
        losses: store.losses,
        matches: store.matches,
      }).catch(() => {});
    }, 400);
    return () => window.clearTimeout(t);
  }, [store.playerName, store.wins, store.losses, store.matches]);

  const addCoins = useCallback((n: number) => {
    const next = read();
    next.coins = Math.max(0, next.coins + n);
    write(next);
  }, []);

  const addCrystals = useCallback((n: number) => {
    const next = read();
    next.crystals = Math.max(0, next.crystals + n);
    write(next);
  }, []);

  const buyPerk = useCallback((id: PerkId) => {
    const perk = getPerk(id);
    const next = read();
    const cur = next.perks[id] ?? 0;
    if (cur >= perk.maxLevel) return false;
    if (next.crystals < perk.pricePerLevel) return false;
    next.crystals -= perk.pricePerLevel;
    next.perks = { ...next.perks, [id]: cur + 1 };
    write(next);
    return true;
  }, []);

  const buy = useCallback((id: string) => {
    const item = getItem(id);
    if (!item) return false;
    const next = read();
    if (next.owned.includes(id)) return true;
    if (next.coins < item.price) return false;
    next.coins -= item.price;
    next.spentCoins = (next.spentCoins ?? 0) + item.price;
    next.owned = [...next.owned, id];
    next.equipped = { ...next.equipped, [item.kind]: id };
    write(next);
    return true;
  }, []);

  const equip = useCallback((id: string) => {
    const item = getItem(id);
    if (!item) return;
    const next = read();
    if (!next.owned.includes(id)) return;
    next.equipped = { ...next.equipped, [item.kind]: id };
    write(next);
  }, []);

  const buyTeam = useCallback((teamName: string, price: number) => {
    const next = read();
    if (next.ownedTeams.includes(teamName)) return true;
    if (next.crystals < price) return false;
    next.crystals -= price;
    next.ownedTeams = [...next.ownedTeams, teamName];
    write(next);
    return true;
  }, []);

  const addWin = useCallback(() => {
    const next = read();
    next.wins = (next.wins ?? 0) + 1;
    // Авто-апгрейд спонсора до лучшего доступного
    const best = [...SPONSORS]
      .filter((s) => next.wins >= s.minWins)
      .sort((a, b) => b.minWins - a.minWins)[0];
    if (best && best.id !== next.sponsor) {
      const cur = getSponsor(next.sponsor);
      // Поднимаем только если новый лучше текущего
      if (best.minWins > cur.minWins) next.sponsor = best.id;
    }
    write(next);
  }, []);

  const equipSponsor = useCallback((id: string) => {
    const sp = getSponsor(id);
    const next = read();
    if (next.wins < sp.minWins) return false;
    next.sponsor = id;
    write(next);
    return true;
  }, []);

  const addMatch = useCallback(() => {
    const next = read();
    next.matches = (next.matches ?? 0) + 1;
    write(next);
  }, []);

  const addLoss = useCallback(() => {
    const next = read();
    next.losses = (next.losses ?? 0) + 1;
    write(next);
  }, []);

  const advanceTournament = useCallback(() => {
    const next = read();
    const cur = next.tournamentStage ?? 0;
    if (cur >= 5) {
      // Уже чемпион — начинаем новый турнир
      next.tournamentTitles = (next.tournamentTitles ?? 0) + 1;
      next.tournamentStage = 0;
    } else {
      next.tournamentStage = cur + 1;
      if (next.tournamentStage === 5) {
        next.tournamentTitles = (next.tournamentTitles ?? 0) + 1;
      }
    }
    write(next);
    return next.tournamentStage;
  }, []);

  const resetTournament = useCallback(() => {
    const next = read();
    next.tournamentStage = 0;
    write(next);
  }, []);

  const addRatingWin = useCallback(() => {
    const next = read();
    next.rating = (next.rating ?? 1000) + 30;
    const claimed: RatingMilestone[] = [];
    const already = new Set(next.ratingClaimed ?? []);
    for (const m of RATING_MILESTONES) {
      if (next.rating >= m.rating && !already.has(m.rating)) {
        already.add(m.rating);
        next.coins += m.coins;
        next.crystals += m.crystals;
        claimed.push(m);
      }
    }
    next.ratingClaimed = Array.from(already);
    write(next);
    return { rating: next.rating, claimed };
  }, []);

  const addRatingLoss = useCallback(() => {
    const next = read();
    next.rating = Math.max(0, (next.rating ?? 1000) - 40);
    write(next);
    return next.rating;
  }, []);

  const setPlayerName = useCallback((name: string) => {
    const next = read();
    next.playerName = name.trim().slice(0, 20) || null;
    write(next);
  }, []);

  const claimDaily = useCallback(() => {
    const next = read();
    const today = todayKey();
    if (next.dailyLastClaim === today) return null;
    const yesterday = yesterdayKey();
    const continuing = next.dailyLastClaim === yesterday;
    const nextStreak = continuing ? Math.min(7, (next.dailyStreak ?? 0) + 1) : 1;
    const reward = DAILY_REWARDS[nextStreak - 1];
    next.coins += reward.coins;
    next.crystals += reward.crystals;
    next.dailyStreak = nextStreak;
    next.dailyLastClaim = today;
    write(next);
    return { day: nextStreak, ...reward };
  }, []);

  const claimAchievement = useCallback((id: string) => {
    const ach = ACHIEVEMENTS.find((a) => a.id === id);
    if (!ach) return false;
    const next = read();
    if ((next.achievementsClaimed ?? []).includes(id)) return false;
    if (!achievementUnlocked(ach, next)) return false;
    next.coins += ach.coins;
    next.crystals += ach.crystals;
    next.achievementsClaimed = [...(next.achievementsClaimed ?? []), id];
    write(next);
    return true;
  }, []);

  const reset = useCallback(() => write(cloneInitial()), []);

  return {
    ...store,
    hydrated,
    addCoins,
    addCrystals,
    buy,
    buyPerk,
    buyTeam,
    equip,
    addWin,
    addMatch,
    addLoss,
    advanceTournament,
    resetTournament,
    addRatingWin,
    addRatingLoss,
    equipSponsor,
    setPlayerName,
    claimDaily,
    canClaimDaily: store.dailyLastClaim !== todayKey(),
    claimAchievement,
    reset,
  };
}

// ---------------- Daily rewards ----------------
// Кристаллы — премиум-валюта, дают только в конце недели за серию.
export const DAILY_REWARDS: { coins: number; crystals: number }[] = [
  { coins: 50, crystals: 0 },
  { coins: 80, crystals: 0 },
  { coins: 120, crystals: 0 },
  { coins: 150, crystals: 1 },
  { coins: 200, crystals: 0 },
  { coins: 250, crystals: 1 },
  { coins: 400, crystals: 3 },
];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function resolveColor(raw: string, teamColor: string): string {
  if (raw === "TEAM") return teamColor;
  if (raw === "RAINBOW") return "url(#rainbowGrad)";
  return raw;
}

// ---------------- Achievements ----------------
export type AchievementDifficulty = "easy" | "medium" | "hard" | "legendary";

export type Achievement = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  difficulty: AchievementDifficulty;
  coins: number;
  crystals: number;
  /** Progress (0..1) given the store state */
  progress: (s: AchievementCheckState) => number;
};

export type AchievementCheckState = {
  wins: number;
  losses: number;
  matches: number;
  coins: number;
  crystals: number;
  spentCoins: number;
  owned: string[];
  ownedTeams: string[];
  rating: number;
  tournamentTitles: number;
  dailyStreak: number;
};

function ratio(value: number, target: number): number {
  if (target <= 0) return 1;
  return Math.max(0, Math.min(1, value / target));
}

export const ACHIEVEMENTS: Achievement[] = [
  // ---- EASY ----
  {
    id: "first_match",
    name: "Первый удар",
    desc: "Сыграй 1 матч",
    icon: "⚽",
    difficulty: "easy",
    coins: 50,
    crystals: 0,
    progress: (s) => ratio(s.matches, 1),
  },
  {
    id: "first_win",
    name: "Первая победа",
    desc: "Выиграй 1 матч",
    icon: "🥇",
    difficulty: "easy",
    coins: 80,
    crystals: 0,
    progress: (s) => ratio(s.wins, 1),
  },
  {
    id: "buy_first",
    name: "Шопоголик",
    desc: "Купи любой предмет",
    icon: "🛍️",
    difficulty: "easy",
    coins: 60,
    crystals: 0,
    progress: (s) => ratio(s.spentCoins, 1),
  },
  {
    id: "daily_3",
    name: "Постоянный гость",
    desc: "Получи подарок 3 дня подряд",
    icon: "📅",
    difficulty: "easy",
    coins: 100,
    crystals: 1,
    progress: (s) => ratio(s.dailyStreak, 3),
  },
  {
    id: "wins_5",
    name: "На разогреве",
    desc: "Выиграй 5 матчей",
    icon: "🔥",
    difficulty: "easy",
    coins: 150,
    crystals: 1,
    progress: (s) => ratio(s.wins, 5),
  },

  // ---- MEDIUM ----
  {
    id: "wins_25",
    name: "Опытный боец",
    desc: "Выиграй 25 матчей",
    icon: "💪",
    difficulty: "medium",
    coins: 400,
    crystals: 3,
    progress: (s) => ratio(s.wins, 25),
  },
  {
    id: "matches_50",
    name: "Марафонец",
    desc: "Сыграй 50 матчей",
    icon: "🏃",
    difficulty: "medium",
    coins: 300,
    crystals: 2,
    progress: (s) => ratio(s.matches, 50),
  },
  {
    id: "collector_10",
    name: "Коллекционер",
    desc: "Соберит 10 предметов",
    icon: "🎨",
    difficulty: "medium",
    coins: 350,
    crystals: 3,
    progress: (s) => ratio(s.owned.length, 10),
  },
  {
    id: "rating_1300",
    name: "Профессионал",
    desc: "Достигни рейтинга 1300",
    icon: "⭐",
    difficulty: "medium",
    coins: 500,
    crystals: 4,
    progress: (s) => ratio(s.rating, 1300),
  },
  {
    id: "teams_3",
    name: "Транcфер",
    desc: "Купи 3 команды",
    icon: "🤝",
    difficulty: "medium",
    coins: 400,
    crystals: 3,
    progress: (s) => ratio(s.ownedTeams.length, 3),
  },
  {
    id: "tournament_1",
    name: "Чемпион турнира",
    desc: "Дойди до титула чемпиона",
    icon: "🏆",
    difficulty: "medium",
    coins: 600,
    crystals: 5,
    progress: (s) => ratio(s.tournamentTitles, 1),
  },

  // ---- HARD ----
  {
    id: "wins_100",
    name: "Сотня",
    desc: "Выиграй 100 матчей",
    icon: "💯",
    difficulty: "hard",
    coins: 1500,
    crystals: 10,
    progress: (s) => ratio(s.wins, 100),
  },
  {
    id: "rating_1750",
    name: "Эксперт",
    desc: "Достигни рейтинга 1750",
    icon: "💎",
    difficulty: "hard",
    coins: 1500,
    crystals: 12,
    progress: (s) => ratio(s.rating, 1750),
  },
  {
    id: "collector_30",
    name: "Магнат",
    desc: "Собери 30 предметов",
    icon: "👑",
    difficulty: "hard",
    coins: 1200,
    crystals: 10,
    progress: (s) => ratio(s.owned.length, 30),
  },
  {
    id: "tournament_3",
    name: "Трёхкратный",
    desc: "Стань чемпионом 3 раза",
    icon: "🏅",
    difficulty: "hard",
    coins: 1800,
    crystals: 12,
    progress: (s) => ratio(s.tournamentTitles, 3),
  },
  {
    id: "daily_7",
    name: "Неделя без пропуска",
    desc: "Получай подарок 7 дней подряд",
    icon: "📆",
    difficulty: "hard",
    coins: 1000,
    crystals: 8,
    progress: (s) => ratio(s.dailyStreak, 7),
  },

  // ---- LEGENDARY ----
  {
    id: "rating_2000",
    name: "Элита",
    desc: "Рейтинг 2000+",
    icon: "🌟",
    difficulty: "legendary",
    coins: 5000,
    crystals: 25,
    progress: (s) => ratio(s.rating, 2000),
  },
  {
    id: "rating_2500",
    name: "Легенда стадиона",
    desc: "Рейтинг 2500+",
    icon: "🔮",
    difficulty: "legendary",
    coins: 10000,
    crystals: 50,
    progress: (s) => ratio(s.rating, 2500),
  },
  {
    id: "wins_500",
    name: "Бессмертный",
    desc: "Выиграй 500 матчей",
    icon: "⚡",
    difficulty: "legendary",
    coins: 8000,
    crystals: 40,
    progress: (s) => ratio(s.wins, 500),
  },
  {
    id: "tournament_10",
    name: "Король арены",
    desc: "10 титулов чемпиона",
    icon: "👑",
    difficulty: "legendary",
    coins: 12000,
    crystals: 60,
    progress: (s) => ratio(s.tournamentTitles, 10),
  },
];

function achievementUnlocked(a: Achievement, s: AchievementCheckState): boolean {
  return a.progress(s) >= 1;
}

export function isAchievementUnlocked(a: Achievement, s: AchievementCheckState): boolean {
  return achievementUnlocked(a, s);
}

export const DIFFICULTY_META: Record<AchievementDifficulty, { label: string; color: string }> = {
  easy: { label: "Лёгкое", color: "#a3e635" },
  medium: { label: "Среднее", color: "#38bdf8" },
  hard: { label: "Сложное", color: "#f59e0b" },
  legendary: { label: "Легендарное", color: "#f43f5e" },
};
