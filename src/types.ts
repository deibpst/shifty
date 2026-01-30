// Consistent color types
export type LaneColor = 'green' | 'blue' | 'yellow' | 'red';
export type WasteType = 'organic' | 'paper_plastic' | 'metal_pet' | 'hazardous';

export interface WasteItem {
  id: string;
  name: string;
  type: WasteType;
  correctLaneColor: LaneColor;
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
