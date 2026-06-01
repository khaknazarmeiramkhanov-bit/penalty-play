import { useEffect, useState, useCallback } from "react";

export type ItemKind = "glove" | "boot" | "wristband" | "sock";

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
};

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
  { id: "glove_neon", kind: "glove", name: "Неон", price: 80, rarity: "common", color: "#39ff14", accent: "#a7ffb1" },
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
  { id: "boot_black", kind: "boot", name: "Чёрные", price: 0, rarity: "common", color: "#0a0a0a", accent: "#ffffff" },
  { id: "boot_white", kind: "boot", name: "Белые", price: 60, rarity: "common", color: "#f4f4f5", accent: "#0a0a0a" },
  { id: "boot_red", kind: "boot", name: "Алые", price: 120, rarity: "common", color: "#dc2626", accent: "#fff7c2" },
  {
    id: "boot_gold",
    kind: "boot",
    name: "Золотые",
    price: 280,
    rarity: "rare",
    color: "#facc15",
    accent: "#0a0a0a",
  },
  { id: "boot_neon", kind: "boot", name: "Лазер", price: 200, rarity: "rare", color: "#ec4899", accent: "#fde68a" },
  { id: "boot_blue", kind: "boot", name: "Сапфир", price: 140, rarity: "common", color: "#2563eb", accent: "#ffffff" },
  { id: "boot_green", kind: "boot", name: "Изумруд", price: 160, rarity: "common", color: "#16a34a", accent: "#bbf7d0" },
  { id: "boot_violet", kind: "boot", name: "Фиолет", price: 180, rarity: "common", color: "#7c3aed", accent: "#fde047" },
  { id: "boot_chrome", kind: "boot", name: "Хром", price: 260, rarity: "rare", color: "#cbd5e1", accent: "#0f172a" },
  { id: "boot_lava", kind: "boot", name: "Лава", price: 320, rarity: "rare", color: "#dc2626", accent: "#facc15" },
  { id: "boot_galaxy", kind: "boot", name: "Галактика", price: 400, rarity: "rare", color: "#1e1b4b", accent: "#a78bfa" },
  { id: "boot_titan", kind: "boot", name: "Титан", price: 1200, rarity: "legendary", color: "#374151", accent: "#60a5fa" },
  { id: "boot_abyss", kind: "boot", name: "Бездна", price: 1400, rarity: "legendary", color: "#020617", accent: "#22d3ee" },
  { id: "boot_magma", kind: "boot", name: "Магма", price: 1100, rarity: "legendary", color: "#7c2d12", accent: "#f97316" },

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
  { id: "sock_black", kind: "sock", name: "Чёрные", price: 0, rarity: "common", color: "#0c0c10", accent: "TEAM" },
  { id: "sock_white", kind: "sock", name: "Белые", price: 50, rarity: "common", color: "#e5e7eb", accent: "TEAM" },
  {
    id: "sock_navy",
    kind: "sock",
    name: "Военные",
    price: 100,
    rarity: "common",
    color: "#0f172a",
    accent: "#22c55e",
  },
  { id: "sock_neon", kind: "sock", name: "Кислота", price: 180, rarity: "common", color: "#ccff00", accent: "#000" },
  { id: "sock_red", kind: "sock", name: "Красные", price: 120, rarity: "common", color: "#dc2626", accent: "TEAM" },
  { id: "sock_blue", kind: "sock", name: "Синие", price: 110, rarity: "common", color: "#2563eb", accent: "#fff" },
  { id: "sock_gold", kind: "sock", name: "Золото", price: 240, rarity: "rare", color: "#facc15", accent: "#0a0a0a" },
  { id: "sock_purple", kind: "sock", name: "Пурпур", price: 160, rarity: "common", color: "#7c3aed", accent: "#fde047" },
  { id: "sock_stripe", kind: "sock", name: "Полоски", price: 200, rarity: "rare", color: "#0a0a0a", accent: "#ffffff" },
  { id: "sock_nova", kind: "sock", name: "Сверхновая", price: 900, rarity: "legendary", color: "#4c1d95", accent: "#facc15" },
  { id: "sock_eclipse", kind: "sock", name: "Затмение", price: 1200, rarity: "legendary", color: "#020617", accent: "#f43f5e" },
  { id: "sock_aurora", kind: "sock", name: "Сияние", price: 1000, rarity: "legendary", color: "#164e63", accent: "#67e8f9" },
];

export const DEFAULT_EQUIPPED: Record<ItemKind, string> = {
  glove: "glove_orange",
  boot: "boot_black",
  wristband: "band_white",
  sock: "sock_black",
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
};

function read(): Store {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      coins: parsed.coins ?? initial.coins,
      crystals: parsed.crystals ?? initial.crystals,
      owned: Array.from(new Set([...initial.owned, ...(parsed.owned ?? [])])),
      equipped: { ...DEFAULT_EQUIPPED, ...(parsed.equipped ?? {}) },
      perks: { ...initial.perks, ...(parsed.perks ?? {}) },
      ownedTeams: parsed.ownedTeams ?? initial.ownedTeams,
      wins: parsed.wins ?? initial.wins,
      losses: parsed.losses ?? initial.losses,
      matches: parsed.matches ?? initial.matches,
      spentCoins: parsed.spentCoins ?? initial.spentCoins,
      sponsor: parsed.sponsor ?? initial.sponsor,
    };
  } catch {
    return initial;
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

  useEffect(() => {
    setStore(read());
    const onChange = () => setStore(read());
    window.addEventListener("penalty-shop-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("penalty-shop-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

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

  const reset = useCallback(() => write(initial), []);

  return {
    ...store,
    addCoins,
    addCrystals,
    buy,
    buyPerk,
    buyTeam,
    equip,
    addWin,
    equipSponsor,
    reset,
  };
}

export function resolveColor(raw: string, teamColor: string): string {
  if (raw === "TEAM") return teamColor;
  if (raw === "RAINBOW") return "url(#rainbowGrad)";
  return raw;
}
