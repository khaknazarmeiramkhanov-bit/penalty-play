import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { TEAMS } from "./teams";

const searchSchema = z.object({ team: z.string().default("Команда") });

const OPPONENT_COLOR = "#dc2626";

function teamColor(name: string): string {
  return TEAMS.find((t) => t.name === name)?.color ?? "#ccff00";
}

function teamAbility(name: string): { ability: string; abilityDesc: string } {
  const t = TEAMS.find((t) => t.name === name);
  return {
    ability: t?.ability ?? "—",
    abilityDesc: t?.abilityDesc ?? "",
  };
}

export const Route = createFileRoute("/match")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Пенальти — Серия пенальти" },
      { name: "description", content: "Угадайте удар и забейте сами." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,900;1,900&display=swap",
      },
    ],
  }),
  component: MatchPage,
});

type Zone = "TL" | "TC" | "TR" | "BL" | "BC" | "BR";
const ZONES: { id: Zone; label: string; col: 0 | 1 | 2; row: 0 | 1 }[] = [
  { id: "TL", label: "↖", col: 0, row: 0 },
  { id: "TC", label: "↑", col: 1, row: 0 },
  { id: "TR", label: "↗", col: 2, row: 0 },
  { id: "BL", label: "↙", col: 0, row: 1 },
  { id: "BC", label: "↓", col: 1, row: 1 },
  { id: "BR", label: "↘", col: 2, row: 1 },
];
const ALL_ZONES: Zone[] = ZONES.map((z) => z.id);
const MIN_ROUNDS = 5;
const SUDDEN_TARGET = 5;

type Phase = "opponent" | "player" | "result" | "over";
type Shooter = "opponent" | "player";
type Last = {
  shooter: Shooter;
  shot: Zone;
  keeper: Zone;
  scored: boolean;
  offTarget: boolean;
};

function randomZone(): Zone {
  return ALL_ZONES[Math.floor(Math.random() * ALL_ZONES.length)];
}

/** Pick the zone the player has chosen the LEAST (good for opponent shooting). */
function leastUsed(history: Zone[]): Zone {
  const counts = new Map<Zone, number>(ALL_ZONES.map((z) => [z, 0]));
  for (const z of history) counts.set(z, (counts.get(z) ?? 0) + 1);
  const min = Math.min(...counts.values());
  const candidates = ALL_ZONES.filter((z) => counts.get(z) === min);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** Pick the zone the player has chosen the MOST (good for keeper diving). */
function mostUsed(history: Zone[]): Zone {
  if (history.length === 0) return randomZone();
  const counts = new Map<Zone, number>(ALL_ZONES.map((z) => [z, 0]));
  for (const z of history) counts.set(z, (counts.get(z) ?? 0) + 1);
  const max = Math.max(...counts.values());
  const candidates = ALL_ZONES.filter((z) => counts.get(z) === max);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function MatchPage() {
  const { team } = Route.useSearch();
  const { ability, abilityDesc } = teamAbility(team);

  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("opponent");
  const [playerScore, setPlayerScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [last, setLast] = useState<Last | null>(null);
  const [animating, setAnimating] = useState(false);
  const [abilityFlash, setAbilityFlash] = useState<string | null>(null);

  // History of player choices to drive smarter AI
  const playerGuessHistory = useRef<Zone[]>([]); // where player dives as keeper
  const playerShotHistory = useRef<Zone[]>([]); // where player shoots
  // Precomputed opponent shot for current opponent phase (for hint abilities)
  const pendingOppShot = useRef<Zone | null>(null);
  // One-time uses
  const kingCancelUsed = useRef(false);

  // Precompute opponent's shot whenever opponent phase starts
  useEffect(() => {
    if (phase !== "opponent") return;
    const lionsDumb = team === "Львы";
    const smart = !lionsDumb && Math.random() < 0.7;
    pendingOppShot.current = smart
      ? leastUsed(playerGuessHistory.current)
      : randomZone();
  }, [phase, team, round]);

  const oppHint = useMemo(() => {
    if (phase !== "opponent" || !pendingOppShot.current) return null;
    const z = pendingOppShot.current;
    const meta = ZONES.find((x) => x.id === z)!;
    if (team === "Орлы") return `Подсказка: соперник бьёт ${meta.row === 0 ? "ВВЕРХ" : "ВНИЗ"}`;
    if (team === "Молнии")
      return `Подсказка: соперник бьёт ${meta.col === 0 ? "ВЛЕВО" : meta.col === 1 ? "В ЦЕНТР" : "ВПРАВО"}`;
    return null;
  }, [phase, team, round]);

  const phaseLabel = useMemo(() => {
    if (phase === "opponent") return "Бьёт соперник — выбери угол";
    if (phase === "player") return `Бьёт ${team} — бей в угол`;
    if (phase === "result") return "Раунд";
    return "Матч окончен";
  }, [phase, team]);

  function handleOpponentShot(playerKeeper: Zone) {
    if (animating) return;
    setAnimating(true);
    const shot: Zone = pendingOppShot.current ?? randomZone();
    playerGuessHistory.current = [...playerGuessHistory.current, playerKeeper];

    // ABILITIES affecting opponent shot:
    const wolves = team === "Волки";       // opp off-target chance up to 25%
    const tigers = team === "Тигры";       // 20% auto-save
    const offChance = wolves ? 0.25 : 0.1;
    const offTarget = Math.random() < offChance;
    const autoSave = tigers && Math.random() < 0.2;
    const effectiveKeeper: Zone = autoSave ? shot : playerKeeper;
    let scored = !offTarget && shot !== effectiveKeeper;

    // Корона: cancel first opponent goal
    if (scored && team === "Короли" && !kingCancelUsed.current) {
      kingCancelUsed.current = true;
      scored = false;
      setAbilityFlash("👑 Корона! Гол отменён");
    } else if (autoSave) {
      setAbilityFlash("🐯 Прыжок тигра! Автосейв");
    } else {
      setAbilityFlash(null);
    }

    setLast({ shooter: "opponent", shot, keeper: effectiveKeeper, scored, offTarget });
    setPhase("result");
    if (scored) setOppScore((s) => s + 1);
    pendingOppShot.current = null;
    window.setTimeout(() => setAnimating(false), 700);
  }

  function handlePlayerShot(playerShot: Zone) {
    if (animating) return;
    setAnimating(true);
    // ABILITIES affecting player shot:
    const bulls = team === "Быки";       // weaker keeper guess
    const cobras = team === "Кобры";     // 20% keeper jumps wrong
    const dragons = team === "Драконы";  // never off-target
    const sharks = team === "Акулы";     // 20% score-through

    const smartChance = bulls ? 0.3 : 0.7;
    const smart = Math.random() < smartChance;
    let keeper: Zone = smart ? mostUsed(playerShotHistory.current) : randomZone();
    if (cobras && Math.random() < 0.2) {
      const others = ALL_ZONES.filter((z) => z !== playerShot);
      keeper = others[Math.floor(Math.random() * others.length)];
    }
    playerShotHistory.current = [...playerShotHistory.current, playerShot];

    const offTarget = dragons ? false : Math.random() < 0.1;
    let scored = !offTarget && playerShot !== keeper;
    if (!scored && !offTarget && sharks && Math.random() < 0.2) {
      scored = true;
      setAbilityFlash("🦈 Хищный удар! Гол сквозь вратаря");
    } else if (cobras && keeper !== playerShot && scored) {
      setAbilityFlash("🐍 Гипноз сработал!");
    } else if (dragons && playerShot !== keeper) {
      setAbilityFlash("🐉 Огненный удар!");
    } else {
      setAbilityFlash(null);
    }

    setLast({ shooter: "player", shot: playerShot, keeper, scored, offTarget });
    setPhase("result");
    if (scored) setPlayerScore((s) => s + 1);
    window.setTimeout(() => setAnimating(false), 700);
  }

  function next() {
    if (!last) return;
    // After opponent shot → player shoots in same round
    if (last.shooter === "opponent") {
      setPhase("player");
      return;
    }
    // Round completed
    const completed = round;
    const playerWinsOutright =
      completed >= MIN_ROUNDS && playerScore !== oppScore;
    const reachedSuddenTarget =
      completed >= MIN_ROUNDS &&
      (playerScore >= SUDDEN_TARGET || oppScore >= SUDDEN_TARGET) &&
      playerScore !== oppScore;

    if (playerWinsOutright || reachedSuddenTarget) {
      setPhase("over");
      return;
    }
    setRound((r) => r + 1);
    setPhase("opponent");
  }

  function reset() {
    setRound(1);
    setPhase("opponent");
    setPlayerScore(0);
    setOppScore(0);
    setLast(null);
    setAbilityFlash(null);
    playerGuessHistory.current = [];
    playerShotHistory.current = [];
    pendingOppShot.current = null;
    kingCancelUsed.current = false;
  }

  const isSudden = round > MIN_ROUNDS;

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden px-4 py-6"
      style={{ backgroundColor: "#0d5c2a", fontFamily: "'Kanit', sans-serif" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-5">
        {/* Scoreboard */}
        <div
          className="relative z-20 flex w-full items-stretch justify-between rounded-xl bg-black/40 p-3 text-white backdrop-blur-sm"
          style={{ border: "2px solid #ccff00" }}
        >
          <ScorePane label="Ты" name={team} score={playerScore} />
          <div className="flex flex-col items-center justify-center px-2 text-white/60">
            <span className="text-[10px] tracking-[0.2em] uppercase">
              {isSudden ? "Сэрия" : "Раунд"}
            </span>
            <span className="text-2xl font-black text-white">
              {isSudden ? `+${round - MIN_ROUNDS}` : `${round}/${MIN_ROUNDS}`}
            </span>
          </div>
          <ScorePane label="Соперник" name="Враги" score={oppScore} />
        </div>

        {/* Phase title */}
        <h2
          className="relative z-20 text-center text-xl font-black italic tracking-tight text-white uppercase sm:text-2xl"
          style={{ textShadow: "0 3px 0 rgba(0,0,0,0.3)" }}
        >
          {phaseLabel}
        </h2>

        {/* Goal scene */}
        <GoalScene
          phase={phase}
          last={last}
          playerColor={teamColor(team)}
          oppColor={OPPONENT_COLOR}
        />

        {/* Zone controls */}
        {(phase === "opponent" || phase === "player") && (
          <ZonePad
            onPick={(z) =>
              phase === "opponent" ? handleOpponentShot(z) : handlePlayerShot(z)
            }
            disabled={animating}
            actionLabel={phase === "opponent" ? "Защищай" : "Бей"}
          />
        )}

        {phase === "result" && last && (
          <ResultBlock last={last} onNext={next} />
        )}

        {phase === "over" && (
          <OverBlock
            team={team}
            playerScore={playerScore}
            oppScore={oppScore}
            onReset={reset}
          />
        )}

        <Link
          to="/teams"
          className="mt-1 text-xs font-bold tracking-[0.2em] text-white/60 uppercase transition-colors hover:text-white"
        >
          ← Сменить команду
        </Link>
      </div>
    </main>
  );
}

function ScorePane({
  label,
  name,
  score,
}: {
  label: string;
  name: string;
  score: number;
}) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className="text-[10px] tracking-[0.2em] text-white/60 uppercase">
        {label}
      </span>
      <span className="max-w-[110px] truncate text-sm font-black tracking-wider uppercase">
        {name}
      </span>
      <span className="mt-1 text-3xl font-black" style={{ color: "#ccff00" }}>
        {score}
      </span>
    </div>
  );
}

function ZonePad({
  onPick,
  disabled,
  actionLabel,
}: {
  onPick: (z: Zone) => void;
  disabled: boolean;
  actionLabel: string;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <p className="text-[10px] tracking-[0.25em] text-white/70 uppercase">
        {actionLabel}: выбери угол
      </p>
      <div className="grid w-full max-w-md grid-cols-3 gap-2">
        {ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(z.id)}
            className="rounded-lg px-2 py-2 text-base font-black text-black transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: "#ccff00",
              boxShadow: "0 3px 0 rgb(132,163,0)",
            }}
          >
            {z.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultBlock({ last, onNext }: { last: Last; onNext: () => void }) {
  const isOpp = last.shooter === "opponent";
  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className="text-center text-xl font-black uppercase"
        style={{ color: last.scored ? "#ff4d4d" : "#ccff00" }}
      >
        {last.offTarget
          ? isOpp
            ? "Соперник пробил мимо!"
            : "Ты пробил мимо!"
          : isOpp
            ? last.scored
              ? "Соперник забил! +1 ему"
              : "Ты отбил!"
            : last.scored
              ? "ГОЛ! +1 тебе"
              : "Вратарь отбил!"}
      </p>
      <p className="text-[10px] tracking-[0.25em] text-white/70 uppercase">
        Удар: {zoneLabel(last.shot)} · Вратарь: {zoneLabel(last.keeper)}
      </p>
      <button
        type="button"
        onClick={onNext}
        className="rounded-xl px-10 py-3 text-lg font-black tracking-widest text-black uppercase transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "#ccff00",
          boxShadow: "0 8px 0 rgb(132,163,0)",
        }}
      >
        Дальше →
      </button>
    </div>
  );
}

function OverBlock({
  team,
  playerScore,
  oppScore,
  onReset,
}: {
  team: string;
  playerScore: number;
  oppScore: number;
  onReset: () => void;
}) {
  const won = playerScore > oppScore;
  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className="text-center text-3xl font-black italic uppercase"
        style={{
          color: won ? "#ccff00" : "#ff4d4d",
          textShadow: "0 3px 0 rgba(0,0,0,0.3)",
        }}
      >
        {won ? "Победа!" : "Поражение"}
      </p>
      <p className="text-sm tracking-widest text-white/80 uppercase">
        {team} {playerScore} : {oppScore} Враги
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl px-6 py-3 text-base font-black tracking-widest text-black uppercase transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: "#ccff00",
            boxShadow: "0 6px 0 rgb(132,163,0)",
          }}
        >
          Ещё раз
        </button>
        <Link
          to="/"
          className="rounded-xl border-2 border-white/40 px-6 py-3 text-base font-black tracking-widest text-white uppercase transition-all duration-200 hover:scale-105 active:scale-95"
        >
          В меню
        </Link>
      </div>
    </div>
  );
}

function zoneLabel(z: Zone) {
  const map: Record<Zone, string> = {
    TL: "Лево-верх",
    TC: "Центр-верх",
    TR: "Право-верх",
    BL: "Лево-низ",
    BC: "Центр-низ",
    BR: "Право-низ",
  };
  return map[z];
}

const SKIN_TONES = ["#f5d6b1", "#e0b48a", "#c98e62", "#8b5a3c", "#5a3a26"];

function Crowd({
  playerColor,
  oppColor,
}: {
  playerColor: string;
  oppColor: string;
}) {
  // Three rows of seats, getting smaller toward the back for depth
  const rows = [
    { count: 30, size: 10, opacity: 0.7, yOffset: 0 },
    { count: 26, size: 12, opacity: 0.9, yOffset: 2 },
    { count: 22, size: 16, opacity: 1, yOffset: 4 },
  ];
  return (
    <div
      className="pointer-events-none relative z-0 w-full overflow-hidden rounded-t-lg"
      aria-hidden
      style={{
        height: 96,
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #1f1f1f 60%, #2a2a2a 100%)",
        boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.5)",
      }}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-end gap-0.5 pb-1">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex w-full items-end justify-between px-1"
            style={{
              transform: `translateY(${row.yOffset}px)`,
              opacity: row.opacity,
            }}
          >
            {Array.from({ length: row.count }).map((_, i) => {
              const isLeft = i < row.count / 2;
              const color = isLeft ? playerColor : oppColor;
              const skin = SKIN_TONES[(i * 7 + rowIdx * 3) % SKIN_TONES.length];
              const armsUp = (i + rowIdx) % 3 === 0;
              return (
                <Fan
                  key={i}
                  color={color}
                  skin={skin}
                  size={row.size}
                  armsUp={armsUp}
                  delay={(i * 60 + rowIdx * 120) % 900}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Fan({
  color,
  skin,
  size,
  armsUp,
  delay,
}: {
  color: string;
  skin: string;
  size: number;
  armsUp: boolean;
  delay: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size * 1.6,
        animation: armsUp
          ? "fanCheer 0.9s ease-in-out infinite"
          : "fanBob 1.4s ease-in-out infinite",
        animationDelay: `${delay}ms`,
        flex: "0 0 auto",
      }}
    >
      <svg viewBox="0 0 16 26" width="100%" height="100%">
        {/* arms */}
        {armsUp ? (
          <>
            <line x1="3" y1="14" x2="1" y2="6" stroke={skin} strokeWidth="2" strokeLinecap="round" />
            <line x1="13" y1="14" x2="15" y2="6" stroke={skin} strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="3" y1="14" x2="2" y2="20" stroke={skin} strokeWidth="2" strokeLinecap="round" />
            <line x1="13" y1="14" x2="14" y2="20" stroke={skin} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {/* body (jersey) */}
        <path
          d="M3 13 Q3 11 5 11 L11 11 Q13 11 13 13 L13 22 L3 22 Z"
          fill={color}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="0.5"
        />
        {/* head */}
        <circle cx="8" cy="6" r="4" fill={skin} stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
        {/* cap stripe in team color */}
        <path
          d="M4.2 4 Q8 1.5 11.8 4 L11.5 5 L4.5 5 Z"
          fill={color}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

function PlayerFigure({
  color,
  pose,
  size = 44,
  emotion = "neutral",
}: {
  color: string;
  pose: "striker" | "keeper";
  size?: number;
  emotion?: "neutral" | "happy" | "sad";
}) {
  const isKeeper = pose === "keeper";
  // Modern flat-vector style — clean silhouette, no creepy face.
  const skin = "#e8b894";
  const skinShade = "#b9805c";
  const hair = "#1a1208";
  const sockDark = "#0c0c10";
  const cleat = "#0a0a0a";
  const accent = "#ffffff";
  const safeId = color.replace(/[^a-zA-Z0-9]/g, "");
  const jerseyId = `jersey-${pose}-${safeId}`;
  const skinId = `skin-${pose}-${safeId}`;
  const browTilt = emotion === "sad" ? -10 : emotion === "happy" ? 8 : 0;

  return (
    <svg
      width={size}
      height={(size * 130) / 90}
      viewBox="0 0 90 130"
      style={{ filter: "drop-shadow(0 6px 4px rgba(0,0,0,0.45))" }}
    >
      <defs>
        <linearGradient id={jerseyId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={skinId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShade} />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="45" cy="126" rx="24" ry="3" fill="rgba(0,0,0,0.35)" />

      {/* === HEAD === */}
      {/* Hair back layer */}
      <path
        d="M32 18 Q32 7 45 7 Q58 7 58 18 L58 24 L32 24 Z"
        fill={hair}
      />
      {/* Face */}
      <path
        d="M34 18 Q34 11 45 11 Q56 11 56 18 L56 26 Q56 33 45 33 Q34 33 34 26 Z"
        fill={`url(#${skinId})`}
      />
      {/* Jaw shade */}
      <path d="M37 28 Q45 32 53 28 L53 30 Q45 33.5 37 30 Z" fill={skinShade} opacity="0.5" />
      {/* Hair fringe over forehead */}
      <path
        d="M33 18 Q40 12 47 16 Q52 14 57 18 L56 21 Q50 18 46 20 Q40 17 34 22 Z"
        fill={hair}
      />
      {/* Ears */}
      <ellipse cx="33.5" cy="22" rx="1.4" ry="2.4" fill={skinShade} />
      <ellipse cx="56.5" cy="22" rx="1.4" ry="2.4" fill={skinShade} />
      {/* Brows — minimal angled strokes */}
      <g transform={`rotate(${browTilt} 41 21)`}>
        <rect x="38.5" y="20.5" width="4.5" height="1.4" rx="0.7" fill="#1a1208" />
      </g>
      <g transform={`rotate(${-browTilt} 49 21)`}>
        <rect x="47" y="20.5" width="4.5" height="1.4" rx="0.7" fill="#1a1208" />
      </g>
      {/* Eyes — minimal dots */}
      <circle cx="41" cy="24" r="0.9" fill="#1a1208" />
      <circle cx="49" cy="24" r="0.9" fill="#1a1208" />
      {/* Mouth */}
      {emotion === "happy" ? (
        <path d="M41 29 Q45 32 49 29" stroke="#1a1208" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      ) : emotion === "sad" ? (
        <path d="M41 30 Q45 28 49 30" stroke="#1a1208" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      ) : (
        <line x1="42" y1="29.5" x2="48" y2="29.5" stroke="#1a1208" strokeWidth="1.2" strokeLinecap="round" />
      )}

      {/* === NECK === */}
      <path d="M40 33 L40 38 Q45 40 50 38 L50 33 Z" fill={`url(#${skinId})`} />
      <path d="M40 36 Q45 39 50 36 L50 38 Q45 40 40 38 Z" fill={skinShade} opacity="0.4" />

      {/* === TORSO (modern athletic jersey) === */}
      <path
        d="M24 46 Q26 40 34 38 Q40 41 45 41 Q50 41 56 38 Q64 40 66 46 L68 70 Q58 74 56 74 L56 82 L34 82 L34 74 Q32 74 22 70 Z"
        fill={`url(#${jerseyId})`}
      />
      {/* Jersey side panel highlights */}
      <path d="M26 46 L24 70 L30 72 L32 48 Z" fill="#fff" opacity="0.08" />
      <path d="M64 46 L66 70 L60 72 L58 48 Z" fill="#000" opacity="0.18" />
      {/* V-collar */}
      <path d="M38 41 L45 49 L52 41 L50 41 L45 46 L40 41 Z" fill="#0d0d0d" />
      {/* Shoulder accent stripes */}
      <path d="M30 41 L34 38 L36 42 L32 45 Z" fill={accent} opacity="0.9" />
      <path d="M60 41 L56 38 L54 42 L58 45 Z" fill={accent} opacity="0.9" />
      {/* Jersey number */}
      <text
        x="45"
        y="64"
        textAnchor="middle"
        fontSize="16"
        fontWeight="900"
        fill={accent}
        fontFamily="Kanit, sans-serif"
        letterSpacing="-0.5"
      >
        {isKeeper ? "01" : "10"}
      </text>

      {/* === ARMS === */}
      {isKeeper ? (
        <>
          {/* Outstretched diving arms */}
          <path d="M24 46 L8 38 L4 44 L20 54 Z" fill={`url(#${jerseyId})`} />
          <path d="M66 46 L82 38 L86 44 L70 54 Z" fill={`url(#${jerseyId})`} />
          {/* Forearm bands */}
          <rect x="14" y="46" width="6" height="3" fill={accent} transform="rotate(-30 17 47)" />
          <rect x="70" y="46" width="6" height="3" fill={accent} transform="rotate(30 73 47)" />
          {/* Gloves — bright pro-keeper style */}
          <path d="M2 38 Q-2 42 2 47 Q8 50 12 46 Q14 42 10 38 Z" fill="#ff7a1a" stroke="#1a1208" strokeWidth="0.6" />
          <path d="M88 38 Q92 42 88 47 Q82 50 78 46 Q76 42 80 38 Z" fill="#ff7a1a" stroke="#1a1208" strokeWidth="0.6" />
          {/* Glove highlights */}
          <path d="M4 41 L8 39 L9 42 L5 44 Z" fill="#ffb066" />
          <path d="M86 41 L82 39 L81 42 L85 44 Z" fill="#ffb066" />
        </>
      ) : (
        <>
          {/* Back arm */}
          <path d="M24 46 L14 58 L18 62 L28 50 Z" fill={`url(#${jerseyId})`} />
          {/* Forward arm */}
          <path d="M66 46 L74 56 L70 62 L60 50 Z" fill={`url(#${jerseyId})`} />
          {/* Wrist bands */}
          <rect x="14" y="56" width="5" height="2.5" fill={accent} transform="rotate(40 16 57)" />
          <rect x="70" y="56" width="5" height="2.5" fill={accent} transform="rotate(-40 72 57)" />
          {/* Hands as soft rounded blobs */}
          <ellipse cx="16" cy="60" rx="3.2" ry="3.6" fill={`url(#${skinId})`} />
          <ellipse cx="72" cy="60" rx="3.2" ry="3.6" fill={`url(#${skinId})`} />
        </>
      )}

      {/* === SHORTS === */}
      <path
        d="M34 82 L56 82 L58 100 L48 100 L46 88 L44 88 L42 100 L32 100 Z"
        fill="#111114"
      />
      {/* Shorts highlight */}
      <path d="M34 83 L56 83 L57 86 L34 86 Z" fill={color} opacity="0.85" />
      <path d="M44 88 L46 88 L46 100 L44 100 Z" fill="#000" opacity="0.4" />

      {/* === LEGS === */}
      {isKeeper ? (
        <>
          {/* Standing keeper stance */}
          <path d="M34 100 L36 118 L44 118 L43 100 Z" fill={sockDark} />
          <path d="M47 100 L46 118 L54 118 L56 100 Z" fill={sockDark} />
          {/* Sock bands (team color) */}
          <rect x="35" y="112" width="9" height="2.5" fill={color} />
          <rect x="46" y="112" width="9" height="2.5" fill={color} />
          {/* Cleats */}
          <path d="M30 118 Q34 116 44 118 L44 122 Q37 124 30 122 Z" fill={cleat} />
          <path d="M46 118 Q56 116 60 118 L60 122 Q53 124 46 122 Z" fill={cleat} />
          {/* Cleat sole stripe */}
          <rect x="30" y="121" width="14" height="1.5" fill={color} />
          <rect x="46" y="121" width="14" height="1.5" fill={color} />
        </>
      ) : (
        <>
          {/* Planted leg */}
          <path d="M34 100 L36 118 L44 118 L44 100 Z" fill={sockDark} />
          {/* Kicking leg swung forward */}
          <path d="M46 100 L62 110 L60 116 L44 106 Z" fill={sockDark} />
          {/* Sock bands */}
          <rect x="35" y="112" width="9" height="2.5" fill={color} />
          <rect x="50" y="105" width="9" height="2.5" fill={color} transform="rotate(30 54 106)" />
          {/* Planted cleat */}
          <path d="M30 118 Q34 116 44 118 L44 122 Q37 124 30 122 Z" fill={cleat} />
          <rect x="30" y="121" width="14" height="1.5" fill={color} />
          {/* Kicking cleat */}
          <g transform="rotate(20 60 113)">
            <path d="M54 110 Q60 108 68 110 L68 114 Q60 116 54 114 Z" fill={cleat} />
            <rect x="54" y="113" width="14" height="1.5" fill={color} />
          </g>
        </>
      )}
    </svg>
  );
}

/** Convert zone to percentage coordinates within the goal frame */
function zoneCoords(z: Zone): { left: string; top: string } {
  const meta = ZONES.find((x) => x.id === z)!;
  const left = meta.col === 0 ? "18%" : meta.col === 1 ? "50%" : "82%";
  const top = meta.row === 0 ? "30%" : "65%";
  return { left, top };
}

function GoalScene({
  phase,
  last,
  playerColor,
  oppColor,
}: {
  phase: Phase;
  last: Last | null;
  playerColor: string;
  oppColor: string;
}) {
  // Animation: ball travels from striker spot to its zone after picking
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (phase === "result") setTick((t) => t + 1);
  }, [phase, last]);

  const showAction = phase === "result" && last;
  const ballPos = showAction ? zoneCoords(last!.shot) : null;
  const keeperPos = showAction
    ? zoneCoords(last!.keeper)
    : { left: "50%", top: "65%" };

  const strikerIsPlayer = last?.shooter === "player";
  // During action phases, striker color matches the active shooter
  const activeShooter: Shooter =
    phase === "player"
      ? "player"
      : phase === "opponent"
        ? "opponent"
        : (last?.shooter ?? "opponent");
  const strikerColor =
    activeShooter === "player" ? playerColor : oppColor;
  // Keeper is the OTHER team
  const keeperColor = activeShooter === "player" ? oppColor : playerColor;

  // Emotions only during result
  let strikerEmotion: "neutral" | "happy" | "sad" = "neutral";
  let keeperEmotion: "neutral" | "happy" | "sad" = "neutral";
  if (showAction && last) {
    if (last.offTarget) {
      strikerEmotion = "sad";
      keeperEmotion = "happy";
    } else if (last.scored) {
      strikerEmotion = "happy";
      keeperEmotion = "sad";
    } else {
      strikerEmotion = "sad";
      keeperEmotion = "happy";
    }
  }

  // Off-target ball position: throw it off to the side / over the bar
  const offBallPos =
    showAction && last?.offTarget
      ? last.shot === "TL" || last.shot === "BL"
        ? { left: "-8%", top: "20%" }
        : last.shot === "TR" || last.shot === "BR"
          ? { left: "108%", top: "20%" }
          : { left: "50%", top: "-15%" }
      : null;
  const finalBallPos = offBallPos ?? ballPos;

  return (
    <div className="relative w-full max-w-lg">
      {/* Crowd stand behind the goal */}
      <Crowd playerColor={playerColor} oppColor={oppColor} />
      {/* Goal frame */}
      <div
        className="relative z-10 w-full overflow-hidden rounded-lg bg-white/5"
        style={{
          aspectRatio: "16 / 9",
          border: "4px solid white",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 28px), repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 28px)",
        }}
      >
        {/* Goal line shadow */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 bg-black/30" />

        {/* Keeper */}
        <div
          key={`keeper-${tick}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ left: keeperPos.left, top: keeperPos.top }}
        >
          <PlayerFigure color={keeperColor} pose="keeper" size={104} emotion={keeperEmotion} />
        </div>

        {/* Ball */}
        {finalBallPos && (
          <div
            key={`ball-${tick}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl"
            style={{
              left: finalBallPos.left,
              top: finalBallPos.top,
              filter: "drop-shadow(0 3px 0 rgba(0,0,0,0.4))",
              animation: "ballFly 0.55s ease-out",
            }}
          >
            ⚽
          </div>
        )}

        {/* Zone grid hint */}
        {(phase === "opponent" || phase === "player") && (
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-2 opacity-30">
            {ZONES.map((z) => (
              <div
                key={z.id}
                className="flex items-center justify-center border border-white/30 text-2xl text-white/70"
              >
                {z.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Striker outside the goal */}
      <div className="mt-2 flex items-center justify-between px-2">
        <PlayerFigure color={strikerColor} pose="striker" size={110} emotion={strikerEmotion} />
        <span className="text-[10px] tracking-[0.25em] text-white/70 uppercase">
          {activeShooter === "player" ? "Бьёшь ты" : "Бьёт соперник"}
        </span>
        <div className="h-20 w-20" />
      </div>

      <style>{`
        @keyframes ballFly {
          0% { transform: translate(-50%, 80px) scale(0.4); opacity: 0.4; }
          60% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes fanBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes fanCheer {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-6px) scaleY(1.05); }
        }
      `}</style>
    </div>
  );
}