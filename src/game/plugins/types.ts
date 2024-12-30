import { ArchethicStatePlugin } from './ArchethicStatePlugin';

export interface EnemyContractState {
  position: {
    x: number;
    y: number;
  };
  stats: {
    health: number;
    attack: number;
    defense: number;
  };
  state: 'idle' | 'patrolling' | 'chasing' | 'attacking';
  targetId?: string;
}

export interface ArchethicConfig {
  endpoint: string;
  network?: string;
  explorerUrl?: string;
  genesisAddress?: string;
  contracts: {
    game: string;
    monsters: string;
    resources: string;
    inventory: string;
  };
}

// Extend Phaser's Plugin types
declare module 'phaser' {
  namespace Plugins {
    interface PluginManager {
      install(key: 'ArchethicStatePlugin', plugin: typeof ArchethicStatePlugin, start?: boolean): void;
    }
  }
} 