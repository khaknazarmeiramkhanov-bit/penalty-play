import { createFileRoute, Link } from "@tanstack/react-router";

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

        {/* Action Button */}
        <Link
          to="/teams"
          className="group relative inline-flex items-center justify-center rounded-xl px-10 py-5 text-xl font-black tracking-widest text-black uppercase transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: "#ccff00",
            boxShadow: "0 8px 0 rgb(132,163,0)",
          }}
        >
          <span className="relative">Начать</span>
          {/* Shine Effect */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <div
              className="absolute inset-0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
              }}
            />
          </div>
        </Link>

        {/* Subtext */}
        <p className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
          Приготовьтесь к удару
        </p>
      </div>
    </main>
  );
}