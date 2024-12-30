import 'phaser';
import Archethic from '@archethicjs/sdk';
import { EventEmitter } from 'events';
import { ArchethicConfig } from './types';

export class ArchethicStatePlugin extends Phaser.Plugins.BasePlugin {
  private archethic: Archethic | null = null;
  private config: ArchethicConfig | null = null;
  private polling: boolean = false;
  private pollInterval: number = 1000;
  private contractAddresses: Map<string, string> = new Map();
  private lastStates: Map<string, any> = new Map();
  private eventEmitter: EventEmitter;

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
    this.eventEmitter = new EventEmitter();
  }

  init(): void {
    // Load config from environment or config file
    this.config = {
      endpoint: process.env.ARCHETHIC_ENDPOINT || 'https://testnet.archethic.net',
      network: process.env.ARCHETHIC_NETWORK || 'testnet',
      contracts: {
        game: process.env.GAME_CONTRACT_ADDRESS || '',
        monsters: process.env.MONSTERS_CONTRACT_ADDRESS || '',
        resources: process.env.RESOURCES_CONTRACT_ADDRESS || '',
        inventory: process.env.INVENTORY_CONTRACT_ADDRESS || ''
      }
    };

    this.archethic = new Archethic(this.config.endpoint);
    
    // Register contract addresses
    Object.entries(this.config.contracts).forEach(([key, address]) => {
      this.contractAddresses.set(key, address);
    });
  }

  // Add event handling methods
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  emit(event: string, ...args: any[]): boolean {
    return this.eventEmitter.emit(event, ...args);
  }

  // New methods for game state interactions
  async getGameState(): Promise<any> {
    if (!this.archethic) throw new Error('Archethic not initialized');
    try {
      return await this.archethic.network.callFunction(
        this.contractAddresses.get('game') || '',
        'get_game_state',
        []
      );
    } catch (error) {
      console.error('Error fetching game state:', error);
      throw error;
    }
  }

  async getEnemyState(enemyId: string): Promise<any> {
    if (!this.archethic) throw new Error('Archethic not initialized');
    const address = this.contractAddresses.get(enemyId);
    if (!address) throw new Error(`No contract address for enemy ${enemyId}`);

    try {
      return await this.archethic.network.callFunction(
        address,
        'get_enemy_state',
        []
      );
    } catch (error) {
      console.error(`Error fetching enemy state for ${enemyId}:`, error);
      throw error;
    }
  }

  async getMonsterState(monsterId: string): Promise<any> {
    if (!this.archethic) throw new Error('Archethic not initialized');
    try {
      return await this.archethic.network.callFunction(
        this.contractAddresses.get('monsters') || '',
        'get_monster_state',
        [monsterId]
      );
    } catch (error) {
      console.error(`Error fetching monster state for ${monsterId}:`, error);
      throw error;
    }
  }

  async collectResource(resourceId: string, amount: number): Promise<void> {
    if (!this.archethic) throw new Error('Archethic not initialized');
    try {
      await this.archethic.network.callFunction(
        this.contractAddresses.get('resources') || '',
        'collect_resource',
        [resourceId, amount]
      );
      this.emit('resourceCollected', { resourceId, amount });
    } catch (error) {
      console.error('Error collecting resource:', error);
      throw error;
    }
  }

  async pickUpObject(objectId: string): Promise<void> {
    if (!this.archethic) throw new Error('Archethic not initialized');
    try {
      await this.archethic.network.callFunction(
        this.contractAddresses.get('inventory') || '',
        'pick_up_object',
        [objectId]
      );
      this.emit('objectPickedUp', { objectId });
    } catch (error) {
      console.error('Error picking up object:', error);
      throw error;
    }
  }

  // Existing methods with updates
  private async pollContractStates(): Promise<void> {
    while (this.polling) {
      try {
        for (const [enemyId, address] of this.contractAddresses) {
          const newState = await this.fetchContractState(address);
          const lastState = this.lastStates.get(enemyId);

          if (this.hasStateChanged(lastState, newState)) {
            this.lastStates.set(enemyId, newState);
            this.emit('enemyStateChanged', { enemyId, state: newState });
          }
        }
      } catch (error) {
        console.error('Error polling contract states:', error);
      }

      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }
  }

  private async fetchContractState(address: string): Promise<any> {
    if (!this.archethic) throw new Error('Archethic not initialized');

    try {
      const response = await this.archethic.network.callFunction(address, 'getState', []);
      return response;
    } catch (error) {
      console.error(`Error fetching state for contract ${address}:`, error);
      throw error;
    }
  }

  private hasStateChanged(oldState: any, newState: any): boolean {
    return JSON.stringify(oldState) !== JSON.stringify(newState);
  }

  setPollInterval(ms: number): void {
    this.pollInterval = ms;
  }
} 