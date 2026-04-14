// Consistent color types
export type LaneColor = 'green' | 'blue' | 'yellow' | 'red';
export type WasteType = 'organic' | 'paper_plastic' | 'metal_pet' | 'hazardous' | 'mindshift';

export type GameMode = 'garbage' | 'mindshift';

export interface MindshiftStatItem {
  phase: number;
  isCorrect: boolean;
  reactionTime: number;
  choseDistractor: boolean;
  emotion?: string;
}

export interface WasteItem {
  id: string;
  name: string;
  type: WasteType;
  correctLaneColor: LaneColor;
  emoji: string;
  
  // Especifico para Mindshift
  mindshiftEmotion?: string;
  mindshiftDistractorLane?: LaneColor; // Carril tramposo (Fase 2)
  mindshiftLabelText?: string; // Texto a mostrar
}

export interface LaneConfig {
  laneCount: number;
  colors: LaneColor[];
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, LaneConfig> = {
  easy: {
    laneCount: 2,
    colors: ['green', 'blue']
  },
  medium: {
    laneCount: 3,
    colors: ['green', 'blue', 'yellow']
  },
  hard: {
    laneCount: 4,
    colors: ['green', 'blue', 'yellow', 'red']
  }
};
