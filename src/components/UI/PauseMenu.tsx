import React from 'react';
import { useGameStore } from '../../store';
import { AnimatePresence, motion } from 'framer-motion';

export const PauseMenu: React.FC = () => {
    const { isPaused, togglePause, setGameStatus } = useGameStore();

    const handleExit = () => {
        togglePause(); // Unpause
        setGameStatus('menu');
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
                            <div className="text-6xl mb-4">⏸️</div>
                            <h2 className="text-4xl font-black text-slate-700 mb-2 tracking-tight">
                                ¡Pausa!
                            </h2>
                            <p className="text-slate-400 font-medium mb-8 text-lg">
                                Tómate un respiro
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={togglePause}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-xl shadow-[0_4px_0_#059669] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>▶</span> REANUDAR
                                </button>

                                <button
                                    onClick={handleExit}
                                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg shadow-[0_4px_0_#991b1b] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
                                >
                                    <span></span> Menú Principal
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
