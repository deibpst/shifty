import React from "react";
import { useGameStore } from "../../store";
import { motion, AnimatePresence } from "framer-motion";

export const HUD: React.FC = () => {
  const { score, lives, currentWasteItem, gameMode } =
    useGameStore();

  if (!currentWasteItem) return null;

  const laneColor = currentWasteItem.correctLaneColor;
  const cardStylingColor = (gameMode === "mindshift" && currentWasteItem.mindshiftCardColor)
    ? currentWasteItem.mindshiftCardColor
    : laneColor;

  const bgColor = getPastelColor(cardStylingColor);
  const borderColor = getBorderColor(cardStylingColor);
  const textColor = getTextColor(cardStylingColor);

  const renderEnglishCard = () => {
    // Las opciones están guardadas como JSON en mindshiftEmotion
    const options: string[] = currentWasteItem.mindshiftEmotion
      ? JSON.parse(currentWasteItem.mindshiftEmotion)
      : [];

    return (
      <>
        <div className="text-9xl filter drop-shadow-sm leading-none">
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
            className="text-4xl font-black leading-tight"
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
    // Mindshift is now only Phase 2: Go to the correct color lane (with distractor)
    const colorNames: Record<string, string> = {
      green: "VERDE",
      blue: "AZUL",
      yellow: "AMARILLO",
      red: "ROJO",
    };
    return (
      <div className="flex flex-col gap-0.5 items-center text-center">
        <div
          className="text-sm font-bold uppercase tracking-widest opacity-90"
          style={{ color: textColor }}
        >
          MINDSHIFT · CONTROL DE IMPULSOS
        </div>
        <div
          className="text-4xl font-black leading-tight"
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
    );
  };

  // --- Garbage mode card content ---
  const renderGarbageCard = () => (
    <>
      <div className="text-9xl filter drop-shadow-sm">
        {currentWasteItem.emoji}
      </div>
      <div className="flex flex-col items-center text-center">
        <div
          className="text-sm font-bold uppercase tracking-widest opacity-90"
          style={{ color: textColor }}
        >
          CLASIFICA:
        </div>
        <div
          className="text-4xl font-black drop-shadow-sm leading-tight"
          style={{ color: textColor }}
        >
          {currentWasteItem.name}
        </div>
      </div>
    </>
  );
  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
      {/* Active Waste Card (TOP CENTER) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWasteItem.id}
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="px-10 py-6 rounded-3xl shadow-2xl inline-flex items-center justify-center gap-8 transition-colors duration-300"
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

      {/* MindShift Phase Indicator removed as it's a single-phase mode now */}

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
      return "#15803d";
    case "blue":
      return "#1d4ed8";
    case "yellow":
      return "#a16207";
    case "red":
      return "#b91c1c";
    default:
      return "#475569";
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
