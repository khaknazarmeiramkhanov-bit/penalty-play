import { useEffect, useState, useCallback } from "react";

export type ItemKind = "glove" | "boot" | "wristband" | "sock";

export type ShopItem = {
  id: string;
  kind: ItemKind;
  name: string;
  price: number;
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
    color: "#ff7a1a",
    accent: "#ffb066",
  },
  { id: "glove_neon", kind: "glove", name: "Неон", price: 80, color: "#39ff14", accent: "#a7ffb1" },
  {
    id: "glove_royal",
    kind: "glove",
    name: "Роял",
    price: 120,
    color: "#1e3a8a",
    accent: "#60a5fa",
  },
  {
    id: "glove_crimson",
    kind: "glove",
    name: "Кровь",
    price: 150,
    color: "#b91c1c",
    accent: "#fca5a5",
  },
  {
    id: "glove_gold",
    kind: "glove",
    name: "Золото",
    price: 300,
    color: "#facc15",
    accent: "#fff7c2",
  },
  {
    id: "glove_carbon",
    kind: "glove",
    name: "Карбон",
    price: 220,
    color: "#1f2937",
    accent: "#7dd3fc",
  },

  // Boots
  { id: "boot_black", kind: "boot", name: "Чёрные", price: 0, color: "#0a0a0a", accent: "#ffffff" },
  { id: "boot_white", kind: "boot", name: "Белые", price: 60, color: "#f4f4f5", accent: "#0a0a0a" },
  { id: "boot_red", kind: "boot", name: "Алые", price: 120, color: "#dc2626", accent: "#fff7c2" },
  {
    id: "boot_gold",
    kind: "boot",
    name: "Золотые",
    price: 280,
    color: "#facc15",
    accent: "#0a0a0a",
  },
  { id: "boot_neon", kind: "boot", name: "Лазер", price: 200, color: "#ec4899", accent: "#fde68a" },

  // Wristbands
  {
    id: "band_white",
    kind: "wristband",
    name: "Белая",
    price: 0,
    color: "#ffffff",
    accent: "#000",
  },
  {
    id: "band_team",
    kind: "wristband",
    name: "Командная",
    price: 50,
    color: "TEAM",
    accent: "#000",
  },
  {
    id: "band_gold",
    kind: "wristband",
    name: "Золото",
    price: 180,
    color: "#facc15",
    accent: "#000",
  },
  {
    id: "band_rainbow",
    kind: "wristband",
    name: "Радуга",
    price: 220,
    color: "RAINBOW",
    accent: "#000",
  },

  // Socks
  { id: "sock_black", kind: "sock", name: "Чёрные", price: 0, color: "#0c0c10", accent: "TEAM" },
  { id: "sock_white", kind: "sock", name: "Белые", price: 50, color: "#e5e7eb", accent: "TEAM" },
  {
    id: "sock_navy",
    kind: "sock",
    name: "Военные",
    price: 100,
    color: "#0f172a",
    accent: "#22c55e",
  },
  { id: "sock_neon", kind: "sock", name: "Кислота", price: 180, color: "#ccff00", accent: "#000" },
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

const STORAGE_KEY = "penalty-shop-v2";

type Store = {
  coins: number;
  crystals: number;
  owned: string[];
  equipped: Record<ItemKind, string>;
  perks: Record<PerkId, number>;
};

const initial: Store = {
  coins: 50,
  crystals: 0,
  owned: ITEMS.filter((i) => i.price === 0).map((i) => i.id),
  equipped: { ...DEFAULT_EQUIPPED },
  perks: { saveBoost: 0, goalBoost: 0, coinBoost: 0, accuracy: 0 },
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

  const reset = useCallback(() => write(initial), []);

  return { ...store, addCoins, addCrystals, buy, buyPerk, equip, reset };
}

export function resolveColor(raw: string, teamColor: string): string {
  if (raw === "TEAM") return teamColor;
  if (raw === "RAINBOW") return "url(#rainbowGrad)";
  return raw;
}
