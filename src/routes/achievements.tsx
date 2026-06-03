import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  useInventory,
  ACHIEVEMENTS,
  DIFFICULTY_META,
  isAchievementUnlocked,
  type AchievementDifficulty,
} from "@/lib/shop";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Достижения — Пенальти" },
      { name: "description", content: "Открывай достижения и забирай награды." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,900;1,900&display=swap",
      },
    ],
  }),
  component: AchievementsPage,
});

const FILTERS: { id: AchievementDifficulty | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "easy", label: "Лёгкие" },
  { id: "medium", label: "Средние" },
  { id: "hard", label: "Сложные" },
  { id: "legendary", label: "Легендарные" },
];

function AchievementsPage() {
  const inv = useInventory();
  const [filter, setFilter] = useState<AchievementDifficulty | "all">("all");
  const [flash, setFlash] = useState<string | null>(null);

  const state = {
    wins: inv.wins,
    losses: inv.losses,
    matches: inv.matches,
    coins: inv.coins,
    crystals: inv.crystals,
    spentCoins: inv.spentCoins ?? 0,
    owned: inv.owned,
    ownedTeams: inv.ownedTeams,
    rating: inv.rating ?? 1000,
    tournamentTitles: inv.tournamentTitles ?? 0,
    dailyStreak: inv.dailyStreak ?? 0,
  };

  const claimed = new Set(inv.achievementsClaimed ?? []);
  const visible = ACHIEVEMENTS.filter((a) => filter === "all" || a.difficulty === filter);
  const totalDone = ACHIEVEMENTS.filter((a) => claimed.has(a.id)).length;

  const handleClaim = (id: string) => {
    const ok = inv.claimAchievement(id);
    if (ok) {
      const a = ACHIEVEMENTS.find((x) => x.id === id)!;
      setFlash(`+${a.coins} 🪙${a.crystals ? ` +${a.crystals} 💎` : ""}`);
      window.setTimeout(() => setFlash(null), 1800);
    }
  };

  return (
    <main
      className="relative min-h-screen w-full px-4 py-6"
      style={{ backgroundColor: "#0d5c2a", fontFamily: "'Kanit', sans-serif" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="rounded-lg border-2 border-white/20 bg-black/40 px-3 py-1.5 text-xs font-black tracking-widest text-white uppercase hover:border-[#ccff00] hover:text-[#ccff00]"
          >
            ← Главная
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="rounded-lg bg-black/40 px-3 py-1.5 text-xs font-black tracking-widest text-white uppercase"
              style={{ border: "2px solid #ffd700" }}
            >
              🏆 {totalDone}/{ACHIEVEMENTS.length}
            </div>
          </div>
        </div>

        <h1
          className="mb-1 text-center text-4xl font-black italic tracking-tighter text-white uppercase sm:text-5xl"
          style={{ textShadow: "0 4px 0 rgba(0,0,0,0.3)" }}
        >
          Достижения
        </h1>
        <p className="mb-6 text-center text-xs font-bold tracking-[0.3em] text-white/60 uppercase">
          Выполняй цели — забирай награды
        </p>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const color = f.id === "all" ? "#ccff00" : DIFFICULTY_META[f.id].color;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="rounded-lg px-3 py-1.5 text-[11px] font-black tracking-widest uppercase transition-all hover:scale-105"
                style={{
                  backgroundColor: active ? color : "rgba(0,0,0,0.4)",
                  color: active ? "#0a4a1f" : "#fff",
                  border: `2px solid ${color}`,
                  boxShadow: active ? `0 0 12px ${color}` : undefined,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          {visible.map((a) => {
            const progress = Math.min(1, a.progress(state));
            const unlocked = isAchievementUnlocked(a, state);
            const isClaimed = claimed.has(a.id);
            const meta = DIFFICULTY_META[a.difficulty];
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-xl bg-black/40 p-3"
                style={{
                  border: `2px solid ${isClaimed ? meta.color : unlocked ? meta.color : "rgba(255,255,255,0.1)"}`,
                  boxShadow: unlocked && !isClaimed ? `0 0 12px ${meta.color}80` : undefined,
                  opacity: isClaimed ? 0.7 : 1,
                }}
              >
                <div
                  className="flex h-14 w-14 flex-none items-center justify-center rounded-lg text-3xl"
                  style={{
                    backgroundColor: isClaimed ? meta.color : "rgba(255,255,255,0.08)",
                    filter: !unlocked ? "grayscale(0.8)" : undefined,
                  }}
                >
                  {a.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-black tracking-wide text-white uppercase">
                      {a.name}
                    </h3>
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase"
                      style={{ backgroundColor: meta.color, color: "#0a0a0a" }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="mb-1.5 truncate text-[11px] text-white/70">{a.desc}</p>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded bg-white/10">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${progress * 100}%`,
                        backgroundColor: meta.color,
                        boxShadow: unlocked ? `0 0 6px ${meta.color}` : undefined,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-white/50 uppercase">
                    <span>{Math.round(progress * 100)}%</span>
                    <span>
                      +{a.coins} 🪙{a.crystals > 0 && ` +${a.crystals} 💎`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleClaim(a.id)}
                  disabled={!unlocked || isClaimed}
                  className="flex-none rounded-lg px-3 py-2 text-[11px] font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    backgroundColor: isClaimed
                      ? "rgba(255,255,255,0.08)"
                      : unlocked
                        ? "#000"
                        : "rgba(255,255,255,0.05)",
                    color: isClaimed ? "rgba(255,255,255,0.4)" : unlocked ? meta.color : "rgba(255,255,255,0.3)",
                    border: `2px solid ${isClaimed ? "transparent" : unlocked ? meta.color : "rgba(255,255,255,0.1)"}`,
                    boxShadow: unlocked && !isClaimed ? `0 0 8px ${meta.color}` : undefined,
                  }}
                >
                  {isClaimed ? "✓ Получено" : unlocked ? "Забрать" : "Закрыто"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reward flash */}
      {flash && (
        <div
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl px-6 py-3 text-lg font-black tracking-widest uppercase"
          style={{
            backgroundColor: "#000",
            color: "#ccff00",
            border: "2px solid #ccff00",
            boxShadow: "0 0 16px #ccff00",
          }}
        >
          {flash}
        </div>
      )}
    </main>
  );
}