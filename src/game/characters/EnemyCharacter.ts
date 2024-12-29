import { GameCharacter } from './GameCharacter';
import { CharacterConfig } from '../types/character';

export class EnemyCharacter extends GameCharacter {
  constructor(config: CharacterConfig) {
    super({
      ...config,
      stats: {
        hp: 80,
        maxHp: 80,
        attack: 12,
        defense: 8,
        movement: 2,
        attackRange: 1,
        abilityRange: 2,
        ...config.stats
      }
    });
  }

  protected getHealthColor(percent: number): number {
    return 0xff4a4a; // Always red for enemies
  }

  protected createPulsingRange(): void {
    // Implement enemy-specific range visualization
    const rangeGraphics = this.scene.add.graphics();
    const range = this.moveRange * this.tileSize;
    
    rangeGraphics.lineStyle(2, 0xff4a4a, 0.4);
    rangeGraphics.strokeCircle(0, 0, range);
    
    this.add(rangeGraphics);
  }

  protected onDeath(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: '+=20',
      duration: 800,
      onComplete: () => {
        this.destroy();
      }
    });
  }
} 