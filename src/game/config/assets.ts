import { AssetConfig } from '../managers/AssetManager';

export const gameAssets: AssetConfig[] = [
  // Character assets
  {
    key: 'player',
    path: 'assets/characters/player.png',
    type: 'image',
    version: '1.0.0',
    fallback: 'assets/fallback/player.png'
  },
  {
    key: 'enemy',
    path: 'assets/characters/enemy.png',
    type: 'image',
    version: '1.0.0',
    fallback: 'assets/fallback/enemy.png'
  },

  // UI assets
  {
    key: 'action-icons',
    path: 'assets/ui/action-icons.png',
    type: 'atlas',
    version: '1.0.0',
    fallback: 'assets/fallback/action-icons.png'
  },

  // Map assets
  {
    key: 'desert-map',
    path: 'assets/tiles/map-01.json',
    type: 'tilemapTiledJSON',
    version: '1.0.0'
  },
  {
    key: 'tmw_desert_spacing',
    path: 'assets/tiles/tmw_desert_spacing.png',
    type: 'image',
    version: '1.0.0'
  }
];

// Asset groups for selective loading
export const assetGroups = {
  essential: ['player', 'enemy', 'action-icons'],
  map: ['desert-map', 'tmw_desert_spacing'],
  ui: ['action-icons'],
  characters: ['player', 'enemy']
}; 