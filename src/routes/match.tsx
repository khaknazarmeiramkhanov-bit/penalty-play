import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { TEAMS } from "./teams";

const searchSchema = z.object({ team: z.string().default("Команда") });

const OPPONENT_COLOR = "#dc2626";

function teamColor(name: string): string {
  return TEAMS.find((t) => t.name === name)?.color ?? "#ccff00";
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

  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("opponent");
  const [playerScore, setPlayerScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [last, setLast] = useState<Last | null>(null);
  const [animating, setAnimating] = useState(false);

  // History of player choices to drive smarter AI
  const playerGuessHistory = useRef<Zone[]>([]); // where player dives as keeper
  const playerShotHistory = useRef<Zone[]>([]); // where player shoots

  const phaseLabel = useMemo(() => {
    if (phase === "opponent") return "Бьёт соперник — выбери угол";
    if (phase === "player") return `Бьёт ${team} — бей в угол`;
    if (phase === "result") return "Раунд";
    return "Матч окончен";
  }, [phase, team]);

  function handleOpponentShot(playerKeeper: Zone) {
    if (animating) return;
    setAnimating(true);
    // Smarter AI: 70% pick the zone player guesses least, 30% random
    const smart = Math.random() < 0.7;
    const shot: Zone = smart ? leastUsed(playerGuessHistory.current) : randomZone();
    playerGuessHistory.current = [...playerGuessHistory.current, playerKeeper];

    const offTarget = Math.random() < 0.1;
    const scored = !offTarget && shot !== playerKeeper;
    setLast({ shooter: "opponent", shot, keeper: playerKeeper, scored, offTarget });
    setPhase("result");
    if (scored) setOppScore((s) => s + 1);
    window.setTimeout(() => setAnimating(false), 700);
  }

  function handlePlayerShot(playerShot: Zone) {
    if (animating) return;
    setAnimating(true);
    // Smarter AI keeper: 70% dive to player's most-used shot zone, 30% random
    const smart = Math.random() < 0.7;
    const keeper: Zone = smart ? mostUsed(playerShotHistory.current) : randomZone();
    playerShotHistory.current = [...playerShotHistory.current, playerShot];

    const offTarget = Math.random() < 0.1;
    const scored = !offTarget && playerShot !== keeper;
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
    playerGuessHistory.current = [];
    playerShotHistory.current = [];
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
  // Derive a slightly darker shade of the team color for shading
  const darkColor = "rgba(0,0,0,0.25)";
  const skin = "#e8b48a";
  const skinShade = "#c89070";
  const hair = "#2a1810";
  const cleat = "#0a0a0a";
  const sock = "#111";

  return (
    <svg
      width={size}
      height={(size * 120) / 80}
      viewBox="0 0 80 120"
      style={{ filter: "drop-shadow(0 4px 3px rgba(0,0,0,0.5))" }}
    >
      <defs>
        <radialGradient id={`jersey-${pose}-${color.replace('#','')}`} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
        <radialGradient id={`skin-grad`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShade} />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="40" cy="116" rx="22" ry="3" fill="rgba(0,0,0,0.35)" />

      {/* Neck */}
      <rect x="36" y="26" width="8" height="6" fill="url(#skin-grad)" />

      {/* Head */}
      <ellipse cx="40" cy="18" rx="9" ry="11" fill="url(#skin-grad)" stroke="#000" strokeWidth="0.8" />
      {/* Hair */}
      <path
        d="M31 14 Q31 6 40 6 Q49 6 49 14 Q49 11 45 10 Q42 12 40 11 Q38 12 35 10 Q31 11 31 14 Z"
        fill={hair}
      />
      {/* Ear */}
      <ellipse cx="31" cy="18" rx="1.4" ry="2.2" fill={skinShade} />
      <ellipse cx="49" cy="18" rx="1.4" ry="2.2" fill={skinShade} />
      {/* Brows */}
      <path d="M34 17 L37.5 16.5" stroke="#000" strokeWidth="1" strokeLinecap="round" />
      <path d="M46 16.5 L42.5 17" stroke="#000" strokeWidth="1" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="36" cy="19" rx="1.3" ry="1.6" fill="#fff" stroke="#000" strokeWidth="0.4" />
      <ellipse cx="44" cy="19" rx="1.3" ry="1.6" fill="#fff" stroke="#000" strokeWidth="0.4" />
      <circle cx="36" cy="19.3" r="0.7" fill="#000" />
      <circle cx="44" cy="19.3" r="0.7" fill="#000" />
      {/* Nose */}
      <path d="M40 19 L38.5 23 L41 23.4" stroke={skinShade} strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Mouth */}
      {emotion === "sad" ? (
        <path d="M36 26 Q40 23 44 26" stroke="#000" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      ) : emotion === "happy" ? (
        <path d="M36 24.5 Q40 28 44 24.5" stroke="#7a2a1a" strokeWidth="1.5" fill="#ff6b8a" strokeLinecap="round" />
      ) : (
        <path d="M37 25 L43 25" stroke="#000" strokeWidth="1.2" strokeLinecap="round" />
      )}

      {/* Jersey torso */}
      <path
        d="M22 38 Q24 32 30 32 L50 32 Q56 32 58 38 L60 60 L52 62 L52 72 L28 72 L28 62 L20 60 Z"
        fill={`url(#jersey-${pose}-${color.replace('#','')})`}
        stroke="#000"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Jersey collar */}
      <path d="M34 32 Q40 36 46 32" stroke="#000" strokeWidth="1" fill={darkColor} />
      {/* Jersey number */}
      <text x="40" y="56" textAnchor="middle" fontSize="14" fontWeight="900" fill="#fff" stroke="#000" strokeWidth="0.6" fontFamily="Kanit, sans-serif">
        {isKeeper ? "1" : "9"}
      </text>

      {/* Arms */}
      {isKeeper ? (
        <>
          {/* Outstretched arms with gloves */}
          <path d="M22 38 L8 30 L4 34 L18 44 Z" fill={`url(#jersey-${pose}-${color.replace('#','')})`} stroke="#000" strokeWidth="1" strokeLinejoin="round" />
          <path d="M58 38 L72 30 L76 34 L62 44 Z" fill={`url(#jersey-${pose}-${color.replace('#','')})`} stroke="#000" strokeWidth="1" strokeLinejoin="round" />
          {/* Gloves (forearms in skin + glove tip) */}
          <ellipse cx="6" cy="32" rx="5" ry="4" fill="#ff9d2a" stroke="#000" strokeWidth="1" />
          <ellipse cx="74" cy="32" rx="5" ry="4" fill="#ff9d2a" stroke="#000" strokeWidth="1" />
        </>
      ) : (
        <>
          {/* One arm back, one forward */}
          <path d="M22 38 L14 50 L18 54 L26 44 Z" fill={`url(#jersey-${pose}-${color.replace('#','')})`} stroke="#000" strokeWidth="1" strokeLinejoin="round" />
          <path d="M58 38 L68 48 L64 52 L54 44 Z" fill={`url(#jersey-${pose}-${color.replace('#','')})`} stroke="#000" strokeWidth="1" strokeLinejoin="round" />
          {/* Hands */}
          <circle cx="16" cy="52" r="3" fill="url(#skin-grad)" stroke="#000" strokeWidth="0.8" />
          <circle cx="66" cy="50" r="3" fill="url(#skin-grad)" stroke="#000" strokeWidth="0.8" />
        </>
      )}

      {/* Shorts */}
      <path
        d="M28 72 L52 72 L54 88 L44 88 L42 78 L38 78 L36 88 L26 88 Z"
        fill="#0d0d0d"
        stroke="#000"
        strokeWidth="1"
      />
      {/* Shorts stripe */}
      <rect x="28" y="74" width="24" height="2" fill={color} opacity="0.8" />

      {/* Legs (socks) */}
      {isKeeper ? (
        <>
          <rect x="30" y="88" width="8" height="16" rx="2" fill={sock} stroke="#000" strokeWidth="1" />
          <rect x="42" y="88" width="8" height="16" rx="2" fill={sock} stroke="#000" strokeWidth="1" />
          {/* Sock band */}
          <rect x="30" y="100" width="8" height="2" fill={color} />
          <rect x="42" y="100" width="8" height="2" fill={color} />
          {/* Cleats */}
          <ellipse cx="34" cy="108" rx="6" ry="4" fill={cleat} stroke="#000" strokeWidth="1" />
          <ellipse cx="46" cy="108" rx="6" ry="4" fill={cleat} stroke="#000" strokeWidth="1" />
        </>
      ) : (
        <>
          {/* Planted leg */}
          <path d="M30 88 L32 104 L40 104 L40 88 Z" fill={sock} stroke="#000" strokeWidth="1" />
          {/* Kicking leg, swung forward */}
          <path d="M42 88 L58 96 L56 102 L40 96 Z" fill={sock} stroke="#000" strokeWidth="1" />
          {/* Sock bands */}
          <rect x="31" y="100" width="9" height="2" fill={color} />
          {/* Cleats */}
          <ellipse cx="35" cy="108" rx="7" ry="4" fill={cleat} stroke="#000" strokeWidth="1" />
          <ellipse cx="60" cy="100" rx="7" ry="4" fill={cleat} stroke="#000" strokeWidth="1" transform="rotate(20 60 100)" />
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