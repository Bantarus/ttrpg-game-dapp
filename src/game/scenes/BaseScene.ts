import { Scene } from 'phaser';

export class BaseScene extends Scene {
  constructor(key: string) {
    super(key);
  }

  init(data?: any): void {
    // Common initialization logic
  }

  preload(): void {
    // Common preload logic
  }

  create(data?: any): void {
    // Common create logic
  }

  update(time: number, delta: number): void {
    // Common update logic
  }

  wake(): void {
    // Common wake logic
  }

  sleep(): void {
    // Common sleep logic
  }

  stop(): void {
    // Common stop logic
  }
} 