# Project Structure Updates

## Recent Updates

### Character System Refactoring
- Split into three distinct classes:
  - BaseCharacter: Abstract base with common functionality
  - PlayerCharacter: Player-specific implementation
  - EnemyCharacter: Enemy-specific implementation
- Enhanced visual feedback
  - Character-specific range indicators
  - Type-specific health colors
  - Death animations

### Key Components

### `/game/characters/`
- New character class hierarchy
  - `BaseCharacter.ts`: Abstract base class
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
│   │   ├── BaseCharacter.ts     # Abstract base character class
│   │   ├── PlayerCharacter.ts   # Player-specific implementation
│   │   ├── EnemyCharacter.ts    # Enemy-specific implementation
│   │   └── CharacterFactory.ts  # Character creation factory
│   ├── types/
│   │   ├── index.ts
│   │   └──character.ts        # Character-related type definitions
│   └── config.ts
│
├── lib/
│   └── utils.ts
│
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   └── game.tsx
│
├── types/
│   ├──index.d.ts
│
├── styles/
│   └── globals.css
│
└── public/
    └── assets/
        ├── tiles/
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

### Type Definitions
- `game/types/index.ts`: Game-related type definitions 

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
