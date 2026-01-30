import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Track } from './World/Track';
import { CatPlayer } from './Player/CatPlayer';
import { WasteManager } from './World/WasteManager';
import { PerspectiveCamera } from '@react-three/drei';

const GameContent: React.FC = () => {
    return (
        <>
            {/* Camera: High and angled down to see the path ahead */}
            <PerspectiveCamera
                makeDefault
                position={[0, 7, 12]}
                rotation={[-0.35, 0, 0]}
                fov={60}
                near={0.1}
                far={1000}
            />

            {/* Lighting: Strong directional light for shadows + Ambient */}
            <ambientLight intensity={0.7} />
            <directionalLight
                position={[-10, 20, 10]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
            />

            {/* Fog: Matches the sky color to hide the spawn point */}
            <fog attach="fog" args={['#87CEEB', 30, 150]} />

            {/* World Components */}
            <Track />
            <WasteManager />
            <CatPlayer />

            {/* Environment for better reflections if materials are glossy */}
            {/* <Environment preset="city" /> */}
        </>
    );
};

export const GameScene: React.FC = () => {
    return (
        <div className="w-full h-full absolute inset-0 bg-sky-300">
            <Canvas shadows>
                <Suspense fallback={null}>
                    <GameContent />
                </Suspense>
            </Canvas>
        </div>
    );
};
