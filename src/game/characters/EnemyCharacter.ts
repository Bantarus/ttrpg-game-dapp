import { BaseCharacter } from './BaseCharacter';
import { CharacterConfig } from '../types/character';

export class EnemyCharacter extends BaseCharacter {
  constructor(config: CharacterConfig) {
    super(config);
  }

  protected getHealthColor(percent: number): number {
    return 0xff4a4a; // Always red for enemies
  }

  protected createPulsingRange(): void {
    const rangeGraphics = this.scene.add.graphics();
    const range = this.moveRange * this.tileSize;
    
    // Draw the range circle with red indicators
    rangeGraphics.lineStyle(2, 0xff4a4a, 0.4);
    rangeGraphics.strokeCircle(0, 0, range);
    
    // Draw segments
    const segments = 32;
    const angleStep = (Math.PI * 2) / segments;
    
    for (let i = 0; i < segments; i++) {
      const startAngle = i * angleStep;
      const endAngle = startAngle + (angleStep * 0.6);
      
      rangeGraphics.lineStyle(2, 0xff4a4a, 0.3)
        .beginPath()
        .arc(0, 0, range, startAngle, endAngle)
        .strokePath();
    }
    
    this.add(rangeGraphics);

    // Add pulsing effect
    this.scene.tweens.add({
      targets: rangeGraphics,
      alpha: { from: 1, to: 0.6 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public takeDamage(amount: number): void {
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    this.updateHealthRing();
    
    // Enemy-specific damage effects
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.stats.hp <= 0) {
      this.onDeath();
    }
  }

  private onDeath(): void {
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