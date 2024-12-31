import { PlayerCharacter } from '../characters/PlayerCharacter';
import { EnemyCharacter } from '../characters/EnemyCharacter';
import { EnemyContractState } from '../plugins/types';
import { GameSceneInterface } from '../types/scene';
import { ArchethicStatePlugin } from '../plugins/ArchethicStatePlugin';

export class GameStateManager {
  private scene: GameSceneInterface;
  private players: Map<string, PlayerCharacter>;
  private enemies: Map<string, EnemyCharacter>;
  private tileSize: number;
  private archethicPlugin: ArchethicStatePlugin | null = null;

  constructor(scene: GameSceneInterface, tileSize: number) {
    this.scene = scene;
    this.players = new Map();
    this.enemies = new Map();
    this.tileSize = tileSize;
    this.initialize();
  }

  private initialize(): void {
    // Get the plugin with null check
    this.archethicPlugin = (this.scene as any).plugins?.get('ArchethicStatePlugin');
    
    // Only subscribe to events if plugin is available
    if (this.archethicPlugin) {
      this.archethicPlugin.on('enemyStateChanged', this.handleEnemyStateChange.bind(this));
      this.archethicPlugin.on('resourceCollected', this.handleResourceCollection.bind(this));
      this.archethicPlugin.on('objectPickedUp', this.handleObjectPickup.bind(this));
    } else {
      console.warn('ArchethicStatePlugin not available - some features may be limited');
    }
  }

  public addPlayer(playerId: string, player: PlayerCharacter): void {
    this.players.set(playerId, player);
  }

  private handleEnemyStateChange({ enemyId, state }: { enemyId: string, state: EnemyContractState }): void {
    if (!this.archethicPlugin) {
      console.warn('ArchethicStatePlugin not available - enemy state changes will not be processed');
      return;
    }

    const enemy = this.enemies.get(enemyId);
    
    if (enemy) {
      // Update enemy position
      enemy.setPosition(
        state.position.x * this.tileSize,
        state.position.y * this.tileSize
      );

      // Update enemy stats
      // TODO: Implement updateStats method

      // Handle state-specific behavior
      switch (state.state) {
        case 'idle':
          // TODO: Implement idle behavior
          break;
      }
    }
  }

  private handleResourceCollection(data: { resourceId: string, amount: number }): void {
    if (!this.archethicPlugin) {
      console.warn('ArchethicStatePlugin not available - resource collection will not be processed');
      return;
    }
    // Update game state with collected resource
    this.scene.events.emit('resourceCollected', data);
  }

  private handleObjectPickup(data: { objectId: string }): void {
    if (!this.archethicPlugin) {
      console.warn('ArchethicStatePlugin not available - object pickup will not be processed');
      return;
    }
    // Update game state with picked up object
    this.scene.events.emit('objectPickedUp', data);
  }

  public getPlayer(playerId: string): PlayerCharacter | undefined {
    return this.players.get(playerId);
  }

  public getEnemy(enemyId: string): EnemyCharacter | undefined {
    return this.enemies.get(enemyId);
  }

  public getAllPlayers(): PlayerCharacter[] {
    return Array.from(this.players.values());
  }

  public getAllEnemies(): EnemyCharacter[] {
    return Array.from(this.enemies.values());
  }

  destroy(): void {
    this.players.clear();
    this.enemies.clear();
  }
} 