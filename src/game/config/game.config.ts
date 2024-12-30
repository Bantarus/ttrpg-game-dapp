import { ArchethicStatePlugin } from '../plugins/ArchethicStatePlugin';

export const gameConfig = {
  type: Phaser.AUTO,
  // ... other config options
  plugins: {
    global: [{
      key: 'ArchethicStatePlugin',
      plugin: ArchethicStatePlugin,
      mapping: 'archethicPlugin',
      start: true
    }]
  }
}; 