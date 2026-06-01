import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Пенальти — Начать игру" },
      { name: "description", content: "Стартовый экран игры Пенальти." },
      { property: "og:title", content: "Пенальти" },
      { property: "og:description", content: "Стартовый экран игры Пенальти." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 px-6" style={{ backgroundColor: "oklch(0.55 0.18 145)" }}>
      <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white drop-shadow-lg">
        Пенальти
      </h1>
      <button
        type="button"
        className="rounded-full bg-white px-12 py-4 text-2xl font-bold shadow-xl transition hover:scale-105 active:scale-95"
        style={{ color: "oklch(0.45 0.18 145)" }}
      >
        Начать
      </button>
    </main>
  );
}