import { create } from "zustand";
import {
  DifficultyLevel,
  DIFFICULTY_CONFIG,
  WasteItem,
  GameMode,
  MindshiftStatItem,
  EMOTION_LANE_MAP,
  LaneColor,
} from "./types";

interface GameState {
  score: number;
  lives: number;
  currentLane: number; // 0-indexed
  gameStatus:
    | "menu"
    | "categorySelect"
    | "instructions"
    | "playing"
    | "paused"
    | "gameover"
    | "customizing"
    | "tutorial";
  difficulty: DifficultyLevel;
  speedMultiplier: number;
  // Character State
  selectedCharacterId: string;
  totalAccumulatedScore: number;

  currentWasteItem: WasteItem | null;

  // Tutorial State
  hasSeenTutorial: boolean;
  tutorialStep: number;

  // Mindshift State
  gameMode: GameMode;
  mindshiftPhase: number;
  mindshiftPlaysInPhase: number;
  mindshiftStats: MindshiftStatItem[];
  mindshiftItemSpawnTime: number;

  // Actions
  setGameMode: (mode: GameMode) => void;
  generateMindshiftItem: (phase: number) => WasteItem;
  startGame: () => void;
  setDifficulty: (level: DifficultyLevel) => void;
  setSelectedCharacter: (id: string) => void;
  moveLane: (direction: "left" | "right") => void;
  setLane: (laneIndex: number) => void;
  processCollision: (isCorrect: boolean, choseDistractor?: boolean) => void;
  resetGame: () => void;
  setGameStatus: (
    status:
      | "menu"
      | "categorySelect"
      | "instructions"
      | "playing"
      | "paused"
      | "gameover"
      | "customizing"
      | "tutorial",
  ) => void;
  randomizeWaste: () => void;

  // Tutorial Actions
  startTutorial: () => void;
  nextTutorialStep: () => void;
  completeTutorial: () => void;
  skipTutorial: () => void;
  isPaused: boolean;
  togglePause: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const INITIAL_LIVES = 3;
const INITIAL_SPEED = 0.6;
const SPEED_INCREMENT = 0.05;

// Updated Waste Data with 4 Categories and Emojis
const WASTE_ITEMS: WasteItem[] = [
  // Green (Organic)
  {
    id: "1",
    name: "Cáscara de Plátano",
    type: "organic",
    correctLaneColor: "green",
    emoji: "🍌",
  },
  {
    id: "2",
    name: "Corazón de Manzana",
    type: "organic",
    correctLaneColor: "green",
    emoji: "🍎",
  },
  {
    id: "101",
    name: "Cáscara de Huevo",
    type: "organic",
    correctLaneColor: "green",
    emoji: "🥚",
  },
  {
    id: "102",
    name: "Espina de Pescado",
    type: "organic",
    correctLaneColor: "green",
    emoji: "🐟",
  },
  {
    id: "103",
    name: "Cáscara de Sandía",
    type: "organic",
    correctLaneColor: "green",
    emoji: "🍉",
  },
  {
    id: "104",
    name: "Hojas Secas",
    type: "organic",
    correctLaneColor: "green",
    emoji: "🍂",
  },
  {
    id: "105",
    name: "Restos de Zanahoria",
    type: "organic",
    correctLaneColor: "green",
    emoji: "🥕",
  },
  {
    id: "106",
    name: "Corteza de Pan",
    type: "organic",
    correctLaneColor: "green",
    emoji: "🍞",
  },

  // Blue (Paper/Plastic)
  {
    id: "3",
    name: "Periódico",
    type: "paper_plastic",
    correctLaneColor: "blue",
    emoji: "📰",
  },
  {
    id: "4",
    name: "Botella de Agua",
    type: "paper_plastic",
    correctLaneColor: "blue",
    emoji: "💧",
  },
  {
    id: "201",
    name: "Envoltura de Galletas",
    type: "paper_plastic",
    correctLaneColor: "blue",
    emoji: "🍪",
  },
  {
    id: "202",
    name: "Cartón de Leche",
    type: "paper_plastic",
    correctLaneColor: "blue",
    emoji: "🥛",
  },
  {
    id: "203",
    name: "Caja de Cartón",
    type: "paper_plastic",
    correctLaneColor: "blue",
    emoji: "📦",
  },
  {
    id: "204",
    name: "Bolsa de Compras",
    type: "paper_plastic",
    correctLaneColor: "blue",
    emoji: "🛍️",
  },
  {
    id: "205",
    name: "Envase de Yogur",
    type: "paper_plastic",
    correctLaneColor: "blue",
    emoji: "🥣",
  },
  {
    id: "206",
    name: "Hoja de Papel",
    type: "paper_plastic",
    correctLaneColor: "blue",
    emoji: "📝",
  },

  // Yellow (Metal/PET) - Note: In some systems PET is plastic, but following user request grouping
  {
    id: "5",
    name: "Lata de Refresco",
    type: "metal_pet",
    correctLaneColor: "yellow",
    emoji: "🥤",
  },
  {
    id: "6",
    name: "Lata de Sopa",
    type: "metal_pet",
    correctLaneColor: "yellow",
    emoji: "🥫",
  },
  {
    id: "301",
    name: "Lata de Atún",
    type: "metal_pet",
    correctLaneColor: "yellow",
    emoji: "🐟",
  },
  {
    id: "302",
    name: "Papel Aluminio",
    type: "metal_pet",
    correctLaneColor: "yellow",
    emoji: "🌯",
  },
  {
    id: "303",
    name: "Tapa de Botella",
    type: "metal_pet",
    correctLaneColor: "yellow",
    emoji: "🔘",
  },
  {
    id: "304",
    name: "Lata de Pintura (Spray)",
    type: "metal_pet",
    correctLaneColor: "yellow",
    emoji: "🎨",
  },
  {
    id: "305",
    name: "Herramientas",
    type: "metal_pet",
    correctLaneColor: "yellow",
    emoji: "🔧",
  },
  {
    id: "306",
    name: "Tubería de Metal",
    type: "metal_pet",
    correctLaneColor: "yellow",
    emoji: "🔩",
  },

  // Red (Hazardous/Various)
  {
    id: "7",
    name: "Pila AA",
    type: "hazardous",
    correctLaneColor: "red",
    emoji: "🔋",
  },
  {
    id: "8",
    name: "Bombilla",
    type: "hazardous",
    correctLaneColor: "red",
    emoji: "💡",
  },
  {
    id: "401",
    name: "Jeringa",
    type: "hazardous",
    correctLaneColor: "red",
    emoji: "💉",
  },
  {
    id: "402",
    name: "Pastillas",
    type: "hazardous",
    correctLaneColor: "red",
    emoji: "💊",
  },
  {
    id: "403",
    name: "Bote de Pintura",
    type: "hazardous",
    correctLaneColor: "red",
    emoji: "🖌️",
  },
  {
    id: "404",
    name: "Termómetro",
    type: "hazardous",
    correctLaneColor: "red",
    emoji: "🌡️",
  },
  {
    id: "405",
    name: "Teléfono Móvil",
    type: "hazardous",
    correctLaneColor: "red",
    emoji: "📱",
  },
  {
    id: "406",
    name: "Insecticida",
    type: "hazardous",
    correctLaneColor: "red",
    emoji: "🦟",
  },
];

const ENGLISH_ITEMS = [
  { emoji: "🐶", correctWord: "DOG", options: ["DOG", "CAT", "COW", "PIG"] },
  { emoji: "🐱", correctWord: "CAT", options: ["RAT", "CAT", "BAT", "HAT"] },
  {
    emoji: "🍎",
    correctWord: "APPLE",
    options: ["GRAPE", "APPLE", "MANGO", "LEMON"],
  },
  {
    emoji: "🌊",
    correctWord: "WATER",
    options: ["FIRE", "EARTH", "WATER", "WIND"],
  },
  {
    emoji: "🏠",
    correctWord: "HOUSE",
    options: ["STORE", "HOUSE", "HOTEL", "RANCH"],
  },
  {
    emoji: "📚",
    correctWord: "BOOK",
    options: ["NOTE", "BOOK", "CARD", "PAGE"],
  },
  {
    emoji: "🌙",
    correctWord: "MOON",
    options: ["STAR", "MOON", "MARS", "RING"],
  },
  { emoji: "☀️", correctWord: "SUN", options: ["SKY", "FOG", "SUN", "RAY"] },
  { emoji: "🚗", correctWord: "CAR", options: ["BUS", "CAR", "VAN", "JET"] },
  {
    emoji: "✈️",
    correctWord: "PLANE",
    options: ["TRAIN", "PLANE", "SHIP", "BIKE"],
  },
  {
    emoji: "🍕",
    correctWord: "PIZZA",
    options: ["PASTA", "PIZZA", "BREAD", "SOUP"],
  },
  {
    emoji: "🎵",
    correctWord: "MUSIC",
    options: ["DANCE", "MUSIC", "SONG", "BEAT"],
  },
  {
    emoji: "⚽",
    correctWord: "BALL",
    options: ["GOAL", "BALL", "TEAM", "GAME"],
  },
  {
    emoji: "🌳",
    correctWord: "TREE",
    options: ["BUSH", "TREE", "LEAF", "ROOT"],
  },
  { emoji: "👁️", correctWord: "EYE", options: ["EAR", "EYE", "ARM", "LEG"] },
  {
    emoji: "🤚",
    correctWord: "HAND",
    options: ["HAND", "FOOT", "KNEE", "BACK"],
  },
];

const LANE_COLORS: LaneColor[] = ["green", "blue", "yellow", "red"];

const generateEnglishItem = (): WasteItem => {
  const item = ENGLISH_ITEMS[Math.floor(Math.random() * ENGLISH_ITEMS.length)];
  // Shuffle las 4 opciones aleatoriamente
  const shuffled = [...item.options].sort(() => Math.random() - 0.5);
  // El carril correcto es donde quedó la palabra correcta tras el shuffle
  const correctIndex = shuffled.indexOf(item.correctWord);
  const correctLane = LANE_COLORS[correctIndex];

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: item.emoji,
    type: "english",
    correctLaneColor: correctLane,
    emoji: item.emoji,
    // Guardamos las 4 opciones en orden (green, blue, yellow, red) para mostrarlas en los cubos
    mindshiftEmotion: JSON.stringify(shuffled),
  };
};

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  lives: INITIAL_LIVES,
  currentLane: 0,
  gameStatus: "menu",
  difficulty: "hard", // Default to hard to show all 4 lanes as requested
  speedMultiplier: INITIAL_SPEED,
  currentWasteItem: null,

  // Mindshift Initial State
  gameMode: "garbage",
  mindshiftPhase: 1,
  mindshiftPlaysInPhase: 0,
  mindshiftStats: [],
  mindshiftItemSpawnTime: 0,

  // Character System
  selectedCharacterId:
    localStorage.getItem("shifty_selected_character") || "cat_default",
  totalAccumulatedScore: parseInt(
    localStorage.getItem("shifty_total_score") || "0",
    10,
  ),

  // Tutorial Init
  hasSeenTutorial: localStorage.getItem("shifty_tutorial_seen") === "true",
  tutorialStep: 0,

  setSelectedCharacter: (id) => {
    localStorage.setItem("shifty_selected_character", id);
    set({ selectedCharacterId: id });
  },

  setGameMode: (mode) => set({ gameMode: mode }),

  generateMindshiftItem: (phase) => {
    const config = DIFFICULTY_CONFIG[get().difficulty];
    const colors = config.colors;

    let newItem: WasteItem;
    const id = Math.random().toString(36).substr(2, 9);

    if (phase === 1) {
      // Pick a random lane, then use the emotion TIED to that lane color
      const chosenLaneIdx = Math.floor(Math.random() * colors.length);
      const chosenColor = colors[chosenLaneIdx];
      const targetEmotion = EMOTION_LANE_MAP[chosenColor];

      newItem = {
        id,
        name: targetEmotion.name, // Show actual emotion name (not generic 'EMOCIÓN')
        type: "mindshift",
        correctLaneColor: chosenColor, // Tied to the emotion via EMOTION_LANE_MAP
        emoji: targetEmotion.emoji, // Matching emoji for that emotion
        mindshiftEmotion: targetEmotion.name,
      };
    } else if (phase === 2) {
      const chosenLaneIdx = Math.floor(Math.random() * colors.length);
      const targetColor = colors[chosenLaneIdx];

      let distractorIdx = Math.floor(Math.random() * colors.length);
      while (distractorIdx === chosenLaneIdx) {
        distractorIdx = Math.floor(Math.random() * colors.length);
      }

      const colorNames: Record<string, string> = {
        green: "VERDE",
        blue: "AZUL",
        yellow: "AMARILLO",
        red: "ROJO",
      };
      // Also show the emotion associated with the target lane
      const laneEmotion = EMOTION_LANE_MAP[targetColor];

      newItem = {
        id,
        name: `VE AL CARRIL ${colorNames[targetColor]}`,
        type: "mindshift",
        correctLaneColor: targetColor,
        emoji: laneEmotion ? laneEmotion.emoji : "🎯",
        mindshiftDistractorLane: colors[distractorIdx],
      };
    } else {
      // Phase 3: Positive vs Negative — use first lane (green) for POSITIVO,
      // last available lane for NEGATIVO (works for easy/medium/hard)
      const isPositive = Math.random() > 0.5;
      const posEmojis = ["🥰", "😁", "🤩", "😇"];
      const negEmojis = ["🤬", "😭", "🤢", "👺"];
      const emoji = isPositive
        ? posEmojis[Math.floor(Math.random() * posEmojis.length)]
        : negEmojis[Math.floor(Math.random() * negEmojis.length)];

      // First lane = positive (green), last lane = negative (red/rightmost)
      const correctColor = isPositive ? colors[0] : colors[colors.length - 1];

      newItem = {
        id,
        name: isPositive ? "POSITIVO" : "NEGATIVO",
        type: "mindshift",
        correctLaneColor: correctColor,
        emoji,
        mindshiftEmotion: isPositive ? "POSITIVO" : "NEGATIVO",
      };
    }
    return newItem;
  },

  startGame: () => {
    const { difficulty, gameMode, generateMindshiftItem } = get();
    const config = DIFFICULTY_CONFIG[difficulty];
    const startLane = Math.floor(config.laneCount / 2);

    const initialItem =
      gameMode === "mindshift"
        ? generateMindshiftItem(1)
        : gameMode === "english"
          ? generateEnglishItem()
          : WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];

    set({
      gameStatus: "playing",
      score: 0,
      lives: INITIAL_LIVES,
      speedMultiplier: INITIAL_SPEED,
      currentLane: startLane,
      currentWasteItem: initialItem,
      isPaused: false,
      mindshiftPhase: 1,
      mindshiftPlaysInPhase: 0,
      mindshiftStats: [],
      mindshiftItemSpawnTime: Date.now(),
    });
  },

  setDifficulty: (level) => {
    const config = DIFFICULTY_CONFIG[level];
    const startLane = Math.floor(config.laneCount / 2);
    set({
      difficulty: level,
      currentLane: startLane,
    });
  },

  moveLane: (direction) => {
    const { gameStatus, currentLane, difficulty, isPaused } = get();
    if ((gameStatus !== "playing" && gameStatus !== "tutorial") || isPaused)
      return;

    if (gameStatus === "tutorial" && get().tutorialStep !== 3) return;

    const config = DIFFICULTY_CONFIG[difficulty];
    const maxLaneIndex = config.laneCount - 1;
    let newLane = currentLane;

    if (direction === "left") {
      newLane = Math.max(0, currentLane - 1);
    } else if (direction === "right") {
      newLane = Math.min(maxLaneIndex, currentLane + 1);
    }

    if (newLane !== currentLane) {
      set({ currentLane: newLane });
    }
  },

  setLane: (laneIndex) => {
    const { gameStatus, difficulty, isPaused } = get();
    if ((gameStatus !== "playing" && gameStatus !== "tutorial") || isPaused)
      return;

    const config = DIFFICULTY_CONFIG[difficulty];
    if (laneIndex >= 0 && laneIndex < config.laneCount) {
      set({ currentLane: laneIndex });
    }
  },

  processCollision: (isCorrect, choseDistractor = false) => {
    const state = get();
    const {
      lives,
      score,
      speedMultiplier,
      gameStatus,
      totalAccumulatedScore,
      gameMode,
      mindshiftPhase,
      mindshiftPlaysInPhase,
      mindshiftStats,
      mindshiftItemSpawnTime,
      generateMindshiftItem,
      currentWasteItem,
    } = state;

    if (gameStatus === "tutorial") return;

    if (gameMode === "english") {
      const points = 10;
      const newScore = isCorrect ? score + points : score;
      const newTotalScore = isCorrect
        ? totalAccumulatedScore + points
        : totalAccumulatedScore;
      const newLives = isCorrect ? lives : lives - 1;

      if (isCorrect) {
        localStorage.setItem("shifty_total_score", newTotalScore.toString());
      }

      if (newLives <= 0) {
        set({
          lives: 0,
          gameStatus: "gameover",
          score: newScore,
          totalAccumulatedScore: newTotalScore,
        });
        return;
      }

      set({
        score: newScore,
        totalAccumulatedScore: newTotalScore,
        lives: newLives,
        speedMultiplier: Math.min(2.0, speedMultiplier + SPEED_INCREMENT * 0.5),
        currentWasteItem: generateEnglishItem(),
      });
      return;
    }

    if (gameMode === "mindshift") {
      const reactionTime = Date.now() - mindshiftItemSpawnTime;
      const emotion = currentWasteItem?.mindshiftEmotion || "None";

      const newStats = [
        ...mindshiftStats,
        {
          phase: mindshiftPhase,
          isCorrect,
          reactionTime,
          choseDistractor,
          emotion,
        },
      ];

      const PLAYS_PER_PHASE = 10;
      const newPlays = mindshiftPlaysInPhase + 1;

      const points = 10;
      const newScore = isCorrect ? score + points : score;
      const newTotalScore = isCorrect
        ? totalAccumulatedScore + points
        : totalAccumulatedScore;

      // --- Life system: lose a life on wrong answer ---
      let newLives = lives;
      if (!isCorrect) {
        newLives = lives - 1;
      }

      if (isCorrect) {
        localStorage.setItem("shifty_total_score", newTotalScore.toString());
      }

      // If lives ran out, game over immediately
      if (newLives <= 0) {
        set({
          lives: 0,
          gameStatus: "gameover",
          mindshiftStats: newStats,
          score: newScore,
          totalAccumulatedScore: newTotalScore,
        });
        return;
      }

      let newPhase = mindshiftPhase;
      let ended = false;

      if (newPlays >= PLAYS_PER_PHASE) {
        if (mindshiftPhase < 3) {
          newPhase = mindshiftPhase + 1;
        } else {
          ended = true;
        }
      }

      if (ended) {
        set({
          gameStatus: "gameover",
          mindshiftStats: newStats,
          score: newScore,
          totalAccumulatedScore: newTotalScore,
          lives: newLives,
        });
      } else {
        const nextItem = generateMindshiftItem(newPhase);
        set({
          lives: newLives,
          mindshiftPhase: newPhase,
          mindshiftPlaysInPhase: newPlays >= PLAYS_PER_PHASE ? 0 : newPlays,
          mindshiftStats: newStats,
          currentWasteItem: nextItem,
          mindshiftItemSpawnTime: Date.now(),
          speedMultiplier: Math.min(
            2.0,
            speedMultiplier + SPEED_INCREMENT * 0.5,
          ),
          score: newScore,
          totalAccumulatedScore: newTotalScore,
        });
      }
      return;
    }

    if (isCorrect) {
      const points = 10; // 10 points per correct item
      const newScore = score + points;
      const newTotalScore = totalAccumulatedScore + points;

      // Persist total score periodically or on game over? Let's do it live for now
      localStorage.setItem("shifty_total_score", newTotalScore.toString());

      const newSpeed = Math.min(2.0, speedMultiplier + SPEED_INCREMENT);
      const randomWaste =
        WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];

      set({
        score: newScore,
        totalAccumulatedScore: newTotalScore,
        speedMultiplier: newSpeed,
        currentWasteItem: randomWaste,
      });
    } else {
      const newLives = lives - 1;
      if (newLives <= 0) {
        set({
          lives: 0,
          gameStatus: "gameover",
        });
      } else {
        set({ lives: newLives });
      }
    }
  },

  resetGame: () => {
    set({
      gameStatus: "menu",
      score: 0,
      lives: INITIAL_LIVES,
      speedMultiplier: INITIAL_SPEED,
      currentWasteItem: null,
    });
  },

  setGameStatus: (status) => set({ gameStatus: status }),

  randomizeWaste: () => {
    const randomWaste =
      WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];
    set({ currentWasteItem: randomWaste });
  },

  // Pause System
  isPaused: false,
  togglePause: () => {
    const { gameStatus, isPaused } = get();
    if (gameStatus !== "playing" && gameStatus !== "tutorial") return;

    set({ isPaused: !isPaused });
  },

  // Sound System
  isMuted: false,
  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  // Tutorial Implementation
  startTutorial: () => {
    const { difficulty } = get();
    const config = DIFFICULTY_CONFIG[difficulty];
    const startLane = Math.floor(config.laneCount / 2);

    // Ensure we have a waste item for display purposes
    const randomWaste =
      WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];

    set({
      gameStatus: "tutorial",
      tutorialStep: 1,
      score: 0,
      lives: INITIAL_LIVES,
      currentLane: startLane,
      currentWasteItem: randomWaste,
      isPaused: false,
    });
  },

  nextTutorialStep: () => {
    set((state) => ({ tutorialStep: state.tutorialStep + 1 }));
  },

  completeTutorial: () => {
    localStorage.setItem("shifty_tutorial_seen", "true");
    set({ hasSeenTutorial: true });
    get().startGame();
  },

  skipTutorial: () => {
    localStorage.setItem("shifty_tutorial_seen", "true");
    set({ hasSeenTutorial: true });
    get().startGame();
  },
}));
