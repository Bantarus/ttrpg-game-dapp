import { PlayerCharacter } from './PlayerCharacter';
import { EnemyCharacter } from './EnemyCharacter';

export class CharacterFactory {
  private scene: Phaser.Scene;
  private readonly DEPTH = {
    GROUND: 0,
    GRID: 5,
    CHARACTERS: 10,
    UI: 20
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createPlayerCharacter(x: number, y: number): PlayerCharacter {
    const player = new PlayerCharacter({
      scene: this.scene,
      x,
      y,
      texture: 'player',
      name: 'Player',
      owner: 'player1'
    });
    player.setDepth(this.DEPTH.CHARACTERS);
    return player;
  }

  createEnemyCharacter(x: number, y: number): EnemyCharacter {
    const enemy = new EnemyCharacter({
      scene: this.scene,
      x: x,
      y: y,
      texture: 'enemy'
    });
    enemy.setDepth(this.DEPTH.CHARACTERS);
    return enemy;
  }
} 