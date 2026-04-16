import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store';

export const AudioController: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    const gameStatus = useGameStore((state) => state.gameStatus);
    const speedMultiplier = useGameStore((state) => state.speedMultiplier);
    const isPaused = useGameStore((state) => state.isPaused);
    const isMuted = useGameStore((state) => state.isMuted);

    useEffect(() => {
        // Initialize audio instance only once
        if (!audioRef.current) {
            const audio = new Audio('/Pista.mpeg');
            audio.loop = true;
            audioRef.current = audio;
        }

        const audio = audioRef.current;
        const isPlayingCondition = (gameStatus === 'playing' || gameStatus === 'tutorial') && !isPaused && !isMuted;

        if (isPlayingCondition) {
            // Browsers require user interaction before playing audio. 
            // Since gameStatus changes on click (e.g. "Start Game"), it is generally safe.
            audio.play().catch(err => {
                console.warn('Autoplay prevented by browser. Audio needs user interaction first.', err);
            });
        } else {
            audio.pause();
        }
    }, [gameStatus, isPaused, isMuted]);

    useEffect(() => {
        // Sync playback rate with speedMultiplier
        if (audioRef.current) {
            // soften the acceleration:
            // speedMultiplier starts at 0.6.
            // For every 0.1 increase in game speed, audio will only increase by 0.04 (multiplier 0.4)
            // Example:
            // game: 0.6 -> audio: 1.0x
            // game: 1.0 -> audio: 1.16x
            // game: 2.0 (max) -> audio: 1.56x
            const baseAudioSpeed = 1.0;
            const dampeningFactor = 0.4; 
            const calculatedRate = baseAudioSpeed + ((speedMultiplier - 0.6) * dampeningFactor);
            
            audioRef.current.playbackRate = Math.max(0.5, Math.min(2.0, calculatedRate));
        }
    }, [speedMultiplier]);

    return null; // Invisible component
};
