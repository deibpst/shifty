import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store';
import { DIFFICULTY_CONFIG } from '../../types';
import { WasteItem, WasteObjectData } from './WasteItem';

const LANE_WIDTH = 3.0; // Must match Track.tsx
const SPAWN_Z = -120; // Horizon
const PLAYER_Z = 0;
const DESPAWN_Z = 20;
const COLLISION_THRESHOLD = 1.8;
const SPAWN_INTERVAL = 1.2;

export const WasteManager: React.FC = () => {
    const {
        gameStatus,
        speedMultiplier,
        difficulty,
        currentLane,
        currentWasteItem,
        processCollision
    } = useGameStore();

    const objectsDataRef = useRef<WasteObjectData[]>([]);
    const [renderableObjects, setRenderableObjects] = useState<WasteObjectData[]>([]);
    const lastSpawnTime = useRef(0);

    useFrame((state, delta) => {
        if (gameStatus !== 'playing' && gameStatus !== 'tutorial') return;

        // In tutorial, we might want to render static objects or just nothing?
        // "Si gameStatus === 'tutorial', el juego debe estar PAUSADO (los objetos no avanzan...)"
        if (gameStatus === 'tutorial') {
            // Do not update positions, do not spawn. 
            // Just return to keep current state frozen.
            return;
        }

        const time = state.clock.elapsedTime;
        const config = DIFFICULTY_CONFIG[difficulty];
        const currentSpeed = 25 * speedMultiplier;
        let needsUpdate = false;

        // --- 1. SPAWNING ---
        if (time - lastSpawnTime.current > SPAWN_INTERVAL / speedMultiplier) {
            lastSpawnTime.current = time;

            const lane = Math.floor(Math.random() * config.laneCount);
            // Determine what "Bin" is in that lane
            // The lane colors are defined in config.colors[lane]
            const laneColor = config.colors[lane];

            // Randomly spawn an obstacle or a Bin
            // 30% Obstacle, 70% Bin
            const isObstacle = Math.random() > 0.7;

            const newObj: WasteObjectData = {
                id: Math.random().toString(36).substr(2, 9),
                laneIndex: lane,
                z: SPAWN_Z,
                type: isObstacle ? 'obstacle' : 'bin',
                // If it's a bin, it MUST have the color of that lane
                color: isObstacle ? undefined : laneColor,
                active: true
            };

            objectsDataRef.current.push(newObj);
            needsUpdate = true;
        }

        // --- 2. MOVEMENT ---
        objectsDataRef.current.forEach(obj => {
            if (!obj.active) return;
            obj.z += currentSpeed * delta;

            // COLLISION
            if (obj.z > PLAYER_Z - 1 && obj.z < PLAYER_Z + 1) {
                const dist = Math.abs(obj.z - PLAYER_Z);
                if (dist < COLLISION_THRESHOLD && obj.laneIndex === currentLane) {
                    obj.active = false;
                    needsUpdate = true;

                    if (obj.type === 'obstacle') {
                        // Hit Obstacle -> BAD
                        processCollision(false);
                    } else {
                        // Hit Bin -> Check strictly if the Bin Color matches the Target Item's Correct Color
                        if (currentWasteItem && obj.color) {
                            const isMatch = obj.color === currentWasteItem.correctLaneColor;
                            // Logic: "Si el color del material del objeto DEBE coincidir con el color del contenedor destino"
                            // Player has TargetItem (e.g. Red Battery). Player hits Red Bin. 
                            // obj.color (Bin Color) === currentWasteItem.correctLaneColor (Red). MATCH!
                            processCollision(isMatch);
                        }
                    }
                }
            }

            // DESPAWN
            if (obj.z > DESPAWN_Z) {
                obj.active = false;
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            objectsDataRef.current = objectsDataRef.current.filter(o => o.active);
            setRenderableObjects([...objectsDataRef.current]);
        }
    });

    const getX = (laneIndex: number) => {
        const config = DIFFICULTY_CONFIG[difficulty];
        const totalWidth = config.laneCount * LANE_WIDTH;
        return -totalWidth / 2 + (laneIndex * LANE_WIDTH) + (LANE_WIDTH / 2);
    };

    return (
        <group>
            {renderableObjects.map(obj => (
                <group key={obj.id} position={[getX(obj.laneIndex), 0, 0]}>
                    <WasteItem
                        key={obj.id}
                        data={obj}
                        laneWidth={LANE_WIDTH}
                    />
                </group>
            ))}
        </group>
    );
};
