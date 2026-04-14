import { useEffect, useState } from 'react';
import { GameScene } from './components/GameScene';
import { HUD } from './components/UI/HUD';
import { InstructionsModal } from './components/UI/InstructionsModal';
import { MainMenu } from './components/UI/MainMenu';
import { Customizer } from './components/UI/Customizer';
import { CategorySelect } from './components/UI/CategorySelect';
import { useGameStore } from './store';

import { TutorialOverlay } from './components/UI/TutorialOverlay';

import { PauseMenu } from './components/UI/PauseMenu';

function App() {
    const setLane = useGameStore((state) => state.setLane);
    const setGameStatus = useGameStore((state) => state.setGameStatus);
    const gameStatus = useGameStore((state) => state.gameStatus);
    const togglePause = useGameStore((state) => state.togglePause);
    const gameMode = useGameStore((state) => state.gameMode);

    // PSI Code Support
    const [typedCode, setTypedCode] = useState('');
    const [showPSIReport, setShowPSIReport] = useState(false);

    // Initial mount check
    useEffect(() => {
        // Ensure we start at menu
        setGameStatus('menu');
        setShowPSIReport(false);
    }, [setGameStatus]);

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (gameStatus === 'gameover' && gameMode === 'mindshift') {
                const key = e.key.toLowerCase();
                setTypedCode(prev => {
                    const next = (prev + key).slice(-7); // 'psi2025' is 7 chars
                    if (next === 'psi2025') {
                        setShowPSIReport(true);
                    }
                    return next;
                });
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [gameStatus, gameMode]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            // GLOBAL CONTROLS
            if (key === ' ') {
                togglePause();
                return;
            }

            // GAMEPLAY CONTROLS
            // Allow controls in tutorial step 3
            const tutorialStep = useGameStore.getState().tutorialStep;

            if (gameStatus === 'playing' || (gameStatus === 'tutorial' && tutorialStep === 3)) {
                switch (key) {
                    case 'a': case 'arrowleft': setLane(0); break;
                    case 's': case 'arrowdown': setLane(1); break;
                    case 'd': case 'arrowup': setLane(2); break;
                    case 'f': case 'arrowright': setLane(3); break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setLane, gameStatus, togglePause]);

    const handleShowInstructions = () => {
        setGameStatus('instructions');
    }

    return (
        <div className="w-screen h-screen overflow-hidden relative select-none font-sans">
            {/* 3D SCENE BACKGROUND */}
            <GameScene />

            {/* HUD (Only visible when playing) */}
            {(gameStatus === 'playing' || gameStatus === 'tutorial') && <HUD />}

            {/* --- OVERLAYS --- */}

            {/* PAUSE MENU */}
            <PauseMenu />

            {/* 0. TUTORIAL */}
            {gameStatus === 'tutorial' && <TutorialOverlay />}

            {/* 1. MAIN MENU */}
            {gameStatus === 'menu' && <MainMenu />}

            {/* 1.5 CATEGORY SELECT */}
            {gameStatus === 'categorySelect' && <CategorySelect />}

            {/* 2. CUSTOMIZER */}
            {gameStatus === 'customizing' && <Customizer />}

            {/* 3. INSTRUCTIONS MODAL */}
            {gameStatus === 'instructions' && (
                <InstructionsModal />
            )}

            {/* 4. GAME OVER */}
            {gameStatus === 'gameover' && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md">
                    <h2 className="text-6xl font-black text-white mb-4">¡PARTIDA TERMINADA!</h2>
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center mb-8">
                        <p className="text-slate-500 text-sm uppercase tracking-bold font-bold mb-2">PUNTUACIÓN FINAL</p>
                        <p className="text-6xl font-mono font-black text-slate-800">
                            {useGameStore.getState().score}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setGameStatus('menu')}
                            className="bg-white hover:bg-gray-100 text-slate-900 font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            MENÚ
                        </button>

                        <button
                            onClick={handleShowInstructions}
                            className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black py-4 px-10 rounded-full text-xl shadow-lg transition-transform hover:scale-105"
                        >
                            REINTENTAR
                        </button>
                    </div>
                </div>
            )}

            {/* 5. PSI REPORT MODAL (Secret) */}
            {showPSIReport && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/95 p-8 overflow-auto">
                    <div className="bg-white rounded-3xl p-8 max-w-4xl w-full text-slate-800">
                        <h2 className="text-4xl font-black mb-6">Reporte Psicológico: MindShift</h2>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {useGameStore.getState().mindshiftStats.map((stat, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border-l-8 ${stat.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                    <div className="flex justify-between items-center font-bold">
                                        <span>Fase {stat.phase}</span>
                                        <span>{stat.isCorrect ? 'ACIERTO' : 'ERROR'}</span>
                                    </div>
                                    <div className="text-sm mt-2 grid grid-cols-2 gap-4">
                                        <div><strong>Tiempo de Reacción:</strong> {stat.reactionTime}ms</div>
                                        <div><strong>Estímulo:</strong> {stat.emotion}</div>
                                        {stat.phase === 2 && <div><strong>¿Cayó en trampa visual?:</strong> {stat.choseDistractor ? 'Sí' : 'No'}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => setShowPSIReport(false)} 
                            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-full transition-transform hover:scale-105"
                        >
                            Cerrar Reporte
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
