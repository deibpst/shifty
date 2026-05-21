// Type definitions for Web Serial API
// Standardized types are not yet included in lib.dom.d.ts by default.

interface SerialOptions {
    baudRate: number;
    dataBits?: number;
    stopBits?: number;
    parity?: 'none' | 'even' | 'odd' | 'mark' | 'space';
    bufferSize?: number;
    flowControl?: 'none' | 'hardware';
}

interface SerialPort {
    open(options: SerialOptions): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream<any> | null;
    writable: WritableStream<any> | null;
}

interface Serial {
    getPorts(): Promise<SerialPort[]>;
    requestPort(options?: { filters: any[] }): Promise<SerialPort>;
}

interface Navigator {
    serial: Serial;
}

interface GLTFAction extends import('three').AnimationClip {
    name: string;
}

