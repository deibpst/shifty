import React from 'react';
import { useGameStore } from '../../store';
import { motion } from 'framer-motion';

const COLORS = [
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Black', hex: '#222222' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Pink', hex: '#FF69B4' },
    { name: 'Purple', hex: '#9370DB' },
];

export const Customizer: React.FC = () => {
    const setGameStatus = useGameStore((state) => state.setGameStatus);
    const setPlayerColor = useGameStore((state) => state.setPlayerColor);
    const playerColor = useGameStore((state) => state.playerColor);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-white/50"
            >
                <button
                    onClick={() => setGameStatus('menu')}
                    className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all shadow-lg group"
                    aria-label="Back to Menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>

                <h2 className="text-4xl font-black text-slate-800 mb-8">ELIGE TU ESTILO</h2>

                <div className="flex justify-center flex-wrap gap-4 mb-10">
                    {COLORS.map((color) => (
                        <motion.button
                            key={color.name}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setPlayerColor(color.hex)}
                            className={`w-16 h-16 rounded-full shadow-lg border-4 transition-all ${playerColor === color.hex ? 'border-blue-500 scale-110' : 'border-white'}`}
                            style={{ backgroundColor: color.hex }}
                            aria-label={color.name}
                        />
                    ))}
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGameStatus('menu')}
                    className="bg-slate-800 text-white font-bold py-3 px-8 rounded-full text-lg shadow-xl"
                >
                    GUARDAR Y VOLVER
                </motion.button>
            </motion.div>
        </div>
    );
};
