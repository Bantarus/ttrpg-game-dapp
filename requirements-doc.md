# Technical Requirements Document: MMO TTRPG Board Game

## 1. Project Overview
A blockchain-based MMO TTRPG board game built with Next.js and Phaser, featuring a Talisman-like board layout and HeroClix-inspired battle mechanics.

## 2. Technical Stack
### Frontend
- Next.js (React Framework)
- TypeScript
- Phaser 4 (Game Engine)
- TailwindCSS (Styling)
- shadcn/ui (UI Components)

### Blockchain Integration
- Archethic SDK
- Transaction-based state management
- Deterministic combat system

## 3. Core Features

### 3.1 Game Board
- Grid-based map system similar to Talisman
- Proper depth management system
  - Ground layer (depth 0)
  - Grid overlay (depth 5)
  - Characters (depth 10)
  - UI elements (depth 20)
- Interactive grid cells
- Tile-based collision system
- Spawn point management

### 3.2 Character System
#### Character Implementation
- [x] Abstract GameCharacter class using Phaser.GameObjects.Container
- [x] Direct Player/Enemy inheritance from GameCharacter
- [x] Character factory pattern
- [x] Basic animations and visual effects
- [x] Health and stats management
- [x] Death handling and cleanup
- [ ] Movement system with pathfinding
- [ ] Character customization
- [ ] Special abilities

#### Character Class Structure
```typescript
interface CharacterSystem {
  GameCharacter: abstract class {
    // Common functionality
    stats: CharacterStats;
    position: GridPosition;
    visual: CharacterVisuals;
    
    // Abstract methods
    getHealthColor(): number;
    createPulsingRange(): void;
    takeDamage(amount: number): void;
    onDeath(): void;
  };
  
  PlayerCharacter: class extends GameCharacter {
    // Player-specific implementations
    blueTargetingIndicators: boolean;
    dynamicHealthColors: boolean;
    cameraShakeOnDamage: boolean;
  };
  
  EnemyCharacter: class extends GameCharacter {
    // Enemy-specific implementations
    redTargetingIndicators: boolean;
    consistentRedHealth: boolean;
    flashOnDamage: boolean;
  };
}
```

#### Battle Dial (HeroClix Inspired)
- Rotating stat display
- Stats include:
  - Health Points (HP)
  - Attack Power
  - Defense
  - Movement Range
  - Special Abilities
- Visual representation of current state
- Click/rotation mechanics for stat changes

#### Character Creation
- Custom character creation interface
- Selection of pre-made characters
- Character data stored on-chain
- NFT integration for character ownership

### Character Token UI
- [x] Modern circular design replacing HeroClix dial
- [x] Dynamic health ring visualization
- [x] Action buttons system
  - Move action
  - Attack action
  - Special ability action
- [x] Character portrait with mask
- [x] Status effects display
- [x] Selection feedback
- [x] Interactive hover states

### Asset Requirements
- [x] Action icons sprite atlas
  - Move icon
  - Attack icon
  - Ability icon
- [ ] Character portraits
- [ ] Status effect icons
- [ ] Ability icons

### Visual Feedback
- [x] Health state indication
  - Player: Dynamic color transitions
  - Enemies: Red health bars
- [x] Range visualization
  - Constant pulsing indicators
  - Segmented circle design
  - Semi-transparent fill

### 3.3 Game Mechanics
#### Movement
- [x] Basic movement system
- [ ] Grid-based movement refinement
- [ ] Movement points/allowance
- [ ] Path finding and validation
- [ ] Collision detection with obstacles and other players

#### Combat System
- Deterministic battle resolution
- Turn-based combat
- Attack and defense calculations
- Special ability implementation
- State verification through blockchain

### 3.4 Blockchain Integration
#### State Management
- Character positions synchronized with blockchain
- Enemy behavior controlled by smart contracts
- Resource collection verified on-chain
- Object interactions tracked through transactions

#### Event System
```typescript
interface BlockchainEvents {
  // State changes
  enemyStateChanged: { enemyId: string, state: EnemyContractState };
  resourceCollected: { resourceId: string, amount: number };
  objectPickedUp: { objectId: string };
  
  // Contract interactions
  getGameState(): Promise<any>;
  collectResource(resourceId: string, amount: number): Promise<void>;
  pickUpObject(objectId: string): Promise<void>;
}

### 3.5 State Management
#### GameStateManager
- Event-driven state updates
- Blockchain synchronization
- Resource management
- Object interaction handling
- Player/Enemy state management

#### Plugin System
- Blockchain state polling
- Event emission
- Contract interaction
- State synchronization

### 3.5 User Interface
#### Dashboard
- Wallet connection
- Character selection/creation
- Game session management
- Player statistics
- Resource management

#### In-Game UI
- Battle dial interface
- Character status display
- Action controls
- Chat system
- Mini-map
- Inventory management

## 4. Technical Requirements

### 4.1 Game Engine Setup
```typescript
interface GameConfig {
  type: Phaser.AUTO;
  parent: string;
  scale: {
    mode: Phaser.Scale.RESIZE;
    width: '100%';
    height: '100%';
    autoCenter: Phaser.Scale.CENTER_BOTH;
    min: {
      width: 375;
      height: 667;
    };
    max: {
      width: 1920;
      height: 1080;
    };
  };
  scene: Scene[];
  physics: {
    default: 'arcade';
    arcade: {
      gravity: { y: 0 };
      debug: boolean;
    };
  };
}
```

### 4.2 Scene Structure
```typescript
interface SceneStructure {
  BootScene: Scene;     // Asset loading and initialization
  GameScene: Scene;     // Main game board and logic
  UIScene: Scene;       // Overlay UI elements
  CharacterPreviewScene: Scene;  // Character visualization
}

interface BootSceneRequirements {
  assetLoading: {
    loadingBar: boolean;
    errorHandling: boolean;
    verification: boolean;
    debugLogging: boolean;
  };
  initialization: {
    sceneTransition: boolean;
    stateSetup: boolean;
  };
}

interface AssetManagement {
  preload: {
    characters: string[];
    ui: string[];
    tiles: string[];
    atlas: string[];
  };
  verification: {
    loadComplete: boolean;
    errorHandling: boolean;
    fallbackSystem: boolean;
  };
  loading: {
    progressBar: boolean;
    debugInfo: boolean;
    errorLogging: boolean;
  };
}
```

### 4.3 Character Data Structure
```typescript
interface Character {
  id: string;           // Unique identifier
  owner: string;        // Wallet address
  name: string;
  level: number;
  stats: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    movement: number;
    attackRange: number;
    abilityRange: number;
  };
  class?: string;       // Character class
  appearance?: {        // Appearance customization
    sprite: string;
    colors: Record<string, string>;
  };
  abilities?: string[]; // Special abilities
  inventory?: Item[];
  lastPlayed?: Date;
}
```

### 4.4 Game State Structure
```typescript
interface GameState {
  players: Map<string, Character>;
  turnOrder: string[];
  currentTurn: string;
  gamePhase: GamePhase;
  boardState: BoardState;
  pendingActions: Action[];
}
```

### 4.5 Targeting System
```typescript
interface TargetingSystem {
  targetingCharacter: GameCharacter | null;
  targetingLines: Phaser.GameObjects.Graphics;
  gamePhase: 'MOVEMENT' | 'TARGETING' | 'BATTLE';
  
  // Methods
  startTargeting(character: GameCharacter, actionType: 'attack' | 'ability'): void;
  showTargetingRange(character: GameCharacter, range: number): void;
  updateTargetingLines(pointer: Phaser.Input.Pointer): void;
  clearTargeting(): void;
}
```

### 4.6 Mobile Requirements
```typescript
interface MobileOptimization {
  viewport: {
    responsive: boolean;
    orientationSupport: boolean;
    touchOptimized: boolean;
  };
  camera: {
    smoothFollow: boolean;
    deadzone: boolean;
    dynamicBounds: boolean;
  };
  interaction: {
    touchFriendly: boolean;
    gestureSupport: boolean;
    adaptiveUI: boolean;
  };
}
```

### 4.1 Depth Management
```typescript
interface DepthLayers {
  GROUND: 0;
  GRID: 5;
  CHARACTERS: 10;
  UI: 20;
}

interface CharacterDepths {
  SELECTION: -1;
  BACKGROUND: 0;
  PORTRAIT: 1;
  HEALTH: 2;
  STATUS: 3;
}
```

### 4.2 Map Integration
```typescript
interface MapRequirements {
  tilesetHandling: {
    margin: 1;
    spacing: 1;
    tileWidth: 32;
    tileHeight: 32;
  };
  layerManagement: {
    ground: TilemapLayer;
    objects: ObjectLayer;
    collision: CollisionLayer;
  };
  spawnSystem: {
    tileBasedSpawns: boolean;
    fallbackMechanism: boolean;
    searchPattern: 'expanding' | 'spiral';
  };
  scaling: {
    maintainAspectRatio: boolean;
    consistentTileSize: boolean;
    gridAlignment: boolean;
  };
}
```

### 4.5 Character Management System
```typescript
interface CharacterManagement {
  // Character CRUD operations
  createCharacter(data: CharacterCreationData): Promise<Character>;
  updateCharacter(id: string, data: Partial<Character>): Promise<Character>;
  deleteCharacter(id: string): Promise<void>;
  getCharacter(id: string): Promise<Character>;
  
  // Character roster
  getCharacterList(): Promise<Character[]>;
  
  // Blockchain integration
  saveCharacterOnChain(character: Character): Promise<void>;
  loadCharacterFromChain(id: string): Promise<Character>;
  
  // Preview system
  previewCharacter(data: Partial<Character>): void;
  updatePreview(changes: Partial<Character>): void;
  cleanupPreview(): void;
}

## 5. Implementation Phases

### Phase 1: Foundation
- Project setup with Next.js and Phaser
- Scene management system implementation
- Asset loading and management system
- Basic game board implementation
- Character movement system
- UI component framework

### Phase 2: Core Mechanics
- Battle wheel hud/ui implementation
- Combat system
- Character creation
- Basic blockchain integration

### Phase 3: Advanced Features
- Multiplayer synchronization
- Complete blockchain integration
- Special abilities
- Enhanced UI/UX

### Phase 4: Polish
- Visual effects
- Sound system
- Performance optimization
- Testing and debugging

## 6. Testing Requirements
- Unit tests for game logic
- Integration tests for blockchain interactions
- Performance testing for real-time updates
- Network latency handling
- State synchronization verification

## 7. Performance Requirements
- Maximum 60ms frame time
- < 100ms response time for local actions
- < 2s response time for blockchain confirmations
- Support for 50+ simultaneous players
- Efficient state updates and rendering

## 8. Security Requirements
- Secure wallet integration
- Transaction signing verification
- State validation
- Anti-cheat mechanisms
- Secure data transmission

## 9. Development Environment
- VS Code
- Node.js 18+
- TypeScript 5+
- ESLint
- Prettier
- Chrome DevTools for debugging

## 10. Development Guidelines

### 10.1 Scene Management
- Implement proper scene hierarchy
- Centralize asset loading in BootScene
- Handle scene transitions gracefully
- Implement proper cleanup on scene destruction
- Manage scene dependencies effectively

### 10.2 Asset Management
- Centralize asset loading in BootScene
- Implement proper error handling
- Add loading state visualization
- Verify asset loading completion
- Implement debug logging system
- Handle loading failures gracefully
- Provide fallback assets when needed

### 10.1 Character System
- Use Container-based approach for characters
- Implement factory pattern for character creation
- Separate visual elements from logic
- Use event system for character interactions
- Implement proper animation management

### 10.2 Asset Requirements
- Character sprites: 64x64px PNG format
- Consistent art style
- Clear silhouettes
- Animation-ready designs
- Proper naming convention

### 10.3 Performance Considerations
- Optimize character animations
- Manage scene transitions
- Handle multiple character instances
- Efficient state management
- Memory cleanup on character destruction

### Targeting System
- [x] Color-coded targeting lines
  - Blue lines for player targeting
  - Offset red lines for enemy targeting
- [x] Mobile-optimized interaction
  - Click-to-show wheel interface
  - Centered on target
  - Direct action execution

### Combat System
- [x] Immediate action execution
- [x] Visual feedback
  - Camera shake for attacks
  - Flash effects for abilities
  - Smooth movement animations
