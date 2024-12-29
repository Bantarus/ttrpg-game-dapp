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
interface SpawnPoint {
  x: number;
  y: number;
  type: 'player' | 'enemy' | 'neutral';
  properties?: Record<string, any>;
}

interface MapExit {
  x: number;
  y: number;
  targetMap: string;
  targetX: number;
  targetY: number;
  requirements?: Record<string, any>;
}

interface TileProperties {
  walkable: boolean;
  cost?: number;
  effect?: string;
  trigger?: string;
  animation?: string;
} 