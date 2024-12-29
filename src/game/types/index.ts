import { GameCharacter } from '../characters/GameCharacter';

export type GamePhase = 'MOVEMENT' | 'TARGETING' | 'BATTLE';

export interface GameState {
  gamePhase: GamePhase;
  players: Map<string, GameCharacter>;
}

export interface Position {
  x: number;
  y: number;
} 