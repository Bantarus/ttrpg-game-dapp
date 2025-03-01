export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  tilesets: TiledTileset[];
}

export interface TiledLayer {
  name: string;
  type: 'tilelayer' | 'objectgroup';
  data?: number[];
  objects?: TiledObject[];
  visible: boolean;
}

export interface TiledObject {
  id: number;
  name?: string;
  type?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  gid?: number;
  properties?: TiledProperty[];
}

export interface TiledProperty {
  name: string;
  type: string;
  value: any;
}

export interface TiledTileset {
  firstgid: number;
  name: string;
  tilewidth: number;
  tileheight: number;
  tilecount: number;
  tiles?: {
    id: number;
    properties: TiledProperty[];
  }[];
}

// New types for enhanced map support
export enum TileType {
  NORMAL = 'normal',
  WALL = 'wall',
  CHEST = 'chest',
  RESOURCE = 'resource',
  PORTAL = 'portal',
  ENEMY_SPAWN = 'enemy_spawn',
  PLAYER_SPAWN = 'player_spawn'
}

export interface Tile extends Phaser.Tilemaps.Tile {
  properties: {
    type: TileType;
    state: number;
    [key: string]: any;
  };
}

export interface SpawnPoint {
  x: number;
  y: number;
  type: TileType;
  properties: {
    [key: string]: any;
  };
}

export interface MapExit {
  x: number;
  y: number;
  targetMap: string;
  targetX: number;
  targetY: number;
}

export interface MapProperties {
  name: string;
  difficulty: number;
  environment: string;
  spawnPoints: SpawnPoint[];
  exits: MapExit[];
} 