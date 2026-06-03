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
      className="relative min-h-dvh w-full overflow-hidden bg-background text-foreground"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Premium ambient backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(70% 50% at 80% 0%, rgba(0,102,177,0.25) 0%, transparent 60%), radial-gradient(50% 40% at 10% 100%, rgba(226,39,24,0.10) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Name Input Modal */}
      {!inv.playerName && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="name-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 wise-fade-up"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 h-1 w-16 bmw-stripe rounded-full" aria-hidden="true" />
            <h2 id="name-dialog-title" className="mb-2 text-2xl font-light tracking-tight text-foreground">
              Как вас зовут?
            </h2>
            <p className="mb-6 text-sm text-muted-foreground uppercase tracking-widest text-xs">
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
              className="mb-4 w-full rounded-lg border border-input bg-background/60 px-4 py-3 text-center text-base font-medium text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveName}
              disabled={!nameInput.trim()}
              className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            >
              Начать
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative z-20 border-b border-border/40 backdrop-blur-md bg-background/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 rounded-full border-2 border-foreground/80 grid place-items-center overflow-hidden bg-background">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="bg-white" />
                <div className="bg-[#0066B1]" />
                <div className="bg-[#0066B1]" />
                <div className="bg-white" />
              </div>
              <div className="absolute inset-1 rounded-full bg-black grid place-items-center">
                <span className="text-[8px] font-bold text-white tracking-tight">PNLT</span>
              </div>
            </div>
            <span className="text-base font-light tracking-[0.25em] uppercase">Пенальти</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-medium">
            <Link to="/teams" className="text-muted-foreground hover:text-foreground transition">Матч</Link>
            <Link to="/rating" className="text-muted-foreground hover:text-foreground transition">Рейтинг</Link>
            <Link to="/shop" className="text-muted-foreground hover:text-foreground transition">Магазин</Link>
          </div>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-border bg-card/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              Выйти
            </button>
          ) : (
            <Link
              to="/auth"
              className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-primary transition hover:bg-primary/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              Войти
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section
        aria-labelledby="hero-title"
        className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28 wise-fade-up"
      >
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-primary" aria-hidden="true" />
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
                Sheer Driving Pleasure
              </span>
            </div>
            <h1
              id="hero-title"
              className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[1.05] text-foreground"
            >
              Точность<br />
              <span className="font-semibold bg-gradient-to-r from-white via-foreground to-primary bg-clip-text text-transparent">
                одного удара.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Соберите команду мечты, выберите тактику и докажите своё мастерство в драматичной серии пенальти.
            </p>

            {inv.playerName && (
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-card/60 px-4 py-2 text-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                <span className="text-muted-foreground uppercase tracking-wider text-xs">Игрок</span>
                <span className="font-semibold text-foreground">{inv.playerName}</span>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                to="/teams"
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-md bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/30 transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
              >
                <span>Начать игру</span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/teams"
                search={{ ranked: true }}
                className="group inline-flex items-center justify-center gap-3 rounded-md border border-border bg-card/40 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-foreground backdrop-blur transition-all duration-300 hover:border-primary hover:bg-card/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                Рейтинговый
                <span className="rounded bg-primary/15 px-2 py-0.5 text-xs text-primary font-bold">
                  {inv.rating ?? 1000}
                </span>
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="aspect-square relative rounded-2xl border border-border bg-gradient-to-br from-card via-card to-background overflow-hidden">
              <div className="absolute inset-0 bmw-shine pointer-events-none" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-[14rem] leading-none opacity-80 drop-shadow-2xl">⚽</div>
              </div>
              <div className="absolute top-4 left-4 text-xs uppercase tracking-widest text-muted-foreground">
                Series · 01
              </div>
              <div className="absolute bottom-4 right-4 text-right">
                <div className="text-3xl font-light text-foreground">23</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">команды</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bmw-stripe" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 wise-fade-up">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { to: "/teams", title: "Быстрый матч", desc: "Случайный соперник, мгновенный старт", icon: "⚡" },
            { to: "/rating", title: "Рейтинг сезона", desc: "Лучшие игроки и ваша позиция", icon: "📊" },
            { to: "/shop", title: "Магазин", desc: "Бонусы, валюта и улучшения", icon: "🛍" },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex items-start justify-between mb-8">
                <div className="text-3xl">{c.icon}</div>
                <span
                  aria-hidden="true"
                  className="text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
                >
                  →
                </span>
              </div>
              <div className="relative">
                <h3 className="text-lg font-semibold text-foreground mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
              <div className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span>© 2026 Пенальти</span>
          <div className="h-1 w-24 bmw-stripe rounded-full" aria-hidden="true" />
          <span>The Ultimate Match</span>
        </div>
      </footer>
    </main>
  );
}
