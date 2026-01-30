import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Track } from './World/Track';
import { CatPlayer } from './Player/CatPlayer';
import { WasteManager } from './World/WasteManager';
import { PerspectiveCamera } from '@react-three/drei';

const GameContent: React.FC = () => {
    return (
        <>
            {/* Fog for depth and to hide the horizon cut-off */}
            <fog attach="fog" args={['#87CEEB', 10, 60]} />

            <ambientLight intensity={0.5} />
            <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />

            {/* Camera: Lower and angled to cover the bottom gap */}
            <PerspectiveCamera
                makeDefault
                position={[0, 4, 8]}
                rotation={[-0.25, 0, 0]}
                fov={60}
                near={0.1}
                far={1000}
            />



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
