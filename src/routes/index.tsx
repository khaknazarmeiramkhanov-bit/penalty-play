import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useInventory, DAILY_REWARDS } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState<{ day: number; coins: number; crystals: number } | null>(null);

  // Ждём гидратацию localStorage перед показом модалки имени,
  // иначе модалка мигает на каждом заходе пока useInventory читает store.
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Автоматически открываем подарок раз в день, как только имя введено
  useEffect(() => {
    if (hydrated && inv.playerName && inv.canClaimDaily) {
      setDailyOpen(true);
    }
  }, [hydrated, inv.playerName, inv.canClaimDaily]);

  const handleClaimDaily = () => {
    const reward = inv.claimDaily();
    if (reward) setDailyClaimed(reward);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const name =
          (session.user.user_metadata as { display_name?: string })?.display_name ||
          session.user.email?.split("@")[0] ||
          "Игрок";
        if (!inv.playerName) inv.setPlayerName(name);
      }
    });
    return () => sub.subscription.unsubscribe();
    // намеренно без [inv] — иначе listener пере-подписывается на каждом ре-рендере
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
      {hydrated && !inv.playerName && (
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

      {/* Daily Gift Modal */}
      {dailyOpen && hydrated && inv.playerName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-2xl border-2 p-6 text-center"
            style={{
              backgroundColor: "#0a4a1f",
              borderColor: "#ccff00",
              boxShadow: "0 0 24px rgba(204,255,0,0.4)",
            }}
          >
            <div className="mb-1 text-5xl">🎁</div>
            <h2
              className="mb-1 text-2xl font-black italic tracking-tight text-white uppercase"
              style={{ textShadow: "0 3px 0 rgba(0,0,0,0.3)" }}
            >
              {dailyClaimed ? "Подарок получен!" : "Ежедневный подарок"}
            </h2>
            <p className="mb-4 text-xs font-bold tracking-widest text-white/60 uppercase">
              {dailyClaimed
                ? `День ${dailyClaimed.day} · приходи завтра за большим!`
                : "Заходи каждый день — награды растут"}
            </p>

            {/* 7-day grid */}
            <div className="mb-5 grid grid-cols-7 gap-1.5">
              {DAILY_REWARDS.map((r, i) => {
                const dayNum = i + 1;
                const nextStreak = Math.min(7, (inv.dailyStreak ?? 0) + (inv.canClaimDaily ? 1 : 0));
                const isClaimed = dailyClaimed ? dayNum <= dailyClaimed.day : dayNum <= (inv.dailyStreak ?? 0);
                const isNext = !dailyClaimed && dayNum === nextStreak;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[10px] font-black text-white"
                    style={{
                      backgroundColor: isClaimed ? "#ccff00" : "rgba(255,255,255,0.06)",
                      border: isNext ? "2px solid #ccff00" : "2px solid transparent",
                      color: isClaimed ? "#0a4a1f" : "#fff",
                      boxShadow: isNext ? "0 0 12px rgba(204,255,0,0.6)" : undefined,
                      transform: isNext ? "scale(1.08)" : undefined,
                    }}
                  >
                    <span className="opacity-70">Д{dayNum}</span>
                    <span className="text-[11px]">{r.coins}🪙</span>
                    {r.crystals > 0 && <span className="text-[10px]">{r.crystals}💎</span>}
                  </div>
                );
              })}
            </div>

            {dailyClaimed ? (
              <div className="mb-4 flex items-center justify-center gap-3 text-lg font-black text-white">
                <span>+{dailyClaimed.coins} 🪙</span>
                {dailyClaimed.crystals > 0 && <span>+{dailyClaimed.crystals} 💎</span>}
              </div>
            ) : null}

            {dailyClaimed ? (
              <button
                onClick={() => {
                  setDailyOpen(false);
                  setDailyClaimed(null);
                }}
                className="w-full rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-black tracking-widest text-white uppercase transition-all hover:scale-105 active:scale-95"
              >
                Закрыть
              </button>
            ) : (
              <button
                onClick={handleClaimDaily}
                className="w-full rounded-xl px-6 py-3 text-lg font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "#000",
                  color: "#ccff00",
                  border: "2px solid #ccff00",
                  boxShadow: "0 0 8px #ccff00, 0 0 16px #ccff00",
                  animation: "neonPulse 2s ease-in-out infinite",
                  textShadow: "0 0 4px #ccff00",
                }}
              >
                Забрать
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-12 px-6 text-center">
        {/* Auth chip */}
        <div className="absolute top-4 right-4 flex gap-2">
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-lg border-2 border-white/20 bg-black/40 px-3 py-1.5 text-xs font-black tracking-widest text-white uppercase hover:border-[#ccff00] hover:text-[#ccff00]"
            >
              Выйти
            </button>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg border-2 border-[#ccff00]/60 bg-black/40 px-3 py-1.5 text-xs font-black tracking-widest text-[#ccff00] uppercase hover:border-[#ccff00]"
              style={{ textShadow: "0 0 4px rgba(204,255,0,0.5)" }}
            >
              Войти
            </Link>
          )}
        </div>

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
              backgroundColor: "#e0ff33",
              color: "#111111",
              border: "2px solid #e0ff33",
              boxShadow: "0 0 12px #e0ff33, 0 0 28px #e0ff33, 0 0 48px #e0ff33",
              animation: "neonPulse 2s ease-in-out infinite",
            }}
          >
            <span className="relative">Начать</span>
          </Link>

          <Link
            to="/teams"
            search={{ ranked: true }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#38bdf8] bg-black/40 px-8 py-3 text-sm font-black tracking-widest uppercase backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              color: "#38bdf8",
              boxShadow: "0 0 8px rgba(56,189,248,0.4)",
              textShadow: "0 0 4px rgba(56,189,248,0.5)",
            }}
          >
            📈 Рейтинговый матч · {inv.rating ?? 1000}
          </Link>

          <Link
            to="/rating"
            className="inline-flex items-center justify-center rounded-xl border-2 border-[#ccff00]/50 bg-black/40 px-8 py-3 text-sm font-black tracking-widest uppercase backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-[#ccff00] active:scale-95"
            style={{
              color: "#ccff00",
              boxShadow: "0 0 6px rgba(204,255,0,0.3)",
              textShadow: "0 0 4px rgba(204,255,0,0.5)",
            }}
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
