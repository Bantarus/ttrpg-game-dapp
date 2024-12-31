# Project Structure Updates

## Recent Updates

### Depth Management System
- Implemented clear depth hierarchy:
  - Ground layer (0)
  - Grid overlay (5)
  - Characters (10)
  - UI elements (20)
- Character container depth management
  - Internal component ordering
  - Proper layering within containers

### Map Integration
- Enhanced Tiled map support
- Proper tileset handling
  - Fixed 32x32 tile size
  - 1px margin and spacing
  - Consistent scaling across game objects
- Layer management
  - Ground layer with proper collision properties
  - Object layer for spawns and items
  - Collision layer based on tile states
- Spawn point system
- Grid alignment with tilemap
  - Grid cells match tilemap dimensions
  - Character movement snaps to grid
  - Proper depth layering maintained

### Key Components

#### `/game/scenes/`
- Enhanced GameScene with proper depth management
- Map integration improvements
- Grid visualization system

#### `/game/characters/`
- Updated depth management in character system
- Enhanced visual layering
- Proper container depth handling

### Character System Refactoring
- Split into three distinct classes:
  - GameCharacter: Abstract base with core functionality
  - PlayerCharacter: Player-specific implementation
  - EnemyCharacter: Enemy-specific implementation
- Enhanced visual feedback
  - Character-specific range indicators
  - Type-specific health colors
  - Death animations

### Key Components

### `/game/characters/`
- New character class hierarchy
  - `GameCharacter.ts`: Abstract base class with core functionality
  - `PlayerCharacter.ts`: Player implementation
  - `EnemyCharacter.ts`: Enemy implementation
  - `CharacterFactory.ts`: Factory for creating characters

### Game Configuration
- Enhanced responsive configuration
- Mobile-optimized viewport settings
- Proper scaling boundaries
- Orientation change handling

### Camera System
- Improved camera following
- Dynamic bounds calculation
- Deadzone implementation
- Smooth pan transitions

### Character Management
- Fixed character initialization
- Single instance creation
- Proper scene lifecycle handling
- Enhanced drag and drop system

## Visual System
- Updated depth-based rendering:
  - Map layers
  - Grid overlay
  - Character components
  - UI elements
- Enhanced visual feedback
  - Grid cell highlighting
  - Character selection
  - Status effects
- Color Coding
  - Player health: Green -> Yellow -> Red
  - Enemy health: Red
  - Player targeting: Blue lines
  - Enemy targeting: Red lines (offset)
  - Selection: Yellow glow
  - Range indicators: Orange pulse

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   ├── ui/          # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── sheet.tsx
│   │   └── scroll-area.tsx
│   ├── GameComponent.tsx
│   └── WalletConnect.tsx
│
├── game/
│   ├── scenes/
│   │   ├── BaseScene.ts        # Base scene with common functionality
│   │   ├── BootScene.ts        # Initial loading scene
│   │   ├── MenuScene.ts        # Main menu scene
│   │   ├── GameScene.ts        # Main game board with grid and movement
│   │   └── UIScene.ts          # Overlay UI elements
│   ├── characters/
│   │   ├── GameCharacter.ts     # Abstract base character class
│   │   ├── PlayerCharacter.ts   # Player-specific implementation
│   │   ├── EnemyCharacter.ts    # Enemy-specific implementation
│   │   └── CharacterFactory.ts  # Character creation factory
│   ├── managers/
│   │   └── GameStateManager.ts  # Manages game state and blockchain events
│   ├── plugins/
│   │   ├── ArchethicStatePlugin.ts  # Blockchain interaction plugin
│   │   └── types.ts                 # Plugin type definitions
│   ├── utils/
│   │   └── TileUtils.ts        # Utility functions for tile operations
│   ├── types/
│   │   ├── index.ts            # Core game type definitions
│   │   ├── character.ts        # Character-related type definitions
│   │   ├── scene.ts           # Scene interface definitions
│   │   ├── tilemap.ts         # Map and tilemap type definitions
│   │   └── map.ts             # Map-specific type definitions
│   └── config.ts              # Game configuration
│
├── lib/
│   └── utils.ts               # Utility functions
│
├── pages/
│   ├── _app.tsx              # Next.js app wrapper
│   ├── _document.tsx         # Custom document component
│   ├── index.tsx            # Home page
│   └── game.tsx             # Game page
│
├── types/
│   └── index.d.ts           # Global type declarations
│
├── styles/
│   └── globals.css          # Global styles
│
└── public/
    └── assets/
        ├── tiles/
        │   ├── map-01.json        # Tilemap data
        │   └── tmw_desert_spacing.png  # Tileset image
        ├── characters/
        │   ├── player.png
        │   └── enemy.png
        └── ui/
            ├── action-icons.png    # Sprite atlas for action icons
            └── action-icons.json   # Atlas configuration

```

## Key Directories

### `/components`
Contains all React components, including layout components and reusable UI elements.

### `/game`
Houses all Phaser-related code, including:
- `scenes/`: Game scene implementations
- `characters/`: Character-related classes and factories
- `managers/`: Game state and resource management
- `plugins/`: Blockchain integration and plugins
- `utils/`: Utility functions for game operations
- `types/`: Game-specific TypeScript definitions
- `config.ts`: Phaser game configuration

### `/pages`
Next.js pages directory for routing and API endpoints.

### `/lib`
Utility functions and shared code.

### `/public/assets`
Static assets for the game, including sprites, tiles, and UI elements.

## Important Files

### Configuration Files
- `game/config.ts`: Phaser game configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration

### Core Components
- `components/GameComponent.tsx`: Main game container
- `components/layout/DashboardLayout.tsx`: Main application layout
- `pages/_app.tsx`: Next.js application wrapper
- `pages/_document.tsx`: Custom document component

### Type Definitions
- `game/types/index.ts`: Core game type definitions
- `game/types/character.ts`: Character-related types
- `game/types/scene.ts`: Scene interface definitions
- `game/types/tilemap.ts`: Map and tilemap type definitions
- `game/plugins/types.ts`: Plugin and contract state types

### Game Logic
- `game/managers/GameStateManager.ts`: Game state and blockchain event management
- `game/plugins/ArchethicStatePlugin.ts`: Blockchain integration
- `game/utils/TileUtils.ts`: Tile-related utility functions

## Key Updates

### `/game/characters/GameCharacter.ts`
- Modern circular token design implementation
- Health ring visualization
- Action buttons system
- Enhanced targeting features:
  - Targetable state management
  - Visual feedback for targeting
  - WebGL glow effects
  - Smooth animations
- Character portrait with mask
- Status effects container
- Selection glow effects
- Interactive hover states
- Enhanced drag and drop

### `/game/scenes/GameScene.ts`
- Asset preloading system
- Action icons atlas loading
- Debug loading feedback
- Grid system implementation
- Smooth camera following after character drop
- Character-camera interaction
- Advanced targeting system features:
  - Range visualization with dashed circles
  - Dynamic targeting lines
  - Target hover effects
  - Drag-based range updates
  - Battle initiation

### `/public/assets/ui`
- New action icons sprite atlas
- Atlas configuration for move, attack, and ability icons

## Updated Project Structure

### `/game/plugins/`
- `ArchethicStatePlugin.ts`: Manages blockchain interactions
- `types.ts`: Plugin and contract state type definitions

### `/game/managers/`
- `GameStateManager.ts`: Handles game state and blockchain events
  - Player management
  - Enemy synchronization
  - Resource collection
  - Object interactions

### Key Components

#### State Management System
```typescript
interface StateManagement {
  GameStateManager: class {
    // State management
    players: Map<string, PlayerCharacter>;
    enemies: Map<string, EnemyCharacter>;
    
    // Event handlers
    handleEnemyStateChange(data: { enemyId: string, state: EnemyContractState }): void;
    handleResourceCollection(data: { resourceId: string, amount: number }): void;
    handleObjectPickup(data: { objectId: string }): void;
  };
  
  ArchethicStatePlugin: class extends Phaser.Plugins.BasePlugin {
    // Blockchain interaction
    init(): void;
    getGameState(): Promise<any>;
    collectResource(resourceId: string, amount: number): Promise<void>;
    pickUpObject(objectId: string): Promise<void>;
  };
}
```

## Key Updates

### Removed Components
- `/game/managers/GameLoopManager.ts`: Replaced with GameStateManager

### Modified Components
- `/game/scenes/GameScene.ts`: Updated to use GameStateManager
- `/game/plugins/ArchethicStatePlugin.ts`: Enhanced blockchain integration
