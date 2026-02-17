
import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store';
import { DIFFICULTY_CONFIG } from '../../types';
import * as THREE from 'three';
import { AVAILABLE_CHARACTERS } from '../../data/CharacterData';

const LANE_WIDTH = 3.0;
const LERP_SPEED = 10;

export const PlayerController: React.FC = () => {
    // Game State
    const currentLane = useGameStore((state) => state.currentLane);
    const difficulty = useGameStore((state) => state.difficulty);
    const gameStatus = useGameStore((state) => state.gameStatus);
    const score = useGameStore((state) => state.score);
    const lives = useGameStore((state) => state.lives);
    const selectedCharacterId = useGameStore((state) => state.selectedCharacterId);

    // Refs for animation triggering
    const prevScore = useRef(score);
    const prevLives = useRef(lives);

    // Group Ref for Movement
    const groupRef = useRef<THREE.Group>(null);

    // Animation Machine
    const [currentAction, setCurrentAction] = useState<string>('Run');

    // Resolve Character Component
    const CharacterComponent = AVAILABLE_CHARACTERS.find(c => c.id === selectedCharacterId)?.Component || AVAILABLE_CHARACTERS[0].Component;

    // React to Game State Changes (Score / Lives)
    useEffect(() => {
        // DETECT SCORE INCREASE (Happy)
        if (score > prevScore.current) {
            handleAnimationTrigger('Jump_Loop', 1000);
        }
        prevScore.current = score;

        // DETECT LIFE LOSS (Hit)
        if (lives < prevLives.current) {
            handleAnimationTrigger('Death', 1000);
        }
        prevLives.current = lives;

    }, [score, lives]);

    // Handle Game Status for Animations
    useEffect(() => {
        if (gameStatus === 'gameover') {
            setCurrentAction('Death');
        } else if (gameStatus === 'playing' || gameStatus === 'tutorial') {
            // Reset to Run if we were dead/idling
            if (currentAction === 'Death' || currentAction === 'Idle') {
                setCurrentAction('Run');
            }
        } else if (gameStatus === 'menu') {
            setCurrentAction('Idle');
        }
    }, [gameStatus]);

    const handleAnimationTrigger = (animName: string, duration: number) => {
        setCurrentAction(animName);
        setTimeout(() => {
            // Check if we didn't die in the meantime
            const currentState = useGameStore.getState().gameStatus;
            if (currentState !== 'gameover') {
                setCurrentAction('Run');
            }
        }, duration);
    };

    useFrame((_state, delta) => {
        if (!groupRef.current) return;

        // Calculate Target X based on Lane
        const config = DIFFICULTY_CONFIG[difficulty];
        const totalWidth = config.laneCount * LANE_WIDTH;
        const targetX = -totalWidth / 2 + (currentLane * LANE_WIDTH) + (LANE_WIDTH / 2);

        // Smooth Lerp Movement
        groupRef.current.position.x = THREE.MathUtils.lerp(
            groupRef.current.position.x,
            targetX,
            LERP_SPEED * delta
        );

        // Optional: Tilt into turn
        const diff = targetX - groupRef.current.position.x;
        groupRef.current.rotation.z = -diff * 0.1;
        groupRef.current.rotation.y = Math.PI; // Face forward (assuming models face Z+)
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <group scale={[0.6, 0.6, 0.6]} position={[0, 0, 0]}>
                <CharacterComponent currentAction={currentAction} />
            </group>
        </group>
    );
};
