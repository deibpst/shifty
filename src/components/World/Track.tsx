import React from 'react';
import { useGameStore } from '../../store';
import { DIFFICULTY_CONFIG } from '../../types';

const LANE_WIDTH = 3.0; // Updated
const ROAD_LENGTH = 300; // Increased to cover horizon

export const Track: React.FC = () => {
    const difficulty = useGameStore((state) => state.difficulty);
    const currentLane = useGameStore((state) => state.currentLane);
    const config = DIFFICULTY_CONFIG[difficulty];
    const totalWidth = config.laneCount * LANE_WIDTH;

    // Floor (Grass)
    const floorWidth = 200;

    return (
        <group position={[0, -1, 0]}>
            {/* Grass Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -ROAD_LENGTH / 2]} receiveShadow>
                <planeGeometry args={[floorWidth, ROAD_LENGTH]} />
                <meshStandardMaterial color="#4ade80" />
            </mesh>

            {/* Road */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -ROAD_LENGTH / 2]} receiveShadow>
                <planeGeometry args={[totalWidth, ROAD_LENGTH]} />
                <meshStandardMaterial color="#334155" />
            </mesh>

            {/* Lane Markers */}
            {Array.from({ length: config.laneCount - 1 }).map((_, i) => {
                // Calculate x position for divider
                // Start from left edge: -totalWidth/2
                // Each divider is after (i+1) lanes
                const xPos = -totalWidth / 2 + (i + 1) * LANE_WIDTH;
                return (
                    <mesh
                        key={i}
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[xPos, 0.01, -ROAD_LENGTH / 2]}
                    >
                        <planeGeometry args={[0.1, ROAD_LENGTH]} />
                        <meshStandardMaterial color="white" opacity={0.5} transparent />
                    </mesh>
                );
            })}

            {/* Current Lane Highlight */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[
                    -totalWidth / 2 + (currentLane * LANE_WIDTH) + (LANE_WIDTH / 2),
                    0.02,
                    -ROAD_LENGTH / 2
                ]}
            >
                <planeGeometry args={[LANE_WIDTH * 0.8, ROAD_LENGTH]} />
                <meshStandardMaterial color="yellow" opacity={0.1} transparent />
            </mesh>
        </group>
    );
};
