
import React, { Suspense, useRef } from 'react';
import { useGameStore } from '../../store';
import { motion } from 'framer-motion';
import { AVAILABLE_CHARACTERS } from '../../data/CharacterData';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';

const CharacterPreview = ({ Component }: { Component: any }) => {
    const ref = useRef<any>();
    useFrame((_state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.5; // Auto rotate
        }
    });

    return (
        <group ref={ref} position={[0, -1, 0]}>
            <Component currentAction="Idle" />
        </group>
    );
};

export const Customizer: React.FC = () => {
    const setGameStatus = useGameStore((state) => state.setGameStatus);
    const selectedCharacterId = useGameStore((state) => state.selectedCharacterId);
    const setSelectedCharacter = useGameStore((state) => state.setSelectedCharacter);
    const totalScore = useGameStore((state) => state.totalAccumulatedScore);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pt-10">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col relative overflow-hidden border border-white/50"
            >
                {/* Header Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-10" />

                <button
                    onClick={() => setGameStatus('menu')}
                    className="absolute top-6 left-6 p-3 bg-white/50 backdrop-blur-md rounded-full text-slate-700 hover:bg-white hover:text-slate-900 transition-all shadow-lg group z-50"
                    aria-label="Back to Menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>

                <div className="text-center z-10 mb-4">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight">GALERÍA DE PERSONAJES</h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Puntuación Total Acumulada: <span className="text-violet-600 font-bold text-xl">{totalScore}</span>
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                        {AVAILABLE_CHARACTERS.map((char) => {
                            const isLocked = totalScore < char.requiredScore;
                            const isSelected = selectedCharacterId === char.id;

                            return (
                                <motion.div
                                    key={char.id}
                                    layout
                                    className={`relative rounded-3xl overflow-hidden border-4 transition-all duration-300 group
                                        ${isSelected ? 'border-violet-500 shadow-xl shadow-violet-200 scale-[1.02]' : 'border-slate-100 shadow-sm hover:border-violet-300'}
                                        ${isLocked ? 'grayscale opacity-70' : 'bg-gradient-to-b from-slate-50 to-white'}
                                    `}
                                >
                                    {/* 3D Preview Canvas */}
                                    <div className="h-48 w-full bg-slate-200/50 relative">
                                        <Canvas shadows dpr={[1, 2]}>
                                            <Suspense fallback={null}>
                                                <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
                                                <ambientLight intensity={0.7} />
                                                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                                                <CharacterPreview Component={char.Component} />
                                                <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                                                <Environment preset="city" />
                                            </Suspense>
                                        </Canvas>

                                        {/* Lock Overlay */}
                                        {isLocked && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
                                                <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/30 text-white">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-5 text-center">
                                        <h3 className="text-xl font-black text-slate-800 mb-1">{char.name}</h3>
                                        <p className="text-sm text-slate-500 mb-4 h-10 leading-tight flex items-center justify-center">
                                            {char.description}
                                        </p>

                                        {isLocked ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-full text-slate-500 font-bold text-sm">
                                                <span>Necesitas {char.requiredScore} pts</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedCharacter(char.id)}
                                                disabled={isSelected}
                                                className={`w-full py-3 rounded-xl font-bold transition-all transform active:scale-95
                                                    ${isSelected
                                                        ? 'bg-violet-600 text-white shadow-lg cursor-default'
                                                        : 'bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50'}
                                                `}
                                            >
                                                {isSelected ? 'SELECCIONADO' : 'SELECCIONAR'}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
