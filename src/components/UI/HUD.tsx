import React from 'react';
import { useGameStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';

export const HUD: React.FC = () => {
    const { score, lives, currentWasteItem, difficulty } = useGameStore();

    return (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">

            {/* Active Waste Card (TOP CENTER) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
                <AnimatePresence mode="wait">
                    {currentWasteItem && (
                        <motion.div
                            key={currentWasteItem.id}
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-white/40 backdrop-blur-md px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-6"
                            style={{
                                boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.2), 0 0 0 4px ${getColorHex(currentWasteItem.correctLaneColor)}`
                            }}
                        >
                            {/* Icon Placeholder */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-${currentWasteItem.correctLaneColor}-500 shadow-inner border-2 border-white`}>
                                🗑️
                            </div>

                            <div className="flex flex-col">
                                <div className="text-xs font-bold text-slate-800 uppercase tracking-widest opacity-80">
                                    FIND THIS LANE
                                </div>
                                <div className="text-2xl font-black text-slate-900 drop-shadow-sm leading-none">
                                    {currentWasteItem.name}
                                </div>
                            </div>
                        </motion.div>
                    )}
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
                            animate={{ scale: i < lives ? 1 : 0.5, opacity: i < lives ? 1 : 0.2 }}
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

// Helper for dynamic colors
function getColorHex(color: string) {
    switch (color) {
        case 'green': return '#22c55e';
        case 'blue': return '#3b82f6';
        case 'yellow': return '#eab308';
        case 'red': return '#ef4444';
        default: return '#94a3b8';
    }
}
