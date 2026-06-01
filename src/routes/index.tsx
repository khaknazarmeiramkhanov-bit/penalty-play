import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useInventory } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Пенальти — Начать игру" },
      { name: "description", content: "Стартовый экран игры Пенальти." },
      { property: "og:title", content: "Пенальти" },
      { property: "og:description", content: "Стартовый экран игры Пенальти." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,900;1,900&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const inv = useInventory();
  const [nameInput, setNameInput] = useState("");

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    inv.setPlayerName(trimmed);
  };

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0d5c2a", fontFamily: "'Kanit', sans-serif" }}
    >
      {/* Pitch Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/2 h-px w-full -translate-x-1/2 bg-white" />
        <div
          className="absolute bottom-0 left-1/2 h-1/2 w-full -translate-x-1/2 rounded-t-[100%] border-t-2 border-white"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      </div>

      {/* Subtle Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Name Input Modal */}
      {!inv.playerName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl border-2 border-white/10 p-8 text-center"
            style={{ backgroundColor: "#0a4a1f" }}
          >
            <h2
              className="mb-2 text-3xl font-black italic tracking-tighter text-white uppercase"
              style={{ textShadow: "0 3px 0 rgba(0,0,0,0.3)" }}
            >
              Как вас зовут?
            </h2>
            <p className="mb-6 text-sm text-white/60">
              Введите имя для вашего аккаунта
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              maxLength={20}
              placeholder="Ваш никнейм"
              className="mb-4 w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-center text-lg font-bold text-white placeholder-white/30 outline-none focus:border-[#ccff00]"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              disabled={!nameInput.trim()}
              className="w-full rounded-xl px-6 py-3 text-lg font-black tracking-widest uppercase transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              style={{
                backgroundColor: "#000",
                color: "#ccff00",
                border: "2px solid #ccff00",
                boxShadow: "0 0 8px #ccff00, 0 0 16px #ccff00, 0 0 24px #ccff00",
                animation: "neonPulse 2s ease-in-out infinite",
                textShadow: "0 0 4px #ccff00, 0 0 8px #ccff00",
              }}
            >
              Играть
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-12 px-6 text-center">
        {/* Title Lockup */}
        <div className="space-y-0">
          <h1
            className="select-none text-7xl font-black italic leading-none tracking-tighter text-white uppercase"
            style={{
              textShadow: "0 4px 0 rgba(0,0,0,0.3)",
            }}
          >
            Пенальти
          </h1>
          <div
            className="h-1.5 w-full shadow-lg"
            style={{
              backgroundColor: "#ccff00",
              transform: "skewX(-12deg)",
            }}
          />
        </div>

        {/* Player Name Display */}
        {inv.playerName && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold tracking-widest text-white/50 uppercase">
              Игрок
            </span>
            <span
              className="text-2xl font-black italic tracking-tight text-white"
              style={{ textShadow: "0 2px 0 rgba(0,0,0,0.3)" }}
            >
              {inv.playerName}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/teams"
            className="group relative inline-flex items-center justify-center rounded-xl px-10 py-5 text-xl font-black tracking-widest uppercase transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "#000",
              color: "#ccff00",
              border: "2px solid #ccff00",
              boxShadow: "0 0 8px #ccff00, 0 0 16px #ccff00, 0 0 24px #ccff00",
              animation: "neonPulse 2s ease-in-out infinite",
              textShadow: "0 0 4px #ccff00, 0 0 8px #ccff00",
            }}
          >
            <span className="relative">Начать</span>
          </Link>

          <Link
            to="/rating"
            className="inline-flex items-center justify-center rounded-xl border-2 border-white/20 bg-white/10 px-8 py-3 text-sm font-black tracking-widest text-white uppercase backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/20 active:scale-95"
          >
            📊 Рейтинг
          </Link>
        </div>

        {/* Subtext */}
        <p className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
          Приготовьтесь к удару
        </p>
      </div>
    </main>
  );
}
