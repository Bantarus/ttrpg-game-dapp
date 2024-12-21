import { BaseScene } from './BaseScene';
import { BaseCharacter } from '../characters/BaseCharacter';
import { PlayerCharacter } from '../characters/PlayerCharacter';
import { EnemyCharacter } from '../characters/EnemyCharacter';
import { CharacterFactory } from '../characters/CharacterFactory';
import { GameState, GamePhase } from '../types';
import { TiledMap } from '../types/map';

export class GameScene extends BaseScene {
  private gameState!: GameState;
  private player!: PlayerCharacter;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private characterFactory!: CharacterFactory;
  private grid!: Phaser.GameObjects.Grid;
  private tileSize: number = 64;
  private cameraFollowingEnabled: boolean = true;
  private battleDial?: Phaser.GameObjects.Container;
  private currentAttacker?: BaseCharacter;
  private currentDefender?: BaseCharacter;
  private targetingCharacter: BaseCharacter | null = null;
  private targetingLines!: Phaser.GameObjects.Graphics;
  private interactionWheel?: Phaser.GameObjects.Container;
  private wheelRadius: number = 80;
  private interactionWheels: Set<Phaser.GameObjects.Container> = new Set();
  private gridWidth: number = 1600; // 25 tiles * 64px
  private gridHeight: number = 1600; // 25 tiles * 64px
  private map!: Phaser.Tilemaps.Tilemap;
  private tileset!: Phaser.Tilemaps.Tileset;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private wallsLayer!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super('GameScene');
    // Initialize game state
    this.gameState = {
      gamePhase: 'MOVEMENT',
      players: new Map()
    };
  }

  preload(): void {
    // Load character assets
    this.load.image('player', '/assets/characters/player.png');
    this.load.image('enemy', '/assets/characters/enemy.png');

    // Load the action icons texture atlas
    this.load.atlas(
      'action-icons',                              // texture key
      'assets/ui/action-icons.png',               // texture path
      'assets/ui/action-icons.json'               // atlas json path
    );

    // Debug loading
    this.load.on('filecomplete-atlas-action-icons', () => {
      console.log('Action icons loaded successfully');
      console.log('Available frames:', this.textures.get('action-icons').getFrameNames());
    });

    // Load tilemap and tileset with correct paths and names
    this.load.tilemapTiledJSON('desert-map', 'assets/tiles/map-01.json');
    this.load.image('tmw_desert_spacing', 'assets/tiles/tmw_desert_spacing.png');
  }

  init(): void {
    // Initialize character factory
    this.characterFactory = new CharacterFactory(this);

    // Set world bounds
    const worldWidth = this.gridWidth;  // Use class property
    const worldHeight = this.gridHeight; // Use class property
    
    // Set the physics world bounds
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    
    // Set the camera bounds
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Create game board grid
    this.createBoard();
    
    // Add enemy characters
    this.spawnEnemies();
    
    // Initialize targeting system
    this.initializeTargeting();
    
    // Setup input
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Start UI Scene
    this.scene.launch('UIScene');

    // Listen for character action triggers
    this.events.on('actionTriggered', this.handleActionButton, this);
  }

  update(): void {
    if (this.gameState.gamePhase === 'MOVEMENT') {
      this.handlePlayerMovement();
    }
    this.player.update();
  }

  private startBattle(attacker: BaseCharacter, defender: BaseCharacter): void {
    this.gameState.gamePhase = 'BATTLE';
    this.currentAttacker = attacker;
    this.currentDefender = defender;
    
    // Create battle overlay
    this.createBattleOverlay();
    
    // Create battle UI elements
    this.createBattleDial();
    this.createBattleUI();
  }

  private createBattleOverlay(): void {
    // Add semi-transparent overlay
    this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    ).setScrollFactor(0).setDepth(10);
  }

  private createBattleDial(): void {
    // Create battle dial at screen center
    this.battleDial = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    ).setScrollFactor(0).setDepth(11);
    
    // Create dial background
    const dialBg = this.add.circle(0, 0, 100, 0x666666);
    this.battleDial.add(dialBg);

    // TODO: Add rotating dial mechanics and stats display
  }

  private createBattleUI(): void {
    // Add attack button
    const attackButton = this.add.text(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.8,
      'Attack',
      {
        backgroundColor: '#ff0000',
        padding: { x: 20, y: 10 },
        color: '#ffffff'
      }
    )
    .setScrollFactor(0)
    .setDepth(11)
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.handleAttack());
  }

  private handleAttack(): void {
    if (!this.currentAttacker || !this.currentDefender) return;
    
    // TODO: Implement attack logic
    console.log('Attack executed');
    
    // After attack resolves, return to movement phase
    this.endBattle();
  }

  private endBattle(): void {
    this.gameState.gamePhase = 'MOVEMENT';
    this.currentAttacker = undefined;
    this.currentDefender = undefined;
    
    // Clean up battle UI
    this.battleDial?.destroy();
    this.battleDial = undefined;
    
    // TODO: Clean up other battle UI elements
  }

  private createBoard(): void {
    const worldWidth = this.gridWidth;
    const worldHeight = this.gridHeight;
    const tileSize = this.tileSize;
    
    // Create a container for the grid with appropriate depth
    const gridContainer = this.add.container(0, 0);
    gridContainer.setDepth(5); // Above ground (0) but below characters (10)
    
    // Calculate grid dimensions
    const gridCols = Math.floor(worldWidth / tileSize);   
    const gridRows = Math.floor(worldHeight / tileSize); 
    
    // Create grid graphics object
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.5); // Thinner, semi-transparent lines
    
    // Draw vertical lines
    for (let x = 0; x <= gridCols; x++) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(x * tileSize, 0);
      gridGraphics.lineTo(x * tileSize, worldHeight);
      gridGraphics.strokePath();
    }

    // Draw horizontal lines
    for (let y = 0; y <= gridRows; y++) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(0, y * tileSize);
      gridGraphics.lineTo(worldWidth, y * tileSize);
      gridGraphics.strokePath();
    }

    // Create grid cells with hover effect
    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        const cell = this.add.rectangle(
          x * tileSize + tileSize / 2, // Center the rectangle in the cell
          y * tileSize + tileSize / 2,
          tileSize - 1, // Slightly smaller to avoid overlap
          tileSize - 1,
          0x444444,
          0
        );
        
        // Make cells interactive
        cell.setInteractive()
          .on('pointerover', () => {
            cell.setFillStyle(0x666666, 0.2);
          })
          .on('pointerout', () => {
            cell.setFillStyle(0x444444, 0);
          });
        
        gridContainer.add(cell);
      }
    }

    // Add the grid graphics to the container
    gridContainer.add(gridGraphics);

    console.log('Grid dimensions:', { gridCols, gridRows, tileSize });
  }

  private createPlayer(): void {
    // Position player at grid center
    const startX = 5;
    const startY = 5;
    this.player = this.characterFactory.createPlayerCharacter(
      startX * this.tileSize + this.tileSize / 2,
      startY * this.tileSize + this.tileSize / 2
    );
    
    // Setup camera following with lerp
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    
    // Listen for drag events to manage camera following
    this.player.on('dragstart', () => {
      this.cameraFollowingEnabled = false;
      this.cameras.main.stopFollow();
    });

    this.player.on('dragend', () => {
      // Always recenter camera on character after drag
      this.cameras.main.stopFollow();
      // Pan to character position
      this.cameras.main.pan(
        this.player.x,
        this.player.y,
        250, // Duration in ms
        'Sine.easeOut',
        false,
        (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
          if (progress === 1) {
            // Resume smooth following after pan completes
            this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
          }
        }
      );
    });

    this.player.on('moveComplete', (gridPosition: { x: number, y: number }) => {
      console.log('Character moved to grid position:', gridPosition);
      // Here you can implement multiplayer sync or other move-related logic
    });

    this.initializeCharacterEvents(this.player);
  }

  private initializeCharacterEvents(character: BaseCharacter): void {
    character.on('characterDeath', (deadCharacter: BaseCharacter) => {
      // Clear targeting if the dead character was being targeted
      if (this.targetingCharacter === deadCharacter) {
        this.clearTargeting();
      }
      
      // Remove from game state
      this.gameState.players.delete(deadCharacter.id);
      
      // Force update targeting lines
      this.updateTargetingLines(this.input.activePointer);
      
      // Clear any interaction wheels
      this.clearAllInteractionWheels();
    });
  }

  private handlePlayerMovement(): void {
    if (!this.cursors) return;

    const speed = 4;
    let moved = false;

    if (this.cursors.left.isDown) {
      this.player.x -= speed;
      moved = true;
    }
    if (this.cursors.right.isDown) {
      this.player.x += speed;
      moved = true;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= speed;
      moved = true;
    }
    if (this.cursors.down.isDown) {
      this.player.y += speed;
      moved = true;
    }

    if (moved) {
      // Emit position update event for multiplayer sync
      // TODO: Implement multiplayer position sync
    }
  }

  private spawnEnemies(): void {
    const enemyPositions = [
      { x: 8, y: 8 },
      { x: 12, y: 5 },
      { x: 15, y: 10 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.characterFactory.createEnemyCharacter(
        pos.x * this.tileSize + this.tileSize / 2,
        pos.y * this.tileSize + this.tileSize / 2
      );
      
      // Initialize character events
      this.initializeCharacterEvents(enemy);
      
      // Add to game state
      this.gameState.players.set(enemy.id, enemy);
    });
  }

  // Connect action buttons to targeting system
  private handleActionButton(data: { action: string, character: BaseCharacter }): void {
    const { action, character } = data;
    console.log(`Handling action: ${action} for character:`, character);
    
    if (action === 'attack' || action === 'ability') {
        this.startTargeting(character, action as 'attack' | 'ability');
    }
  }

  private startTargeting(character: BaseCharacter, actionType: 'attack' | 'ability'): void {
    console.log('Starting targeting with:', actionType, character);
    
    // Clear any existing targeting
    this.clearTargeting();
    
    this.targetingCharacter = character;
    
    // Get range based on action type
    const range = actionType === 'attack' ? 
        character.stats.attackRange : 
        character.stats.abilityRange;
    
    console.log('Using range:', range);
    
    // Mark valid targets and show range
    this.gameState.gamePhase = 'TARGETING';
    this.showTargetingRange(character, range);
    
    // Verify targeting is active
    console.log('Targeting phase active:', this.gameState.gamePhase);
    console.log('Targeting character:', this.targetingCharacter);
  }

  private showTargetingRange(character: BaseCharacter, range: number): void {
    console.log('Showing targeting range:', range);
    const rangeInPixels = range * this.tileSize;
    
    // Clear previous graphics
    this.targetingLines.clear();
    
    // Draw filled range indicator with better alpha
    this.targetingLines
        .fillStyle(0xf7a072, 0.08)
        .fillCircle(character.x, character.y, rangeInPixels);
    
    // Draw dashed range border
    const segments = 32;
    const angleStep = (Math.PI * 2) / segments;
    
    for (let i = 0; i < segments; i++) {
        const startAngle = i * angleStep;
        const endAngle = startAngle + (angleStep * 0.6);
        
        this.targetingLines
            .lineStyle(2, 0xf7a072, 0.8)
            .beginPath()
            .arc(character.x, character.y, rangeInPixels, startAngle, endAngle)
            .strokePath();
    }

    // Add pulsing effect
    this.targetingLines.setAlpha(0.8);
    this.tweens.add({
        targets: this.targetingLines,
        alpha: { from: 0.8, to: 0.4 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
  }

  private clearTargeting(): void {
    if (this.targetingCharacter) {
        // Clear targeting graphics
        this.targetingLines.clear();
        
        // Reset all characters' targeting state
        Array.from(this.gameState.players.values()).forEach(character => {
            character.setTargetable(false);
        });
        
        // Reset state
        this.targetingCharacter = null;
        this.gameState.gamePhase = 'MOVEMENT';
        
        // Reset cursor
        this.input.setDefaultCursor('default');
        
        // Stop any active tweens on targeting lines
        this.tweens.killTweensOf(this.targetingLines);
    }
  }

  private initializeTargeting(): void {
    // Initialize targeting graphics with depth and make sure it's visible
    this.targetingLines = this.add.graphics()
        .setDepth(100)
        .setVisible(true);
    
    // Listen for pointer movement to draw targeting lines
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.player) {
            this.targetingLines.clear();
            this.updateTargetingLines(pointer);
        }
    });

    // Listen for clicks on characters
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const source = this.targetingCharacter || this.player;
        
        // Clear any existing wheels first
        this.clearAllInteractionWheels();
        
        // Check if we clicked on a valid target
        Array.from(this.gameState.players.values()).forEach(target => {
            if (target !== source && target.getBounds().contains(worldPoint.x, worldPoint.y)) {
                const distance = Phaser.Math.Distance.Between(
                    source.x, source.y,
                    target.x, target.y
                );
                
                const range = source instanceof PlayerCharacter ? 3 : 4;
                if (distance <= range * this.tileSize) {
                    // Create interaction wheel for clicked target
                    this.createInteractionWheel(source, target);
                    
                    // Add visual feedback for selection
                    this.cameras.main.shake(200, 0.005);
                }
            }
        });
    });

    // Listen for clicks outside of characters to clear wheels
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        let clickedOnCharacter = false;
        
        Array.from(this.gameState.players.values()).forEach(character => {
            if (character.getBounds().contains(worldPoint.x, worldPoint.y)) {
                clickedOnCharacter = true;
            }
        });
        
        if (!clickedOnCharacter) {
            this.clearAllInteractionWheels();
        }
    });
  }

  private updateTargetingLines(pointer: Phaser.Input.Pointer): void {
    const source = this.targetingCharacter || this.player;
    if (!source || !source.scene) return; // Check if source still exists

    // Clear previous lines
    this.targetingLines.clear();

    // Draw lines from player/selected character to valid targets
    Array.from(this.gameState.players.values()).forEach(target => {
      // Skip if target has been destroyed
      if (!target.scene) {
        this.gameState.players.delete(target.id);
        return;
      }

      if (target !== source) {
        const distance = Phaser.Math.Distance.Between(
          source.x, source.y,
          target.x, target.y
        );

        const range = source instanceof PlayerCharacter ? 3 : 4;
        if (distance <= range * this.tileSize) {
          const color = source instanceof PlayerCharacter ? 0x4a9eff : 0xff4a4a;
          this.drawTargetingLine(source, target, false, color);
        }
      }
    });

    // Only draw enemy lines if player still exists
    if (this.player && this.player.scene) {
      Array.from(this.gameState.players.values()).forEach(enemy => {
        if (enemy instanceof EnemyCharacter && enemy.scene) {
          const distance = Phaser.Math.Distance.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
          );

          const enemyRange = 4;
          if (distance <= enemyRange * this.tileSize) {
            this.drawTargetingLine(enemy, this.player, false, 0xff4a4a);
          }
        }
      });
    }
  }

  private drawTargetingLine(
    source: BaseCharacter, 
    target: BaseCharacter, 
    isHovered: boolean,
    baseColor: number = 0xf7a072
  ): void {
    const color = isHovered ? 0xff0000 : baseColor;
    const lineWidth = isHovered ? 3 : 2;
    const alpha = isHovered ? 1 : 0.6;
    
    // Calculate offset based on line color (offset red lines)
    const offset = baseColor === 0xff4a4a ? 4 : 0; // Offset for red (enemy) lines
    
    // Calculate perpendicular offset vector
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize and rotate 90 degrees for perpendicular offset
    const offsetX = -dy / length * offset;
    const offsetY = dx / length * offset;
    
    // Draw targeting line with offset for enemy lines
    this.targetingLines
        .lineStyle(lineWidth, color, alpha)
        .beginPath()
        .moveTo(source.x + offsetX, source.y + offsetY)
        .lineTo(target.x + offsetX, target.y + offsetY)
        .strokePath();

    // Add targeting circle with pulse effect when hovered
    if (isHovered) {
        // Draw outer circle
        this.targetingLines
            .lineStyle(2, color, 0.8)
            .strokeCircle(target.x, target.y, this.tileSize / 2 + 4);
            
        // Add inner highlight
        this.targetingLines
            .fillStyle(color, 0.2)
            .fillCircle(target.x, target.y, this.tileSize / 2);
            
        // Camera feedback
        this.cameras.main.flash(100, 255, 255, 255, 0.2);
    }
  }

  private createInteractionWheel(source: BaseCharacter, target: BaseCharacter): void {
    // Create new wheel container centered on target
    const wheel = this.add.container(target.x, target.y);
    wheel.setDepth(1000);

    // Available actions
    const actions = [
        { key: 'attack', angle: 0, icon: 'attack.png' },
        { key: 'ability', angle: 120, icon: 'ability.png' },
        { key: 'move', angle: 240, icon: 'move.png' }
    ];

    // Create wheel background
    const wheelBg = this.add.circle(0, 0, this.wheelRadius * 0.6, 0x000000, 0.7);
    wheel.add(wheelBg);

    // Add action buttons in a circular layout
    actions.forEach(action => {
        const angle = Phaser.Math.DegToRad(action.angle);
        const x = Math.cos(angle) * (this.wheelRadius * 0.4);
        const y = Math.sin(angle) * (this.wheelRadius * 0.4);

        const button = this.add.sprite(x, y, 'action-icons', action.icon)
            .setScale(0.8)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.handleWheelAction(action.key, source, target);
            });

        // Add touch feedback
        button.on('pointerdown', () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 100,
                yoyo: true,
                ease: 'Cubic.easeOut'
            });
        });

        wheel.add(button);
    });

    // Add entrance animation
    wheel.setScale(0);
    this.tweens.add({
        targets: wheel,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut'
    });

    // Store reference to wheel
    if (!this.interactionWheels) {
        this.interactionWheels = new Set();
    }
    this.interactionWheels.add(wheel);
  }

  private clearAllInteractionWheels(): void {
    if (this.interactionWheels) {
        this.interactionWheels.forEach(wheel => wheel.destroy());
        this.interactionWheels.clear();
    }
  }

  private handleWheelAction(action: string, source: BaseCharacter, target: BaseCharacter): void {
    // Clear the wheel immediately
    this.clearAllInteractionWheels();

    switch (action) {
      case 'attack':
        // Start battle immediately
        this.gameState.gamePhase = 'BATTLE';
        
        // Visual feedback for attack
        this.cameras.main.shake(200, 0.005);
        
        // Calculate damage (example implementation)
        const damage = source.stats.attack - (target.stats.defense / 2);
        target.takeDamage(Math.max(1, damage));
        
        // Add specific effects based on character type
        if (target instanceof PlayerCharacter) {
          // Additional player-specific effects when taking damage
          this.cameras.main.flash(100, 0xff0000, 0.3);
        } else if (target instanceof EnemyCharacter) {
          // Additional enemy-specific effects when taking damage
          this.cameras.main.flash(100, 0x000000, 0.3);
        }
        
        // Reset game phase after attack
        this.gameState.gamePhase = 'MOVEMENT';
        break;

      case 'ability':
        // Execute ability immediately
        this.cameras.main.flash(100, 0x4a9eff, 0.3);
        // TODO: Implement ability effects
        break;

      case 'move':
        // Execute move immediately
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 4;
        const duration = (distance / speed) * 16; // Adjust for smooth movement

        this.tweens.add({
            targets: source,
            x: target.x,
            y: target.y,
            duration: duration,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                source.snapToGrid(
                    Math.floor(target.x / this.tileSize),
                    Math.floor(target.y / this.tileSize)
                );
            }
        });
        break;
    }
  }

  create(): void {
    // Create map first
    this.createMap();
    
    // Create player with better spawn point handling
    this.createPlayerAtSpawn();

    // Spawn map objects
    this.spawnObjectsFromMap();
    
    // Center camera on player
    this.centerCameraOnPlayer();

    // Setup resize handler
    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const camera = this.cameras.main;
    
    // Update camera viewport
    camera.setViewport(0, 0, gameSize.width, gameSize.height);
    
    // Update camera bounds with some padding
    const padding = 100;
    camera.setBounds(
      -padding,
      -padding,
      this.map.widthInPixels + padding * 2,
      this.map.heightInPixels + padding * 2
    );

    // Recenter on player
    this.centerCameraOnPlayer();
  }

  // Update createPlayer to accept coordinates
  private createPlayer(x: number, y: number): void {
    this.player = this.characterFactory.createPlayerCharacter(x, y);
    
    // Setup camera following with lerp
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    
    // Listen for drag events to manage camera following
    this.player.on('dragstart', () => {
      this.cameraFollowingEnabled = false;
      this.cameras.main.stopFollow();
    });

    this.player.on('dragend', () => {
      // Always recenter camera on character after drag
      this.cameras.main.stopFollow();
      // Pan to character position
      this.cameras.main.pan(
        this.player.x,
        this.player.y,
        250, // Duration in ms
        'Sine.easeOut',
        false,
        (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
          if (progress === 1) {
            // Resume smooth following after pan completes
            this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
          }
        }
      );
    });

    this.player.on('moveComplete', (gridPosition: { x: number, y: number }) => {
      console.log('Character moved to grid position:', gridPosition);
      // Here you can implement multiplayer sync or other move-related logic
    });

    this.initializeCharacterEvents(this.player);
  }

  // Update centerCameraOnPlayer
  public centerCameraOnPlayer(): void {
    if (this.player) {
      const camera = this.cameras.main;
      const { width, height } = camera;
      
      // Set deadzone for smoother camera following
      const deadZoneSize = Math.min(width, height) * 0.1;
      camera.setDeadzone(deadZoneSize, deadZoneSize);
      
      // Ensure camera doesn't show outside map bounds
      camera.setBounds(
        0,
        0,
        this.map.widthInPixels,
        this.map.heightInPixels
      );
    }
  }

  // Update camera bounds when grid size changes
  private updateCameraBounds(): void {
    const { width, height } = this.cameras.main;
    
    this.cameras.main.setBounds(
      -width/4,
      -height/4,
      this.gridWidth + width/2,
      this.gridHeight + width/2
    );
  }

  private createMap(): void {
    // Create the tilemap from loaded JSON
    this.map = this.make.tilemap({ key: 'desert-map' });
    
    // Add the tileset
    this.tileset = this.map.addTilesetImage(
      'tmw_desert_spacing',
      'tmw_desert_spacing',
      32,
      32,
      1,
      1
    )!;

    // Create the ground layer and set its depth to 0
    this.groundLayer = this.map.createLayer('Calque de Tuiles 1', this.tileset)!;
    this.groundLayer.setDepth(0);

    // Set collisions based on tile properties
    this.groundLayer.setCollisionByProperty({ State: 3 });

    // Enable collision with player
    if (this.player) {
      this.physics.add.collider(this.player, this.groundLayer);
    }

    // Set world bounds based on map dimensions
    const mapWidth = this.map.widthInPixels;
    const mapHeight = this.map.heightInPixels;
    
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Update grid dimensions based on map
    this.gridWidth = mapWidth;
    this.gridHeight = mapHeight;
  }

  private spawnObjectsFromMap(): void {
    // Spawn chests
    const chestLayer = this.map.getObjectLayer('Chests');
    if (chestLayer && chestLayer.objects) {
      chestLayer.objects.forEach(chest => {
        // Create chest at position
        const chestSprite = this.add.sprite(chest.x!, chest.y!, 'chest');
        chestSprite.setOrigin(0, 1); // Adjust origin to match Tiled coordinates
      });
    }

    // Spawn enemies
    const lizardLayer = this.map.getObjectLayer('Lizards');
    if (lizardLayer && lizardLayer.objects) {
      lizardLayer.objects.forEach(lizard => {
        const enemy = this.characterFactory.createEnemyCharacter(
          lizard.x!,
          lizard.y!
        );
        
        // Set name if specified in Tiled
        if (lizard.name) {
          enemy.setName(lizard.name);
        }
        
        this.initializeCharacterEvents(enemy);
        this.gameState.players.set(enemy.id, enemy);
      });
    }
  }

  private createPlayerAtSpawn(): void {
    // First try to find a spawn point tile
    const tileSpawn = this.findSpawnPointFromTiles();
    
    if (tileSpawn) {
      console.log('Found spawn point tile:', tileSpawn);
      this.createPlayer(tileSpawn.x, tileSpawn.y);
      return;
    }

    // Fallback to finding a walkable position
    const position = this.findDefaultSpawnPosition();
    console.log('Using default spawn position:', position);
    this.createPlayer(position.x, position.y);
  }

  private findSpawnPointFromTiles(): { x: number, y: number } | null {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = this.groundLayer.getTileAt(x, y);
        if (tile && tile.properties.State === 4) { // State 4 is spawn point
          return {
            x: (x + 0.5) * this.map.tileWidth,
            y: (y + 0.5) * this.map.tileHeight
          };
        }
      }
    }
    return null;
  }

  private findDefaultSpawnPosition(): { x: number, y: number } {
    // Try to find a sand tile (State: 0) near the center
    const centerX = Math.floor(this.map.width / 2);
    const centerY = Math.floor(this.map.height / 2);
    
    // Search in expanding square pattern
    const searchRadius = 10;
    for (let r = 0; r < searchRadius; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          const tileX = centerX + dx;
          const tileY = centerY + dy;
          
          const tile = this.groundLayer.getTileAt(tileX, tileY);
          if (tile && tile.properties.State === 0) {
            return {
              x: (tileX + 0.5) * this.map.tileWidth,
              y: (tileY + 0.5) * this.map.tileHeight
            };
          }
        }
      }
    }

    // Fallback to center if no suitable tile found
    return {
      x: this.map.widthInPixels / 2,
      y: this.map.heightInPixels / 2
    };
  }

  private isTileWalkable(tileX: number, tileY: number): boolean {
    // Check if tile is within map bounds
    if (tileX < 0 || tileX >= this.map.width || tileY < 0 || tileY >= this.map.height) {
      return false;
    }

    // Get tile at position
    const tile = this.groundLayer.getTileAt(tileX, tileY);
    if (!tile) return true; // No tile means walkable
    
    // Check State property - 3 means wall/collision, 0 means walkable
    return tile.properties?.State !== 3;
  }
} 