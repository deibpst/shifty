import React from 'react';
import { useGameStore } from '../../store';
import { DIFFICULTY_CONFIG } from '../../types';

const LANE_WIDTH = 3.0;
const ROAD_LENGTH = 300;

const LANE_COLORS: Record<string, string> = {
    green: '#22c55e',  // Vivid Green
    blue: '#3b82f6',   // Vivid Blue
    yellow: '#eab308', // Vivid Yellow
    red: '#ef4444'     // Vivid Red
};

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MeshStandardMaterial } from 'three';

const Lane: React.FC<{ colorName: string; xPos: number }> = ({ colorName, xPos }) => {
    const matRef = useRef<MeshStandardMaterial>(null);
    const { gameMode, mindshiftPhase, currentWasteItem } = useGameStore();
    const colorHex = LANE_COLORS[colorName];

    useFrame((state) => {
        if (!matRef.current) return;
        
        const isDistractor = gameMode === 'mindshift' && mindshiftPhase === 2 && currentWasteItem?.mindshiftDistractorLane === colorName;
        
        if (isDistractor) {
            const time = state.clock.elapsedTime;
            matRef.current.emissiveIntensity = 0.5 + Math.sin(time * 15) * 0.8;
            matRef.current.emissive.set(colorHex);
        } else {
            matRef.current.emissiveIntensity = 0;
            matRef.current.emissive.setHex(0x000000);
        }
    });

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[xPos, 0, -ROAD_LENGTH / 2 + 20]}
        >
            <planeGeometry args={[LANE_WIDTH, ROAD_LENGTH]} />
            <meshStandardMaterial ref={matRef} color={colorHex} toneMapped={false} />
        </mesh>
    );
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
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[floorSize, floorSize]} />
                <meshStandardMaterial color="#4ade80" />
            </mesh>

            {/* Colored Lanes */}
            {config.colors.map((colorName, i) => {
                const xPos = -totalWidth / 2 + (i * LANE_WIDTH) + (LANE_WIDTH / 2);
                return <Lane key={`lane-${i}`} colorName={colorName} xPos={xPos} />;
            })}

            {/* Lane Dividers (White Lines) */}
            {Array.from({ length: config.laneCount - 1 }).map((_, i) => {
                const xPos = -totalWidth / 2 + (i + 1) * LANE_WIDTH;
                return (
                    <mesh
                        key={`divider-${i}`}
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[xPos, 0.01, -ROAD_LENGTH / 2 + 20]}
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
                    -ROAD_LENGTH / 2 + 20
                ]}
            >
                <planeGeometry args={[LANE_WIDTH * 0.9, ROAD_LENGTH]} />
                <meshStandardMaterial color="white" opacity={0.15} transparent />
            </mesh>
        </group>
    );
};
