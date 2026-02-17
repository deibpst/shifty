
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useGameStore } from '../../store';
import { DIFFICULTY_CONFIG } from '../../types';

const LANE_WIDTH = 3.0;
const LERP_SPEED = 10;

// Based on Cat.tsx from gltfjsx
type ActionName = 'Death' | 'Headbutt' | 'Idle' | 'Idle_Eating' | 'Jump_Loop' | 'Jump_Start' | 'Run' | 'Walk';

interface GLTFAction extends THREE.AnimationClip {
    name: ActionName;
}

type GLTFResult = any; // Simplifying for this file, or we can copy the full type if strict

export const CatPlayer: React.FC = () => {
    // Game State
    const currentLane = useGameStore((state) => state.currentLane);
    const difficulty = useGameStore((state) => state.difficulty);
    const gameStatus = useGameStore((state) => state.gameStatus);
    const score = useGameStore((state) => state.score);
    const lives = useGameStore((state) => state.lives);

    // Refs for animation logic
    const prevScore = useRef(score);
    const prevLives = useRef(lives);

    // Model & Animations
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF('/Cat.gltf');
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as GLTFResult;
    const { actions } = useAnimations(animations, group);

    // Animation Machine
    const [currentAction, setCurrentAction] = useState<ActionName>('Run');

    useEffect(() => {
        // Initial Animation
        if (actions['Run']) {
            actions['Run'].reset().fadeIn(0.5).play();
        }
        return () => {
            actions['Run']?.fadeOut(0.5);
        };
    }, [actions]);

    // React to Game State Changes (Score / Lives)
    useEffect(() => {
        // DETECT SCORE INCREASE (Happy)
        if (score > prevScore.current) {
            handleAnimationTrigger('Jump_Loop', 1000); // Jump for 1s
        }
        prevScore.current = score;

        // DETECT LIFE LOSS (Hit)
        if (lives < prevLives.current) {
            handleAnimationTrigger('Death', 1000); // Death/Stumble for 1s
        }
        prevLives.current = lives;

    }, [score, lives]);

    const handleAnimationTrigger = (animName: ActionName, duration: number) => {
        const action = actions[animName];
        const runAction = actions['Run'];

        if (!action || !runAction) return;

        // Transition TO animation
        runAction.fadeOut(0.2);
        action.reset().fadeIn(0.2).play();

        // Schedule return to Run
        setTimeout(() => {
            action.fadeOut(0.2);
            runAction.reset().fadeIn(0.2).play();
        }, duration);
    };

    // Handle Game Over or Menu state specifically?
    useEffect(() => {
        if (gameStatus === 'gameover') {
            // Play Death and stay there
            const run = actions['Run'];
            const death = actions['Death'];
            if (run && death) {
                run.fadeOut(0.5);
                death.reset().fadeIn(0.5).setLoop(THREE.LoopOnce, 1).play();
                death.clampWhenFinished = true; // Stay dead
            }
        } else if (gameStatus === 'playing' || gameStatus === 'tutorial') {
            // Ensure running if coming back
            const run = actions['Run'];
            const death = actions['Death'];
            if (run && !run.isRunning()) {
                death?.fadeOut(0.5);
                run.reset().fadeIn(0.5).play();
            }
        }
    }, [gameStatus, actions]);


    useFrame((state, delta) => {
        if (!group.current) return;

        // Calculate Target X based on Lane
        const config = DIFFICULTY_CONFIG[difficulty];
        const totalWidth = config.laneCount * LANE_WIDTH;
        const targetX = -totalWidth / 2 + (currentLane * LANE_WIDTH) + (LANE_WIDTH / 2);

        // Smooth Lerp Movement
        group.current.position.x = THREE.MathUtils.lerp(
            group.current.position.x,
            targetX,
            LERP_SPEED * delta
        );

        // Optional: Tilt the cat slightly into the turn?
        // const diff = targetX - group.current.position.x;
        // group.current.rotation.z = -diff * 0.1; 
    });

    return (
        <group ref={group} dispose={null} position={[0, 0, 0]}>
            <group name="Scene">
                <group name="AnimalArmature" scale={[0.6, 0.6, 0.6]} rotation={[0, Math.PI, 0]}> {/* Scale down if needed, Rotate 180 if facing wrong way */}
                    <primitive object={nodes.All} />
                    <primitive object={nodes.Root} />
                    <skinnedMesh
                        name="Cat"
                        geometry={nodes.Cat.geometry}
                        material={materials.Atlas}
                        skeleton={nodes.Cat.skeleton}
                        castShadow
                        receiveShadow
                    />
                </group>
            </group>
        </group>
    );
};

useGLTF.preload('/Cat.gltf');
