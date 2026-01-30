import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store';
import { DIFFICULTY_CONFIG } from '../../types';
import * as THREE from 'three';

const LANE_WIDTH = 3.0;
const LERP_SPEED = 10;

export const CatPlayer: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    const currentLane = useGameStore((state) => state.currentLane);
    const difficulty = useGameStore((state) => state.difficulty);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const config = DIFFICULTY_CONFIG[difficulty];
        const totalWidth = config.laneCount * LANE_WIDTH;

        // Calculate target X position
        // Center is 0. 
        // Left edge of road is -totalWidth/2
        // Center of lane i is: -totalWidth/2 + (i * LANE_WIDTH) + (LANE_WIDTH/2)
        const targetX = -totalWidth / 2 + (currentLane * LANE_WIDTH) + (LANE_WIDTH / 2);

        // Smooth interpolation
        meshRef.current.position.x = THREE.MathUtils.lerp(
            meshRef.current.position.x,
            targetX,
            LERP_SPEED * delta
        );

        // Simple bobbing for "running" effect
        meshRef.current.position.y = -0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.5;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
            {/* Eyes to show direction */}
            <mesh position={[0.2, 0.2, 0.4]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[-0.2, 0.2, 0.4]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="black" />
            </mesh>
        </mesh>
    );
};
