import { createFileRoute, Link } from "@tanstack/react-router";
import { ITEMS, PERKS, useInventory, type ItemKind, type Perk, type ShopItem } from "@/lib/shop";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Пенальти — Магазин" },
      { name: "description", content: "Покупай перчатки, бутсы и аксессуары." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,900;1,900&display=swap",
      },
    ],
  }),
  component: ShopPage,
});

const SECTIONS: { kind: ItemKind; title: string }[] = [
  { kind: "glove", title: "Перчатки вратаря" },
  { kind: "boot", title: "Бутсы" },
  { kind: "wristband", title: "Напульсники" },
  { kind: "sock", title: "Гетры" },
];

function ShopPage() {
  const inv = useInventory();

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center px-4 py-8"
      style={{ backgroundColor: "#0d5c2a", fontFamily: "'Kanit', sans-serif" }}
    >
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-stretch gap-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/teams"
            className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase hover:text-white"
          >
            ← Назад
          </Link>
          <h1
            className="text-3xl font-black italic uppercase text-white sm:text-4xl"
            style={{ textShadow: "0 4px 0 rgba(0,0,0,0.3)" }}
          >
            Магазин
          </h1>
          <div
            className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 font-black text-white"
            style={{ border: "2px solid #ccff00" }}
          >
            <span className="text-xl">🪙</span>
            <span className="text-lg">{inv.coins}</span>
            <span className="ml-2 text-xl">💎</span>
            <span className="text-lg">{inv.crystals}</span>
          </div>
        </div>

        <p className="text-center text-[11px] tracking-[0.25em] text-white/60 uppercase">
          🪙 гол +20 · сейв +15 · победа +100 &nbsp;·&nbsp; 💎 победа +1 · сухой матч +3
        </p>

        <PerksSection
          perks={PERKS}
          levels={inv.perks}
          crystals={inv.crystals}
          onBuy={inv.buyPerk}
        />

        {SECTIONS.map((s) => (
          <Section
            key={s.kind}
            title={s.title}
            items={ITEMS.filter((i) => i.kind === s.kind)}
            coins={inv.coins}
            owned={inv.owned}
            equipped={inv.equipped[s.kind]}
            onBuy={inv.buy}
            onEquip={inv.equip}
          />
        ))}

        <button
          type="button"
          onClick={inv.reset}
          className="mx-auto mt-2 rounded px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase hover:text-white/80"
        >
          сбросить инвентарь
        </button>
      </div>
    </main>
  );
}

function Section({
  title,
  items,
  coins,
  owned,
  equipped,
  onBuy,
  onEquip,
}: {
  title: string;
  items: ShopItem[];
  coins: number;
  owned: string[];
  equipped: string;
  onBuy: (id: string) => void;
  onEquip: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-black tracking-[0.3em] text-white/80 uppercase">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const isOwned = owned.includes(item.id);
          const isEquipped = equipped === item.id;
          const canAfford = coins >= item.price;
          const isLegendary = item.rarity === "legendary";
          const isRare = item.rarity === "rare";
          return (
            <div
              key={item.id}
              className="relative flex flex-col items-center gap-2 rounded-xl bg-black/40 p-3 backdrop-blur-sm"
              style={{
                border: isEquipped
                  ? "2px solid #ccff00"
                  : isLegendary
                    ? "2px solid #fbbf24"
                    : isRare
                      ? "2px solid #a855f7"
                      : "2px solid rgba(255,255,255,0.15)",
                boxShadow: isEquipped
                  ? "0 0 24px rgba(204,255,0,0.4)"
                  : isLegendary
                    ? "0 0 20px rgba(251,191,36,0.35), inset 0 0 12px rgba(251,191,36,0.12)"
                    : undefined,
              }}
            >
              {isLegendary && (
                <span className="absolute top-1.5 right-1.5 text-xs">👑</span>
              )}
              {isRare && !isLegendary && (
                <span className="absolute top-1.5 right-1.5 text-xs">⭐</span>
              )}
              <Preview item={item} />
              <span className="text-center text-sm font-black tracking-wider text-white uppercase">
                {item.name}
              </span>
              {isOwned ? (
                <button
                  type="button"
                  disabled={isEquipped}
                  onClick={() => onEquip(item.id)}
                  className="w-full rounded-md px-3 py-2 text-xs font-black tracking-widest uppercase transition-all disabled:opacity-60"
                  style={{
                    backgroundColor: isEquipped
                      ? "#ccff00"
                      : isLegendary
                        ? "rgba(251,191,36,0.25)"
                        : isRare
                          ? "rgba(168,85,247,0.25)"
                          : "rgba(255,255,255,0.1)",
                    color: isEquipped ? "#000" : isLegendary ? "#fbbf24" : "#fff",
                  }}
                >
                  {isEquipped ? "Надето" : "Надеть"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => onBuy(item.id)}
                  className="flex w-full items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-black tracking-widest uppercase transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: canAfford
                      ? isLegendary
                        ? "#fbbf24"
                        : isRare
                          ? "#a855f7"
                          : "#ccff00"
                      : isLegendary
                        ? "rgba(251,191,36,0.12)"
                        : isRare
                          ? "rgba(168,85,247,0.12)"
                          : "rgba(255,255,255,0.08)",
                    color: canAfford ? (isLegendary || isRare ? "#000" : "#000") : isLegendary ? "#fbbf24" : isRare ? "#c4b5fd" : "#fff",
                  }}
                >
                  🪙 {item.price}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PerksSection({
  perks,
  levels,
  crystals,
  onBuy,
}: {
  perks: Perk[];
  levels: Record<string, number>;
  crystals: number;
  onBuy: (id: Perk["id"]) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-xs font-black tracking-[0.3em] text-white/80 uppercase">
        <span>💎</span> Способности
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {perks.map((p) => {
          const lvl = levels[p.id] ?? 0;
          const maxed = lvl >= p.maxLevel;
          const canAfford = !maxed && crystals >= p.pricePerLevel;
          return (
            <div
              key={p.id}
              className="flex flex-col gap-2 rounded-xl bg-black/40 p-3 backdrop-blur-sm"
              style={{ border: "2px solid rgba(255,255,255,0.15)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p.icon}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-wider text-white uppercase">
                    {p.name}
                  </span>
                  <span className="text-[10px] tracking-widest text-white/60 uppercase">
                    {p.step}
                  </span>
                </div>
              </div>
              <p className="text-xs text-white/70">{p.desc}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: p.maxLevel }).map((_, i) => (
                  <span
                    key={i}
                    className="h-2 flex-1 rounded-full"
                    style={{ backgroundColor: i < lvl ? "#ccff00" : "rgba(255,255,255,0.15)" }}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={!canAfford}
                onClick={() => onBuy(p.id)}
                className="flex w-full items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-black tracking-widest uppercase transition-all disabled:opacity-50"
                style={{
                  backgroundColor: maxed
                    ? "rgba(204,255,0,0.25)"
                    : canAfford
                      ? "#ccff00"
                      : "rgba(255,255,255,0.08)",
                  color: maxed ? "#fff" : canAfford ? "#000" : "#fff",
                }}
              >
                {maxed ? "Максимум" : `💎 ${p.pricePerLevel} · ур. ${lvl + 1}/${p.maxLevel}`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Preview({ item }: { item: ShopItem }) {
  const color =
    item.color === "TEAM" ? "#ccff00" : item.color === "RAINBOW" ? "url(#rg)" : item.color;
  const accent = item.accent === "TEAM" ? "#ccff00" : (item.accent ?? "#fff");
  return (
    <div className="flex h-16 w-full items-center justify-center rounded-md bg-black/30">
      <svg viewBox="0 0 60 40" width="60" height="40">
        <defs>
          <linearGradient id="rg" x1="0" x2="1">
            <stop offset="0" stopColor="#ef4444" />
            <stop offset="0.25" stopColor="#facc15" />
            <stop offset="0.5" stopColor="#22c55e" />
            <stop offset="0.75" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {item.kind === "glove" && (
          <g>
            <path
              d="M14 10 Q14 4 20 4 L34 4 Q40 4 40 10 L40 20 Q42 22 42 26 L42 32 Q42 36 38 36 L16 36 Q12 36 12 32 L12 18 Q12 14 14 12 Z"
              fill={color}
              stroke="#0a0a0a"
              strokeWidth="1"
            />
            <rect
              x="18"
              y="6"
              width="3"
              height="14"
              rx="1.5"
              fill={color}
              stroke="#0a0a0a"
              strokeWidth="0.6"
            />
            <rect
              x="24"
              y="4"
              width="3"
              height="16"
              rx="1.5"
              fill={color}
              stroke="#0a0a0a"
              strokeWidth="0.6"
            />
            <rect
              x="30"
              y="5"
              width="3"
              height="15"
              rx="1.5"
              fill={color}
              stroke="#0a0a0a"
              strokeWidth="0.6"
            />
            <rect
              x="36"
              y="8"
              width="3"
              height="12"
              rx="1.5"
              fill={color}
              stroke="#0a0a0a"
              strokeWidth="0.6"
            />
            <path d="M14 28 L40 28" stroke={accent} strokeWidth="1.5" />
            <rect x="12" y="32" width="30" height="4" fill="#0a0a0a" />
            <rect x="12" y="32" width="30" height="1.5" fill={accent} />
          </g>
        )}
        {item.kind === "boot" && (
          <g>
            <path
              d="M6 24 Q6 18 14 18 L34 18 Q42 18 44 22 L52 28 L52 32 Q52 34 50 34 L8 34 Q6 34 6 32 Z"
              fill={color}
              stroke="#0a0a0a"
              strokeWidth="1"
            />
            <path d="M6 30 L52 30" stroke={accent} strokeWidth="1.2" />
            <circle cx="14" cy="34" r="1.2" fill="#0a0a0a" />
            <circle cx="20" cy="34" r="1.2" fill="#0a0a0a" />
            <circle cx="26" cy="34" r="1.2" fill="#0a0a0a" />
            <circle cx="32" cy="34" r="1.2" fill="#0a0a0a" />
            <circle cx="38" cy="34" r="1.2" fill="#0a0a0a" />
          </g>
        )}
        {item.kind === "wristband" && (
          <g>
            <rect
              x="10"
              y="14"
              width="40"
              height="14"
              rx="3"
              fill={color}
              stroke="#0a0a0a"
              strokeWidth="1"
            />
            <rect x="10" y="18" width="40" height="2" fill="rgba(255,255,255,0.4)" />
            <rect x="10" y="23" width="40" height="2" fill="rgba(0,0,0,0.25)" />
          </g>
        )}
        {item.kind === "sock" && (
          <g>
            <rect
              x="22"
              y="4"
              width="16"
              height="32"
              rx="3"
              fill={color}
              stroke="#0a0a0a"
              strokeWidth="1"
            />
            <rect x="22" y="14" width="16" height="3" fill={accent} />
            <rect x="22" y="22" width="16" height="3" fill={accent} />
          </g>
        )}
      </svg>
    </div>
  );
}
