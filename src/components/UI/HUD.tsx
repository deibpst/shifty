import React from "react";
import { useGameStore } from "../../store";
import { motion, AnimatePresence } from "framer-motion";

export const HUD: React.FC = () => {
  const { score, lives, currentWasteItem, gameMode, mindshiftPhase } =
    useGameStore();

  if (!currentWasteItem) return null;

  const laneColor = currentWasteItem.correctLaneColor;
  const bgColor = getPastelColor(laneColor);
  const borderColor = getBorderColor(laneColor);
  const textColor = getTextColor(laneColor);

  const renderEnglishCard = () => {
    // Las opciones están guardadas como JSON en mindshiftEmotion
    const options: string[] = currentWasteItem.mindshiftEmotion
      ? JSON.parse(currentWasteItem.mindshiftEmotion)
      : [];

    return (
      <>
        <div className="text-7xl filter drop-shadow-sm leading-none">
          {currentWasteItem.emoji}
        </div>
        <div className="flex flex-col gap-0.5">
          <div
            className="text-sm font-bold uppercase tracking-widest opacity-90"
            style={{ color: textColor }}
          >
            ENGLISH · ENCUENTRA LA PALABRA
          </div>
          <div
            className="text-2xl font-black leading-none"
            style={{ color: textColor }}
          >
            ¿Cómo se llama en inglés?
          </div>
          {/* Mini guía de carriles */}
          <div className="flex gap-2 mt-1">
            {(["green", "blue", "yellow", "red"] as const).map((color, i) => (
              <span
                key={color}
                className="text-[11px] font-black px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: getLaneTagColor(color),
                  color: color === "yellow" ? "#1e1b4b" : "#fff",
                }}
              >
                {options[i] || ""}
              </span>
            ))}
          </div>
        </div>
      </>
    );
  };

  // --- Build MindShift card content based on phase ---
  const renderMindshiftCard = () => {
    if (mindshiftPhase === 1) {
      // Phase 1: Show the emotion the player must classify
      return (
        <>
          <div className="text-7xl filter drop-shadow-sm leading-none">
            {currentWasteItem.emoji}
          </div>
          <div className="flex flex-col gap-0.5">
            <div
              className="text-sm font-bold uppercase tracking-widest opacity-90"
              style={{ color: textColor }}
            >
              FASE 1 · IDENTIFICA LA EMOCIÓN
            </div>
            <div
              className="text-2xl font-black leading-none"
              style={{ color: textColor }}
            >
              {currentWasteItem.name}
            </div>
            <div
              className="text-lg font-semibold opacity-90"
              style={{ color: textColor }}
            >
              ¿En qué carril va esta emoción?
            </div>
          </div>
        </>
      );
    }

    if (mindshiftPhase === 2) {
      // Phase 2: Go to the correct color lane (with distractor)
      const colorNames: Record<string, string> = {
        green: "VERDE",
        blue: "AZUL",
        yellow: "AMARILLO",
        red: "ROJO",
      };
      return (
        <>
          <div className="text-7xl filter drop-shadow-sm leading-none">
            {currentWasteItem.emoji}
          </div>
          <div className="flex flex-col gap-0.5">
            <div
              className="text-sm font-bold uppercase tracking-widest opacity-90"
              style={{ color: textColor }}
            >
              FASE 2 · CONTROL DE IMPULSOS
            </div>
            <div
              className="text-2xl font-black leading-none"
              style={{ color: textColor }}
            >
              CARRIL {colorNames[laneColor] || laneColor}
            </div>
            <div
              className="text-lg font-semibold opacity-90"
              style={{ color: textColor }}
            >
              ⚠️ Cuidado con el carril trampa
            </div>
          </div>
        </>
      );
    }

    if (mindshiftPhase === 3) {
      // Phase 3: Classify as positive or negative
      const isPositive = currentWasteItem.name === "POSITIVO";
      return (
        <>
          <div className="text-7xl filter drop-shadow-sm leading-none">
            {currentWasteItem.emoji}
          </div>
          <div className="flex flex-col gap-0.5">
            <div
              className="text-sm font-bold uppercase tracking-widest opacity-90"
              style={{ color: textColor }}
            >
              FASE 3 · CLASIFICA LA EMOCIÓN
            </div>
            <div
              className="text-2xl font-black leading-none"
              style={{ color: textColor }}
            >
              {isPositive ? "😊 POSITIVO" : "😡 NEGATIVO"}
            </div>
            <div
              className="text-lg font-semibold opacity-90"
              style={{ color: textColor }}
            >
              {isPositive
                ? "Ve al carril verde (izquierda)"
                : "Ve al carril rojo (derecha)"}
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  // --- Garbage mode card content ---
  const renderGarbageCard = () => (
    <>
      <div className="text-5xl filter drop-shadow-sm">
        {currentWasteItem.emoji}
      </div>
      <div className="flex flex-col">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-widest opacity-70">
          CLASIFICA:
        </div>
        <div className="text-2xl font-black text-slate-900 drop-shadow-sm leading-none">
          {currentWasteItem.name}
        </div>
      </div>
    </>
  );

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
      {/* Active Waste Card (TOP CENTER) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWasteItem.id}
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="px-8 py-4 rounded-2xl shadow-xl flex items-center gap-5 transition-colors duration-300"
            style={{
              backgroundColor: bgColor,
              border: `4px solid ${borderColor}`,
              boxShadow: `0 8px 32px ${borderColor}88`,
            }}
          >
            {gameMode === "mindshift"
              ? renderMindshiftCard()
              : gameMode === "english"
                ? renderEnglishCard()
                : renderGarbageCard()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MindShift Phase Indicator */}
      {gameMode === "mindshift" && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <div className="flex gap-2">
            {[1, 2, 3].map((p) => (
              <div
                key={p}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md transition-all duration-300"
                style={{
                  backgroundColor:
                    p === mindshiftPhase ? "#7c3aed" : "rgba(255,255,255,0.25)",
                  color:
                    p === mindshiftPhase ? "#fff" : "rgba(255,255,255,0.6)",
                  border:
                    p === mindshiftPhase
                      ? "2px solid #a78bfa"
                      : "2px solid rgba(255,255,255,0.2)",
                  transform: p === mindshiftPhase ? "scale(1.2)" : "scale(1)",
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Bar: Score & Lives (Sides) */}
      <div className="flex justify-between items-start w-full">
        {/* Lives Top Left */}
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: i < lives ? 1 : 0.8,
                opacity: i < lives ? 1 : 0.3,
              }}
              className="text-4xl filter drop-shadow-lg"
            >
              ❤️
            </motion.div>
          ))}
        </div>

        {/* Score & Pause Group */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-lg border-2 border-slate-200">
            <span className="text-2xl font-black text-slate-700 font-mono">
              {score.toString().padStart(4, "0")}
            </span>
          </div>

          <button
            onClick={() => useGameStore.getState().togglePause()}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors border-2 border-white/50 shadow-sm"
            title="Pausar (Espacio)"
          >
            <span className="text-2xl">⏸️</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Lane color helpers ----
function getPastelColor(color: string) {
  switch (color) {
    case "green":
      return "rgba(34, 197, 94, 0.92)";
    case "blue":
      return "rgba(59, 130, 246, 0.92)";
    case "yellow":
      return "rgba(234, 179, 8, 0.95)";
    case "red":
      return "rgba(239, 68, 68, 0.92)";
    default:
      return "rgba(241, 245, 249, 0.95)";
  }
}

function getBorderColor(color: string) {
  switch (color) {
    case "green":
      return "#86efac";
    case "blue":
      return "#93c5fd";
    case "yellow":
      return "#fde047";
    case "red":
      return "#fca5a5";
    default:
      return "#cbd5e1";
  }
}

function getTextColor(color: string) {
  // Yellow is light, needs dark text; others are dark enough for white
  switch (color) {
    case "yellow":
      return "#1e1b4b";
    default:
      return "#ffffff";
  }
}

function getLaneTagColor(color: string) {
  switch (color) {
    case "green":
      return "#22c55e";
    case "blue":
      return "#3b82f6";
    case "yellow":
      return "#eab308";
    case "red":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
}
