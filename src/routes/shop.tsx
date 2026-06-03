import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ITEMS,
  PERKS,
  SPONSORS,
  useInventory,
  type ItemKind,
  type Perk,
  type ShopItem,
  type Sponsor,
} from "@/lib/shop";
import { BallSvg } from "@/components/BallSvg";

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
  { kind: "ball", title: "Мячи (100 скинов)" },
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

        {SECTIONS.filter((s) => s.kind === "ball").map((s) => (
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

        <PerksSection
          perks={PERKS}
          levels={inv.perks}
          crystals={inv.crystals}
          onBuy={inv.buyPerk}
        />

        <SponsorsSection
          sponsors={SPONSORS}
          wins={inv.wins}
          current={inv.sponsor}
          onEquip={inv.equipSponsor}
        />

        {SECTIONS.filter((s) => s.kind !== "ball").map((s) => (
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
      {item.kind === "ball" ? (
        <BallSvg item={item} size={56} />
      ) : (
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
            <defs>
              <linearGradient id={`gl-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={color === "url(#rg)" ? "#fff" : color} stopOpacity="1" />
                <stop offset="1" stopColor="#000" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            {/* palm shadow */}
            <path
              d="M16 14 Q16 9 21 9 L35 9 Q40 9 40 14 L40 24 Q42 26 42 30 L42 33 Q42 35 40 35 L18 35 Q14 35 14 31 L14 20 Q14 16 16 14 Z"
              fill="#000"
              opacity="0.25"
              transform="translate(1.5,1.5)"
            />
            {/* fingers */}
            <path d="M17 14 Q17 5 21 5 Q25 5 25 14 Z" fill={color} stroke="#0a0a0a" strokeWidth="0.8" />
            <path d="M24 13 Q24 3 28 3 Q32 3 32 13 Z" fill={color} stroke="#0a0a0a" strokeWidth="0.8" />
            <path d="M31 13 Q31 4 35 4 Q39 4 39 13 Z" fill={color} stroke="#0a0a0a" strokeWidth="0.8" />
            <path d="M38 14 Q38 7 41 7 Q44 7 44 14 Z" fill={color} stroke="#0a0a0a" strokeWidth="0.8" />
            {/* palm */}
            <path
              d="M14 16 Q14 12 18 12 L40 12 Q44 12 44 16 L44 26 Q46 28 46 31 L46 33 Q46 35 44 35 L16 35 Q12 35 12 31 L12 20 Q12 17 14 16 Z"
              fill={`url(#gl-${item.id})`}
              stroke="#0a0a0a"
              strokeWidth="1"
            />
            {/* stitching */}
            <path d="M16 22 Q29 20 44 22" stroke={accent} strokeWidth="0.6" fill="none" strokeDasharray="1.5 1" opacity="0.8" />
            <path d="M16 28 Q29 30 44 28" stroke={accent} strokeWidth="0.8" fill="none" />
            {/* cuff */}
            <rect x="12" y="33" width="34" height="3" rx="1" fill="#0a0a0a" />
            <rect x="12" y="33" width="34" height="1" fill={accent} />
            {/* highlight */}
            <path d="M18 14 Q18 13 20 13 L26 13" stroke="#fff" strokeWidth="0.6" opacity="0.5" fill="none" />
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
      )}
    </div>
  );
}

function SponsorsSection({
  sponsors,
  wins,
  current,
  onEquip,
}: {
  sponsors: Sponsor[];
  wins: number;
  current: string;
  onEquip: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center justify-between text-xs font-black tracking-[0.3em] text-white/80 uppercase">
        <span>🏆 Спонсоры на футболке</span>
        <span className="text-white/60">побед: {wins}</span>
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sponsors.map((s) => {
          const unlocked = wins >= s.minWins;
          const isEquipped = current === s.id;
          return (
            <div
              key={s.id}
              className="flex flex-col items-center gap-2 rounded-xl bg-black/40 p-3 backdrop-blur-sm"
              style={{
                border: isEquipped
                  ? "2px solid #ccff00"
                  : unlocked
                    ? "2px solid rgba(255,255,255,0.18)"
                    : "2px solid rgba(255,255,255,0.08)",
                boxShadow: isEquipped ? "0 0 24px rgba(204,255,0,0.4)" : undefined,
                opacity: unlocked ? 1 : 0.55,
              }}
            >
              <div
                className="flex h-10 w-full items-center justify-center rounded-md"
                style={{
                  backgroundColor: s.id === "none" ? "rgba(255,255,255,0.08)" : s.color,
                  border: "1px solid rgba(0,0,0,0.4)",
                }}
              >
                <span
                  className="text-sm font-black tracking-widest"
                  style={{ color: s.id === "none" ? "#fff8" : s.textColor }}
                >
                  {s.name}
                </span>
              </div>
              <span className="text-[10px] tracking-[0.2em] text-white/60 uppercase">
                {s.minWins === 0 ? "по умолчанию" : `от ${s.minWins} побед`}
              </span>
              <button
                type="button"
                disabled={!unlocked || isEquipped}
                onClick={() => onEquip(s.id)}
                className="w-full rounded-md px-3 py-2 text-xs font-black tracking-widest uppercase transition-all disabled:opacity-60"
                style={{
                  backgroundColor: isEquipped
                    ? "#ccff00"
                    : unlocked
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.05)",
                  color: isEquipped ? "#000" : "#fff",
                }}
              >
                {isEquipped
                  ? "Надето"
                  : unlocked
                    ? "Надеть"
                    : `🔒 ${Math.max(0, s.minWins - wins)} побед`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
