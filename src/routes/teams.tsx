import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Пенальти — Выбор команды" },
      { name: "description", content: "Выберите команду для игры в Пенальти." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,900;1,900&display=swap",
      },
    ],
  }),
  component: TeamsPage,
});

export const TEAMS = [
  { name: "Акулы", emoji: "🦈", color: "#1e90ff" },
  { name: "Короли", emoji: "👑", color: "#ffd700" },
  { name: "Драконы", emoji: "🐉", color: "#dc2626" },
  { name: "Орлы", emoji: "🦅", color: "#8b5cf6" },
  { name: "Волки", emoji: "🐺", color: "#94a3b8" },
  { name: "Тигры", emoji: "🐯", color: "#f97316" },
  { name: "Львы", emoji: "🦁", color: "#eab308" },
  { name: "Быки", emoji: "🐂", color: "#7c2d12" },
  { name: "Кобры", emoji: "🐍", color: "#16a34a" },
  { name: "Молнии", emoji: "⚡", color: "#fde047" },
];

function TeamsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden px-6 py-10"
      style={{ backgroundColor: "#0d5c2a", fontFamily: "'Kanit', sans-serif" }}
    >
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-8">
        {/* Header */}
        <div className="space-y-0 text-center">
          <h1
            className="select-none text-5xl font-black italic leading-none tracking-tighter text-white uppercase sm:text-6xl"
            style={{ textShadow: "0 4px 0 rgba(0,0,0,0.3)" }}
          >
            Выбор команды
          </h1>
          <div
            className="mt-2 h-1.5 w-full shadow-lg"
            style={{ backgroundColor: "#ccff00", transform: "skewX(-12deg)" }}
          />
        </div>

        <p className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
          Выберите свою команду
        </p>

        {/* Teams Grid */}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {TEAMS.map((team) => (
            <button
              key={team.name}
              type="button"
              onClick={() => setSelected(team.name)}
              className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-black/30 px-4 py-5 text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                border: `2px solid ${team.color}`,
                boxShadow:
                  selected === team.name
                    ? `0 0 0 4px #ccff00, 0 6px 0 rgba(0,0,0,0.35), 0 0 32px ${team.color}88`
                    : `0 6px 0 rgba(0,0,0,0.35), 0 0 24px ${team.color}33`,
                transform: selected === team.name ? "scale(1.05)" : undefined,
              }}
            >
              <span className="text-4xl">{team.emoji}</span>
              <span className="text-sm font-black tracking-wider uppercase">
                {team.name}
              </span>
            </button>
          ))}
        </div>

        {/* Next Button */}
        {selected && (
          <button
            type="button"
            onClick={() =>
              navigate({ to: "/match", search: { team: selected } })
            }
            className="group relative inline-flex items-center justify-center rounded-xl px-10 py-4 text-lg font-black tracking-widest text-black uppercase transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "#ccff00",
              boxShadow: "0 8px 0 rgb(132,163,0)",
            }}
          >
            Дальше →
          </button>
        )}

        {/* Back link */}
        <Link
          to="/"
          className="mt-2 text-xs font-bold tracking-[0.2em] text-white/70 uppercase transition-colors hover:text-white"
        >
          ← Назад
        </Link>
      </div>
    </main>
  );
}