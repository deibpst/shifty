import { useEffect } from 'react';
import { GameScene } from './components/GameScene';
import { HUD } from './components/UI/HUD';
import { InstructionsModal } from './components/UI/InstructionsModal';
import { MainMenu } from './components/UI/MainMenu';
import { Customizer } from './components/UI/Customizer';
import { useGameStore } from './store';

import { TutorialOverlay } from './components/UI/TutorialOverlay';

function App() {
    const setLane = useGameStore((state) => state.setLane);
    const setGameStatus = useGameStore((state) => state.setGameStatus);
    const gameStatus = useGameStore((state) => state.gameStatus);

    // Initial mount check
    useEffect(() => {
        // Ensure we start at menu
        setGameStatus('menu');
    }, [setGameStatus]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

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
    }, [setLane, gameStatus]);

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

            {/* 0. TUTORIAL */}
            {gameStatus === 'tutorial' && <TutorialOverlay />}

            {/* 1. MAIN MENU */}
            {gameStatus === 'menu' && <MainMenu />}

            {/* 2. CUSTOMIZER */}
            {gameStatus === 'customizing' && <Customizer />}

            {/* 3. INSTRUCTIONS MODAL */}
            {gameStatus === 'instructions' && (
                <InstructionsModal />
            )}

            {/* 4. GAME OVER */}
            {gameStatus === 'gameover' && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md">
                    <h2 className="text-6xl font-black text-white mb-4">GAME OVER</h2>
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center mb-8">
                        <p className="text-slate-500 text-sm uppercase tracking-bold font-bold mb-2">FINAL SCORE</p>
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
                            MENU
                        </button>

                        <button
                            onClick={handleShowInstructions}
                            className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black py-4 px-10 rounded-full text-xl shadow-lg transition-transform hover:scale-105"
                        >
                            TRY AGAIN
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
