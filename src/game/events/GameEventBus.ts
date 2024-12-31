import { EventEmitter } from 'events';

class GameEventBus {
    private static instance: GameEventBus;
    private emitter: EventEmitter;

    private constructor() {
        this.emitter = new EventEmitter();
    }

    public static getInstance(): GameEventBus {
        if (!GameEventBus.instance) {
            GameEventBus.instance = new GameEventBus();
        }
        return GameEventBus.instance;
    }

    public emit(event: string, data: any): void {
        this.emitter.emit(event, data);
    }

    public on(event: string, callback: (data: any) => void): void {
        this.emitter.on(event, callback);
    }

    public off(event: string, callback: (data: any) => void): void {
        this.emitter.off(event, callback);
    }
}

export const gameEventBus = GameEventBus.getInstance(); 