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
                <h2 className="text-4xl font-black text-slate-800 mb-8">CHOOSE YOUR STYLE</h2>

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
                    SAVE & BACK
                </motion.button>
            </motion.div>
        </div>
    );
};
