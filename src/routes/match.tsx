import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";

const searchSchema = z.object({ team: z.string().default("Команда") });

export const Route = createFileRoute("/match")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Пенальти — Серия пенальти" },
      { name: "description", content: "Серия пенальти: угадайте удар соперника." },
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

type Side = "left" | "center" | "right";
const SIDES: { id: Side; label: string }[] = [
  { id: "left", label: "Лево" },
  { id: "center", label: "Центр" },
  { id: "right", label: "Право" },
];
const TOTAL_ROUNDS = 5;

type Phase = "opponent" | "player" | "result" | "over";

function randomSide(): Side {
  const arr: Side[] = ["left", "center", "right"];
  return arr[Math.floor(Math.random() * 3)];
}

function MatchPage() {
  const { team } = Route.useSearch();

  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("opponent");
  const [playerScore, setPlayerScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [last, setLast] = useState<{
    shooter: "opponent" | "player";
    shot: Side;
    pick: Side;
    scored: boolean;
  } | null>(null);

  const phaseLabel = useMemo(() => {
    if (phase === "opponent") return "Бьёт соперник — угадай направление";
    if (phase === "player") return `Бьёт ${team} — выбери направление удара`;
    if (phase === "result") return "Результат раунда";
    return "Матч окончен";
  }, [phase, team]);

  function handleOpponentGuess(pick: Side) {
    const shot = randomSide();
    const saved = pick === shot;
    const scored = !saved;
    if (scored) setOppScore((s) => s + 1);
    else setOppScore((s) => s - 1);
    setLast({ shooter: "opponent", shot, pick, scored });
    setPhase("result");
  }

  function handlePlayerShot(pick: Side) {
    const dive = randomSide();
    const scored = pick !== dive;
    if (scored) setPlayerScore((s) => s + 1);
    else setPlayerScore((s) => s - 1);
    setLast({ shooter: "player", shot: pick, pick: dive, scored });
    setPhase("result");
  }

  function next() {
    if (!last) return;
    if (last.shooter === "opponent") {
      setPhase("player");
      return;
    }
    if (round >= TOTAL_ROUNDS) {
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
  }

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden px-6 py-8"
      style={{ backgroundColor: "#0d5c2a", fontFamily: "'Kanit', sans-serif" }}
    >
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6">
        {/* Scoreboard */}
        <div
          className="flex w-full items-stretch justify-between rounded-xl bg-black/40 p-4 text-white backdrop-blur-sm"
          style={{ border: "2px solid #ccff00" }}
        >
          <div className="flex flex-1 flex-col items-center">
            <span className="text-[10px] tracking-[0.2em] text-white/60 uppercase">
              Ты
            </span>
            <span className="text-sm font-black tracking-wider uppercase">
              {team}
            </span>
            <span className="mt-1 text-3xl font-black" style={{ color: "#ccff00" }}>
              {playerScore}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center px-2 text-white/60">
            <span className="text-xs tracking-[0.2em] uppercase">Раунд</span>
            <span className="text-2xl font-black text-white">
              {Math.min(round, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <span className="text-[10px] tracking-[0.2em] text-white/60 uppercase">
              Соперник
            </span>
            <span className="text-sm font-black tracking-wider uppercase">
              Враги
            </span>
            <span className="mt-1 text-3xl font-black" style={{ color: "#ccff00" }}>
              {oppScore}
            </span>
          </div>
        </div>

        {/* Phase title */}
        <h2
          className="text-center text-2xl font-black italic tracking-tight text-white uppercase sm:text-3xl"
          style={{ textShadow: "0 3px 0 rgba(0,0,0,0.3)" }}
        >
          {phaseLabel}
        </h2>

        {/* Goal */}
        <Goal phase={phase} last={last} />

        {/* Controls */}
        {(phase === "opponent" || phase === "player") && (
          <div className="grid w-full grid-cols-3 gap-3">
            {SIDES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  phase === "opponent"
                    ? handleOpponentGuess(s.id)
                    : handlePlayerShot(s.id)
                }
                className="rounded-xl px-4 py-5 text-lg font-black tracking-widest text-black uppercase transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "#ccff00",
                  boxShadow: "0 6px 0 rgb(132,163,0)",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {phase === "result" && last && (
          <div className="flex flex-col items-center gap-4">
            <p
              className="text-center text-xl font-black uppercase"
              style={{
                color: last.scored ? "#ff4d4d" : "#ccff00",
              }}
            >
              {last.shooter === "opponent"
                ? last.scored
                  ? "Соперник забил! +1 сопернику"
                  : "Отбил! −1 сопернику"
                : last.scored
                  ? "Гол! +1 тебе"
                  : "Мимо / отбито! −1 тебе"}
            </p>
            <p className="text-xs tracking-[0.2em] text-white/70 uppercase">
              {last.shooter === "opponent"
                ? `Удар: ${labelOf(last.shot)} · Твой выбор: ${labelOf(last.pick)}`
                : `Твой удар: ${labelOf(last.shot)} · Вратарь: ${labelOf(last.pick)}`}
            </p>
            <button
              type="button"
              onClick={next}
              className="rounded-xl px-10 py-4 text-lg font-black tracking-widest text-black uppercase transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "#ccff00",
                boxShadow: "0 8px 0 rgb(132,163,0)",
              }}
            >
              Дальше →
            </button>
          </div>
        )}

        {phase === "over" && (
          <div className="flex flex-col items-center gap-4">
            <p
              className="text-center text-3xl font-black italic uppercase"
              style={{
                color: playerScore > oppScore ? "#ccff00" : "#ff4d4d",
                textShadow: "0 3px 0 rgba(0,0,0,0.3)",
              }}
            >
              {playerScore > oppScore
                ? "Победа!"
                : playerScore < oppScore
                  ? "Поражение"
                  : "Ничья"}
            </p>
            <p className="text-sm tracking-widest text-white/80 uppercase">
              {team} {playerScore} : {oppScore} Враги
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={reset}
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
        )}

        <Link
          to="/teams"
          className="mt-2 text-xs font-bold tracking-[0.2em] text-white/60 uppercase transition-colors hover:text-white"
        >
          ← Сменить команду
        </Link>
      </div>
    </main>
  );
}

function labelOf(s: Side) {
  return s === "left" ? "Лево" : s === "center" ? "Центр" : "Право";
}

function Goal({
  phase,
  last,
}: {
  phase: Phase;
  last: { shooter: "opponent" | "player"; shot: Side; pick: Side; scored: boolean } | null;
}) {
  const showBall = phase === "result" && last;
  const ballSide = last?.shot;
  const keeperSide = last
    ? last.shooter === "opponent"
      ? last.pick
      : last.pick
    : null;

  return (
    <div
      className="relative w-full max-w-md rounded-lg bg-white/5"
      style={{
        aspectRatio: "16 / 9",
        border: "3px solid white",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 28px), repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 28px)",
      }}
    >
      {/* Keeper */}
      {keeperSide && (
        <div
          className="absolute bottom-2 h-12 w-10 rounded-md bg-yellow-300 transition-all duration-500"
          style={{
            left:
              keeperSide === "left"
                ? "12%"
                : keeperSide === "center"
                  ? "calc(50% - 20px)"
                  : "calc(88% - 40px)",
            boxShadow: "0 4px 0 rgba(0,0,0,0.4)",
          }}
        />
      )}
      {/* Ball */}
      {showBall && ballSide && (
        <div
          className="absolute h-6 w-6 rounded-full bg-white transition-all duration-500"
          style={{
            top: "30%",
            left:
              ballSide === "left"
                ? "18%"
                : ballSide === "center"
                  ? "calc(50% - 12px)"
                  : "calc(82% - 24px)",
            boxShadow: "0 3px 0 rgba(0,0,0,0.4)",
          }}
        />
      )}
    </div>
  );
}