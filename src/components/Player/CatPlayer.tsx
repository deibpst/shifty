import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store';
import { DIFFICULTY_CONFIG } from '../../types';
import * as THREE from 'three';

const LANE_WIDTH = 3.0;
const LERP_SPEED = 10;

export const CatPlayer: React.FC = () => {
    const currentLane = useGameStore((state) => state.currentLane);
    const difficulty = useGameStore((state) => state.difficulty);
    const playerColor = useGameStore((state) => state.playerColor);

    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Calculate Target X based on Lane
        const config = DIFFICULTY_CONFIG[difficulty];
        // Center logic: -total/2 + index*w + w/2
        const totalWidth = config.laneCount * LANE_WIDTH;
        const targetX = -totalWidth / 2 + (currentLane * LANE_WIDTH) + (LANE_WIDTH / 2);

        // Smooth Lerp
        groupRef.current.position.x = THREE.MathUtils.lerp(
            groupRef.current.position.x,
            targetX,
            LERP_SPEED * delta
        );

        // Bobbing animation
        groupRef.current.position.y = 0.75 + Math.sin(state.clock.elapsedTime * 15) * 0.1;
    });

    return (
        <group ref={groupRef} position={[0, 0.75, 0]}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={playerColor} roughness={0.6} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.3, 0.6, 0]} rotation={[0, 0, 0.5]} castShadow>
                <coneGeometry args={[0.2, 0.4, 4]} />
                <meshStandardMaterial color={playerColor} />
            </mesh>
            <mesh position={[0.3, 0.6, 0]} rotation={[0, 0, -0.5]} castShadow>
                <coneGeometry args={[0.2, 0.4, 4]} />
                <meshStandardMaterial color={playerColor} />
            </mesh>
        </group>
    );
};
