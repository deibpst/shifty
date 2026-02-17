import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store';
import { Model as Tree1 } from './Tree_1';
import { Model as Tree2 } from './Tree_2';
import { Model as Flowers1 } from './Flowers_1';
import { Model as GrassBig } from './Grass_Big';
import { Model as GrassSmall } from './Grass_Small';
import * as THREE from 'three';

// Configuration
const MAX_POOL_SIZE = 200; // Increased to 200 for maximum density
const BASE_ACTIVE_COUNT = 200; // ALL ACTIVE. No empty spaces.
const SCORE_FOR_MAX_DENSITY = 0; // Immediate max density
const SPAWN_Z_START = -5; // Start right in front of camera
const SPAWN_Z_END = -300; // Go way deep
const TRACK_LENGTH = Math.abs(SPAWN_Z_END - SPAWN_Z_START);
const RESET_Z = -300;
const DESPAWN_Z = 25;

// X Ranges for side placement
const LEFT_X_MIN = -15;
const LEFT_X_MAX = -6;
const RIGHT_X_MIN = 6;
const RIGHT_X_MAX = 15;

type SceneryType = 'tree1' | 'tree2' | 'flowers' | 'grassBig' | 'grassSmall';

interface SceneryObject {
    id: string;
    initialType: SceneryType;
    initialPosition: THREE.Vector3;
    scale: number;
    rotationY: number;
    index: number;
}

export const EnvironmentManager: React.FC = () => {
    // const { gameStatus, speedMultiplier } = useGameStore(); // Unused here

    // Create initial pool of objects
    const initialPool = useMemo(() => {
        const objects: SceneryObject[] = [];
        const types: SceneryType[] = ['tree1', 'tree2', 'flowers', 'grassBig', 'grassSmall'];

        for (let i = 0; i < MAX_POOL_SIZE; i++) {
            const isLeft = Math.random() > 0.5;
            const xRange = isLeft
                ? [LEFT_X_MIN, LEFT_X_MAX]
                : [RIGHT_X_MIN, RIGHT_X_MAX];

            const x = THREE.MathUtils.randFloat(xRange[0], xRange[1]);
            // Spread them out initially
            const zStep = TRACK_LENGTH / MAX_POOL_SIZE;
            const zJitter = THREE.MathUtils.randFloat(-2, 2);
            const z = SPAWN_Z_START - (i * zStep) + zJitter;

            objects.push({
                id: `scenery-${i}`,
                initialType: types[Math.floor(Math.random() * types.length)],
                initialPosition: new THREE.Vector3(x, 0, z),
                scale: THREE.MathUtils.randFloat(0.8, 1.4),
                rotationY: THREE.MathUtils.randFloat(0, Math.PI * 2),
                index: i
            });
        }
        return objects;
    }, []);

    // We can use a ref to track positions to avoid re-renders if we were updating state every frame.
    // However, since we need to render them, we can either:
    // 1. Update refs in useFrame and force a render (or allow R3F to handle it via direct object mutation)
    // 2. Since this is "Eye Candy", direct mutation of Mesh refs is best for performance.
    // BUT, we have a list of different components. 
    // Let's use a state for the list, but we won't change the list structure (rendering same components), 
    // just their positions.
    // Actually, to update positions efficiently without re-rendering the React tree, 
    // we should map the objects and let each Item handle its own position update or use a parent ref.

    // Approach: Access group refs.
    // We will render the pool once. We need a way to update their positions.
    // Let's wrap each item in a component that handles its own movement?
    // OR, update the positions in the manager using refs.

    // Easier for this scale: Render list. Pass a "ref" to the item? No, specific components.
    // Let's try "Manager updates data, force update" - might be too heavy?
    // Better: Helper component for each Item that subscribes to the loop?
    // Or simpler: The Manager has a Ref to the Group containing all items. 
    // If we update `obj.position.z` in the array, it doesn't update the view unless we are using specific THREE instances.

    // Let's use a 'SceneryItem' wrapper that takes the initial object and handles its own movement logic via useFrame.
    // This distributes the update logic and avoids re-rendering the parent manager.

    return (
        <group>
            {initialPool.map(obj => (
                <SceneryItem key={obj.id} data={obj} />
            ))}
        </group>
    );
};

const SceneryItem: React.FC<{ data: SceneryObject }> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { speedMultiplier, gameStatus, score } = useGameStore();
    const [sceneryType, setSceneryType] = useState<SceneryType>(data.initialType);

    const isActive = data.index < (BASE_ACTIVE_COUNT + (score / 40));

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        if (!isActive) {
            groupRef.current.visible = false;
            groupRef.current.position.z = RESET_Z;
            return;
        }

        groupRef.current.visible = true;

        if (gameStatus !== 'playing' && gameStatus !== 'tutorial') return;
        if (gameStatus === 'tutorial') return;

        const currentSpeed = 40 * speedMultiplier;

        // Move
        groupRef.current.position.z += currentSpeed * delta;

        // Recycle
        if (groupRef.current.position.z > DESPAWN_Z) {
            groupRef.current.position.z = RESET_Z;

            const isLeft = Math.random() > 0.5;
            const xRange = isLeft ? [LEFT_X_MIN, LEFT_X_MAX] : [RIGHT_X_MIN, RIGHT_X_MAX];
            groupRef.current.position.x = THREE.MathUtils.randFloat(xRange[0], xRange[1]);
            groupRef.current.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);

            // DYNAMIC TYPE GENERATION
            // "Mientras mas puntos... mas Flowers_1"
            const flowerChance = Math.min(0.6, 0.2 + (score / 3000));

            if (Math.random() < flowerChance) {
                setSceneryType('flowers');
            } else {
                const others: SceneryType[] = ['tree1', 'tree2', 'grassBig', 'grassSmall'];
                setSceneryType(others[Math.floor(Math.random() * others.length)]);
            }
        }
    });

    const getComponent = () => {
        switch (sceneryType) {
            case 'tree1': return <Tree1 />;
            case 'tree2': return <Tree2 />;
            case 'flowers': return <Flowers1 />;
            case 'grassBig': return <GrassBig />;
            case 'grassSmall': return <GrassSmall />;
            default: return null;
        }
    };

    return (
        <group
            ref={groupRef}
            position={data.initialPosition}
            scale={[data.scale, data.scale, data.scale]}
            rotation={[0, data.rotationY, 0]}
        >
            {getComponent()}
        </group>
    );
};
