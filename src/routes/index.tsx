import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useInventory } from "@/lib/shop";
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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const inv = useInventory();
  const [nameInput, setNameInput] = useState("");
  const [user, setUser] = useState<User | null>(null);

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
  }, [inv]);

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
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Soft gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 0%, rgba(37,99,235,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Name Input Modal */}
      {!inv.playerName && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="name-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 wise-fade-up"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
            <h2 id="name-dialog-title" className="mb-2 text-2xl font-bold tracking-tight text-foreground">
              Как вас зовут?
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Введите имя для вашего аккаунта
            </p>
            <label htmlFor="player-name" className="sr-only">Никнейм</label>
            <input
              id="player-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              maxLength={20}
              placeholder="Ваш никнейм"
              className="mb-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-base font-medium text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveName}
              disabled={!nameInput.trim()}
              className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            >
              Играть
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-12 wise-fade-up">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold"
            >
              ⚽
            </div>
            <span className="text-base font-semibold tracking-tight">Пенальти</span>
          </div>
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              Выйти
            </button>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              Войти
            </Link>
          )}
        </header>

        {/* Hero card */}
        <section
          aria-labelledby="hero-title"
          className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Готовы к удару?
          </p>
          <h1
            id="hero-title"
            className="mb-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            Пенальти
          </h1>
          <p className="mx-auto mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Соберите команду, выберите тактику и победите соперника в серии пенальти.
          </p>

          {inv.playerName && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm">
              <span className="text-muted-foreground">Игрок:</span>
              <span className="font-semibold text-foreground">{inv.playerName}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              to="/teams"
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            >
              Начать игру
            </Link>
            <Link
              to="/teams"
              search={{ ranked: true }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              Рейтинговый матч
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {inv.rating ?? 1000}
              </span>
            </Link>
          </div>
        </section>

        {/* Secondary card */}
        <Link
          to="/rating"
          className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"
            >
              📊
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground">Таблица рейтинга</div>
              <div className="text-xs text-muted-foreground">Лучшие игроки сезона</div>
            </div>
          </div>
          <span
            aria-hidden="true"
            className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"
          >
            →
          </span>
        </Link>
      </div>
    </main>
  );
}
