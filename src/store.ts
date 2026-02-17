import { create } from 'zustand';
import { DifficultyLevel, DIFFICULTY_CONFIG, WasteItem } from './types';

interface GameState {
    score: number;
    lives: number;
    currentLane: number; // 0-indexed
    gameStatus: 'menu' | 'instructions' | 'playing' | 'paused' | 'gameover' | 'customizing' | 'tutorial';
    difficulty: DifficultyLevel;
    speedMultiplier: number;
    playerColor: string;

    currentWasteItem: WasteItem | null;

    // Tutorial State
    hasSeenTutorial: boolean;
    tutorialStep: number;

    // Actions
    startGame: () => void;
    setDifficulty: (level: DifficultyLevel) => void;
    setPlayerColor: (color: string) => void;
    moveLane: (direction: 'left' | 'right') => void;
    setLane: (laneIndex: number) => void;
    processCollision: (isCorrect: boolean) => void;
    resetGame: () => void;
    setGameStatus: (status: 'menu' | 'instructions' | 'playing' | 'paused' | 'gameover' | 'customizing' | 'tutorial') => void;
    randomizeWaste: () => void;

    // Tutorial Actions
    startTutorial: () => void;
    nextTutorialStep: () => void;
    completeTutorial: () => void;
    skipTutorial: () => void;
}

const INITIAL_LIVES = 3;
const INITIAL_SPEED = 0.6;
const SPEED_INCREMENT = 0.05;

// Updated Waste Data with 4 Categories and Emojis
const WASTE_ITEMS: WasteItem[] = [
    // Green (Organic)
    { id: '1', name: 'Cáscara de Plátano', type: 'organic', correctLaneColor: 'green', emoji: '🍌' },
    { id: '2', name: 'Corazón de Manzana', type: 'organic', correctLaneColor: 'green', emoji: '🍎' },
    { id: '101', name: 'Cáscara de Huevo', type: 'organic', correctLaneColor: 'green', emoji: '🥚' },
    { id: '102', name: 'Espina de Pescado', type: 'organic', correctLaneColor: 'green', emoji: '🐟' },
    { id: '103', name: 'Cáscara de Sandía', type: 'organic', correctLaneColor: 'green', emoji: '🍉' },
    { id: '104', name: 'Hojas Secas', type: 'organic', correctLaneColor: 'green', emoji: '🍂' },
    { id: '105', name: 'Restos de Zanahoria', type: 'organic', correctLaneColor: 'green', emoji: '🥕' },
    { id: '106', name: 'Corteza de Pan', type: 'organic', correctLaneColor: 'green', emoji: '🍞' },

    // Blue (Paper/Plastic)
    { id: '3', name: 'Periódico', type: 'paper_plastic', correctLaneColor: 'blue', emoji: '📰' },
    { id: '4', name: 'Botella de Agua', type: 'paper_plastic', correctLaneColor: 'blue', emoji: '💧' },
    { id: '201', name: 'Envoltura de Galletas', type: 'paper_plastic', correctLaneColor: 'blue', emoji: '🍪' },
    { id: '202', name: 'Cartón de Leche', type: 'paper_plastic', correctLaneColor: 'blue', emoji: '🥛' },
    { id: '203', name: 'Caja de Cartón', type: 'paper_plastic', correctLaneColor: 'blue', emoji: '📦' },
    { id: '204', name: 'Bolsa de Compras', type: 'paper_plastic', correctLaneColor: 'blue', emoji: '🛍️' },
    { id: '205', name: 'Envase de Yogur', type: 'paper_plastic', correctLaneColor: 'blue', emoji: '🥣' },
    { id: '206', name: 'Hoja de Papel', type: 'paper_plastic', correctLaneColor: 'blue', emoji: '📝' },

    // Yellow (Metal/PET) - Note: In some systems PET is plastic, but following user request grouping
    { id: '5', name: 'Lata de Refresco', type: 'metal_pet', correctLaneColor: 'yellow', emoji: '🥤' },
    { id: '6', name: 'Lata de Sopa', type: 'metal_pet', correctLaneColor: 'yellow', emoji: '🥫' },
    { id: '301', name: 'Lata de Atún', type: 'metal_pet', correctLaneColor: 'yellow', emoji: '🐟' },
    { id: '302', name: 'Papel Aluminio', type: 'metal_pet', correctLaneColor: 'yellow', emoji: '🌯' },
    { id: '303', name: 'Tapa de Botella', type: 'metal_pet', correctLaneColor: 'yellow', emoji: '🔘' },
    { id: '304', name: 'Lata de Pintura (Spray)', type: 'metal_pet', correctLaneColor: 'yellow', emoji: '🎨' },
    { id: '305', name: 'Herramientas', type: 'metal_pet', correctLaneColor: 'yellow', emoji: '🔧' },
    { id: '306', name: 'Tubería de Metal', type: 'metal_pet', correctLaneColor: 'yellow', emoji: '🔩' },

    // Red (Hazardous/Various)
    { id: '7', name: 'Pila AA', type: 'hazardous', correctLaneColor: 'red', emoji: '🔋' },
    { id: '8', name: 'Bombilla', type: 'hazardous', correctLaneColor: 'red', emoji: '💡' },
    { id: '401', name: 'Jeringa', type: 'hazardous', correctLaneColor: 'red', emoji: '💉' },
    { id: '402', name: 'Pastillas', type: 'hazardous', correctLaneColor: 'red', emoji: '💊' },
    { id: '403', name: 'Bote de Pintura', type: 'hazardous', correctLaneColor: 'red', emoji: '🖌️' },
    { id: '404', name: 'Termómetro', type: 'hazardous', correctLaneColor: 'red', emoji: '🌡️' },
    { id: '405', name: 'Teléfono Móvil', type: 'hazardous', correctLaneColor: 'red', emoji: '📱' },
    { id: '406', name: 'Insecticida', type: 'hazardous', correctLaneColor: 'red', emoji: '🦟' },
];

export const useGameStore = create<GameState>((set, get) => ({
    score: 0,
    lives: INITIAL_LIVES,
    currentLane: 0,
    gameStatus: 'menu',
    difficulty: 'hard', // Default to hard to show all 4 lanes as requested
    speedMultiplier: INITIAL_SPEED,
    currentWasteItem: null,
    playerColor: '#FFA500', // Default Orange

    // Tutorial Init
    hasSeenTutorial: localStorage.getItem('shifty_tutorial_seen') === 'true',
    tutorialStep: 0,

    setPlayerColor: (color) => set({ playerColor: color }),

    startGame: () => {
        const { difficulty } = get();
        const config = DIFFICULTY_CONFIG[difficulty];
        const startLane = Math.floor(config.laneCount / 2);

        const randomWaste = WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];

        set({
            gameStatus: 'playing',
            score: 0,
            lives: INITIAL_LIVES,
            speedMultiplier: INITIAL_SPEED,
            currentLane: startLane,
            currentWasteItem: randomWaste,
        });
    },

    setDifficulty: (level) => {
        const config = DIFFICULTY_CONFIG[level];
        const startLane = Math.floor(config.laneCount / 2);
        set({
            difficulty: level,
            currentLane: startLane
        });
    },

    moveLane: (direction) => {
        const { gameStatus, currentLane, difficulty } = get();
        if (gameStatus !== 'playing' && gameStatus !== 'tutorial') return; // Allow movement in tutorial if needed, or maybe not? 
        // Request says paused, but maybe we want them to test controls? 
        // "Step 3: ... Use keys ...". 
        // If game is paused, they can't move? 
        // "if gameStatus === 'tutorial', the game must be PAUSED (objects do not advance and player cannot lose lives)."
        // This usually implies update loop is paused, but controls might work?
        // Let's assume controls work but world is static for now, or we'll handle it in GameScene.

        if (gameStatus === 'tutorial' && get().tutorialStep !== 3) return; // Only move in step 3? Or always? Let's allow if tutorial.

        const config = DIFFICULTY_CONFIG[difficulty];
        const maxLaneIndex = config.laneCount - 1;
        let newLane = currentLane;

        if (direction === 'left') {
            newLane = Math.max(0, currentLane - 1);
        } else if (direction === 'right') {
            newLane = Math.min(maxLaneIndex, currentLane + 1);
        }

        if (newLane !== currentLane) {
            set({ currentLane: newLane });
        }
    },

    setLane: (laneIndex) => {
        const { gameStatus, difficulty } = get();
        if (gameStatus !== 'playing' && gameStatus !== 'tutorial') return;

        const config = DIFFICULTY_CONFIG[difficulty];
        if (laneIndex >= 0 && laneIndex < config.laneCount) {
            set({ currentLane: laneIndex });
        }
    },

    processCollision: (isCorrect) => {
        const { lives, score, speedMultiplier, gameStatus } = get();

        if (gameStatus === 'tutorial') return; // No collision processing in tutorial

        if (isCorrect) {
            const newScore = score + 1;
            const newSpeed = Math.min(2.0, speedMultiplier + SPEED_INCREMENT); // Cap speed
            const randomWaste = WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];

            set({
                score: newScore,
                speedMultiplier: newSpeed,
                currentWasteItem: randomWaste
            });
        } else {
            const newLives = lives - 1;
            if (newLives <= 0) {
                set({
                    lives: 0,
                    gameStatus: 'gameover'
                });
            } else {
                set({ lives: newLives });
            }
        }
    },

    resetGame: () => {
        set({
            gameStatus: 'menu',
            score: 0,
            lives: INITIAL_LIVES,
            speedMultiplier: INITIAL_SPEED,
            currentWasteItem: null
        });
    },

    setGameStatus: (status) => set({ gameStatus: status }),

    randomizeWaste: () => {
        const randomWaste = WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];
        set({ currentWasteItem: randomWaste });
    },

    // Tutorial Implementation
    startTutorial: () => {
        const { difficulty } = get();
        const config = DIFFICULTY_CONFIG[difficulty];
        const startLane = Math.floor(config.laneCount / 2);

        // Ensure we have a waste item for display purposes
        const randomWaste = WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];

        set({
            gameStatus: 'tutorial',
            tutorialStep: 1,
            score: 0,
            lives: INITIAL_LIVES,
            currentLane: startLane,
            currentWasteItem: randomWaste
        });
    },

    nextTutorialStep: () => {
        set((state) => ({ tutorialStep: state.tutorialStep + 1 }));
    },

    completeTutorial: () => {
        localStorage.setItem('shifty_tutorial_seen', 'true');
        set({ hasSeenTutorial: true });
        get().startGame();
    },

    skipTutorial: () => {
        localStorage.setItem('shifty_tutorial_seen', 'true');
        set({ hasSeenTutorial: true });
        get().startGame();
    }
}));
