import React from 'react';
import { useGameStore } from '../../store';
import { motion } from 'framer-motion';

export const MainMenu: React.FC = () => {
    const setGameStatus = useGameStore((state) => state.setGameStatus);



    const handleCustomize = () => {
        setGameStatus('customizing');
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-center"
            >
                <h1 className="text-9xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-br from-orange-400 via-yellow-300 to-red-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] italic tracking-tighter transform -rotate-6">
                    SHIFTY
                </h1>

                <div className="flex flex-col gap-6 items-center">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const { hasSeenTutorial, startTutorial, startGame } = useGameStore.getState();
                            // If user clicks play, we can either go to instructions (as previously mapped) 
                            // OR go directly to game/tutorial if they've seen instructions?
                            // User request: "Al darle "Jugar" desde el menú principal, verifica: if (!hasSeenTutorial) { startTutorial(); } else { startGame(); }."
                            // IMPORTANT: The previous flow was Menu -> Instructions -> Game.
                            // If we strictly follow "Menu -> Play -> Check Tutorial/Game", we bypass Instructions?
                            // Let's assume we want to guide them.

                            // IF we want to keep instructions as a step:
                            // setGameStatus('instructions'); 

                            // BUT request says: "Al darle "Jugar" ... verifica"
                            // So let's follow the request to verify.  

                            // However, point 4 says: "botón ... Volver a ver el Tutorial ... en la pantalla de Instrucciones".
                            // This implies the user CAN see instructions.

                            // Let's stick to the flow: Play -> Instructions -> Game/Tutorial?
                            // Or Play -> Game/Tutorial (and Instructions is separate?)

                            // Current `MainMenu.tsx` lines 8-12 mapped `handlePlay` to `setGameStatus('instructions')`.
                            // Let's change this to follow the NEW request logic directly on the Play button?
                            // "Al darle "Jugar" ... verifica: if (!hasSeenTutorial) ..."
                            // This implies skipping instructions if they hit Play?

                            // Wait, usually Instructions is a good "Ready?" screen.
                            // Let's compromise: If they haven't seen tutorial, Show Tutorial (which covers instructions).
                            // If they HAVE seen it, maybe show Instructions Modal as a "Ready" screen? 
                            // Or just start game.

                            if (!hasSeenTutorial) {
                                startTutorial();
                            } else {
                                // If they've seen it, maybe just start game or show instructions first?
                                // "else { startGame(); }" - User request is explicit.
                                startGame();
                            }
                        }}
                        className="w-64 py-4 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white text-2xl font-black shadow-[0_0_20px_rgba(34,197,94,0.6)] border-4 border-white/20"
                    >
                        PLAY
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCustomize}
                        className="w-64 py-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white text-2xl font-black shadow-[0_0_20px_rgba(59,130,246,0.6)] border-4 border-white/20"
                    >
                        CUSTOMIZE
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};
