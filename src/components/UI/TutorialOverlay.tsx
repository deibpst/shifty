import React from 'react';
import { useGameStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';

const TUTORIAL_STEPS = [
    {
        step: 1,
        title: "MEET YOUR CHARACTER",
        content: "¡Hola! Este eres tú. Tu objetivo es avanzar y limpiar el camino.",
        highlightClass: "bottom-1/4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full",
    },
    {
        step: 2,
        title: "THE OBJECTIVE",
        content: "Presta atención aquí. Este es el residuo que debes clasificar y el color del contenedor que debes buscar.",
        highlightClass: "top-4 left-1/2 -translate-x-1/2 w-64 h-32 rounded-3xl",
    },
    {
        step: 3,
        title: "CONTROLS",
        content: "Usa las teclas A, S, D, F para moverte entre los carriles (Verde, Azul, Amarillo, Rojo).",
        // Center overlay, no specific highlight needed or maybe center
        highlightClass: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 rounded-2xl",
    },
    {
        step: 4,
        title: "SCORE POINTS",
        content: "¡Acierta el contenedor correcto y ganarás puntos para desbloquear nuevos personajes!",
        highlightClass: "top-4 right-4 w-32 h-16 rounded-full",
    },
    {
        step: 5,
        title: "WATCH YOUR LIVES",
        content: "Cuidado con los obstáculos y los contenedores equivocados, o perderás vidas. ¡Si pierdes 3, se acaba el juego!",
        highlightClass: "top-4 left-4 w-48 h-16 rounded-full",
    }
];

export const TutorialOverlay: React.FC = () => {
    const { tutorialStep, nextTutorialStep, skipTutorial, completeTutorial } = useGameStore();
    const currentStepData = TUTORIAL_STEPS.find(s => s.step === tutorialStep);

    if (!currentStepData) return null;

    const handleNext = () => {
        if (tutorialStep === TUTORIAL_STEPS.length) {
            completeTutorial();
        } else {
            nextTutorialStep();
        }
    };

    return (
        <div className="absolute inset-0 z-50 overflow-hidden">
            {/* Dark Background with Masking for Spotlight */}
            {/* 
                Doing a true CSS clip-path spotlight is tricky with dynamic positions. 
                Instead, we can use a composite approach or just a simple overlay with a "hole" visual 
                using box-shadow which is a common trick. 
            */}
            <div className="absolute inset-0 transition-all duration-500 ease-in-out"
                style={{
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
                    // We need to position this div exactly where the highlight is
                    // This is a bit hacky for "highlightClasses". 
                    // Better approach: Full screen overlay with a transparent hole.
                    // Let's try the box-shadow trick on a positioned create element.
                }}
            >
                {/* 
                  Actually, the box-shadow trick requires the element to be positioned *at* the target.
                  Let's render a localized div based on currentStepData.highlightClass 
               */}
            </div>

            {/* The Spotlight Element */}
            <div
                className={`absolute transition-all duration-500 ease-in-out border-4 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] ${currentStepData.highlightClass || ''}`}
            />

            {/* Content Card - Always centered-ish but maybe offset to avoid covering the spotlight? 
                Let's keep it simple: Center or Bottom-Center usually works.
            */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tutorialStep}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center"
                >
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">
                        STEP {tutorialStep} / {TUTORIAL_STEPS.length}
                    </h3>
                    <h2 className="text-3xl font-black text-slate-800 mb-4">
                        {currentStepData.title}
                    </h2>
                    <p className="text-slate-600 text-lg font-medium mb-8 leading-relaxed">
                        {currentStepData.content}
                    </p>

                    {/* Step 3 Special Visual: Keyboard logic */}
                    {tutorialStep === 3 && (
                        <div className="flex justify-center gap-2 mb-8">
                            {['A', 'S', 'D', 'F'].map((key, i) => (
                                <div key={key} className={`w-12 h-12 rounded-lg border-b-4 flex items-center justify-center font-bold text-slate-700
                                    ${i === 0 ? 'bg-green-100 border-green-300' : ''}
                                    ${i === 1 ? 'bg-blue-100 border-blue-300' : ''}
                                    ${i === 2 ? 'bg-yellow-100 border-yellow-300' : ''}
                                    ${i === 3 ? 'bg-red-100 border-red-300' : ''}
                                `}>
                                    {key}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={skipTutorial}
                            className="px-6 py-3 rounded-full text-slate-400 font-bold hover:text-slate-600 transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-10 py-3 rounded-full bg-slate-900 text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            {tutorialStep === TUTORIAL_STEPS.length ? "Let's Play!" : 'Next'}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
