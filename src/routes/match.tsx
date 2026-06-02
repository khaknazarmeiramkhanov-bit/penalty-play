import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { TEAMS } from "./teams";
import { useInventory, getItem, resolveColor, getSponsor, type Sponsor } from "@/lib/shop";

const searchSchema = z.object({ team: z.string().default("Команда") });

const OPPONENT_FALLBACK_COLOR = "#dc2626";

function pickOpponent(playerTeam: string): string {
  const pool = TEAMS.filter((t) => t.name !== playerTeam);
  return pool[Math.floor(Math.random() * pool.length)].name;
}

function teamColor(name: string): string {
  return TEAMS.find((t) => t.name === name)?.color ?? "#ccff00";
}

type GloveStyle = "classic" | "striped" | "tech" | "carbon";

// Per-team glove identity: color, accent, decoration style.
// Each team gets a recognizable glove look tied to their brand color.
function teamGlove(name: string): { color: string; accent: string; style: GloveStyle } {
  const tc = teamColor(name);
  switch (name) {
    case "Снежные барсы":
      return { color: tc, accent: "#e2e8f0", style: "tech" };
    case "Молнии":
      return { color: "#1a1a1a", accent: tc, style: "tech" };
    case "Орлы":
      return { color: tc, accent: "#fde68a", style: "tech" };
    case "Драконы":
      return { color: tc, accent: "#fde047", style: "striped" };
    case "Тигры":
      return { color: tc, accent: "#0a0a0a", style: "striped" };
    case "Львы":
      return { color: tc, accent: "#7c2d12", style: "striped" };
    case "Кобры":
      return { color: tc, accent: "#ecfccb", style: "striped" };
    case "Короли":
      return { color: tc, accent: "#1a1208", style: "classic" };
    case "Волки":
      return { color: "#1a1a1a", accent: tc, style: "carbon" };
    case "Быки":
      return { color: tc, accent: "#fde68a", style: "classic" };
    case "Лисы":
      return { color: tc, accent: "#fdba74", style: "striped" };
    case "Медведи":
      return { color: tc, accent: "#d6c0a8", style: "classic" };
    case "Кондоры":
      return { color: tc, accent: "#e0f2fe", style: "tech" };
    case "Олени":
      return { color: tc, accent: "#bfdbfe", style: "classic" };
    case "Игуаны":
      return { color: tc, accent: "#a7f3d0", style: "striped" };
    case "Совы":
      return { color: tc, accent: "#e5e7eb", style: "tech" };
    case "Крокодилы":
      return { color: tc, accent: "#a7f3d0", style: "striped" };
    case "Слоны":
      return { color: tc, accent: "#d1d5db", style: "classic" };
    case "Носороги":
      return { color: tc, accent: "#fecaca", style: "carbon" };
    case "Бабочки":
      return { color: tc, accent: "#c7d2fe", style: "tech" };
    case "Гориллы":
      return { color: tc, accent: "#fafafa", style: "carbon" };
    case "Гепарды":
      return { color: tc, accent: "#1a1a1a", style: "striped" };
    case "Фениксы":
      return { color: tc, accent: "#fde68a", style: "tech" };
    case "Кракены":
      return { color: tc, accent: "#cffafe", style: "tech" };
    case "Викинги":
      return { color: tc, accent: "#1a1208", style: "carbon" };
    case "Призраки":
      return { color: "#1a1a1a", accent: tc, style: "tech" };
    case "Черепахи":
      return { color: tc, accent: "#bbf7d0", style: "classic" };
    case "Зебры":
      return { color: "#1a1a1a", accent: "#fafafa", style: "striped" };
    case "Соколы":
      return { color: tc, accent: "#fde68a", style: "tech" };
    case "Скорпионы":
      return { color: tc, accent: "#1a1a1a", style: "carbon" };
    case "Барсуки":
      return { color: tc, accent: "#fafafa", style: "striped" };
    default:
      return { color: "#ff7a1a", accent: "#ffb066", style: "classic" };
  }
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
  { id: "TL", label: "левый верх", col: 0, row: 0 },
  { id: "TC", label: "центр верх", col: 1, row: 0 },
  { id: "TR", label: "правый верх", col: 2, row: 0 },
  { id: "BL", label: "левый низ", col: 0, row: 1 },
  { id: "BC", label: "центр низ", col: 1, row: 1 },
  { id: "BR", label: "правый низ", col: 2, row: 1 },
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
  const inv = useInventory();
  const playerSponsor = getSponsor(inv.sponsor);
  const tColor = teamColor(team);
  // Opponent: random team (different from player). Stable for the match;
  // reset() picks a new one.
  const [oppTeam, setOppTeam] = useState<string>(() => pickOpponent(team));
  const oppMeta = teamAbility(oppTeam);
  const oppColor = teamColor(oppTeam) || OPPONENT_FALLBACK_COLOR;
  const oppEmoji = TEAMS.find((t) => t.name === oppTeam)?.emoji ?? "🤖";
  const equippedGlove = getItem(inv.equipped.glove);
  const equippedBoot = getItem(inv.equipped.boot);
  const equippedBand = getItem(inv.equipped.wristband);
  const equippedSock = getItem(inv.equipped.sock);
  const tGlove = teamGlove(team);
  const gear = {
    gloveColor: resolveColor(equippedGlove?.color ?? tGlove.color, tColor),
    gloveAccent: equippedGlove?.accent ?? tGlove.accent,
    gloveStyle: tGlove.style,
    bootColor: resolveColor(equippedBoot?.color ?? "#0a0a0a", tColor),
    bootAccent: resolveColor(equippedBoot?.accent ?? "#fff", tColor),
    bandColor: resolveColor(equippedBand?.color ?? "#fff", tColor),
    sockColor: resolveColor(equippedSock?.color ?? "#0c0c10", tColor),
    sockAccent: resolveColor(equippedSock?.accent ?? tColor, tColor),
  };
  const winRewarded = useRef(false);

  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("opponent");
  const [playerScore, setPlayerScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [last, setLast] = useState<Last | null>(null);
  const [animating, setAnimating] = useState(false);
  const [abilityFlash, setAbilityFlash] = useState<string | null>(null);
  const [resultLocked, setResultLocked] = useState(false);

  // History of player choices to drive smarter AI
  const playerGuessHistory = useRef<Zone[]>([]); // where player dives as keeper
  const playerShotHistory = useRef<Zone[]>([]); // where player shoots
  // Precomputed opponent shot for current opponent phase (for hint abilities)
  const pendingOppShot = useRef<Zone | null>(null);
  // One-time uses
  const kingCancelUsed = useRef(false);
  // Foxes: armed after opponent miss, consumed on next player shot (cunning feint)
  const foxFintArmed = useRef(false);
  // Iguanas: armed after a save, consumed on next player shot (sticky tongue)
  const iguanaArmed = useRef(false);
  // Reindeer: armed after your goal, next opp shot forced off-target (aurora frost)
  const reindeerFrostArmed = useRef(false);
  // Elephants: full history of opp shots for "memory" hint (from round 2)
  const oppShotHistory = useRef<Zone[]>([]);
  // Owls: per-opponent-phase flag — is the hint truthful or misleading
  const owlHintZone = useRef<Zone | null>(null);
  // ---- OPPONENT ability state (mirrors player abilities) ----
  const oppKingCancelUsed = useRef(false); // Короли у соперника отменяют наш гол
  const oppFoxFintArmed = useRef(false); // Лисы: после нашего промаха
  const oppIguanaArmed = useRef(false); // Игуаны: после сейва соперника
  const oppReindeerFrostArmed = useRef(false); // Олени: после гола соперника
  // Фениксы: после промаха мимо ворот следующий удар гарантированно в створ
  const phoenixRebornArmed = useRef(false);
  const oppPhoenixRebornArmed = useRef(false);
  // Викинги: после промаха игрока — следующий удар 60% обмануть вратаря
  // Кракены: раз за матч — повторный удар после сейва
  const krakenReboundUsed = useRef(false);
  const oppKrakenReboundUsed = useRef(false);
  // Викинги: первый гол в матче приносит +2
  const vikingsDoubleUsed = useRef(false);
  const oppVikingsDoubleUsed = useRef(false);
  // Призраки: соперник пугается и пробивает мимо в первом раунде
  const ghostFearUsed = useRef(false);
  const oppGhostFearUsed = useRef(false);
  // Черепахи: после гола соперника — следующий его удар мимо
  const turtleArmed = useRef(false);
  const oppTurtleArmed = useRef(false);

  // Precompute opponent's shot whenever opponent phase starts
  useEffect(() => {
    if (phase !== "opponent") return;
    const lionsDumb = team === "Львы" || team === "Носороги";
    const smart = !lionsDumb && Math.random() < 0.7;
    pendingOppShot.current = smart ? leastUsed(playerGuessHistory.current) : randomZone();
    if (team === "Совы") {
      // 70% правдивая, 30% случайная (возможно ложная)
      owlHintZone.current = Math.random() < 0.7 ? pendingOppShot.current : randomZone();
    }
  }, [phase, team, round]);

  const oppHint = useMemo(() => {
    if (phase !== "opponent" || !pendingOppShot.current) return null;
    const z = pendingOppShot.current;
    const meta = ZONES.find((x) => x.id === z)!;
    if (team === "Орлы") return `Подсказка: соперник бьёт ${meta.row === 0 ? "ВВЕРХ" : "ВНИЗ"}`;
    if (team === "Молнии")
      return `Подсказка: соперник бьёт ${meta.col === 0 ? "ВЛЕВО" : meta.col === 1 ? "В ЦЕНТР" : "ВПРАВО"}`;
    if (team === "Совы" && owlHintZone.current) {
      const owlMeta = ZONES.find((x) => x.id === owlHintZone.current!)!;
      return `Подсказка: соперник бьёт ${owlMeta.label}`;
    }
    if (team === "Слоны" && oppShotHistory.current.length >= 1) {
      const fav = mostUsed(oppShotHistory.current);
      const favMeta = ZONES.find((x) => x.id === fav)!;
      return `Память слона: любимая зона соперника — ${favMeta.label}`;
    }
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
    oppShotHistory.current = [...oppShotHistory.current, shot];

    // ABILITIES affecting opponent shot:
    const wolves = team === "Волки"; // opp off-target chance up to 25%
    const tigers = team === "Тигры"; // 20% auto-save
    const crocodiles = team === "Крокодилы"; // auto-save on bottom row
    const bears = team === "Медведи"; // auto-save on center column (TC/BC)
    const butterflies = team === "Бабочки"; // 15% invert outcome
    const shotMeta = ZONES.find((z) => z.id === shot)!;
    const frostForceOff = reindeerFrostArmed.current; // Олени: после твоего гола
    // ---- OPPONENT shooter abilities ----
    const oppDragons = oppTeam === "Драконы";
    const oppCondors = oppTeam === "Кондоры" && shotMeta.row === 0;
    const oppCondorHit = oppCondors && Math.random() < 0.4;
    const oppFoxHit = oppFoxFintArmed.current && Math.random() < 0.5;
    const oppIguanaHit = oppIguanaArmed.current && Math.random() < 0.5;
    const oppGorillaHit = oppTeam === "Гориллы" && shotMeta.row === 1 && Math.random() < 0.3;
    const oppCheetahHit = oppTeam === "Гепарды" && Math.random() < 0.3;
    // Зебры (у соперника): каждый 3-й удар — гарантия
    const oppZebraHit =
      oppTeam === "Зебры" && (oppShotHistory.current.length % 3 === 0);
    // Соколы (у соперника): по углам +30%
    const oppFalconHit =
      oppTeam === "Соколы" && shotMeta.col !== 1 && Math.random() < 0.3;
    const oppKeeperBypass =
      oppCondorHit || oppFoxHit || oppIguanaHit || oppGorillaHit || oppCheetahHit ||
      oppZebraHit || oppFalconHit;
    const offChance = wolves ? 0.25 : 0.1;
    const frostHit = frostForceOff && Math.random() < 0.4;
    const oppPhoenixSafe = oppTeam === "Фениксы" && oppPhoenixRebornArmed.current;
    // Призраки (у игрока): первый удар соперника в матче — мимо
    const ghostFearForce =
      team === "Призраки" && !ghostFearUsed.current;
    // Черепахи (у игрока): после гола соперника — следующий удар мимо
    const turtleForce = team === "Черепахи" && turtleArmed.current;
    const offTarget =
      ghostFearForce || turtleForce
        ? true
        : oppDragons || oppPhoenixSafe
          ? false
          : frostHit || Math.random() < offChance;
    // Скорпионы (у соперника): мимо → 35% закрутка в створ
    let oppScorpionRecover = false;
    let oppOffTargetFinal = offTarget;
    if (
      oppOffTargetFinal &&
      oppTeam === "Скорпионы" &&
      !ghostFearForce &&
      !turtleForce &&
      Math.random() < 0.35
    ) {
      oppOffTargetFinal = false;
      oppScorpionRecover = true;
    }
    const crocSave = crocodiles && shotMeta.row === 1 && Math.random() < 0.5;
    const bearSave = bears && shotMeta.col === 1 && Math.random() < 0.5;
    const perkSaveChance = (inv.perks.saveBoost ?? 0) * 0.05;
    const perkSave = perkSaveChance > 0 && Math.random() < perkSaveChance;
    // Барсуки (у игрока): +15% автосейв
    const badgerSave = team === "Барсуки" && Math.random() < 0.15;
    const autoSave =
      !oppKeeperBypass && ((tigers && Math.random() < 0.2) || crocSave || bearSave || perkSave || badgerSave);
    // Если соперник пробил вратаря (Кондоры/Лисы/Игуаны) — вратарь точно мимо
    const effectiveKeeper: Zone = autoSave
      ? shot
      : oppKeeperBypass
        ? ALL_ZONES.filter((z) => z !== shot)[Math.floor(Math.random() * 5)]
        : playerKeeper;
    let scored = !oppOffTargetFinal && shot !== effectiveKeeper;
    let butterflyFlip = false;
    const oppButterflyFlip = oppTeam === "Бабочки" && Math.random() < 0.15;
    if (butterflies && Math.random() < 0.15) {
      butterflyFlip = true;
      scored = !scored;
    } else if (oppButterflyFlip) {
      scored = !scored;
    }
    // Соперник-Снежные барсы / Носороги: пробивают сквозь нашего вратаря
    if (
      !scored &&
      !oppOffTargetFinal &&
      ((oppTeam === "Снежные барсы" && Math.random() < 0.2) ||
        (oppTeam === "Носороги" && Math.random() < 0.2))
    ) {
      scored = true;
      setAbilityFlash(
        oppTeam === "Снежные барсы"
          ? `${oppEmoji} ${oppTeam}: гол сквозь вратаря`
          : `${oppEmoji} ${oppTeam}: таран!`,
      );
    }

    // Корона: cancel first opponent goal
    if (scored && team === "Короли" && !kingCancelUsed.current) {
      kingCancelUsed.current = true;
      scored = false;
      setAbilityFlash("👑 Корона! Гол отменён");
    } else if (frostHit) {
      setAbilityFlash("🦌 Северное сияние! Соперник замёрз и бьёт мимо");
    } else if (ghostFearForce) {
      setAbilityFlash("👻 Страх! Соперник испугался и бьёт мимо");
    } else if (turtleForce) {
      setAbilityFlash("🐢 Панцирь! Соперник промахнулся после гола");
    } else if (oppScorpionRecover) {
      setAbilityFlash(`${oppEmoji} ${oppTeam}: жало — мяч закрутился в створ`);
    } else if (butterflyFlip) {
      setAbilityFlash("🦋 Эффект бабочки! Исход перевёрнут");
    } else if (oppButterflyFlip) {
      setAbilityFlash(`${oppEmoji} ${oppTeam}: эффект бабочки`);
    } else if (oppKeeperBypass && scored) {
      setAbilityFlash(
        oppCondorHit
          ? `${oppEmoji} ${oppTeam}: пике сверху`
          : oppFoxHit
            ? `${oppEmoji} ${oppTeam}: хитрый финт`
            : oppIguanaHit
              ? `${oppEmoji} ${oppTeam}: липкий язык`
              : oppGorillaHit
                ? `${oppEmoji} ${oppTeam}: силовой удар!`
                : oppCheetahHit
                  ? `${oppEmoji} ${oppTeam}: скорость!`
                  : oppZebraHit
                    ? `${oppEmoji} ${oppTeam}: стадо — гарантия!`
                    : oppFalconHit
                      ? `${oppEmoji} ${oppTeam}: точность сокола`
                      : "",
      );
    } else if (autoSave) {
      setAbilityFlash(
        crocSave
          ? "🐊 Засада! Хватаешь снизу"
          : bearSave
            ? "🐻 Медвежья хватка! Ловишь в центре"
            : tigers
              ? "🐯 Прыжок тигра! Автосейв"
              : badgerSave
                ? "🦡 Цепкая лапа! Автосейв"
                : "🧤 Реакция вратаря! Автосейв",
      );
    } else {
      setAbilityFlash(null);
    }
    if (frostForceOff) reindeerFrostArmed.current = false;
    if (oppFoxFintArmed.current) oppFoxFintArmed.current = false;
    if (oppIguanaArmed.current) oppIguanaArmed.current = false;
    if (oppPhoenixSafe) oppPhoenixRebornArmed.current = false;
    if (oppOffTargetFinal && oppTeam === "Фениксы") oppPhoenixRebornArmed.current = true;
    if (ghostFearForce) ghostFearUsed.current = true;
    if (turtleForce) turtleArmed.current = false;

    setLast({ shooter: "opponent", shot, keeper: effectiveKeeper, scored, offTarget: oppOffTargetFinal });
    setPhase("result");
    setResultLocked(true);
    window.setTimeout(() => setResultLocked(false), 4000);
    if (scored) {
      // Опп-Викинги: первый гол приносит +2
      const oppVikingDouble =
        oppTeam === "Викинги" && !oppVikingsDoubleUsed.current;
      if (oppVikingDouble) oppVikingsDoubleUsed.current = true;
      setOppScore((s) => s + (oppVikingDouble ? 2 : 1));
      if (oppVikingDouble) setAbilityFlash(`${oppEmoji} ${oppTeam}: двойной гол!`);
      // Опп-Олени: после своего гола замораживают наш следующий удар
      if (oppTeam === "Олени") oppReindeerFrostArmed.current = true;
      // Черепахи (у игрока): после гола соперника взводим панцирь
      if (team === "Черепахи") turtleArmed.current = true;
    }
    if (!scored) {
      inv.addCoins(15 + (inv.perks.coinBoost ?? 0) * 5); // save reward + perk
      // Игуаны: после сейва — следующий удар гарантированный гол
      if (team === "Игуаны") iguanaArmed.current = true;
    }
    // Лисы: после промаха соперника (offTarget) — следующий твой удар обманет вратаря
    if (team === "Лисы" && offTarget) foxFintArmed.current = true;
    pendingOppShot.current = null;
    window.setTimeout(() => setAnimating(false), 700);
  }

  function handlePlayerShot(playerShot: Zone) {
    if (animating) return;
    setAnimating(true);
    // ABILITIES affecting player shot:
    const bulls = team === "Быки"; // weaker keeper guess
    const cobras = team === "Кобры"; // 20% keeper jumps wrong
    const dragons = team === "Драконы"; // never off-target
    const snowLeopards = team === "Снежные барсы"; // 20% score-through
    const rhinos = team === "Носороги"; // 30% таран сквозь вратаря
    const condors = team === "Кондоры"; // top-row = guaranteed goal
    const foxFint = team === "Лисы" && foxFintArmed.current;
    const iguanaShot = team === "Игуаны" && iguanaArmed.current;
    const butterflies = team === "Бабочки"; // 15% invert
    const gorillas = team === "Гориллы"; // нижний ряд — 30% бить сквозь вратаря
    const cheetahs = team === "Гепарды"; // 30% вратарь не успевает
    const phoenixes = team === "Фениксы"; // после промаха — следующий точно в створ
    // Призраки (у соперника): первый твой удар в матче — мимо
    const oppGhostFearForce =
      oppTeam === "Призраки" && !oppGhostFearUsed.current;
    // Черепахи (у соперника): после нашего гола — наш следующий удар мимо
    const oppTurtleForce = oppTeam === "Черепахи" && oppTurtleArmed.current;

    // ---- OPPONENT keeper abilities (соперник защищает ворота) ----
    const oppTigers = oppTeam === "Тигры";
    const oppBears = oppTeam === "Медведи";
    const oppCrocs = oppTeam === "Крокодилы";
    const oppWolves = oppTeam === "Волки";
    const oppButterflies = oppTeam === "Бабочки";
    const oppBadgers = oppTeam === "Барсуки";
    const oppFrostHit = oppReindeerFrostArmed.current && Math.random() < 0.4;

    const smartChance = bulls ? 0.3 : 0.7;
    const smart = Math.random() < smartChance;
    let keeper: Zone = smart ? mostUsed(playerShotHistory.current) : randomZone();
    if (cobras && Math.random() < 0.2) {
      const others = ALL_ZONES.filter((z) => z !== playerShot);
      keeper = others[Math.floor(Math.random() * others.length)];
    }
    const shotMeta = ZONES.find((z) => z.id === playerShot)!;
    // Кондоры: верхний ряд — 40% обмануть вратаря
    const condorHit = condors && shotMeta.row === 0 && Math.random() < 0.4;
    // Игуаны: после сейва — 50% обмануть вратаря
    const iguanaHit = iguanaShot && Math.random() < 0.5;
    // Лисы: после промаха соперника — 50% обмануть вратаря
    const foxHit = foxFint && Math.random() < 0.5;
    // Гориллы: силовой удар низом
    const gorillaHit = gorillas && shotMeta.row === 1 && Math.random() < 0.3;
    // Гепарды: вратарь не успевает
    const cheetahHit = cheetahs && Math.random() < 0.3;
    // Зебры: каждый 3-й удар — гарантированный гол
    const zebraHit =
      team === "Зебры" && (playerShotHistory.current.length % 3 === 0);
    // Соколы: боковые углы — +30% обмануть вратаря
    const falconHit =
      team === "Соколы" && shotMeta.col !== 1 && Math.random() < 0.3;
    // Перк "Удар по углам" — общий шанс что вратарь прыгнет не туда
    const perkGoalChance = (inv.perks.goalBoost ?? 0) * 0.05;
    const perkGoalHit = perkGoalChance > 0 && Math.random() < perkGoalChance;
    if (condorHit || iguanaHit || foxHit || perkGoalHit || gorillaHit || cheetahHit || zebraHit || falconHit) {
      const others = ALL_ZONES.filter((z) => z !== playerShot);
      keeper = others[Math.floor(Math.random() * others.length)];
    }
    // Opp keeper auto-saves
    const oppCrocSave = oppCrocs && shotMeta.row === 1 && Math.random() < 0.5;
    const oppBearSave = oppBears && shotMeta.col === 1 && Math.random() < 0.5;
    const oppTigerSave = oppTigers && Math.random() < 0.2;
    const oppBadgerSave = oppBadgers && Math.random() < 0.15;
    const oppAutoSave =
      !(condorHit || iguanaHit || foxHit || perkGoalHit || gorillaHit || cheetahHit || zebraHit || falconHit) &&
      (oppCrocSave || oppBearSave || oppTigerSave || oppBadgerSave);
    if (oppAutoSave) keeper = playerShot; // принудительный сейв
    playerShotHistory.current = [...playerShotHistory.current, playerShot];

    const baseOff = Math.max(0, 0.1 - (inv.perks.accuracy ?? 0) * 0.02);
    const wolvesOff = oppWolves && Math.random() < 0.25;
    const phoenixSafe = phoenixes && phoenixRebornArmed.current;
    let offTarget =
      oppGhostFearForce || oppTurtleForce
        ? true
        : dragons ||
      condorHit ||
      iguanaHit ||
      foxHit ||
      perkGoalHit ||
      gorillaHit ||
      cheetahHit ||
      zebraHit ||
      falconHit ||
      phoenixSafe
        ? false
        : oppFrostHit || wolvesOff || Math.random() < baseOff;
    // 🦂 Скорпионы: мимо → 35% закрутка обратно в створ
    let scorpionRecover = false;
    if (
      team === "Скорпионы" &&
      offTarget &&
      !oppGhostFearForce &&
      !oppTurtleForce &&
      Math.random() < 0.35
    ) {
      offTarget = false;
      scorpionRecover = true;
    }
    let scored = !offTarget && playerShot !== keeper;
    // 🐙 Кракены: раз за матч — повторный удар после сейва
    let krakenReboundFlash = false;
    if (
      team === "Кракены" &&
      !krakenReboundUsed.current &&
      !offTarget &&
      !scored
    ) {
      krakenReboundUsed.current = true;
      const others = ALL_ZONES.filter((z) => z !== playerShot);
      keeper = others[Math.floor(Math.random() * others.length)];
      scored = playerShot !== keeper;
      krakenReboundFlash = true;
    }
    if (
      !scored &&
      !offTarget &&
      ((snowLeopards && Math.random() < 0.2) || (rhinos && Math.random() < 0.2))
    ) {
      scored = true;
      setAbilityFlash(
        snowLeopards ? "🐆 Горный хищник! Гол сквозь вратаря" : "🦏 Таран! Пробил вратаря",
      );
    } else if (foxHit && scored) {
      setAbilityFlash("🦊 Хитрый финт! Вратарь обманут");
    } else if (iguanaHit && scored) {
      setAbilityFlash("🦎 Липкий язык! Вратарь обманут");
    } else if (condorHit && scored) {
      setAbilityFlash("🦅 Пике сверху! Верх — твой");
    } else if (gorillaHit && scored) {
      setAbilityFlash("🦍 Сила! Пробил вратаря низом");
    } else if (cheetahHit && scored) {
      setAbilityFlash("🐅 Скорость! Вратарь не успел");
    } else if (zebraHit && scored) {
      setAbilityFlash("🦓 Стадо! Гарантированный гол");
    } else if (falconHit && scored) {
      setAbilityFlash("🦅 Точность сокола! В угол");
    } else if (scorpionRecover) {
      setAbilityFlash(
        scored ? "🦂 Жало! Закрутка — гол" : "🦂 Жало! Закрутка спасена вратарём",
      );
    } else if (krakenReboundFlash) {
      setAbilityFlash(scored ? "🐙 Второй шанс! Гол с добивания" : "🐙 Второй шанс... мимо");
    } else if (oppGhostFearForce) {
      setAbilityFlash(`${oppEmoji} ${oppTeam}: страх! Ты бьёшь мимо`);
    } else if (oppTurtleForce) {
      setAbilityFlash(`${oppEmoji} ${oppTeam}: панцирь — ты бьёшь мимо`);
    } else if (phoenixSafe && scored) {
      setAbilityFlash("🔥 Возрождение! В створ");
    } else if (cobras && keeper !== playerShot && scored) {
      setAbilityFlash("🐍 Гипноз сработал!");
    } else if (dragons && playerShot !== keeper) {
      setAbilityFlash("🐉 Огненный удар!");
    } else if (oppFrostHit) {
      setAbilityFlash(`${oppEmoji} ${oppTeam}: северное сияние — ты бьёшь мимо`);
    } else if (wolvesOff) {
      setAbilityFlash(`${oppEmoji} ${oppTeam}: стая отвлекла — мимо`);
    } else if (oppAutoSave) {
      setAbilityFlash(
        oppCrocSave
          ? `${oppEmoji} ${oppTeam}: засада снизу!`
          : oppBearSave
            ? `${oppEmoji} ${oppTeam}: медвежья хватка!`
            : oppTigerSave
              ? `${oppEmoji} ${oppTeam}: прыжок тигра!`
              : `${oppEmoji} ${oppTeam}: цепкая лапа!`,
      );
    } else {
      setAbilityFlash(null);
    }
    // Бабочки (наши/соперника): 15% инверсия
    if (butterflies && Math.random() < 0.15) {
      scored = !scored;
      setAbilityFlash("🦋 Эффект бабочки! Исход перевёрнут");
    } else if (oppButterflies && Math.random() < 0.15) {
      scored = !scored;
      setAbilityFlash(`${oppEmoji} ${oppTeam}: эффект бабочки`);
    }
    // Опп-Короли: отменяют наш первый гол
    if (scored && oppTeam === "Короли" && !oppKingCancelUsed.current) {
      oppKingCancelUsed.current = true;
      scored = false;
      setAbilityFlash(`${oppEmoji} ${oppTeam}: корона отменила гол`);
    }
    // Способность всегда тратится, попала она или нет
    if (iguanaShot) iguanaArmed.current = false;
    if (foxFint) foxFintArmed.current = false;
    if (phoenixSafe) phoenixRebornArmed.current = false;
    if (offTarget && phoenixes) phoenixRebornArmed.current = true;
    if (oppGhostFearForce) oppGhostFearUsed.current = true;
    if (oppTurtleForce) oppTurtleArmed.current = false;
    if (oppFrostHit) oppReindeerFrostArmed.current = false;
    if (offTarget && oppTeam === "Лисы") oppFoxFintArmed.current = true;
    if (!scored && !offTarget && oppTeam === "Игуаны") oppIguanaArmed.current = true;
    // Олени: после твоего гола взводим заморозку соперника
    if (scored && team === "Олени") reindeerFrostArmed.current = true;

    setLast({ shooter: "player", shot: playerShot, keeper, scored, offTarget });
    setPhase("result");
    setResultLocked(true);
    window.setTimeout(() => setResultLocked(false), 4000);
    if (scored) {
      // ⚔️ Викинги: первый гол приносит +2
      const vikingDouble = team === "Викинги" && !vikingsDoubleUsed.current;
      if (vikingDouble) {
        vikingsDoubleUsed.current = true;
        setAbilityFlash("⚔️ Двойной гол! +2 очка");
      }
      setPlayerScore((s) => s + (vikingDouble ? 2 : 1));
    }
    if (scored) inv.addCoins(20 + (inv.perks.coinBoost ?? 0) * 5); // goal reward + perk
    // Опп-Черепахи: после нашего гола взводим панцирь
    if (scored && oppTeam === "Черепахи") oppTurtleArmed.current = true;
    window.setTimeout(() => setAnimating(false), 700);
  }

  function next() {
    if (resultLocked) return;
    if (!last) return;
    // After opponent shot → player shoots in same round
    if (last.shooter === "opponent") {
      setPhase("player");
      return;
    }
    // Round completed
    const completed = round;
    const playerWinsOutright = completed >= MIN_ROUNDS && playerScore !== oppScore;
    const reachedSuddenTarget =
      completed >= MIN_ROUNDS &&
      (playerScore >= SUDDEN_TARGET || oppScore >= SUDDEN_TARGET) &&
      playerScore !== oppScore;

    if (playerWinsOutright || reachedSuddenTarget) {
      setPhase("over");
      inv.addMatch();
      if (!winRewarded.current && playerScore > oppScore) {
        winRewarded.current = true;
        inv.addCoins(100);
        // Кристаллы за победу: +1 за матч, +2 если соперник не забил (сухой матч)
        const crystals = oppScore === 0 ? 3 : 1;
        inv.addCrystals(crystals);
        inv.addWin();
      } else if (playerScore < oppScore) {
        inv.addLoss();
      }
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
    winRewarded.current = false;
    foxFintArmed.current = false;
    iguanaArmed.current = false;
    reindeerFrostArmed.current = false;
    oppShotHistory.current = [];
    owlHintZone.current = null;
    oppKingCancelUsed.current = false;
    oppFoxFintArmed.current = false;
    oppIguanaArmed.current = false;
    oppReindeerFrostArmed.current = false;
    phoenixRebornArmed.current = false;
    oppPhoenixRebornArmed.current = false;
    setOppTeam(pickOpponent(team));
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
          <ScorePane label="Соперник" name={`${oppEmoji} ${oppTeam}`} score={oppScore} />
        </div>

        {/* Coins + shop */}
        <div className="relative z-20 flex w-full items-center justify-between gap-3">
          <div
            className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 font-black text-white"
            style={{ border: "2px solid #ccff00" }}
          >
            <span className="text-base">🪙</span>
            <span className="text-sm">{inv.coins}</span>
          </div>
          <Link
            to="/shop"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-black tracking-[0.2em] text-white uppercase hover:bg-white/20"
          >
            Магазин →
          </Link>
        </div>

        {/* Phase title */}
        <h2
          className="relative z-20 text-center text-xl font-black italic tracking-tight text-white uppercase sm:text-2xl"
          style={{ textShadow: "0 3px 0 rgba(0,0,0,0.3)" }}
        >
          {phaseLabel}
        </h2>

        {/* Ability badge */}
        <div className="relative z-20 grid w-full grid-cols-2 gap-2">
          <div
            className="flex flex-col items-center gap-1 rounded-lg bg-black/40 px-2 py-2 text-center"
            style={{ border: `2px solid ${teamColor(team)}` }}
          >
            <span className="text-[9px] tracking-[0.2em] text-white/60 uppercase">Ты</span>
            <span className="text-xs font-black tracking-wider text-white uppercase">
              {ability}
            </span>
            <span className="text-[9px] font-medium text-white/70">{abilityDesc}</span>
          </div>
          <div
            className="flex flex-col items-center gap-1 rounded-lg bg-black/40 px-2 py-2 text-center"
            style={{ border: `2px solid ${oppColor}` }}
          >
            <span className="text-[9px] tracking-[0.2em] text-white/60 uppercase">
              {oppEmoji} Соперник
            </span>
            <span className="text-xs font-black tracking-wider text-white uppercase">
              {oppMeta.ability}
            </span>
            <span className="text-[9px] font-medium text-white/70">{oppMeta.abilityDesc}</span>
          </div>
        </div>
        {(oppHint || (abilityFlash && phase === "result")) && (
          <div className="relative z-20 flex w-full flex-col items-center gap-1 text-center">
            {oppHint && (
              <span
                className="rounded px-2 py-0.5 text-[11px] font-black uppercase text-black"
                style={{ backgroundColor: "#ccff00" }}
              >
                {oppHint}
              </span>
            )}
            {abilityFlash && phase === "result" && (
              <span
                className="rounded px-2 py-0.5 text-[11px] font-black uppercase text-black"
                style={{ backgroundColor: "#ccff00" }}
              >
                {abilityFlash}
              </span>
            )}
          </div>
        )}

        {/* Goal scene */}
        <GoalScene
          phase={phase}
          last={last}
          playerColor={teamColor(team)}
          oppColor={oppColor}
          gear={gear}
          sponsor={playerSponsor}
          onPickShot={
            !animating && phase === "player"
              ? (z) => handlePlayerShot(z)
              : !animating && phase === "opponent"
                ? (z) => handleOpponentShot(z)
                : undefined
          }
        />

        {phase === "result" && last && (
          <ResultBlock last={last} onNext={next} locked={resultLocked} />
        )}

        {phase === "over" && (
          <OverBlock team={team} playerScore={playerScore} oppScore={oppScore} onReset={reset} />
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

function ScorePane({ label, name, score }: { label: string; name: string; score: number }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className="text-[10px] tracking-[0.2em] text-white/60 uppercase">{label}</span>
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

function ResultBlock({
  last,
  onNext,
  locked,
}: {
  last: Last;
  onNext: () => void;
  locked?: boolean;
}) {
  const isOpp = last.shooter === "opponent";
  // Suspense phase: while striker winds up (~1.5s), hide result and show hype phrases
  const HYPE = ["Момент!", "И-и-и!", "Замах!", "Бум!"];
  const [suspense, setSuspense] = useState(true);
  const [hypeIdx, setHypeIdx] = useState(0);
  useEffect(() => {
    setSuspense(true);
    setHypeIdx(0);
    const rot = window.setInterval(() => setHypeIdx((i) => (i + 1) % HYPE.length), 375);
    const end = window.setTimeout(() => setSuspense(false), 1500);
    return () => {
      window.clearInterval(rot);
      window.clearTimeout(end);
    };
  }, [last]);

  if (suspense) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p
          key={hypeIdx}
          className="animate-fade-in text-center text-2xl font-black tracking-wider uppercase"
          style={{ color: "#ccff00", textShadow: "0 2px 0 rgba(0,0,0,0.4)" }}
        >
          {HYPE[hypeIdx]}
        </p>
        <p className="text-[10px] tracking-[0.25em] text-white/50 uppercase">
          Удар: {zoneLabel(last.shot)}
        </p>
      </div>
    );
  }
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
        disabled={locked}
        className="rounded-xl px-10 py-3 text-lg font-black tracking-widest text-black uppercase transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

function Crowd({ playerColor, oppColor }: { playerColor: string; oppColor: string }) {
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
        background: "linear-gradient(180deg, #0a0a0a 0%, #1f1f1f 60%, #2a2a2a 100%)",
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
            <line
              x1="3"
              y1="14"
              x2="1"
              y2="6"
              stroke={skin}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="13"
              y1="14"
              x2="15"
              y2="6"
              stroke={skin}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <line
              x1="3"
              y1="14"
              x2="2"
              y2="20"
              stroke={skin}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="13"
              y1="14"
              x2="14"
              y2="20"
              stroke={skin}
              strokeWidth="2"
              strokeLinecap="round"
            />
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

function GloveDecor({ style, accent }: { style: GloveStyle; accent: string }) {
  return GloveDecorInner({ style, accent });
}

function GloveBaseDetails() {
  // Realistic seams, stitches, knuckle creases, palm wrinkles and a soft
  // highlight. Drawn in glove-local coordinates so it sits under the
  // style-specific GloveDecor overlay.
  const stitch = "rgba(245,235,210,0.85)";
  const seamShadow = "rgba(0,0,0,0.55)";
  const crease = "rgba(0,0,0,0.35)";
  const highlight = "rgba(255,255,255,0.18)";
  // Finger seam helper: a dark seam + dashed stitch overlay along the finger's center.
  const fingerSeam = (x: number, y1: number, y2: number) => (
    <g key={`fs-${x}-${y1}`}>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={seamShadow} strokeWidth="0.35" />
      <line
        x1={x}
        y1={y1}
        x2={x}
        y2={y2}
        stroke={stitch}
        strokeWidth="0.25"
        strokeDasharray="0.7 0.6"
      />
    </g>
  );
  return (
    <>
      {/* Soft highlight on upper-left of palm for leather sheen */}
      <path d="M-9 -3 Q-9 -10 -2 -11 L4 -11 Q-2 -8 -5 -3 Z" fill={highlight} />
      {/* Palm perimeter stitch — runs just inside the palm outline */}
      <path
        d="M-8.5 -3 Q-9 -10.5 -1.5 -11 L7.5 -11 Q11 -11 11 -6.5 L11 7.5 Q11 12 5.5 12 L-3.5 12 Q-9 12 -9 6.5 Z"
        fill="none"
        stroke={stitch}
        strokeWidth="0.32"
        strokeDasharray="0.9 0.7"
      />
      {/* Thumb seam */}
      <path
        d="M-9.5 -2 Q-13 -9.5 -7.5 -13"
        fill="none"
        stroke={stitch}
        strokeWidth="0.3"
        strokeDasharray="0.8 0.6"
      />
      {/* Thumb crease */}
      <path d="M-7 -8 Q-5 -6 -4 -3" stroke={crease} strokeWidth="0.35" fill="none" />
      {/* Knuckle creases — short arcs where fingers meet palm */}
      <path d="M-4.5 -10 Q-3.3 -8.8 -2 -10" stroke={crease} strokeWidth="0.35" fill="none" />
      <path d="M-0.5 -10 Q0.7 -8.6 2 -10" stroke={crease} strokeWidth="0.35" fill="none" />
      <path d="M3.5 -10 Q4.7 -8.8 6 -10" stroke={crease} strokeWidth="0.35" fill="none" />
      <path d="M7.5 -10 Q8.5 -8.8 10 -10" stroke={crease} strokeWidth="0.35" fill="none" />
      {/* Palm wrinkles — curved creases across the palm */}
      <path d="M-7 -4 Q1 -2 10 -4" stroke={crease} strokeWidth="0.3" fill="none" opacity="0.7" />
      <path d="M-7 7 Q1 9 10 7" stroke={crease} strokeWidth="0.3" fill="none" opacity="0.7" />
      {/* Finger center seams with stitches */}
      {fingerSeam(-3.3, -22.5, -10.5)}
      {fingerSeam(0.7, -25.5, -10.5)}
      {fingerSeam(4.7, -23.5, -10.5)}
      {fingerSeam(8.7, -19.5, -10.5)}
      {/* Finger pad creases (knuckle joints on each finger) */}
      <line x1="-4.7" y1="-16" x2="-1.9" y2="-16" stroke={crease} strokeWidth="0.3" />
      <line x1="-0.7" y1="-19" x2="2.1" y2="-19" stroke={crease} strokeWidth="0.3" />
      <line x1="3.3" y1="-17" x2="6.1" y2="-17" stroke={crease} strokeWidth="0.3" />
      <line x1="7.3" y1="-14" x2="10.1" y2="-14" stroke={crease} strokeWidth="0.3" />
      {/* Cuff top stitch line (just above the dark cuff bar) */}
      <line
        x1="-9.5"
        y1="9.2"
        x2="10.5"
        y2="9.2"
        stroke={stitch}
        strokeWidth="0.3"
        strokeDasharray="0.9 0.7"
      />
      {/* Subtle leather grain dots scattered on palm */}
      {[
        [-6, 0],
        [-3, 6],
        [2, -5],
        [5, 3],
        [8, -2],
        [0, 0],
        [-5, -6],
        [7, 8],
      ].map(([cx, cy]) => (
        <circle key={`gr-${cx}-${cy}`} cx={cx} cy={cy} r="0.18" fill={crease} opacity="0.6" />
      ))}
    </>
  );
}

function GloveDecorInner({ style, accent }: { style: GloveStyle; accent: string }) {
  // Style-specific top-layer decorations. Realistic seams/textures are rendered
  // separately by <GloveBaseDetails /> beneath this layer.
  // Local glove coords: palm spans roughly x ∈ [-10, 12], y ∈ [-12, 13].
  switch (style) {
    case "striped":
      return (
        <>
          {/* Bold horizontal bands across palm — tiger-stripe feel */}
          <rect x="-9" y="-7" width="20" height="2" fill={accent} opacity="0.95" />
          <rect x="-9" y="-2" width="20" height="2" fill={accent} opacity="0.95" />
          <rect x="-9" y="3" width="20" height="2" fill={accent} opacity="0.95" />
          <rect x="-9" y="8" width="20" height="2" fill={accent} opacity="0.95" />
          {/* Fingertip caps */}
          <rect x="-5" y="-23" width="3.4" height="2.5" rx="1" fill={accent} />
          <rect x="-1" y="-26" width="3.4" height="2.5" rx="1" fill={accent} />
          <rect x="3" y="-24" width="3.4" height="2.5" rx="1" fill={accent} />
          <rect x="7" y="-20" width="3.4" height="2.5" rx="1" fill={accent} />
        </>
      );
    case "tech":
      return (
        <>
          {/* Diagonal slash + chevron — futuristic tech look */}
          <path d="M-9 8 L11 -6" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
          <path
            d="M-7 -5 L1 -9 L9 -5"
            stroke={accent}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="6" r="1.6" fill={accent} />
          {/* Knuckle dots */}
          <circle cx="-3" cy="-10" r="0.7" fill={accent} />
          <circle cx="1" cy="-11" r="0.7" fill={accent} />
          <circle cx="5" cy="-10" r="0.7" fill={accent} />
        </>
      );
    case "carbon":
      return (
        <>
          {/* Dense grid of dots — carbon/grip pattern */}
          {[-7, -3, 1, 5, 9].map((cx) =>
            [-6, -2, 2, 6, 10].map((cy) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.6" fill={accent} opacity="0.85" />
            )),
          )}
          {/* Single bold edge stripe */}
          <rect x="-9" y="11" width="20" height="1.2" fill={accent} opacity="0.95" />
        </>
      );
    case "classic":
    default:
      return (
        <>
          {/* Two clean brand stripes + grip dots */}
          <path d="M-8 0 L11 0" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
          <path
            d="M-7 4 Q2 5 10 4"
            stroke={accent}
            strokeWidth="1.1"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="-5" cy="2" r="0.7" fill="#0a0a0a" opacity="0.6" />
          <circle cx="-1" cy="2" r="0.7" fill="#0a0a0a" opacity="0.6" />
          <circle cx="3" cy="2" r="0.7" fill="#0a0a0a" opacity="0.6" />
          <circle cx="7" cy="2" r="0.7" fill="#0a0a0a" opacity="0.6" />
        </>
      );
  }
}

function PlayerFigure({
  color,
  pose,
  size = 44,
  emotion = "neutral",
  kicking = false,
  gear = DEFAULT_GEAR,
  sponsor,
}: {
  color: string;
  pose: "striker" | "keeper";
  size?: number;
  emotion?: "neutral" | "happy" | "sad";
  kicking?: boolean;
  gear?: Gear;
  sponsor?: Sponsor;
}) {
  const isKeeper = pose === "keeper";
  // Deterministic hairstyle + hair color + skin tone from team color string
  const hashStr = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };
  // Skin tones — light to deep, includes african-american tones
  const SKIN_TONES: Array<[string, string]> = [
    ["#f1c79a", "#b9805c"],
    ["#e8b894", "#a36a48"],
    ["#c98e62", "#7a4a2c"],
    ["#a06a40", "#5a3416"],
    ["#6b3f22", "#3a1f0e"],
    ["#4a2812", "#26110a"],
  ];
  const HAIR_COLORS = ["#1a1208", "#3a1f0a", "#6b3410", "#c98a3a", "#0a0a0a", "#5a3a2a"];
  const HAIR_STYLES = ["short", "bald", "sidepart", "mohawk", "slickback", "buzz"] as const;
  const styleSeed = hashStr(color);
  const hairStyle = HAIR_STYLES[styleSeed % HAIR_STYLES.length];
  const hair = HAIR_COLORS[(styleSeed >> 3) % HAIR_COLORS.length];
  const [skin, skinShade] = SKIN_TONES[(styleSeed >> 5) % SKIN_TONES.length];
  const sockDark = gear.sockColor;
  const sockAccent = gear.sockAccent;
  const cleat = gear.bootColor;
  const cleatAccent = gear.bootAccent;
  const bandColor = gear.bandColor;
  const accent = "#ffffff";
  const safeId = color.replace(/[^a-zA-Z0-9]/g, "");
  const jerseyId = `jersey-${pose}-${safeId}`;
  const skinId = `skin-${pose}-${safeId}`;
  const gloveGradId = `glove-grad-${pose}-${safeId}`;
  const rainbowId = `rainbow-${pose}-${safeId}`;
  const usesRainbowBand = bandColor.includes("rainbowGrad");
  const resolvedBand = usesRainbowBand ? `url(#${rainbowId})` : bandColor;
  const browTilt = emotion === "sad" ? -10 : emotion === "happy" ? 8 : 0;

  return (
    <svg
      width={size}
      height={(size * 130) / 90}
      viewBox="0 0 90 130"
      overflow="visible"
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
        <linearGradient id={gloveGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={gear.gloveColor} />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={rainbowId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="0.25" stopColor="#facc15" />
          <stop offset="0.5" stopColor="#22c55e" />
          <stop offset="0.75" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="45" cy="126" rx="24" ry="3" fill="rgba(0,0,0,0.35)" />

      {/* === HEAD === */}
      {/* Hair back layer (varies by style) */}
      {hairStyle === "sidepart" && (
        <path d="M33 18 Q33 7 45 7 Q57 7 57 18 L57 24 L33 24 Z" fill={hair} />
      )}
      {hairStyle === "slickback" && (
        <path d="M32 18 Q32 5 45 5 Q58 5 58 18 L60 24 L58 28 L32 28 L30 24 Z" fill={hair} />
      )}
      {hairStyle === "short" && (
        <path d="M32 18 Q32 7 45 7 Q58 7 58 18 L58 24 L32 24 Z" fill={hair} />
      )}
      {hairStyle === "mohawk" && (
        <path d="M42 4 Q45 0 48 4 L48 18 L42 18 Z" fill={hair} />
      )}
      {hairStyle === "buzz" && (
        <path d="M34 16 Q34 9 45 9 Q56 9 56 16 L56 20 L34 20 Z" fill={hair} opacity="0.9" />
      )}
      {/* bald: no hair layer; add a subtle highlight later */}
      {/* Face */}
      <path
        d="M34 18 Q34 11 45 11 Q56 11 56 18 L56 26 Q56 33 45 33 Q34 33 34 26 Z"
        fill={`url(#${skinId})`}
      />
      {/* Jaw shade */}
      <path d="M37 28 Q45 32 53 28 L53 30 Q45 33.5 37 30 Z" fill={skinShade} opacity="0.5" />
      {/* Hair fringe over forehead (style-dependent) */}
      {hairStyle === "short" && (
        <path d="M33 18 Q40 12 47 16 Q52 14 57 18 L56 21 Q50 18 46 20 Q40 17 34 22 Z" fill={hair} />
      )}
      {hairStyle === "slickback" && (
        <path d="M33 18 Q40 10 45 12 Q50 10 57 18 L56 22 Q50 18 45 20 Q40 18 34 22 Z" fill={hair} />
      )}
      {hairStyle === "sidepart" && (
        <path d="M34 18 Q40 14 45 16 Q50 14 56 18 L55 21 L45 19 Q40 17 35 22 Z" fill={hair} />
      )}
      {hairStyle === "buzz" && (
        <path d="M35 17 Q45 14 55 17 L55 19 Q45 17 35 19 Z" fill={hair} opacity="0.7" />
      )}
      {hairStyle === "bald" && (
        <ellipse cx="45" cy="14" rx="6" ry="2.2" fill="#ffffff" opacity="0.25" />
      )}
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
        <path
          d="M41 29 Q45 32 49 29"
          stroke="#1a1208"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      ) : emotion === "sad" ? (
        <path
          d="M41 30 Q45 28 49 30"
          stroke="#1a1208"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <line
          x1="42"
          y1="29.5"
          x2="48"
          y2="29.5"
          stroke="#1a1208"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
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
      {/* Sponsor badge */}
      {sponsor && sponsor.id !== "none" && (
        <g>
          <rect
            x="32"
            y="50"
            width="26"
            height="7"
            rx="1.5"
            fill={sponsor.color}
            stroke="#0a0a0a"
            strokeWidth="0.4"
          />
          <text
            x="45"
            y="55.6"
            textAnchor="middle"
            fontSize="5"
            fontWeight="900"
            fill={sponsor.textColor}
            fontFamily="Kanit, sans-serif"
            letterSpacing="0.4"
          >
            {sponsor.name}
          </text>
        </g>
      )}

      {/* === ARMS === */}
      {isKeeper ? (
        <>
          {/* LEFT arm — slightly away from body */}
          <path d="M26 46 L16 68 L22 70 L32 48 Z" fill={`url(#${jerseyId})`} />
          <path
            d="M16 68 L12 86 L18 88 L22 70 Z"
            fill={`url(#${skinId})`}
            stroke="#1a1208"
            strokeWidth="0.4"
          />
          <rect
            x="12"
            y="83"
            width="6"
            height="3"
            rx="1"
            fill={resolvedBand}
            stroke="#0a0a0a"
            strokeWidth="0.3"
          />
          {/* LEFT GLOVE — slightly away from body, fingers down */}
          <g transform="translate(17 92) scale(-0.6 -0.6)">
            <path
              d="M-9 -4 Q-10 -11 -2 -12 L8 -12 Q12 -12 12 -7 L12 8 Q12 13 6 13 L-4 13 Q-10 13 -10 7 Z"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.8"
            />
            <path
              d="M-10 -2 Q-14 -10 -8 -14 Q-3 -14 -3 -8 Z"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.7"
            />
            <rect
              x="-5"
              y="-23"
              width="3.4"
              height="13"
              rx="1.6"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.7"
            />
            <rect
              x="-1"
              y="-26"
              width="3.4"
              height="16"
              rx="1.6"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.7"
            />
            <rect
              x="3"
              y="-24"
              width="3.4"
              height="14"
              rx="1.6"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.7"
            />
            <rect
              x="7"
              y="-20"
              width="3.4"
              height="10"
              rx="1.6"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.7"
            />
            <GloveBaseDetails />
            <GloveDecor style={gear.gloveStyle} accent={gear.gloveAccent} />
            <rect x="-10" y="10" width="22" height="5" rx="1.2" fill="#0a0a0a" />
            <rect x="-10" y="11" width="22" height="1.5" fill={gear.gloveAccent} opacity="0.9" />
          </g>

          {/* RIGHT arm — slightly away from body */}
          <path d="M64 46 L74 68 L68 70 L58 48 Z" fill={`url(#${jerseyId})`} />
          <path
            d="M74 68 L78 86 L72 88 L68 70 Z"
            fill={`url(#${skinId})`}
            stroke="#1a1208"
            strokeWidth="0.4"
          />
          <rect
            x="72"
            y="83"
            width="6"
            height="3"
            rx="1"
            fill={resolvedBand}
            stroke="#0a0a0a"
            strokeWidth="0.3"
          />
          {/* RIGHT GLOVE — slightly away from body, fingers down */}
          <g transform="translate(75 92) scale(0.6 -0.6)">
            <path
              d="M-9 -4 Q-10 -11 -2 -12 L8 -12 Q12 -12 12 -7 L12 8 Q12 13 6 13 L-4 13 Q-10 13 -10 7 Z"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.8"
            />
            <path
              d="M-10 -2 Q-14 -10 -8 -14 Q-3 -14 -3 -8 Z"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.7"
            />
            <rect
              x="-5"
              y="-23"
              width="3.4"
              height="13"
              rx="1.6"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.7"
            />
            <rect
              x="-1"
              y="-26"
              width="3.4"
              height="16"
              rx="1.6"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.7"
            />
            <rect
              x="3"
              y="-24"
              width="3.4"
              height="14"
              rx="1.6"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.7"
            />
            <rect
              x="7"
              y="-20"
              width="3.4"
              height="10"
              rx="1.6"
              fill={`url(#${gloveGradId})`}
              stroke="#0a0a0a"
              strokeWidth="0.7"
            />
            <GloveBaseDetails />
            <GloveDecor style={gear.gloveStyle} accent={gear.gloveAccent} />
            <rect x="-10" y="10" width="22" height="5" rx="1.2" fill="#0a0a0a" />
            <rect x="-10" y="11" width="22" height="1.5" fill={gear.gloveAccent} opacity="0.9" />
          </g>
        </>
      ) : kicking ? (
        <>
          {/* LEFT arm — back swung, longer reach */}
          {/* Upper arm (jersey) */}
          <path d="M26 46 L18 60 L22 64 L30 50 Z" fill={`url(#${jerseyId})`} />
          {/* Forearm (skin) */}
          <path
            d="M18 60 L8 74 L12 78 L22 64 Z"
            fill={`url(#${skinId})`}
            stroke="#1a1208"
            strokeWidth="0.4"
          />
          {/* Wrist band */}
          <rect
            x="9"
            y="73"
            width="6"
            height="2.5"
            fill={resolvedBand}
            transform="rotate(55 12 74)"
          />
          {/* Hand */}
          <ellipse
            cx="9"
            cy="78"
            rx="3.4"
            ry="3.8"
            fill={`url(#${skinId})`}
            stroke="#1a1208"
            strokeWidth="0.4"
          />

          {/* RIGHT arm — forward swing */}
          <path d="M64 46 L72 60 L68 64 L60 50 Z" fill={`url(#${jerseyId})`} />
          <path
            d="M72 60 L82 74 L78 78 L68 64 Z"
            fill={`url(#${skinId})`}
            stroke="#1a1208"
            strokeWidth="0.4"
          />
          <rect
            x="75"
            y="73"
            width="6"
            height="2.5"
            fill={resolvedBand}
            transform="rotate(-55 78 74)"
          />
          <ellipse
            cx="81"
            cy="78"
            rx="3.4"
            ry="3.8"
            fill={`url(#${skinId})`}
            stroke="#1a1208"
            strokeWidth="0.4"
          />
        </>
      ) : (
        <>
          {/* IDLE arms — hanging at sides */}
          <path d="M26 46 L22 70 L28 72 L32 48 Z" fill={`url(#${jerseyId})`} />
          <path
            d="M22 70 L20 86 L26 88 L28 72 Z"
            fill={`url(#${skinId})`}
            stroke="#1a1208"
            strokeWidth="0.4"
          />
          <rect
            x="20"
            y="83"
            width="6"
            height="3"
            rx="1"
            fill={resolvedBand}
            stroke="#0a0a0a"
            strokeWidth="0.3"
          />
          <ellipse
            cx="23"
            cy="90"
            rx="3.2"
            ry="3.6"
            fill={`url(#${skinId})`}
            stroke="#1a1208"
            strokeWidth="0.4"
          />

          <path d="M64 46 L68 70 L62 72 L58 48 Z" fill={`url(#${jerseyId})`} />
          <path
            d="M68 70 L70 86 L64 88 L62 72 Z"
            fill={`url(#${skinId})`}
            stroke="#1a1208"
            strokeWidth="0.4"
          />
          <rect
            x="64"
            y="83"
            width="6"
            height="3"
            rx="1"
            fill={resolvedBand}
            stroke="#0a0a0a"
            strokeWidth="0.3"
          />
          <ellipse
            cx="67"
            cy="90"
            rx="3.2"
            ry="3.6"
            fill={`url(#${skinId})`}
            stroke="#1a1208"
            strokeWidth="0.4"
          />
        </>
      )}

      {/* === SHORTS === */}
      <path d="M34 82 L56 82 L58 100 L48 100 L46 88 L44 88 L42 100 L32 100 Z" fill="#111114" />
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
          <rect x="35" y="112" width="9" height="2.5" fill={sockAccent} />
          <rect x="46" y="112" width="9" height="2.5" fill={sockAccent} />
          {/* Cleats */}
          <path d="M30 118 Q34 116 44 118 L44 122 Q37 124 30 122 Z" fill={cleat} />
          <path d="M46 118 Q56 116 60 118 L60 122 Q53 124 46 122 Z" fill={cleat} />
          {/* Cleat sole stripe */}
          <rect x="30" y="121" width="14" height="1.5" fill={cleatAccent} />
          <rect x="46" y="121" width="14" height="1.5" fill={cleatAccent} />
        </>
      ) : kicking ? (
        <>
          {/* Planted leg */}
          <path d="M34 100 L36 118 L44 118 L44 100 Z" fill={sockDark} />
          {/* Kicking leg swung forward */}
          <path d="M46 100 L62 110 L60 116 L44 106 Z" fill={sockDark} />
          {/* Sock bands */}
          <rect x="35" y="112" width="9" height="2.5" fill={sockAccent} />
          <rect
            x="50"
            y="105"
            width="9"
            height="2.5"
            fill={sockAccent}
            transform="rotate(30 54 106)"
          />
          {/* Planted cleat */}
          <path d="M30 118 Q34 116 44 118 L44 122 Q37 124 30 122 Z" fill={cleat} />
          <rect x="30" y="121" width="14" height="1.5" fill={cleatAccent} />
          {/* Kicking cleat */}
          <g transform="rotate(20 60 113)">
            <path d="M54 110 Q60 108 68 110 L68 114 Q60 116 54 114 Z" fill={cleat} />
            <rect x="54" y="113" width="14" height="1.5" fill={cleatAccent} />
          </g>
        </>
      ) : (
        <>
          {/* IDLE — both legs straight */}
          <path d="M34 100 L36 118 L44 118 L44 100 Z" fill={sockDark} />
          <path d="M46 100 L46 118 L54 118 L56 100 Z" fill={sockDark} />
          <rect x="35" y="112" width="9" height="2.5" fill={sockAccent} />
          <rect x="46" y="112" width="9" height="2.5" fill={sockAccent} />
          <path d="M30 118 Q34 116 44 118 L44 122 Q37 124 30 122 Z" fill={cleat} />
          <path d="M46 118 Q56 116 60 118 L60 122 Q53 124 46 122 Z" fill={cleat} />
          <rect x="30" y="121" width="14" height="1.5" fill={cleatAccent} />
          <rect x="46" y="121" width="14" height="1.5" fill={cleatAccent} />
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

type Gear = {
  gloveColor: string;
  gloveAccent: string;
  gloveStyle: GloveStyle;
  bootColor: string;
  bootAccent: string;
  bandColor: string;
  sockColor: string;
  sockAccent: string;
};

const DEFAULT_GEAR: Gear = {
  gloveColor: "#ff7a1a",
  gloveAccent: "#ffb066",
  gloveStyle: "classic",
  bootColor: "#0a0a0a",
  bootAccent: "#ffffff",
  bandColor: "#ffffff",
  sockColor: "#0c0c10",
  sockAccent: "#ffffff",
};

function GoalScene({
  phase,
  last,
  playerColor,
  oppColor,
  gear,
  sponsor,
  onPickShot,
}: {
  phase: Phase;
  last: Last | null;
  playerColor: string;
  oppColor: string;
  gear: Gear;
  sponsor: Sponsor;
  onPickShot?: (z: Zone) => void;
}) {
  // Random weather/time-of-day condition picked once per match mount
  const weather = useMemo<WeatherKind>(() => {
    const kinds: WeatherKind[] = ["day", "sunset", "night", "rain", "storm", "snow", "fog"];
    return kinds[Math.floor(Math.random() * kinds.length)];
  }, []);
  // Animation: ball travels from striker spot to its zone after picking
  const [tick, setTick] = useState(0);
  // Kick animation: idle → wind-up → strike
  const [kickStage, setKickStage] = useState<"idle" | "windup" | "kick">("idle");
  const [ballFly, setBallFly] = useState(false);
  useEffect(() => {
    if (phase === "result") {
      setTick((t) => t + 1);
      setBallFly(false);
      // Visible wind-up for 3 seconds, then strike + ball fly together
      setKickStage("windup");
      const t1 = window.setTimeout(() => {
        setKickStage("kick");
        setBallFly(true);
      }, 3000);
      return () => window.clearTimeout(t1);
    } else {
      setKickStage("idle");
      setBallFly(false);
    }
  }, [phase, last]);

  const showAction = phase === "result" && last;
  const ballPos = showAction ? zoneCoords(last!.shot) : null;
  const keeperPos = showAction ? zoneCoords(last!.keeper) : { left: "50%", top: "65%" };

  const strikerIsPlayer = last?.shooter === "player";
  // During action phases, striker color matches the active shooter
  const activeShooter: Shooter =
    phase === "player"
      ? "player"
      : phase === "opponent"
        ? "opponent"
        : (last?.shooter ?? "opponent");
  const strikerColor = activeShooter === "player" ? playerColor : oppColor;
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
      {/* Weather/time-of-day atmosphere overlays the whole scene */}
      <WeatherScene weather={weather} />
      {/* Crowd stand behind the goal */}
      <Crowd playerColor={playerColor} oppColor={oppColor} />
      {/* Goal frame */}
      <div
        className="relative z-10 w-full"
        style={{ aspectRatio: "16 / 9" }}
      >
        {/* Net — diagonal mesh with depth fade */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,40,30,0.55) 0%, rgba(10,25,18,0.85) 100%)",
            boxShadow:
              "inset 0 0 60px rgba(0,0,0,0.55), inset 0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          {/* Net mesh — two diagonal sets of fine lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 14px)",
              maskImage:
                "radial-gradient(ellipse at 50% 40%, #000 60%, rgba(0,0,0,0.6) 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 40%, #000 60%, rgba(0,0,0,0.6) 100%)",
            }}
          />
          {/* Subtle vertical net seams */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 32px)",
            }}
          />
        </div>

        {/* Crossbar */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: 10,
            background:
              "linear-gradient(180deg, #ffffff 0%, #f1f1f1 55%, #b8b8b8 100%)",
            boxShadow: "0 3px 6px rgba(0,0,0,0.45)",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        />
        {/* Left post */}
        <div
          className="absolute top-0 bottom-0 left-0"
          style={{
            width: 10,
            background:
              "linear-gradient(90deg, #ffffff 0%, #e8e8e8 60%, #a8a8a8 100%)",
            boxShadow: "3px 0 6px rgba(0,0,0,0.4)",
          }}
        />
        {/* Right post */}
        <div
          className="absolute top-0 bottom-0 right-0"
          style={{
            width: 10,
            background:
              "linear-gradient(270deg, #ffffff 0%, #e8e8e8 60%, #a8a8a8 100%)",
            boxShadow: "-3px 0 6px rgba(0,0,0,0.4)",
          }}
        />
        {/* Goal line shadow at the bottom inside */}
        <div className="pointer-events-none absolute inset-x-2 bottom-0 h-3 bg-gradient-to-t from-black/55 to-transparent" />

        {/* Keeper */}
        <div
          key={`keeper-${tick}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ left: keeperPos.left, top: keeperPos.top }}
        >
          <PlayerFigure
            color={keeperColor}
            pose="keeper"
            size={104}
            emotion={keeperEmotion}
            gear={activeShooter === "player" ? DEFAULT_GEAR : gear}
            sponsor={activeShooter === "player" ? undefined : sponsor}
          />
        </div>

        {/* Ball — flies only after the wind-up completes */}
        {finalBallPos && ballFly && (
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

        {/* Click target overlay — player picks WHERE to shoot */}
        {onPickShot && (
          <button
            type="button"
            aria-label="Бей в ворота"
            className="absolute inset-0 z-20 cursor-crosshair bg-transparent"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              const y = (e.clientY - rect.top) / rect.height;
              const col: 0 | 1 | 2 = x < 1 / 3 ? 0 : x < 2 / 3 ? 1 : 2;
              const row: 0 | 1 = y < 0.5 ? 0 : 1;
              const zone = ZONES.find((z) => z.col === col && z.row === row)!;
              onPickShot(zone.id);
            }}
          />
        )}
      </div>

      {/* Pitch in front of the goal */}
      <div className="relative mt-2 w-full overflow-hidden rounded-b-lg" style={{ height: 180 }}>
        {/* Field with pitch lines */}
        <PitchLines />
        {/* Electric energy effects in the corners of the field */}
        <FieldLightning side="left" />
        <FieldLightning side="right" />
        {/* Striker on the penalty spot */}
        <div
          key={`striker-${tick}`}
          className="absolute bottom-2"
          style={{
            left: "50%",
            transform:
              kickStage === "kick" ? "translateX(-50%) translateX(6px)" : "translateX(-50%)",
            transition: "transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            animation: kickStage === "windup" ? "strikerWindup 3s ease-in-out infinite" : "none",
          }}
        >
          <PlayerFigure
            color={strikerColor}
            pose="striker"
            size={120}
            emotion={strikerEmotion}
            kicking={kickStage === "kick"}
            gear={activeShooter === "player" ? gear : DEFAULT_GEAR}
            sponsor={activeShooter === "player" ? sponsor : undefined}
          />
        </div>
        {/* Label */}
        <span className="absolute right-3 top-3 rounded bg-black/50 px-2 py-1 text-[10px] tracking-[0.25em] text-white/80 uppercase">
          {activeShooter === "player" ? "Бьёшь ты" : "Бьёт соперник"}
        </span>
      </div>

      <style>{`
        @keyframes ballFly {
          0% { transform: translate(-50%, 200px) scale(0.3); opacity: 0; }
          15% { opacity: 1; }
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
        @keyframes strikerWindup {
          0% { transform: translateX(-50%) rotate(0deg) scale(1); }
          25% { transform: translateX(-50%) rotate(-3deg) scale(1.02) translateY(-2px); }
          50% { transform: translateX(-50%) rotate(-6deg) scale(1.03) translateY(-3px); }
          75% { transform: translateX(-50%) rotate(-3deg) scale(1.02) translateY(-2px); }
          100% { transform: translateX(-50%) rotate(0deg) scale(1); }
        }
        @keyframes boltFlash {
          0%, 92%, 100% { opacity: 0; transform: translateX(-50%) scaleY(0.8); filter: brightness(1); }
          93% { opacity: 1; transform: translateX(-50%) scaleY(1); filter: brightness(1.8); }
          95% { opacity: 0.2; transform: translateX(-48%) scaleY(0.95); }
          97% { opacity: 1; transform: translateX(-52%) scaleY(1.05); filter: brightness(2); }
          99% { opacity: 0.1; }
        }
        @keyframes coreGlow {
          0%, 100% { opacity: 0.55; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.95; transform: translateX(-50%) scale(1.15); }
        }
        @keyframes sparkFloat {
          0% { transform: translate(0, 0) scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.8; }
          100% { transform: translate(var(--drift, 0px), -70px) scale(0.2); opacity: 0; }
        }
        @keyframes auraPulse {
          0%, 100% { opacity: 0.35; transform: translateX(-50%) scale(0.9); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.2); }
        }
      `}</style>
    </div>
  );
}

function FieldLightning({ side }: { side: "left" | "right" }) {
  const horiz = side === "left" ? { left: "4%" } : { right: "4%" };
  const delay = side === "left" ? 0 : 0.6;
  return (
    <div
      className="pointer-events-none absolute"
      style={{ ...horiz, bottom: 0, width: 70, height: 110 }}
    >
      {/* Ground glow puddle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -10,
          width: 80,
          height: 28,
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse at center, rgba(150,180,255,0.65), rgba(80,60,220,0.35) 45%, transparent 75%)",
          filter: "blur(6px)",
          animation: `auraPulse 1.8s ease-in-out infinite`,
          animationDelay: `${delay}s`,
          mixBlendMode: "screen",
        }}
      />
      {/* Vertical energy beam */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: 6,
          height: 90,
          transform: "translateX(-50%)",
          background:
            "linear-gradient(to top, rgba(180,200,255,0.9) 0%, rgba(140,120,255,0.7) 40%, rgba(120,80,255,0.3) 80%, transparent 100%)",
          filter: "blur(2px)",
          animation: `auraPulse 1.6s ease-in-out infinite`,
          animationDelay: `${delay + 0.2}s`,
          mixBlendMode: "screen",
          borderRadius: 6,
        }}
      />
      {/* Lightning bolt — big and centered */}
      <svg
        width="48"
        height="100"
        viewBox="0 0 48 100"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          animation: `boltFlash 2.4s linear infinite`,
          animationDelay: `${delay}s`,
          filter:
            "drop-shadow(0 0 4px #c8d8ff) drop-shadow(0 0 10px #8a6aff) drop-shadow(0 0 18px rgba(120,90,255,0.7))",
        }}
      >
        <path
          d="M28 2 L8 50 L20 50 L14 98 L42 42 L28 42 L34 2 Z"
          fill="#f4f7ff"
          stroke="#b8c8ff"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      {/* Floating sparks rising */}
      {[0, 1, 2, 3, 4].map((e) => (
        <span
          key={e}
          style={{
            position: "absolute",
            left: `${30 + (e * 11) % 40}%`,
            bottom: 6,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: e % 2 === 0 ? "#d8e4ff" : "#b8a8ff",
            boxShadow: "0 0 6px #a8c0ff, 0 0 12px #7a5cff",
            ["--drift" as any]: `${(e - 2) * 6}px`,
            animation: `sparkFloat ${1.8 + e * 0.3}s linear infinite`,
            animationDelay: `${delay + e * 0.25}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

function PitchLines() {
  // SVG of penalty area as seen looking toward the goal (top-down compressed perspective).
  return (
    <svg
      viewBox="0 0 400 180"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      style={{
        background: "linear-gradient(180deg, #0e6a30 0%, #0d5c2a 60%, #0a4a22 100%)",
      }}
    >
      {/* Mowed stripes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x="0"
          y={i * 30}
          width="400"
          height="30"
          fill={i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}
        />
      ))}
      {/* Goal-area (6-yard box) — narrow trapezoid at top */}
      <path d="M150 0 L250 0 L260 24 L140 24 Z" fill="none" stroke="#fff" strokeWidth="2" />
      {/* Penalty area (18-yard box) — wider trapezoid */}
      <path d="M70 0 L330 0 L380 70 L20 70 Z" fill="none" stroke="#fff" strokeWidth="2" />
      {/* Penalty arc */}
      <path d="M170 70 Q200 95 230 70" fill="none" stroke="#fff" strokeWidth="2" />
      {/* Penalty spot */}
      <circle cx="200" cy="56" r="3" fill="#fff" />
      {/* Side touchlines fade */}
      <line x1="0" y1="178" x2="400" y2="178" stroke="#fff" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

// ============================================================
// Weather / time-of-day atmosphere
// ============================================================
type WeatherKind = "day" | "sunset" | "night" | "rain" | "storm" | "snow" | "fog";

const WEATHER_LABEL: Record<WeatherKind, { icon: string; name: string }> = {
  day: { icon: "☀️", name: "Ясный день" },
  sunset: { icon: "🌅", name: "Закат" },
  night: { icon: "🌙", name: "Ночь" },
  rain: { icon: "🌧️", name: "Дождь" },
  storm: { icon: "⛈️", name: "Гроза" },
  snow: { icon: "❄️", name: "Снег" },
  fog: { icon: "🌫️", name: "Туман" },
};

function WeatherScene({ weather }: { weather: WeatherKind }) {
  // Tints applied as a full-scene overlay (over goal + pitch + crowd)
  const tint: Record<WeatherKind, string> = {
    day: "linear-gradient(180deg, rgba(255,240,180,0.10), rgba(255,255,255,0.04))",
    sunset:
      "linear-gradient(180deg, rgba(255,120,40,0.28) 0%, rgba(255,80,120,0.18) 50%, rgba(80,30,80,0.25) 100%)",
    night:
      "linear-gradient(180deg, rgba(8,12,40,0.55) 0%, rgba(10,20,55,0.55) 100%)",
    rain:
      "linear-gradient(180deg, rgba(40,55,75,0.45) 0%, rgba(30,45,65,0.45) 100%)",
    storm:
      "linear-gradient(180deg, rgba(15,18,30,0.65) 0%, rgba(20,25,45,0.65) 100%)",
    snow:
      "linear-gradient(180deg, rgba(200,220,240,0.30) 0%, rgba(170,190,220,0.25) 100%)",
    fog: "linear-gradient(180deg, rgba(220,225,230,0.45), rgba(200,210,220,0.55))",
  };

  const label = WEATHER_LABEL[weather];

  // Stadium floodlights turn on for dark conditions
  const isDark = weather === "night" || weather === "rain" || weather === "storm" || weather === "fog";

  // Pre-compute drop / flake positions
  const drops = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 0.55 + Math.random() * 0.4,
        length: 12 + Math.random() * 18,
      })),
    [],
  );
  const flakes = useMemo(
    () =>
      Array.from({ length: 50 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 5,
        size: 4 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 60,
      })),
    [],
  );
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 40,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 3,
      })),
    [],
  );

  return (
    <>
      {/* Sky decorations (sun / moon / stars) behind everything */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {weather === "day" && (
          <div
            className="absolute rounded-full"
            style={{
              top: "6%",
              right: "10%",
              width: 60,
              height: 60,
              background:
                "radial-gradient(circle, #fff7c2 0%, #ffd96b 55%, rgba(255,200,80,0) 75%)",
              filter: "blur(2px)",
              boxShadow: "0 0 60px rgba(255,210,90,0.7)",
            }}
          />
        )}
        {weather === "sunset" && (
          <div
            className="absolute rounded-full"
            style={{
              bottom: "55%",
              right: "12%",
              width: 80,
              height: 80,
              background:
                "radial-gradient(circle, #fff1a8 0%, #ff8a3d 50%, rgba(255,80,40,0) 78%)",
              filter: "blur(1px)",
              boxShadow: "0 0 80px rgba(255,120,40,0.8)",
            }}
          />
        )}
        {(weather === "night" || weather === "storm") && (
          <>
            <div
              className="absolute rounded-full"
              style={{
                top: "8%",
                left: "12%",
                width: 44,
                height: 44,
                background:
                  "radial-gradient(circle at 35% 35%, #f5f1e0 0%, #cfc8a8 60%, rgba(120,110,80,0) 78%)",
                boxShadow: "0 0 40px rgba(240,235,200,0.55)",
              }}
            />
            {weather === "night" &&
              stars.map((s, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: `${s.left}%`,
                    top: `${s.top}%`,
                    width: s.size,
                    height: s.size,
                    animation: `starTwinkle 2.4s ${s.delay}s ease-in-out infinite`,
                    boxShadow: "0 0 4px rgba(255,255,255,0.9)",
                  }}
                />
              ))}
          </>
        )}
      </div>

      {/* Color tint overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{ background: tint[weather], mixBlendMode: "multiply" }}
      />

      {/* Stadium floodlights — turn on when the scene is dark */}
      {isDark && (
        <div className="pointer-events-none absolute inset-0 z-35 overflow-hidden">
          {/* Left tower */}
          <div
            className="absolute"
            style={{
              top: "-2%",
              left: "4%",
              width: 14,
              height: 10,
              background: "linear-gradient(180deg, #fffce0 0%, #ffe066 100%)",
              borderRadius: 2,
              boxShadow: "0 0 18px 4px rgba(255,236,150,0.95), 0 0 40px 10px rgba(255,220,120,0.55)",
              animation: "floodFlicker 5s ease-in-out infinite",
            }}
          />
          {/* Right tower */}
          <div
            className="absolute"
            style={{
              top: "-2%",
              right: "4%",
              width: 14,
              height: 10,
              background: "linear-gradient(180deg, #fffce0 0%, #ffe066 100%)",
              borderRadius: 2,
              boxShadow: "0 0 18px 4px rgba(255,236,150,0.95), 0 0 40px 10px rgba(255,220,120,0.55)",
              animation: "floodFlicker 5s -2.5s ease-in-out infinite",
            }}
          />
          {/* Left beam — wide cone of light */}
          <div
            className="absolute"
            style={{
              top: "0%",
              left: "0%",
              width: "55%",
              height: "100%",
              background:
                "conic-gradient(from 130deg at 8% 0%, rgba(255,240,180,0) 0deg, rgba(255,240,180,0.32) 8deg, rgba(255,240,180,0.18) 18deg, rgba(255,240,180,0) 28deg)",
              mixBlendMode: "screen",
              filter: "blur(2px)",
              animation: "floodFlicker 5s ease-in-out infinite",
            }}
          />
          {/* Right beam */}
          <div
            className="absolute"
            style={{
              top: "0%",
              right: "0%",
              width: "55%",
              height: "100%",
              background:
                "conic-gradient(from 200deg at 92% 0%, rgba(255,240,180,0) 0deg, rgba(255,240,180,0.18) 10deg, rgba(255,240,180,0.32) 20deg, rgba(255,240,180,0) 28deg)",
              mixBlendMode: "screen",
              filter: "blur(2px)",
              animation: "floodFlicker 5s -2.5s ease-in-out infinite",
            }}
          />
          {/* Warm pool of light on the pitch under both beams */}
          <div
            className="absolute inset-x-0"
            style={{
              bottom: 0,
              height: "55%",
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(255,235,170,0.28) 0%, rgba(255,220,140,0.12) 40%, rgba(0,0,0,0) 75%)",
              mixBlendMode: "screen",
            }}
          />
        </div>
      )}

      {/* Particles & special effects (above tint) */}
      <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
        {(weather === "rain" || weather === "storm") &&
          drops.map((d, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${d.left}%`,
                top: "-10%",
                width: 1.5,
                height: d.length,
                background:
                  "linear-gradient(180deg, rgba(180,210,255,0) 0%, rgba(200,225,255,0.85) 100%)",
                animation: `rainFall ${d.duration}s ${d.delay}s linear infinite`,
                transform: "skewX(-12deg)",
              }}
            />
          ))}
        {weather === "snow" &&
          flakes.map((f, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${f.left}%`,
                top: "-5%",
                width: f.size,
                height: f.size,
                opacity: 0.9,
                boxShadow: "0 0 4px rgba(255,255,255,0.8)",
                ["--drift" as string]: `${f.drift}px`,
                animation: `snowFall ${f.duration}s ${f.delay}s linear infinite`,
              }}
            />
          ))}
        {weather === "fog" && (
          <>
            <div
              className="absolute inset-x-[-20%] h-24"
              style={{
                bottom: "20%",
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)",
                filter: "blur(10px)",
                animation: "fogDrift 18s linear infinite",
              }}
            />
            <div
              className="absolute inset-x-[-20%] h-20"
              style={{
                bottom: "5%",
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)",
                filter: "blur(14px)",
                animation: "fogDrift 24s -6s linear infinite reverse",
              }}
            />
          </>
        )}
        {weather === "storm" && (
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(255,255,255,0.9)",
              animation: "lightningFlash 6s infinite",
              mixBlendMode: "screen",
            }}
          />
        )}
      </div>

      {/* Weather badge */}
      <div
        className="pointer-events-none absolute left-3 top-3 z-50 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
      >
        <span className="text-sm leading-none">{label.icon}</span>
        <span>{label.name}</span>
      </div>

      <style>{`
        @keyframes rainFall {
          0% { transform: translateY(-20px) skewX(-12deg); }
          100% { transform: translateY(120vh) skewX(-12deg); }
        }
        @keyframes snowFall {
          0% { transform: translate(0, -20px) rotate(0deg); }
          100% { transform: translate(var(--drift, 0px), 120vh) rotate(360deg); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes fogDrift {
          0% { transform: translateX(-10%); }
          100% { transform: translateX(10%); }
        }
        @keyframes lightningFlash {
          0%, 92%, 100% { opacity: 0; }
          93% { opacity: 0.85; }
          94% { opacity: 0; }
          96% { opacity: 0.6; }
          97% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
