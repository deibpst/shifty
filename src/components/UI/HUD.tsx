import React from 'react';
import { useGameStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';

export const HUD: React.FC = () => {
    const { score, lives, currentWasteItem, difficulty } = useGameStore();

    if (!currentWasteItem) return null;

    const laneColor = currentWasteItem.correctLaneColor;
    const bgColor = getPastelColor(laneColor);
    const borderColor = getBorderColor(laneColor);

    return (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">

            {/* Active Waste Card (TOP CENTER) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentWasteItem.id}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="px-8 py-4 rounded-2xl shadow-lg flex items-center gap-6 transition-colors duration-300"
                        style={{
                            backgroundColor: bgColor,
                            border: `4px solid ${borderColor}`
                        }}
                    >
                        {/* Icon - Emoji */}
                        <div className="text-5xl filter drop-shadow-sm">
                            {currentWasteItem.emoji}
                        </div>

                        <div className="flex flex-col">
                            <div className="text-xs font-bold text-slate-800 uppercase tracking-widest opacity-70">
                                FIND THIS LANE
                            </div>
                            <div className="text-2xl font-black text-slate-900 drop-shadow-sm leading-none">
                                {currentWasteItem.name}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Top Bar: Score & Lives (Sides) */}
            <div className="flex justify-between items-start w-full">
                {/* Lives Top Left */}
                <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{ scale: i < lives ? 1 : 0.8, opacity: i < lives ? 1 : 0.3 }}
                            className="text-4xl filter drop-shadow-lg"
                        >
                            ❤️
                        </motion.div>
                    ))}
                </div>

                {/* Score Top Right */}
                <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-lg border-2 border-slate-200">
                    <span className="text-2xl font-black text-slate-700 font-mono">
                        {score.toString().padStart(4, '0')}
                    </span>
                </div>
            </div>

            {/* Debug Info */}
            <div className="absolute bottom-2 right-2 text-xs text-black/30 font-mono">
                Diff: {difficulty}
            </div>
        </div>
    );
};

function getPastelColor(color: string) {
    switch (color) {
        case 'green': return '#A2E4B8';
        case 'blue': return '#AEC6CF';
        case 'yellow': return '#FDFD96';
        case 'red': return '#FFB3BA';
        default: return '#f1f5f9';
    }
}

function getBorderColor(color: string) {
    switch (color) {
        case 'green': return '#86efac';
        case 'blue': return '#93c5fd';
        case 'yellow': return '#fde047';
        case 'red': return '#fca5a5';
        default: return '#cbd5e1';
    }
}
