export interface CharacterStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  movement: number;
  attackRange: number;
  abilityRange: number;
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface CharacterConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
  stats?: Partial<CharacterStats>;
  name?: string;
  owner?: string;
  gridPosition?: GridPosition;
}

export type GamePhase = 'MOVEMENT' | 'ACTION' | 'BATTLE' | 'END_TURN';

export interface Character {
  id: string;
  owner: string;
  name: string;
  stats: CharacterStats;
  position: {
    x: number;
    y: number;
  };
} 