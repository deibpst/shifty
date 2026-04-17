import { useGameStore } from '../store';

// Lane index mapping: color button → 0-indexed lane
const COLOR_TO_LANE: Record<string, number> = {
    green: 0,
    blue: 1,
    purple: 1,   // alias
    yellow: 2,
    red: 3,
    orange: 3,   // alias
};

// Global reference to the writable stream so we can send messages from anywhere
let serialWriter: WritableStreamDefaultWriter<string> | null = null;
export let isSerialConnected = false;
let lastMenuActionTime = 0;

/**
 * Parses a single text line from the ESP32 (e.g., "btn:green") 
 * and maps it to a Zustand store action.
 */
function handleSerialMessage(line: string) {
    const trimmed = line.trim().toLowerCase();
    if (!trimmed) return;

    // Expected format: "btn:green", "btn:pause", "btn:sound"
    if (trimmed.startsWith('btn:')) {
        const button = trimmed.substring(4); // e.g., "green"

        const state = useGameStore.getState();
        const setLane = state.setLane;
        const togglePause = state.togglePause;
        const toggleMute = state.toggleMute;
        const setGameStatus = state.setGameStatus;
        const gameStatus = state.gameStatus;
        const startGame = state.startGame;

        // Debounce / Throttle preventer for menus
        // Prevents holding a button from instantly clicking through multiple nested menus.
        const isMenuState = gameStatus === 'menu' || gameStatus === 'categorySelect' || gameStatus === 'customizing' || gameStatus === 'gameover' || state.isPaused;
        if (isMenuState) {
            const now = Date.now();
            if (now - lastMenuActionTime < 150) {
                return; // Ignore rapid fires in menus
            }
            lastMenuActionTime = now;
        }

        // Navigation in Pause Menu
        if (state.isPaused) {
            if (button === 'green' || button === 'pause') {
                togglePause();
                return;
            }
            if (button === 'red' || button === 'orange') {
                togglePause(); // Remove pause completely before navigating away
                setGameStatus('menu');
                return;
            }
            if (button === 'sound') {
                toggleMute();
                return;
            }
            // Ignore any lane changes or UI interactions while paused
            return;
        }

        // Navigation in Game Over
        if (gameStatus === 'gameover') {
            if (button === 'red' || button === 'orange') {
                setGameStatus('menu');
                return;
            }
            if (button === 'green') {
                startGame();
                return;
            }
            // Ignore other buttons while in game over
            return;
        }

        // Navigation in Main Menu
        if (gameStatus === 'menu') {
            if (button === 'green') {
                setGameStatus('categorySelect');
                return;
            }
            if (button === 'blue' || button === 'purple') {
                setGameStatus('customizing');
                return;
            }
        }

        // Navigation in Category Select
        if (gameStatus === 'categorySelect') {
            window.dispatchEvent(new CustomEvent('serial:categorySelect', { detail: button }));
            return;
        }

        // Navigation in Customizer
        if (gameStatus === 'customizing') {
            window.dispatchEvent(new CustomEvent('serial:customizer', { detail: button }));
            return;
        }

        if (button === 'pause') {
            togglePause();
            return;
        }

        if (button === 'sound') {
            toggleMute();
            return;
        }

        const laneIndex = COLOR_TO_LANE[button];
        if (laneIndex !== undefined) {
            setLane(laneIndex);
            return;
        }

        console.warn('[Serial] Unknown button pressed:', button);
    } else {
        console.log('[Serial] ESP32:', trimmed);
    }
}

/**
 * Requests a serial port from the user, configures streams, 
 * and starts the read loop.
 */
export async function connectToSerial() {
    if (!('serial' in navigator)) {
        alert("Tu navegador no soporta la Web Serial API (Usa Chrome o Edge).");
        return;
    }

    try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        isSerialConnected = true;

        console.log("[Serial] Conectado al Mando USB ESP32.");

        // Setup the encoder/writer (Juego -> ESP32)
        const textEncoder = new TextEncoderStream();
        if (port.writable) {
            textEncoder.readable.pipeTo(port.writable);
            serialWriter = textEncoder.writable.getWriter();
        }

        // Setup the decoder/reader (ESP32 -> Juego)
        const textDecoder = new TextDecoderStream();
        if (port.readable) {
            port.readable.pipeTo(textDecoder.writable);
            const reader = textDecoder.readable.getReader();

            let buffer = "";

            try {
                // Background read loop
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        break;
                    }

                    if (value) {
                        buffer += value;
                        // ESP32 sends println() which usually ends with \n or \r\n
                        const lines = buffer.split(/\r?\n/);
                        // The last element is either empty (if ended perfectly with \n) 
                        // or an incomplete chunk. Keep it in the buffer.
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            handleSerialMessage(line);
                        }
                    }
                }
            } catch (error) {
                console.error("[Serial] Error de lectura:", error);
            } finally {
                reader.releaseLock();
            }
        }
    } catch (err) {
        console.error("[Serial] Error al conectar:", err);
    }
}

/**
 * Sends a string message via USB to the ESP32.
 * @param msg The string to send (must end with '\n' if ESP32 expects lines)
 */
export async function sendSerialMessage(msg: string) {
    if (!isSerialConnected || !serialWriter) return;

    try {
        await serialWriter.write(msg);
    } catch (err) {
        console.error("[Serial] No se pudo enviar el mensaje:", err);
    }
}
