import React from "react";
import { useGameStore } from "../../store";
import { AnimatePresence, motion } from "framer-motion";

export const PauseMenu: React.FC = () => {
  const { isPaused, togglePause, setGameStatus } = useGameStore();

  const handleExit = () => {
    togglePause(); // Unpause
    setGameStatus("menu");
  };

  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white/95 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
          >
            {/* Decorative background blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

            <div className="relative z-10">
              <div className="text-7xl mb-4 inline-block bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-4 shadow-inner">
                ⏸️
              </div>
              <h2 className="text-5xl font-black mb-2 tracking-tight bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                ¡PAUSA!
              </h2>
              <p className="text-slate-600 font-semibold mb-8 text-lg">
                Tómate un respiro
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={togglePause}
                  className="w-full py-4 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-2xl font-black text-xl border-4 border-green-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>▶</span> REANUDAR
                </button>

                <button
                  onClick={handleExit}
                  className="w-full py-4 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white rounded-2xl font-black text-xl border-4 border-red-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  🏠 MENÚ PRINCIPAL
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
