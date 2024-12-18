export interface Position {
  x: number;
  y: number;
}

export interface CharacterStats {
  hp: number;
  attack: number;
  defense: number;
  movement: number;
}

export interface Character {
  id: string;
  owner: string;
  name: string;
  stats: CharacterStats;
  position: Position;
  inventory: Item[];
  abilities: Ability[];
  currentDialPosition: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  effects: Effect[];
}

export interface Ability {
  id: string;
  name: string;
  type: AbilityType;
  effects: Effect[];
  cooldown: number;
}

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  CONSUMABLE = 'CONSUMABLE',
}

export enum AbilityType {
  ATTACK = 'ATTACK',
  DEFENSE = 'DEFENSE',
  UTILITY = 'UTILITY',
}

export interface Effect {
  type: EffectType;
  value: number;
  duration?: number;
}

export enum EffectType {
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL',
  BUFF = 'BUFF',
  DEBUFF = 'DEBUFF',
}

export enum GamePhase {
  SETUP = 'SETUP',
  MOVEMENT = 'MOVEMENT',
  ACTION = 'ACTION',
  BATTLE = 'BATTLE',
  END_TURN = 'END_TURN',
} 