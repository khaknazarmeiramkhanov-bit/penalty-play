import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useInventory } from "@/lib/shop";

export const Route = createFileRoute("/teams")({
  validateSearch: z.object({
    ranked: z.coerce.boolean().optional().default(false),
  }),
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
    abilityDesc: "После промаха соперника — 50% обмануть вратаря на следующем ударе",
  },
  {
    name: "Медведи",
    emoji: "🐻",
    color: "#92400e",
    country: "Россия",
    flag: "🇷🇺",
    ability: "Медвежья хватка",
    abilityDesc: "Удары соперника в центральную колонку — 50% автосейв",
  },
  {
    name: "Кондоры",
    emoji: "🦅",
    color: "#0ea5e9",
    country: "Аргентина",
    flag: "🇦🇷",
    ability: "Пике сверху",
    abilityDesc: "Твои удары в верхний ряд — 40% обмануть вратаря",
  },
  {
    name: "Олени",
    emoji: "🦌",
    color: "#1e3a5a",
    country: "Финляндия",
    flag: "🇫🇮",
    ability: "Северное сияние",
    abilityDesc: "После твоего гола — 40% что соперник пробьёт мимо",
  },
  {
    name: "Игуаны",
    emoji: "🦎",
    color: "#10b981",
    country: "Мексика",
    flag: "🇲🇽",
    ability: "Липкий язык",
    abilityDesc: "После сейва — 50% обмануть вратаря на следующем ударе",
  },
  {
    name: "Совы",
    emoji: "🦉",
    color: "#4b5563",
    country: "Германия",
    flag: "🇩🇪",
    ability: "Ночное зрение",
    abilityDesc: "70% — точная зона удара соперника, иначе подсказка ложная",
  },
  {
    name: "Крокодилы",
    emoji: "🐊",
    color: "#065f46",
    country: "Австралия",
    flag: "🇦🇺",
    ability: "Засада",
    abilityDesc: "Удары соперника в нижний ряд — 50% автосейв",
  },
  {
    name: "Слоны",
    emoji: "🐘",
    color: "#6b7280",
    country: "Индия",
    flag: "🇮🇳",
    ability: "Память слона",
    abilityDesc: "С 3-го раунда видишь любимую зону соперника",
  },
  {
    name: "Носороги",
    emoji: "🦏",
    color: "#ef4444",
    country: "Южная Корея",
    flag: "🇰🇷",
    ability: "Таран",
    abilityDesc: "20% шанс пробить вратаря тараном, даже если он угадал",
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
  {
    name: "Черепахи",
    emoji: "🐢",
    color: "#15803d",
    country: "Греция",
    flag: "🇬🇷",
    ability: "Панцирь",
    abilityDesc: "После гола соперника — его следующий удар точно мимо",
  },
  {
    name: "Зебры",
    emoji: "🦓",
    color: "#f5f5f5",
    country: "Танзания",
    flag: "🇹🇿",
    ability: "Стадо",
    abilityDesc: "Каждый 3-й твой удар — гарантированный гол",
  },
  {
    name: "Соколы",
    emoji: "🦅",
    color: "#1e40af",
    country: "Сербия",
    flag: "🇷🇸",
    ability: "Точность сокола",
    abilityDesc: "Удары в боковые углы — +30% обмануть вратаря",
  },
  {
    name: "Скорпионы",
    emoji: "🦂",
    color: "#facc15",
    country: "Марокко",
    flag: "🇲🇦",
    ability: "Жало",
    abilityDesc: "Твой удар мимо — 35% шанс закрутки обратно в створ",
  },
  {
    name: "Барсуки",
    emoji: "🦡",
    color: "#52525b",
    country: "Польша",
    flag: "🇵🇱",
    ability: "Цепкая лапа",
    abilityDesc: "+15% автосейв на любых ударах соперника",
  },
  {
    name: "Гориллы",
    emoji: "🦍",
    color: "#3f3f46",
    country: "Камерун",
    flag: "🇨🇲",
    ability: "Сила",
    abilityDesc: "Удары в нижний ряд — 30% пробить вратаря силой",
    special: true,
    priceCrystals: 5,
  },
  {
    name: "Гепарды",
    emoji: "🐅",
    color: "#fbbf24",
    country: "Кения",
    flag: "🇰🇪",
    ability: "Скорость",
    abilityDesc: "30% — вратарь не успевает прыгнуть к мячу",
    special: true,
    priceCrystals: 5,
  },
  {
    name: "Фениксы",
    emoji: "🔥",
    color: "#fb7185",
    country: "Египет",
    flag: "🇪🇬",
    ability: "Возрождение",
    abilityDesc: "После промаха мимо ворот — следующий удар точно в створ",
    special: true,
    priceCrystals: 5,
  },
  {
    name: "Кракены",
    emoji: "🐙",
    color: "#0891b2",
    country: "Норвегия",
    flag: "🇳🇴",
    ability: "Второй шанс",
    abilityDesc: "Раз за матч: если твой удар парирован — бьёшь повторно",
    special: true,
    priceCrystals: 7,
  },
  {
    name: "Викинги",
    emoji: "⚔️",
    color: "#a16207",
    country: "Швеция",
    flag: "🇸🇪",
    ability: "Двойной гол",
    abilityDesc: "Твой первый гол в матче приносит 2 очка вместо 1",
    special: true,
    priceCrystals: 6,
  },
  {
    name: "Призраки",
    emoji: "👻",
    color: "#e5e7eb",
    country: "Ирландия",
    flag: "🇮🇪",
    ability: "Страх",
    abilityDesc: "Соперник бьёт мимо в первом раунде — слишком напуган",
    special: true,
    priceCrystals: 8,
  },
  {
    name: "Колоссы",
    emoji: "🗿",
    color: "#94a3b8",
    country: "Атлантида",
    flag: "🗿",
    ability: "Каменный щит",
    abilityDesc: "+35% автосейв на ЛЮБЫХ ударах соперника",
    special: true,
    secret: true,
    priceCrystals: 15,
  },
  {
    name: "Архангелы",
    emoji: "😇",
    color: "#fef9c3",
    country: "Небеса",
    flag: "✨",
    ability: "Святой щит",
    abilityDesc: "Первые 2 гола соперника отменяются",
    special: true,
    secret: true,
    priceCrystals: 15,
  },
  {
    name: "Нибиру",
    emoji: "🪐",
    color: "#a855f7",
    country: "Космос",
    flag: "🌌",
    ability: "Гравитация",
    abilityDesc: "50% — твой удар обходит вратаря в любую зону",
    special: true,
    secret: true,
    priceCrystals: 15,
  },
];

function TeamsPage() {
  const { ranked } = Route.useSearch();
  const [selected, setSelected] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const navigate = useNavigate();
  const inv = useInventory();

  const isTeamOwned = (team: (typeof TEAMS)[number]) => {
    if (!team.special) return true;
    return inv.ownedTeams.includes(team.name);
  };

  const handleSelect = (team: (typeof TEAMS)[number]) => {
    if (team.special && !isTeamOwned(team)) return;
    setSelected(team.name);
  };

  const handleBuy = (team: (typeof TEAMS)[number]) => {
    if (!team.special || !team.priceCrystals) return;
    const ok = inv.buyTeam(team.name, team.priceCrystals);
    if (ok) {
      setFlash(`Куплено: ${team.name}!`);
      setTimeout(() => setFlash(null), 1500);
      setSelected(team.name);
    } else {
      setFlash("Не хватает 💎!");
      setTimeout(() => setFlash(null), 1500);
    }
  };

  const canProceed = selected && isTeamOwned(TEAMS.find((t) => t.name === selected)!);

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

      {/* Flash toast */}
      {flash && (
        <div className="fixed top-6 z-50 rounded-full bg-black/80 px-6 py-2 text-sm font-black text-white shadow-xl backdrop-blur-md">
          {flash}
        </div>
      )}

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

        <div className="flex items-center gap-4">
          <p className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
            Выберите свою команду
          </p>
          <div
            className="flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-black"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <span>💎</span>
            <span className="text-white">{inv.crystals}</span>
          </div>
        </div>

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
          {TEAMS.filter((t) => !t.special).map((team) => (
            <button
              key={team.name}
              type="button"
              onClick={() => handleSelect(team)}
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

        {/* Special Teams Section */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, #ffd700)" }} />
            <span
              className="text-xs font-black tracking-[0.3em] uppercase"
              style={{ color: "#ffd700", textShadow: "0 0 12px rgba(255,215,0,0.5)" }}
            >
              ★ Особые команды ★
            </span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #ffd700, transparent)" }} />
          </div>
          <div
            className="grid w-full grid-cols-1 gap-4 rounded-2xl p-4 sm:grid-cols-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,100,200,0.08))",
              border: "2px dashed rgba(255,215,0,0.4)",
            }}
          >
            {TEAMS.filter((t) => t.special && !("secret" in t && t.secret)).map((team) => {
              const owned = isTeamOwned(team);
              const canAfford = inv.crystals >= (team.priceCrystals ?? 0);
              return (
                <div
                  key={team.name}
                  className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-black/40 px-4 py-5 text-white backdrop-blur-sm transition-all duration-200"
                  style={{
                    border: `2px solid ${team.color}`,
                    boxShadow:
                      selected === team.name && owned
                        ? `0 0 0 4px #ccff00, 0 6px 0 rgba(0,0,0,0.35), 0 0 40px ${team.color}aa`
                        : `0 6px 0 rgba(0,0,0,0.35), 0 0 32px ${team.color}55`,
                    transform: selected === team.name && owned ? "scale(1.05)" : undefined,
                    opacity: owned ? 1 : 0.7,
                  }}
                >
                  <span
                    className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider uppercase text-black"
                    style={{ background: "#ffd700", boxShadow: "0 0 12px rgba(255,215,0,0.7)" }}
                  >
                    ★ Особая
                  </span>
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

                  {owned ? (
                    <button
                      type="button"
                      onClick={() => handleSelect(team)}
                      className="mt-1 w-full rounded-md px-3 py-2 text-xs font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: selected === team.name ? "#ccff00" : "rgba(255,255,255,0.1)",
                        color: selected === team.name ? "#000" : "#fff",
                      }}
                    >
                      {selected === team.name ? "Выбрано" : "Выбрать"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleBuy(team)}
                      className="mt-1 flex w-full items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-black tracking-widest uppercase transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: canAfford ? "#ccff00" : "rgba(255,255,255,0.08)",
                        color: canAfford ? "#000" : "#fff",
                      }}
                    >
                      🔒 Купить 💎 {team.priceCrystals}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Secret Teams Section */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, transparent, #a855f7)" }}
            />
            <span
              className="text-xs font-black tracking-[0.3em] uppercase"
              style={{ color: "#d8b4fe", textShadow: "0 0 12px rgba(168,85,247,0.7)" }}
            >
              ✦ Секретные команды ✦
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, #a855f7, transparent)" }}
            />
          </div>
          <div
            className="grid w-full grid-cols-1 gap-4 rounded-2xl p-4 sm:grid-cols-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(14,165,233,0.10))",
              border: "2px dashed rgba(168,85,247,0.55)",
              boxShadow: "0 0 40px rgba(168,85,247,0.15)",
            }}
          >
            {TEAMS.filter((t) => "secret" in t && t.secret).map((team) => {
              const owned = isTeamOwned(team);
              const canAfford = inv.crystals >= (team.priceCrystals ?? 0);
              return (
                <div
                  key={team.name}
                  className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-black/50 px-4 py-5 text-white backdrop-blur-sm transition-all duration-200"
                  style={{
                    border: `2px solid ${team.color}`,
                    boxShadow:
                      selected === team.name && owned
                        ? `0 0 0 4px #ccff00, 0 6px 0 rgba(0,0,0,0.35), 0 0 50px ${team.color}cc`
                        : `0 6px 0 rgba(0,0,0,0.35), 0 0 40px ${team.color}77`,
                    transform: selected === team.name && owned ? "scale(1.05)" : undefined,
                    opacity: owned ? 1 : 0.75,
                  }}
                >
                  <span
                    className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider uppercase text-white"
                    style={{
                      background: "linear-gradient(90deg, #a855f7, #ec4899)",
                      boxShadow: "0 0 14px rgba(168,85,247,0.8)",
                    }}
                  >
                    ✦ Секрет
                  </span>
                  <span className="text-4xl" style={{ filter: owned ? undefined : "blur(6px) grayscale(1)" }}>
                    {owned ? team.emoji : "❓"}
                  </span>
                  <span className="text-sm font-black tracking-wider uppercase">
                    {owned ? team.name : "???"}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
                    <span className="text-sm leading-none">{owned ? team.flag : "🌐"}</span>
                    {owned ? team.country : "Неизвестно"}
                  </span>
                  <span
                    className="text-[10px] font-black leading-tight tracking-wide"
                    style={{ color: "#d8b4fe" }}
                  >
                    {owned ? team.ability : "Скрытая способность"}
                  </span>
                  <span className="text-[9px] font-medium leading-tight text-white/65 text-center">
                    {owned ? team.abilityDesc : "Откройте, чтобы узнать"}
                  </span>

                  {owned ? (
                    <button
                      type="button"
                      onClick={() => handleSelect(team)}
                      className="mt-1 w-full rounded-md px-3 py-2 text-xs font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor:
                          selected === team.name ? "#ccff00" : "rgba(255,255,255,0.1)",
                        color: selected === team.name ? "#000" : "#fff",
                      }}
                    >
                      {selected === team.name ? "Выбрано" : "Выбрать"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleBuy(team)}
                      className="mt-1 flex w-full items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-black tracking-widest uppercase transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                      style={{
                        background: canAfford
                          ? "linear-gradient(90deg, #a855f7, #ec4899)"
                          : "rgba(255,255,255,0.08)",
                        color: "#fff",
                      }}
                    >
                      🔒 Купить 💎 {team.priceCrystals}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        {canProceed && (
          <button
            type="button"
            onClick={() =>
              navigate({ to: "/match", search: { team: selected, ranked } })
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
