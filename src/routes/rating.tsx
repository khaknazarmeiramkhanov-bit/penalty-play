import { createFileRoute, Link } from "@tanstack/react-router";
import { useInventory } from "@/lib/shop";

export const Route = createFileRoute("/rating")({
  head: () => ({
    meta: [
      { title: "Пенальти — Рейтинг" },
      { name: "description", content: "Статистика игрока." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,900;1,900&display=swap",
      },
    ],
  }),
  component: RatingPage,
});

function RatingPage() {
  const inv = useInventory();
  const winRate = inv.matches > 0 ? ((inv.wins / inv.matches) * 100).toFixed(1) : "0.0";

  const stats = [
    { label: "Победы", value: inv.wins, icon: "🏆" },
    { label: "Поражения", value: inv.losses, icon: "💔" },
    { label: "Всего матчей", value: inv.matches, icon: "⚽" },
    { label: "Процент побед", value: `${winRate}%`, icon: "📊" },
    { label: "Монет", value: inv.coins, icon: "🪙" },
    { label: "Потрачено монет", value: inv.spentCoins, icon: "💸" },
  ];

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center px-4 py-8"
      style={{ backgroundColor: "#0d5c2a", fontFamily: "'Kanit', sans-serif" }}
    >
      <div className="relative z-10 flex w-full max-w-md flex-col items-stretch gap-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase hover:text-white"
          >
            ← Назад
          </Link>
          <h1
            className="text-3xl font-black italic uppercase text-white"
            style={{ textShadow: "0 4px 0 rgba(0,0,0,0.3)" }}
          >
            Рейтинг
          </h1>
          <div className="w-12" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-xl bg-black/40 p-4 backdrop-blur-sm"
              style={{ border: "2px solid rgba(255,255,255,0.15)" }}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-lg font-black tracking-wider text-white">
                {s.value}
              </span>
              <span className="text-[10px] tracking-[0.2em] text-white/60 uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar for win rate */}
        <div className="flex flex-col gap-2 rounded-xl bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black tracking-wider text-white">Процент побед</span>
            <span className="text-sm font-black text-white">{winRate}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/10">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${inv.matches > 0 ? (inv.wins / inv.matches) * 100 : 0}%`,
                backgroundColor: "#ccff00",
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
