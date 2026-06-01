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

    const scored = shot !== playerKeeper;
    setLast({ shooter: "opponent", shot, keeper: playerKeeper, scored });
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

    const scored = playerShot !== keeper;
    setLast({ shooter: "player", shot: playerShot, keeper, scored });
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
          className="flex w-full items-stretch justify-between rounded-xl bg-black/40 p-3 text-white backdrop-blur-sm"
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
          className="text-center text-xl font-black italic tracking-tight text-white uppercase sm:text-2xl"
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
        {isOpp
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

  return (
    <div className="relative w-full max-w-md">
      {/* Goal frame */}
      <div
        className="relative w-full overflow-hidden rounded-lg bg-white/5"
        style={{
          aspectRatio: "16 / 10",
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
          <PlayerFigure color={keeperColor} pose="keeper" size={46} />
        </div>

        {/* Ball */}
        {ballPos && (
          <div
            key={`ball-${tick}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl"
            style={{
              left: ballPos.left,
              top: ballPos.top,
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
        <PlayerFigure color={strikerColor} pose="striker" size={44} />
        <span className="text-[10px] tracking-[0.25em] text-white/70 uppercase">
          {activeShooter === "player" ? "Бьёшь ты" : "Бьёт соперник"}
        </span>
        <div className="h-10 w-10" />
      </div>

      <style>{`
        @keyframes ballFly {
          0% { transform: translate(-50%, 80px) scale(0.4); opacity: 0.4; }
          60% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}