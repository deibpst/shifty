import { create } from 'zustand';
import { DifficultyLevel, DIFFICULTY_CONFIG, WasteItem } from './types';

interface GameState {
    score: number;
    lives: number;
    currentLane: number; // 0-indexed
    gameStatus: 'menu' | 'instructions' | 'playing' | 'paused' | 'gameover';
    difficulty: DifficultyLevel;
    speedMultiplier: number;

    currentWasteItem: WasteItem | null;

    // Actions
    startGame: () => void;
    setDifficulty: (level: DifficultyLevel) => void;
    moveLane: (direction: 'left' | 'right') => void;
    setLane: (laneIndex: number) => void;
    processCollision: (isCorrect: boolean) => void;
    resetGame: () => void;
    setGameStatus: (status: 'menu' | 'instructions' | 'playing' | 'paused' | 'gameover') => void;
    randomizeWaste: () => void;
}

const INITIAL_LIVES = 3;
const INITIAL_SPEED = 0.6;
const SPEED_INCREMENT = 0.05;

// Updated Waste Data with 4 Categories
const WASTE_ITEMS: WasteItem[] = [
    // Green (Organic)
    { id: '1', name: 'Banana Peel', type: 'organic', correctLaneColor: 'green' },
    { id: '2', name: 'Apple Core', type: 'organic', correctLaneColor: 'green' },
    // Blue (Paper/Plastic)
    { id: '3', name: 'Newspaper', type: 'paper_plastic', correctLaneColor: 'blue' },
    { id: '4', name: 'Water Bottle', type: 'paper_plastic', correctLaneColor: 'blue' },
    // Yellow (Metal/PET)
    { id: '5', name: 'Soda Can', type: 'metal_pet', correctLaneColor: 'yellow' },
    { id: '6', name: 'Soup Can', type: 'metal_pet', correctLaneColor: 'yellow' },
    // Red (Hazardous)
    { id: '7', name: 'Battery', type: 'hazardous', correctLaneColor: 'red' },
    { id: '8', name: 'Light Bulb', type: 'hazardous', correctLaneColor: 'red' },
];

export const useGameStore = create<GameState>((set, get) => ({
    score: 0,
    lives: INITIAL_LIVES,
    currentLane: 0,
    gameStatus: 'menu',
    difficulty: 'hard', // Default to hard to show all 4 lanes as requested
    speedMultiplier: INITIAL_SPEED,
    currentWasteItem: null,

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
        if (gameStatus !== 'playing') return;

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
        if (gameStatus !== 'playing') return;

        const config = DIFFICULTY_CONFIG[difficulty];
        if (laneIndex >= 0 && laneIndex < config.laneCount) {
            set({ currentLane: laneIndex });
        }
    },

    processCollision: (isCorrect) => {
        const { lives, score, speedMultiplier } = get();

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
                // If wrong bin, maybe keep same item or switch? 
                // Usually keeping the same item lets them try again, but endless runner flows fast.
                // Let's switch to avoid confusion if they missed it.
                // Actually, user didn't specify. Let's keep it simply lives deduction.
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
    }
}));
