import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store';
import { DIFFICULTY_CONFIG, EMOTION_LANE_MAP } from '../../types';
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
    const lastSpawnedMindshiftItemId = useRef('');
    const spawnHistoryRef = useRef<string[]>([]);
    const sinceLastTargetRef = useRef(0);

    // Bug 3 Fix: Limpiar carriles al cambiar de modo (cuando inicia el playing)
    React.useEffect(() => {
        if (gameStatus === 'playing') {
            objectsDataRef.current = [];
            setRenderableObjects([]);
            lastSpawnedMindshiftItemId.current = '';
            spawnHistoryRef.current = [];
            sinceLastTargetRef.current = 0;
        }
    }, [gameStatus]);

    useFrame((state, delta) => {
        if (gameStatus !== 'playing' && gameStatus !== 'tutorial') return;

        // Check Pause
        if (useGameStore.getState().isPaused) return;

        // In tutorial, we might want to render static objects or just nothing?
        // "Si gameStatus === 'tutorial', el juego debe estar PAUSADO (los objetos no avanzan...)"
        if (gameStatus === 'tutorial') {
            // Do not update positions, do not spawn. 
            // Just return to keep current state frozen.
            return;
        }

        const time = state.clock.elapsedTime;
        const config = DIFFICULTY_CONFIG[difficulty];
        const currentSpeed = 40 * speedMultiplier;
        let needsUpdate = false;

        // --- 1. SPAWNING ---
        if (useGameStore.getState().gameMode === 'mindshift') {
            if (currentWasteItem && lastSpawnedMindshiftItemId.current !== currentWasteItem.id) {
                lastSpawnedMindshiftItemId.current = currentWasteItem.id;
                
                // MINDSHIFT SPAWNING LOGIC: Spawn a row of bins
                const phase = useGameStore.getState().mindshiftPhase;
                const phaseColors = config.colors;

                phaseColors.forEach((laneColor, laneIdx) => {
                    let text = '';
                    let isDistractor = false;

                    if (phase === 1) {
                        // Each bin shows the emotion TIED to its lane color
                        const emo = EMOTION_LANE_MAP[laneColor];
                        text = emo ? `${emo.emoji} ${emo.name}` : '?';
                    } else if (phase === 2) {
                        if (laneColor === currentWasteItem.mindshiftDistractorLane) {
                            isDistractor = true;
                        }
                        // Show the emotion of this lane so player knows what each lane means
                        const emo = EMOTION_LANE_MAP[laneColor];
                        text = emo ? emo.emoji : 'ENTRA';
                    } else if (phase === 3) {
                        // First lane = POSITIVO, last lane = NEGATIVO, middle lanes empty
                        if (laneIdx === 0) text = '😊 POSITIVO';
                        else if (laneIdx === phaseColors.length - 1) text = '😡 NEGATIVO';
                        else text = '';
                    }

                    objectsDataRef.current.push({
                        id: Math.random().toString(36).substr(2, 9),
                        laneIndex: laneIdx,
                        z: SPAWN_Z,
                        type: 'bin',
                        color: laneColor,
                        active: true,
                        mindshiftLabelText: text,
                        mindshiftDistractor: isDistractor
                    });
                });
                needsUpdate = true;
            }
        } else {
            if (time - lastSpawnTime.current > SPAWN_INTERVAL / speedMultiplier) {
                lastSpawnTime.current = time;

                // Build all possible type keys: one per lane color + obstacle
                const allTypeKeys = ['obstacle', ...config.colors.map(c => `bin-${c}`)];
                // Cooldown window capped so there are always types available
                const maxHistorySize = Math.min(4, allTypeKeys.length - 1);

                // Filter out recently spawned types
                const available = allTypeKeys.filter(k => !spawnHistoryRef.current.includes(k));
                const pool = available.length > 0 ? available : allTypeKeys;

                const storeState = useGameStore.getState();
                const targetKey = storeState.currentWasteItem
                    ? `bin-${storeState.currentWasteItem.correctLaneColor}`
                    : null;
                const targetInPool = targetKey !== null && pool.includes(targetKey);
                const targetOverdue = sinceLastTargetRef.current >= 4;

                let chosenKey: string;
                if (targetInPool && targetOverdue) {
                    // Force target: too long without a valid object
                    chosenKey = targetKey!;
                } else {
                    // Weighted selection: target gets 2x weight when available
                    const weights = pool.map(k => (k === targetKey && targetInPool ? 2 : 1));
                    const totalWeight = weights.reduce((s, w) => s + w, 0);
                    let rand = Math.random() * totalWeight;
                    chosenKey = pool[pool.length - 1];
                    for (let i = 0; i < pool.length; i++) {
                        rand -= weights[i];
                        if (rand <= 0) { chosenKey = pool[i]; break; }
                    }
                }

                // Update history
                spawnHistoryRef.current.push(chosenKey);
                if (spawnHistoryRef.current.length > maxHistorySize) {
                    spawnHistoryRef.current.shift();
                }

                // Track how long since a correct target spawned
                if (chosenKey === targetKey) {
                    sinceLastTargetRef.current = 0;
                } else {
                    sinceLastTargetRef.current++;
                }

                // Resolve key → lane index, color, type
                let lane: number;
                let laneColor: (typeof config.colors)[number] | undefined;
                let isObstacle: boolean;

                if (chosenKey === 'obstacle') {
                    isObstacle = true;
                    lane = Math.floor(Math.random() * config.laneCount);
                    laneColor = undefined;
                } else {
                    isObstacle = false;
                    laneColor = chosenKey.replace('bin-', '') as (typeof config.colors)[number];
                    lane = config.colors.indexOf(laneColor);
                    if (lane === -1) lane = 0;
                }

                const newObj: WasteObjectData = {
                    id: Math.random().toString(36).substr(2, 9),
                    laneIndex: lane,
                    z: SPAWN_Z,
                    type: isObstacle ? 'obstacle' : 'bin',
                    color: isObstacle ? undefined : laneColor,
                    active: true
                };

                objectsDataRef.current.push(newObj);
                needsUpdate = true;
            }
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

                    if (useGameStore.getState().gameMode === 'mindshift') {
                        // All phases: correct = the bin whose color matches correctLaneColor
                        const choseDistractor = !!obj.mindshiftDistractor;
                        const isMatch = currentWasteItem
                            ? obj.color === currentWasteItem.correctLaneColor
                            : false;
                        processCollision(isMatch, choseDistractor);
                         
                         // Clear the rest of the row to avoid double collisions
                         objectsDataRef.current.forEach(o => {
                             if(Math.abs(o.z - PLAYER_Z) < 3) o.active = false;
                         });
                    } else {
                        if (obj.type === 'obstacle') {
                            processCollision(false);
                        } else {
                            if (currentWasteItem && obj.color) {
                                const isMatch = obj.color === currentWasteItem.correctLaneColor;
                                processCollision(isMatch);
                            }
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
