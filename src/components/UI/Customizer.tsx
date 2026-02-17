
import React, { Suspense, useRef, useState } from 'react';
import { useGameStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { AVAILABLE_CHARACTERS } from '../../data/CharacterData';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';

// --- THEME CONFIGURATION ---
const THEMES = [
    { name: 'green', bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-600', btn: 'bg-green-500 hover:bg-green-600 shadow-green-700', shadow: 'shadow-green-200' },
    { name: 'blue', bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600', btn: 'bg-blue-500 hover:bg-blue-600 shadow-blue-700', shadow: 'shadow-blue-200' },
    { name: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-600', btn: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-700', shadow: 'shadow-yellow-200' },
    { name: 'red', bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600', btn: 'bg-red-500 hover:bg-red-600 shadow-red-700', shadow: 'shadow-red-200' },
];

const CharacterPreview = ({ Component }: { Component: any }) => {
    const ref = useRef<any>();
    useFrame((_state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.5; // Auto rotate
        }
    });

    return (
        <group ref={ref} position={[0, -0.4, 0]}>
            <Component currentAction="Idle" />
        </group>
    );
};

export const Customizer: React.FC = () => {
    const setGameStatus = useGameStore((state) => state.setGameStatus);
    const selectedCharacterId = useGameStore((state) => state.selectedCharacterId);
    const setSelectedCharacter = useGameStore((state) => state.setSelectedCharacter);
    const totalScore = useGameStore((state) => state.totalAccumulatedScore);

    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 2;
    const totalPages = Math.ceil(AVAILABLE_CHARACTERS.length / itemsPerPage);

    // Calculate Indices
    const startIndex = currentPage * itemsPerPage;
    const visibleCharacters = AVAILABLE_CHARACTERS.slice(startIndex, startIndex + itemsPerPage);

    // Calculate next page for navigation
    const nextPage = (currentPage + 1) % totalPages;

    const handleNext = () => {
        setCurrentPage(nextPage);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
            <motion.div
                layout
                className="bg-white p-4 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col relative overflow-hidden border-2 border-slate-100"
            >
                {/* Header Decoration - Neutral */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-50 to-transparent opacity-50" />

                {/* Score Badge */}
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur px-4 py-1 rounded-full shadow-md border border-slate-100 z-20">
                    <p className="text-slate-500 font-bold text-xs">
                        PUNTOS: <span className="text-slate-800 text-base font-black">{totalScore}</span>
                    </p>
                </div>

                <div className="text-center z-10 mb-2 mt-3 shrink-0">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase drop-shadow-sm">
                        Galería
                    </h2>
                    <p className="text-slate-400 font-bold text-xs tracking-widest uppercase mt-1">
                        Página {currentPage + 1} de {totalPages}
                    </p>
                </div>

                {/* --- CHARACTER GRID --- */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-4">
                        <AnimatePresence mode='wait'>
                            {visibleCharacters.map((char, index) => {
                                const isLocked = totalScore < char.requiredScore;
                                const isSelected = selectedCharacterId === char.id;

                                // Fixed Theme: Index 0 = Green, Index 1 = Blue
                                const themeIndex = index === 0 ? 0 : 1;
                                const theme = THEMES[themeIndex];

                                return (
                                    <motion.div
                                        key={char.id}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 group bg-white
                                            ${isSelected
                                                ? `${theme.border} ${theme.shadow} shadow-lg scale-[1.01]`
                                                : 'border-slate-100 shadow-sm hover:border-slate-300'}
                                            ${isLocked ? 'grayscale opacity-70' : ''}
                                        `}
                                    >
                                        {/* 3D Preview */}
                                        <div className="h-40 w-full bg-slate-50 relative">
                                            <Canvas shadows dpr={[1, 2]}>
                                                <Suspense fallback={null}>
                                                    <PerspectiveCamera makeDefault position={[0, 1.2, 3.5]} fov={45} />
                                                    <ambientLight intensity={0.8} />
                                                    <spotLight position={[5, 10, 5]} intensity={1} castShadow />
                                                    <CharacterPreview Component={char.Component} />
                                                    <ContactShadows opacity={0.4} scale={10} blur={2.5} />
                                                    <Environment preset="city" />
                                                </Suspense>
                                            </Canvas>

                                            {/* Lock Icon */}
                                            {isLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/30 text-white">
                                                        🔒
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info & Action */}
                                        <div className={`p-4 text-center transition-colors duration-500 ${isSelected ? theme.bg : 'bg-white'}`}>
                                            <h3 className="text-lg font-black text-slate-800 mb-1">{char.name}</h3>
                                            <p className="text-xs text-slate-500 mb-3 min-h-[2rem] flex items-center justify-center font-medium leading-tight">
                                                {char.description}
                                            </p>

                                            {isLocked ? (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-lg text-slate-500 font-bold text-xs">
                                                    <span>🔒 {char.requiredScore} pts</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedCharacter(char.id)}
                                                    disabled={isSelected}
                                                    className={`w-full py-2.5 rounded-lg font-bold transition-all transform active:scale-95 text-sm
                                                        ${isSelected
                                                            ? `${theme.btn} text-white cursor-default shadow-[0_3px_0_rgba(0,0,0,0.2)]`
                                                            : `bg-white border-2 ${theme.border} ${theme.text} hover:bg-slate-50`}
                                                    `}
                                                >
                                                    {isSelected ? '¡LISTO!' : 'ELEGIR'}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* --- NAVIGATION FOOTER --- */}
                <div className="p-3 flex items-center justify-between gap-3 z-20 shrink-0 bg-white border-t border-slate-100">
                    {/* Back to Menu (Red) */}
                    <button
                        onClick={() => setGameStatus('menu')}
                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-base shadow-[0_3px_0_#991b1b] active:translate-y-1 active:shadow-none transition-all"
                    >
                        SALIR
                    </button>

                    {/* Next Page (Yellow) */}
                    <button
                        onClick={handleNext}
                        className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl font-bold text-base shadow-[0_3px_0_#ca8a04] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        <span>SIGUIENTE</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </div>

            </motion.div>
        </div>
    );
};
