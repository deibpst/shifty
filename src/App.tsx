import { useEffect } from 'react';
import { GameScene } from './components/GameScene';
import { HUD } from './components/UI/HUD';
import { InstructionsModal } from './components/UI/InstructionsModal';
import { MainMenu } from './components/UI/MainMenu';
import { Customizer } from './components/UI/Customizer';
import { useGameStore } from './store';

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
            if (gameStatus === 'playing') {
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
            {gameStatus === 'playing' && <HUD />}

            {/* --- OVERLAYS --- */}

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
                    <button
                        onClick={handleShowInstructions}
                        className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black py-4 px-10 rounded-full text-xl shadow-lg transition-transform hover:scale-105"
                    >
                        TRY AGAIN
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
