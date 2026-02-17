import React, { useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { LaneColor } from '../../types';
import { Model as ObstacleModel } from './Skull';

export interface WasteObjectData {
    id: string;
    laneIndex: number;
    z: number;
    type: 'bin' | 'obstacle';
    color?: LaneColor;
    active: boolean;
}

interface WasteItemProps {
    data: WasteObjectData;
    laneWidth: number;
}

export const WasteItem: React.FC<WasteItemProps> = ({ data }) => {
    const groupRef = useRef<Group>(null);
    const meshRef = useRef<Mesh>(null);

    // Initial position setup - calculate X once
    // We assume 4 lanes max for calculation simplicity here or pass totalWidth
    // But since we pass laneWidth and laneIndex, we can compute X local to center if we know the offset.
    // Ideally Manager passes exact X. Let's recalculate or expect X passed. 
    // Wait, the manager was calculating X. Let's make this component take X as a prop to be pure.
    // Actually, to update Z fluidly, we just need to read `data.z` every frame.

    // BUT `data.z` is being updated by the Manager's loop.
    // So this component just needs to sync its transform with `data`.

    useFrame(() => {
        if (groupRef.current && data.active) {
            groupRef.current.position.z = data.z;
        }
    });

    useLayoutEffect(() => {
        // Set initial X
        // We need the manager to tell us the X, or compute it.
        // Let's rely on the parent formatting the position, 
        // OR better: The manager updates the DATA, this updates the VIEW.
        // We still need X.
    }, []);

    // Helper to get color hex
    const getColorHex = (c?: string) => {
        switch (c) {
            case 'green': return '#22c55e';
            case 'blue': return '#3b82f6';
            case 'yellow': return '#eab308';
            case 'red': return '#ef4444';
            default: return '#334155';
        }
    };

    const colorHex = getColorHex(data.color);

    return (
        <group ref={groupRef} position={[0, 1.0, data.z]}>
            {/* OBSTACLE */}
            {data.type === 'obstacle' ? (
                <ObstacleModel scale={[1, 1, 1]} />
            ) : (
                // BIN
                <mesh ref={meshRef} frustumCulled={false}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial
                        color={colorHex}
                        emissive={colorHex}
                        emissiveIntensity={0.6}
                    />
                    {/* Inner Mouth */}
                    <mesh position={[0, 0.5, 1.01]}>
                        <planeGeometry args={[1.5, 0.5]} />
                        <meshBasicMaterial color="#000" />
                    </mesh>
                    {/* Label Area */}
                    <mesh position={[0, -0.2, 1.01]}>
                        <planeGeometry args={[1.0, 1.0]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                </mesh>
            )}
        </group>
    );
};
