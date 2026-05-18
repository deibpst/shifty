import React from "react";
import { useGameStore } from "../../store";
import { motion } from "framer-motion";

export const CategorySelect: React.FC = () => {
  const {
    setGameStatus,
    setGameMode,
    startTutorial,
    startGame,
    hasSeenTutorial,
  } = useGameStore();

  const handleGarbage = () => {
    setGameMode("garbage");
    if (!hasSeenTutorial) {
      startTutorial();
    } else {
      startGame();
    }
  };

  const handleMindShift = () => {
    setGameMode("mindshift");
    startGame(); // Directo a MindShift, podemos hacer un pequeño intro luego si es necesario
  };

  const handleEnglish = () => {
    setGameMode("english");
    startGame();
  };

  React.useEffect(() => {
    const handleSerial = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const button = customEvent.detail;

      if (button === "green") {
        handleGarbage();
      } else if (button === "blue" || button === "purple") {
        handleMindShift();
      } else if (button === "yellow") {
        handleEnglish();
      } else if (button === "red" || button === "orange") {
        setGameStatus("menu");
      }
    };

    window.addEventListener("serial:categorySelect", handleSerial);
    return () =>
      window.removeEventListener("serial:categorySelect", handleSerial);
  }, [handleGarbage, handleMindShift, setGameStatus]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-center w-full max-w-4xl px-4"
      >
        <h2 className="text-6xl font-black mb-12 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] italic tracking-tighter">
          ELIGE TU MISIÓN
        </h2>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
          {/* Tarjeta Recolección de Basura */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGarbage}
            className="flex-1 p-8 rounded-3xl bg-gradient-to-br from-green-400/90 to-emerald-600/90 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] border-4 border-white/50 backdrop-blur-sm flex flex-col items-center gap-4 group transition-all"
          >
            <div className="text-8xl group-hover:scale-110 transition-transform">
              ♻️
            </div>
            <h3 className="text-3xl font-black uppercase tracking-wide">
              Recolección de Basura
            </h3>
            <p className="text-white font-semibold text-lg drop-shadow-md">
              Limpia la ciudad clasificando residuos a toda velocidad.
            </p>
          </motion.button>

          {/* Tarjeta MindShift */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMindShift}
            className="flex-1 p-8 rounded-3xl bg-gradient-to-br from-blue-400/90 to-blue-600/90 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] border-4 border-white/50 backdrop-blur-sm flex flex-col items-center gap-4 group transition-all"
          >
            <div className="text-8xl group-hover:scale-110 transition-transform">
              🧠
            </div>
            <h3 className="text-3xl font-black uppercase tracking-wide">
              MindShift
            </h3>
            <p className="text-white font-semibold text-lg drop-shadow-md">
              Entrena tu mente, emociones y control de impulsos.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEnglish}
            className="flex-1 p-8 rounded-3xl bg-gradient-to-br from-yellow-400/90 to-orange-500/90 text-white shadow-[0_0_30px_rgba(234,179,8,0.4)] border-4 border-white/50 backdrop-blur-sm flex flex-col items-center gap-4 group transition-all"
          >
            <div className="text-8xl group-hover:scale-110 transition-transform">
              🔤
            </div>
            <h3 className="text-3xl font-black uppercase tracking-wide">
              English Basic
            </h3>
            <p className="text-white font-semibold text-lg drop-shadow-md">
              Relaciona emojis con su palabra correcta en inglés.
            </p>
          </motion.button>
        </div>

        <div className="mt-12">
          <button
            onClick={() => setGameStatus("menu")}
            className="px-8 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-colors border-2 border-red-400 shadow-[0_3px_0_#991b1b] active:translate-y-1 active:shadow-none"
          >
            VOLVER AL MENÚ
          </button>
        </div>
      </motion.div>
    </div>
  );
};
