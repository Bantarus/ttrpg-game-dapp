import { PlayerCharacter } from './PlayerCharacter';
import { EnemyCharacter } from './EnemyCharacter';
import { CharacterConfig } from '../types/character';

export class CharacterFactory {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createPlayerCharacter(x: number, y: number): PlayerCharacter {
    const config: CharacterConfig = {
      scene: this.scene,
      x,
      y,
      texture: 'player',
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 15,
        defense: 10,
        movement: 3,
        attackRange: 2,
        abilityRange: 3
      }
    };
    
    return new PlayerCharacter(config);
  }

  createEnemyCharacter(x: number, y: number): EnemyCharacter {
    const config: CharacterConfig = {
      scene: this.scene,
      x,
      y,
      texture: 'enemy',
      stats: {
        hp: 80,
        maxHp: 80,
        attack: 12,
        defense: 8,
        movement: 2,
        attackRange: 1,
        abilityRange: 2
      }
    };
    
    return new EnemyCharacter(config);
  }
} 