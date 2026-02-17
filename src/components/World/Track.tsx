import React from 'react';
import { useGameStore } from '../../store';
import { DIFFICULTY_CONFIG } from '../../types';

const LANE_WIDTH = 3.0;
const ROAD_LENGTH = 300;

const LANE_COLORS: Record<string, string> = {
    green: '#A2E4B8',  // Pastel Green
    blue: '#AEC6CF',   // Pastel Blue
    yellow: '#FDFD96', // Pastel Yellow
    red: '#FFB3BA'     // Pastel Red
};

export const Track: React.FC = () => {
    const difficulty = useGameStore((state) => state.difficulty);
    const currentLane = useGameStore((state) => state.currentLane);
    const config = DIFFICULTY_CONFIG[difficulty];
    const totalWidth = config.laneCount * LANE_WIDTH;

    // Floor (Grass) - Massive plane to prevent gaps
    const floorSize = 1000;

    return (
        <group position={[0, -1, 0]}>
            {/* Grass Ground - Infinite appearance */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[floorSize, floorSize]} />
                <meshStandardMaterial color="#4ade80" />
            </mesh>

            {/* Colored Lanes */}
            {config.colors.map((colorName, i) => {
                // Calculate x position for this specific lane
                // Total width is centered at 0
                // Left edge is -totalWidth / 2
                // Lane center is Left Edge + (i * Width) + (Width / 2)
                const xPos = -totalWidth / 2 + (i * LANE_WIDTH) + (LANE_WIDTH / 2);

                return (
                    <mesh
                        key={`lane-${i}`}
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[xPos, 0, -ROAD_LENGTH / 2]}
                        receiveShadow
                    >
                        <planeGeometry args={[LANE_WIDTH, ROAD_LENGTH]} />
                        <meshStandardMaterial color={LANE_COLORS[colorName]} />
                    </mesh>
                );
            })}

            {/* Lane Dividers (White Lines) */}
            {Array.from({ length: config.laneCount - 1 }).map((_, i) => {
                const xPos = -totalWidth / 2 + (i + 1) * LANE_WIDTH;
                return (
                    <mesh
                        key={`divider-${i}`}
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[xPos, 0.01, -ROAD_LENGTH / 2]}
                    >
                        <planeGeometry args={[0.1, ROAD_LENGTH]} />
                        <meshStandardMaterial color="white" opacity={0.8} transparent />
                    </mesh>
                );
            })}

            {/* Current Lane Highlight (Subtle) */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[
                    -totalWidth / 2 + (currentLane * LANE_WIDTH) + (LANE_WIDTH / 2),
                    0.02,
                    -ROAD_LENGTH / 2
                ]}
            >
                <planeGeometry args={[LANE_WIDTH * 0.9, ROAD_LENGTH]} />
                <meshStandardMaterial color="white" opacity={0.15} transparent />
            </mesh>
        </group>
    );
};
