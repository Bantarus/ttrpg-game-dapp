import { GameCharacter } from './GameCharacter';
import { CharacterConfig } from '../types/character';

export class PlayerCharacter extends GameCharacter {
  constructor(config: CharacterConfig) {
    super({
      ...config,
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 15,
        defense: 10,
        movement: 3,
        attackRange: 2,
        abilityRange: 3,
        ...config.stats
      }
    });
  }

  protected getHealthColor(percent: number): number {
    if (percent > 0.6) return 0x00ff00;    // Green
    if (percent > 0.3) return 0xffff00;    // Yellow
    return 0xff0000;                       // Red
  }

  protected createPulsingRange(): void {
    const rangeGraphics = this.scene.add.graphics();
    const range = this.moveRange * this.tileSize;
    
    // Draw the range circle with blue indicators
    rangeGraphics.lineStyle(2, 0x4a9eff, 0.4);
    rangeGraphics.strokeCircle(0, 0, range);
    
    // Draw segments
    const segments = 32;
    const angleStep = (Math.PI * 2) / segments;
    
    for (let i = 0; i < segments; i++) {
      const startAngle = i * angleStep;
      const endAngle = startAngle + (angleStep * 0.6);
      
      rangeGraphics.lineStyle(2, 0x4a9eff, 0.3)
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
    
    // Player-specific damage effects
    this.scene.cameras.main.shake(200, 0.005);
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