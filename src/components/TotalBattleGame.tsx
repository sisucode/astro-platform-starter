import { useEffect, useMemo, useState } from "react";

type PortalSide = "left" | "right";
type OperationType = "multiply" | "divide";

interface PortalConfig {
  side: PortalSide;
  type: OperationType;
  value: number;
  result: number;
  isCorrect: boolean;
  disabled?: boolean;
}

interface GameState {
  playerStart: number;
  opponent: number;
  portals: PortalConfig[];
}

const MAX_ATTEMPTS = 2;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const computeResult = (type: OperationType, player: number, value: number) => {
  const raw = type === "multiply" ? player * value : player / value;
  return Math.floor(raw);
};

const generateOperation = (
  player: number,
  opponent: number,
  shouldWin: boolean
): { type: OperationType; value: number; result: number } => {
  const maxTries = 200;
  for (let i = 0; i < maxTries; i += 1) {
    const type: OperationType = Math.random() < 0.5 ? "multiply" : "divide";
    const value =
      type === "multiply" ? randomInt(2, 12) : randomInt(2, 13);
    const result = computeResult(type, player, value);

    if (shouldWin ? result > opponent : result < opponent) {
      return { type, value, result };
    }
  }

  if (shouldWin) {
    const minMultiplier = Math.ceil((opponent + 1) / player);
    const clampedValue = Math.max(2, Math.min(minMultiplier, 12));
    const result = computeResult("multiply", player, clampedValue);
    return { type: "multiply", value: clampedValue, result };
  }

  const value = 13;
  const result = computeResult("divide", player, value);
  return { type: "divide", value, result };
};

const createGameState = (): GameState => {
  const playerStart = randomInt(20, 40);
  const opponent = playerStart + randomInt(5, 15);
  const winningSide: PortalSide = Math.random() < 0.5 ? "left" : "right";

  const winningOperation = generateOperation(playerStart, opponent, true);
  const losingOperation = generateOperation(playerStart, opponent, false);

  const portals: PortalConfig[] = [
    {
      side: "left",
      ...(winningSide === "left" ? winningOperation : losingOperation),
      isCorrect: winningSide === "left",
    },
    {
      side: "right",
      ...(winningSide === "right" ? winningOperation : losingOperation),
      isCorrect: winningSide === "right",
    },
  ];

  return { playerStart, opponent, portals };
};

const formatPortalLabel = (portal: PortalConfig) =>
  `${portal.type === "multiply" ? "×" : "÷"}${portal.value}`;

const TotalBattleGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => createGameState());
  const [portals, setPortals] = useState<PortalConfig[]>(gameState.portals);
  const [attempt, setAttempt] = useState(1);
  const [playerCount, setPlayerCount] = useState(gameState.playerStart);
  const [status, setStatus] = useState<"ready" | "won" | "lost">("ready");
  const [feedback, setFeedback] = useState("Välj den bästa porten för din armé!");
  const [marchingSide, setMarchingSide] = useState<PortalSide | null>(null);

  useEffect(() => {
    if (!marchingSide) return;
    const timeout = setTimeout(() => setMarchingSide(null), 600);
    return () => clearTimeout(timeout);
  }, [marchingSide]);

  const disabledSides = useMemo(
    () => portals.filter((portal) => portal.disabled).map((portal) => portal.side),
    [portals]
  );

  const handlePortalSelection = (side: PortalSide) => {
    if (status === "won" || status === "lost") {
      return;
    }

    if (disabledSides.includes(side)) {
      return;
    }

    const portal = portals.find((item) => item.side === side);
    if (!portal) return;

    setMarchingSide(side);

    setPlayerCount(portal.result);

    if (portal.isCorrect) {
      setStatus("won");
      setFeedback(
        `Du har nu ${portal.result} soldater! Motståndaren har ${gameState.opponent}. DU VINNER! 🎉`
      );
      setPortals((prev) => prev.map((p) => ({ ...p, disabled: true })));
      return;
    }

    if (attempt > MAX_ATTEMPTS) {
      return;
    }

    if (attempt === MAX_ATTEMPTS) {
      setStatus("lost");
      setFeedback(
        `Du har nu ${portal.result} soldater! Motståndaren har ${gameState.opponent}. GAME OVER - Motståndaren vinner!`
      );
      setPortals((prev) => prev.map((p) => ({ ...p, disabled: true })));
      return;
    }

    if (attempt === 1) {
      setFeedback(
        `Du har nu ${portal.result} soldater! Motståndaren har ${gameState.opponent}. Du förlorar denna runda... Försök 2/2 - Välj den andra porten!`
      );
      setAttempt(2);
      setPortals((prev) =>
        prev.map((p) => (p.side === side ? { ...p, disabled: true } : p))
      );
      return;
    }

    setStatus("lost");
    setFeedback(
      `Du har nu ${portal.result} soldater! Motståndaren har ${gameState.opponent}. GAME OVER - Motståndaren vinner!`
    );
    setPortals((prev) => prev.map((p) => ({ ...p, disabled: true })));
  };

  const resetGame = () => {
    const nextGame = createGameState();
    setGameState(nextGame);
    setPortals(nextGame.portals);
    setPlayerCount(nextGame.playerStart);
    setAttempt(1);
    setStatus("ready");
    setFeedback("Välj den bästa porten för din armé!");
    setMarchingSide(null);
  };

  const opponentArmy = useMemo(
    () => Array.from({ length: gameState.opponent }),
    [gameState.opponent]
  );

  const playerArmy = useMemo(
    () => Array.from({ length: Math.min(playerCount, 500) }),
    [playerCount]
  );

  const currentAttemptLabel = `Försök ${attempt}/${MAX_ATTEMPTS}`;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 text-white">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-slate-950/70">
          <div>
            <h1 className="text-2xl font-bold text-blue-200">Strategislaget</h1>
            <p className="text-sm text-slate-300">Analysera portalerna och led din armé till seger.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-slate-800 rounded-full text-sm font-semibold uppercase tracking-wide">
              {currentAttemptLabel}
            </span>
            <button
              type="button"
              onClick={resetGame}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-300 focus-visible:ring-offset-slate-900 rounded-full font-semibold text-sm transition"
            >
              Spela igen
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="text-center text-lg font-semibold text-slate-200 min-h-[3.5rem] flex items-center justify-center text-balance">
            {feedback}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="bg-slate-900/60 rounded-2xl border border-slate-700 p-4 flex flex-col gap-3">
              <div className="text-center font-semibold text-lg text-blue-200">Din armé</div>
              <div className="flex justify-center">
                <div className="w-24 h-12 bg-gradient-to-b from-blue-400/80 to-blue-700/60 border border-blue-200/40 rounded-t-2xl shadow-lg shadow-blue-900/40 flex items-end justify-center pb-2 text-xs font-bold uppercase tracking-wider text-blue-50">
                  Fort
                </div>
              </div>
              <div
                className={`relative h-48 overflow-hidden rounded-xl border border-blue-500/40 bg-gradient-to-t from-blue-900/60 to-blue-600/40 transition-transform duration-500 ${
                  marchingSide ? "translate-y-2 scale-[0.98]" : "translate-y-0 scale-100"
                }`}
              >
                <div className="absolute inset-0 flex flex-wrap content-start gap-1 p-3">
                  {playerArmy.map((_, index) => (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={`player-${index}`}
                      className="w-3 h-3 rounded-full bg-blue-300/90 shadow-sm shadow-blue-500/60"
                    />
                  ))}
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-400/40 text-xs font-semibold">
                  Start: {gameState.playerStart}
                </div>
              </div>
              <div className="text-center text-2xl font-bold text-blue-300">
                Aktuellt: {playerCount}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative flex-1 bg-slate-900/50 border border-slate-700 rounded-2xl p-6 flex flex-col gap-6">
                <div className="absolute inset-x-8 top-0 h-3 bg-gradient-to-r from-blue-500 via-slate-500 to-red-500 blur-xl opacity-60" />
                <div className="relative flex justify-between items-center">
                  {portals.map((portal) => (
                    <div key={portal.side} className="flex flex-col items-center gap-3">
                      <span className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                        {portal.side === "left" ? "Vänster port" : "Höger port"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePortalSelection(portal.side)}
                        disabled={
                          portal.disabled ||
                          (status !== "ready" && !portal.isCorrect && attempt >= MAX_ATTEMPTS)
                        }
                        className={`w-32 h-32 rounded-full border-4 transition transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/70 font-bold text-3xl tracking-wide flex items-center justify-center ${
                          portal.side === "left"
                            ? "bg-blue-900/60 border-blue-400/60 shadow-lg shadow-blue-800/30"
                            : "bg-red-900/60 border-red-400/60 shadow-lg shadow-red-800/30"
                        } ${
                          disabledSides.includes(portal.side) || status === "won" || status === "lost"
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {formatPortalLabel(portal)}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative text-center text-sm text-slate-300">
                  Välj den portal som ger din armé tillräckligt med förstärkningar för att slå motståndaren.
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-2xl border border-slate-700 p-4 flex flex-col gap-3">
              <div className="text-center font-semibold text-lg text-red-200">Fiendens armé</div>
              <div className="flex justify-center">
                <div className="w-24 h-12 bg-gradient-to-b from-red-400/80 to-red-700/60 border border-red-200/40 rounded-t-2xl shadow-lg shadow-red-900/40 flex items-end justify-center pb-2 text-xs font-bold uppercase tracking-wider text-red-50">
                  Fäste
                </div>
              </div>
              <div className="relative h-48 overflow-hidden rounded-xl border border-red-500/40 bg-gradient-to-t from-red-900/60 to-red-600/40">
                <div className="absolute inset-0 flex flex-wrap content-start gap-1 p-3">
                  {opponentArmy.map((_, index) => (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={`enemy-${index}`}
                      className="w-3 h-3 rounded-full bg-red-300/90 shadow-sm shadow-red-500/60"
                    />
                  ))}
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-red-900/80 border border-red-400/40 text-xs font-semibold">
                  Totalt: {gameState.opponent}
                </div>
              </div>
              <div className="text-center text-2xl font-bold text-red-300">
                Måste slå: {gameState.opponent}
              </div>
            </div>
          </div>

          {status === "lost" && (
            <div className="text-center text-lg font-semibold text-red-300">
              GAME OVER - Motståndaren vinner!
            </div>
          )}
          {status === "won" && (
            <div className="text-center text-lg font-semibold text-emerald-300">
              Seger! Din strategi överglänste motståndaren.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalBattleGame;
