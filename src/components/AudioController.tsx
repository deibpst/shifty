import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store';

export const AudioController: React.FC = () => {
    const gameAudioRef = useRef<HTMLAudioElement | null>(null);
    const menuAudioRef = useRef<HTMLAudioElement | null>(null);
    
    // Estado para gestionar las Políticas de Autoplay
    // El audio no arrancará en los navegadores hasta que el usuario interactúe al menos una vez (clic/tecla)
    const [hasInteracted, setHasInteracted] = useState(false);
    
    const gameStatus = useGameStore((state) => state.gameStatus);
    const speedMultiplier = useGameStore((state) => state.speedMultiplier);
    const isPaused = useGameStore((state) => state.isPaused);
    const isMuted = useGameStore((state) => state.isMuted);

    // Inicialización de pistas y listeners globales de interacción
    useEffect(() => {
        if (!gameAudioRef.current) {
            gameAudioRef.current = new Audio('/Pista.mpeg');
            gameAudioRef.current.loop = true;
        }
        if (!menuAudioRef.current) {
            menuAudioRef.current = new Audio('/menu.mpeg');
            menuAudioRef.current.loop = true;
        }

        const handleInteraction = () => {
            if (!hasInteracted) {
                setHasInteracted(true);
            }
        };

        // Detectar cualquier interacción válida para desbloquear el audio
        window.addEventListener('pointerdown', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('pointerdown', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [hasInteracted]);

    // Lógica cruzada de Play/Pause dependiendo del gameState (gameStatus)
    useEffect(() => {
        const gameAudio = gameAudioRef.current;
        const menuAudio = menuAudioRef.current;

        if (!gameAudio || !menuAudio) return;

        // Si el usuario silenció el juego desde la UI, paramos ambas pistas inmediatamente
        if (isMuted) {
            gameAudio.pause();
            menuAudio.pause();
            return;
        }

        // Definimos cuándo es gameplay activo vs cuándo es menú/tienda/gameover
        const isGameplay = gameStatus === 'playing' || gameStatus === 'tutorial';
        
        // El audio in-game suena si estamos jugando Y NO está en pausa
        const isGameAudioActive = isGameplay && !isPaused;
        // El audio del menú suena siempre que NO estemos en medio de la partida (ej. menú, perdidas)
        // Ojo: Si quieres que suene el menú durante la pausa añade: || isPaused
        const isMenuAudioActive = !isGameplay; 

        // IMPORTANTE: Respetar Autoplay Policy. No llamamos .play() sin interacción previa
        if (!hasInteracted) return;

        // Cross-playback: Apagamos una, encendemos otra
        if (isGameAudioActive) {
            gameAudio.play().catch(err => console.warn('Game audio autoplay error', err));
        } else {
            gameAudio.pause();
            // Opcional: ¿Quieres reiniciar la pista de juego al salir? Comenta la línea siguiente si quieres que continúe donde se quedó
            gameAudio.currentTime = 0; 
        }

        if (isMenuAudioActive) {
            menuAudio.play().catch(err => console.warn('Menu audio autoplay error', err));
        } else {
            menuAudio.pause();
        }
    }, [gameStatus, isPaused, isMuted, hasInteracted]);

    // Aceleración dinámica SOLO para la pista principal del juego
    useEffect(() => {
        if (gameAudioRef.current) {
            const baseAudioSpeed = 1.0;
            const dampeningFactor = 0.4; 
            const calculatedRate = baseAudioSpeed + ((speedMultiplier - 0.6) * dampeningFactor);
            
            gameAudioRef.current.playbackRate = Math.max(0.5, Math.min(2.0, calculatedRate));
        }
    }, [speedMultiplier]);

    return null; // Componente invisible (Global Audio Manager)
};
