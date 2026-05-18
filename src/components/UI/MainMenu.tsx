import React from "react";
import { useGameStore } from "../../store";
import { motion } from "framer-motion";
import { connectToSerial } from "../../hooks/useSerialController";

export const MainMenu: React.FC = () => {
  const setGameStatus = useGameStore((state) => state.setGameStatus);

  const handleCustomize = () => {
    setGameStatus("customizing");
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-center"
      >
        <h1 className="text-9xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-br from-orange-400 via-yellow-300 to-red-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] italic tracking-tighter transform -rotate-6">
          SHIFTY
        </h1>

        <div className="flex flex-col gap-6 items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setGameStatus("categorySelect");
            }}
            className="w-64 py-4 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white text-2xl font-black shadow-[0_0_20px_rgba(34,197,94,0.6)] border-4 border-green-800 active:scale-95 transition-all"
          >
            JUGAR
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCustomize}
            className="w-64 py-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white text-2xl font-black shadow-[0_0_20px_rgba(59,130,246,0.6)] border-4 border-blue-800 active:scale-95 transition-all"
          >
            PERSONALIZAR
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => connectToSerial()}
            className="w-64 py-4 mt-4 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 text-white text-xl font-black shadow-[0_0_20px_rgba(0,0,0,0.4)] border-4 border-slate-950 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            🔌 Conectar Mando USB
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
