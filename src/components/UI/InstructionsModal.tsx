import React from 'react';
import { useGameStore } from '../../store';
import { motion } from 'framer-motion';

export const InstructionsModal: React.FC = () => {


    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-red-500" />

                <button
                    onClick={() => useGameStore.getState().setGameStatus('menu')}
                    className="absolute top-4 left-4 p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-all z-10"
                    aria-label="Back to Menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>

                <h2 className="text-3xl font-black text-slate-800 mb-2 text-center mt-2">CÓMO JUGAR</h2>
                <p className="text-slate-500 text-center mb-8 font-medium">
                    ¡Ayuda a tu mascota a clasificar los residuos en los contenedores correctos!
                </p>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* CONTROLS */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">CONTROLES</h3>
                        <div className="space-y-3">
                            <ControlRow keyChar="A" color="green" label="Carril Verde" />
                            <ControlRow keyChar="S" color="blue" label="Carril Azul" />
                            <ControlRow keyChar="D" color="yellow" label="Carril Amarillo" />
                            <ControlRow keyChar="F" color="red" label="Carril Rojo" />
                        </div>
                        <p className="mt-4 text-xs text-slate-400 text-center">O usa las Flechas</p>
                    </div>

                    {/* LEGEND */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">GUÍA DE RESIDUOS</h3>
                        <div className="space-y-3">
                            <LegendRow color="green" label="Orgánico" desc="Comida, Cáscaras" />
                            <LegendRow color="blue" label="Papel/Plástico" desc="Botellas, Periódico" />
                            <LegendRow color="yellow" label="Metal/PET" desc="Latas" />
                            <LegendRow color="red" label="Peligrosos" desc="Pilas" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => {
                            useGameStore.getState().startTutorial();
                        }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-lg font-bold py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <span>🎬</span>
                        VOLVER A VER EL TUTORIAL
                    </button>

                    <button
                        onClick={() => {
                            const { hasSeenTutorial, startTutorial, startGame } = useGameStore.getState();
                            if (!hasSeenTutorial) {
                                startTutorial();
                            } else {
                                startGame();
                            }
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold py-4 px-12 rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-95"
                    >
                        ¡ENTENDIDO, A CLASIFICAR!
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const ControlRow = ({ keyChar, color, label }: { keyChar: string, color: string, label: string }) => (
    <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-white border-b-4 border-slate-200 flex items-center justify-center font-black text-slate-700 shadow-sm`}>
            {keyChar}
        </div>
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${color}-500 shadow-[0_0_10px_rgba(0,0,0,0.2)]`} style={{ backgroundColor: getColorHex(color) }} />
            <span className="text-sm font-bold text-slate-600">{label}</span>
        </div>
    </div>
);

const LegendRow = ({ color, label, desc }: { color: string, label: string, desc: string }) => (
    <div className="flex items-center gap-3">
        <div className={`w-3 h-full min-h-[2rem] rounded-full bg-${color}-500`} style={{ backgroundColor: getColorHex(color) }} />
        <div>
            <div className="text-sm font-bold text-slate-700">{label}</div>
            <div className="text-xs text-slate-400">{desc}</div>
        </div>
    </div>
);

function getColorHex(color: string) {
    switch (color) {
        case 'green': return '#22c55e';
        case 'blue': return '#3b82f6';
        case 'yellow': return '#eab308';
        case 'red': return '#ef4444';
        default: return '#94a3b8';
    }
}
