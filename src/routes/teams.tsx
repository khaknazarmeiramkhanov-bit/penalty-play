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
  {
    name: "Снежные барсы",
    emoji: "🐆",
    color: "#b8c5d6",
    country: "Казахстан",
    flag: "🇰🇿",
    ability: "Горный хищник",
    abilityDesc: "+20% шанс гола даже если вратарь угадал",
  },
  {
    name: "Короли",
    emoji: "👑",
    color: "#ffd700",
    country: "Англия",
    flag: "🇬🇧",
    ability: "Корона",
    abilityDesc: "Первый гол соперника отменяется",
  },
  {
    name: "Драконы",
    emoji: "🐉",
    color: "#dc2626",
    country: "Китай",
    flag: "🇨🇳",
    ability: "Огненный удар",
    abilityDesc: "Никогда не бьёшь мимо",
  },
  {
    name: "Орлы",
    emoji: "🦅",
    color: "#8b5cf6",
    country: "США",
    flag: "🇺🇸",
    ability: "Зоркий глаз",
    abilityDesc: "Видишь, верх или низ выберет соперник",
  },
  {
    name: "Волки",
    emoji: "🐺",
    color: "#94a3b8",
    country: "Италия",
    flag: "🇮🇹",
    ability: "Стая",
    abilityDesc: "Соперник бьёт мимо на 25%",
  },
  {
    name: "Тигры",
    emoji: "🐯",
    color: "#f97316",
    country: "Индия",
    flag: "🇮🇳",
    ability: "Прыжок тигра",
    abilityDesc: "20% шанс автосейва",
  },
  {
    name: "Львы",
    emoji: "🦁",
    color: "#eab308",
    country: "ЮАР",
    flag: "🇿🇦",
    ability: "Рык",
    abilityDesc: "Соперник бьёт случайно (без мозгов)",
  },
  {
    name: "Быки",
    emoji: "🐂",
    color: "#7c2d12",
    country: "Испания",
    flag: "🇪🇸",
    ability: "Стальной удар",
    abilityDesc: "Вратарь хуже угадывает твой удар",
  },
  {
    name: "Кобры",
    emoji: "🐍",
    color: "#16a34a",
    country: "Бразилия",
    flag: "🇧🇷",
    ability: "Гипноз",
    abilityDesc: "20% шанс — вратарь прыгнет не туда",
  },
  {
    name: "Молнии",
    emoji: "⚡",
    color: "#fde047",
    country: "Япония",
    flag: "🇯🇵",
    ability: "Молниеносный",
    abilityDesc: "Видишь, в какую сторону соперник бьёт",
  },
  {
    name: "Лисы",
    emoji: "🦊",
    color: "#f97316",
    country: "Нидерланды",
    flag: "🇳🇱",
    ability: "Хитрый финт",
    abilityDesc: "После промаха соперника твой следующий удар обманет вратаря",
  },
  {
    name: "Медведи",
    emoji: "🐻",
    color: "#92400e",
    country: "Россия",
    flag: "🇷🇺",
    ability: "Медвежья хватка",
    abilityDesc: "Удары соперника в центр (TC/BC) — автосейв",
  },
  {
    name: "Кондоры",
    emoji: "🦅",
    color: "#0ea5e9",
    country: "Аргентина",
    flag: "🇦🇷",
    ability: "Пике сверху",
    abilityDesc: "Твои удары в верхний ряд — гарантированный гол",
  },
  {
    name: "Олени",
    emoji: "🦌",
    color: "#1e3a5a",
    country: "Финляндия",
    flag: "🇫🇮",
    ability: "Северное сияние",
    abilityDesc: "После твоего гола следующий удар соперника летит мимо",
  },
  {
    name: "Игуаны",
    emoji: "🦎",
    color: "#10b981",
    country: "Мексика",
    flag: "🇲🇽",
    ability: "Липкий язык",
    abilityDesc: "После сейва твой следующий удар точно становится голом",
  },
  {
    name: "Совы",
    emoji: "🦉",
    color: "#4b5563",
    country: "Германия",
    flag: "🇩🇪",
    ability: "Ночное зрение",
    abilityDesc: "Видишь точную зону удара соперника",
  },
  {
    name: "Крокодилы",
    emoji: "🐊",
    color: "#065f46",
    country: "Австралия",
    flag: "🇦🇺",
    ability: "Засада",
    abilityDesc: "Удары соперника в нижний ряд автоматически парируются",
  },
  {
    name: "Слоны",
    emoji: "🐘",
    color: "#6b7280",
    country: "Индия",
    flag: "🇮🇳",
    ability: "Память слона",
    abilityDesc: "Со 2-го раунда видишь любимую зону соперника",
  },
  {
    name: "Носороги",
    emoji: "🦏",
    color: "#ef4444",
    country: "Южная Корея",
    flag: "🇰🇷",
    ability: "Таран",
    abilityDesc: "30% шанс пробить вратаря тараном, даже если он угадал",
  },
  {
    name: "Бабочки",
    emoji: "🦋",
    color: "#818cf8",
    country: "Франция",
    flag: "🇫🇷",
    ability: "Эффект бабочки",
    abilityDesc: "15% шанс, что исход удара перевернётся",
  },
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

        {/* Big shop button */}
        <Link
          to="/shop"
          className="group relative inline-flex w-full max-w-md items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-black tracking-[0.2em] text-black uppercase transition-all duration-200 hover:scale-[1.02] active:scale-95"
          style={{
            background: "linear-gradient(180deg, #ffe34a 0%, #f5b400 100%)",
            boxShadow: "0 6px 0 rgb(150,110,0), 0 0 28px rgba(255,210,60,0.45)",
            border: "2px solid #fff",
          }}
        >
          <span className="text-2xl">🪙</span>
          <span>Магазин экипировки</span>
          <span className="text-xl">→</span>
        </Link>

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
              <span className="text-sm font-black tracking-wider uppercase">{team.name}</span>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
                <span className="text-sm leading-none">{team.flag}</span>
                {team.country}
              </span>
              <span className="text-[10px] font-bold leading-tight tracking-wide text-white/80">
                {team.ability}
              </span>
              <span className="text-[9px] font-medium leading-tight text-white/55">
                {team.abilityDesc}
              </span>
            </button>
          ))}
        </div>

        {/* Next Button */}
        {selected && (
          <button
            type="button"
            onClick={() => navigate({ to: "/match", search: { team: selected } })}
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
        <div className="mt-2 flex items-center gap-6">
          <Link
            to="/"
            className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase transition-colors hover:text-white"
          >
            ← Назад
          </Link>
        </div>
      </div>
    </main>
  );
}
