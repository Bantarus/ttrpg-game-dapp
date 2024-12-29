import { CharacterConfig, CharacterStats, GridPosition } from '../types/character';
import { WalkableScene } from '../types/scene';
import { TileUtils } from '../utils/TileUtils';

export abstract class GameCharacter extends Phaser.GameObjects.Container {
  public id: string = Phaser.Utils.String.UUID();
  public owner: string = '';
  public name: string = 'Character';
  public stats: CharacterStats = {
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    movement: 3,
    attackRange: 2,
    abilityRange: 3
  };
  
  private sprite!: Phaser.GameObjects.Image;
  private moveTarget?: Phaser.Math.Vector2;
  private isMoving: boolean = false;
  private gridPosition!: GridPosition;
  public isDragging: boolean = false;
  protected moveRange: number = 3;
  private highlightedTiles: Phaser.GameObjects.Rectangle[] = [];
  protected tileSize: number = 32;
  private dragStartOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  private portraitSprite!: Phaser.GameObjects.Sprite;
  private healthRing!: Phaser.GameObjects.Graphics;
  private actionButtons: Map<string, Phaser.GameObjects.Container> = new Map();
  private selectionGlow!: Phaser.GameObjects.Graphics;
  private glowTween?: Phaser.Tweens.Tween;
  private statusEffects!: Phaser.GameObjects.Container;

  private targetingGlow?: Phaser.GameObjects.Graphics;
  private isTargetable: boolean = false;

  protected moveRangeGraphics: Phaser.GameObjects.Graphics;
  protected reachableTiles: Phaser.Tilemaps.Tile[] = [];

  constructor(config: CharacterConfig) {
    super(config.scene, config.x, config.y);
    
    // Initialize moveRangeGraphics
    this.moveRangeGraphics = this.scene.add.graphics();
    this.moveRangeGraphics.setDepth(5);
    
    // Initialize with provided stats if any
    if (config.stats) {
      this.stats = { ...this.stats, ...config.stats };
    }

    // Set initial grid position based on spawn coordinates
    this.gridPosition = {
      x: Math.floor(config.x / this.tileSize),
      y: Math.floor(config.y / this.tileSize)
    };

    // Adjust initial position to tile center
    const centerX = this.gridPosition.x * this.tileSize + this.tileSize / 2;
    const centerY = this.gridPosition.y * this.tileSize + this.tileSize / 2;
    this.setPosition(centerX, centerY);

    this.setSize(this.tileSize, this.tileSize);
    this.initializeProperties(config);
    this.createBaseVisuals();
    this.createHealthRing();
    this.createStatusEffectsContainer();
    this.createSelectionGlow();
    this.setupInteractions();

    this.scene.add.existing(this);
  }

  private initializeProperties(config: CharacterConfig): void {
    // Create the sprite
    this.sprite = new Phaser.GameObjects.Image(this.scene, 0, 0, config.texture);
    
    // Scale the sprite to fit within the tile
    const scale = (this.tileSize * 0.8) / Math.max(this.sprite.width, this.sprite.height);
    this.sprite.setScale(scale);
    
    this.add(this.sprite);

    // Set container size to match tile size
    this.setSize(this.tileSize, this.tileSize);

    // Initialize default stats
    this.stats = {
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      movement: 3,
      attackRange: 2,    // Default attack range
      abilityRange: 3,   // Default ability range
      ...config.stats
    };

    this.id = Phaser.Utils.String.UUID();
    this.name = config.name || 'Character';
    this.owner = config.owner || '';

    // Initialize character animations
    this.initializeAnimations();

    this.gridPosition = {
      x: Math.floor(config.x / this.tileSize),
      y: Math.floor(config.y / this.tileSize)
    };
  }

  private createBaseVisuals(): void {
    // Create circular background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x222222, 0.9);
    bg.lineStyle(2, 0x333333);
    bg.fillCircle(0, 0, this.tileSize / 2);
    bg.strokeCircle(0, 0, this.tileSize / 2);
    this.add(bg);

    // Create character portrait using the sprite's texture
    this.portraitSprite = this.scene.add.sprite(0, 0, this.sprite.texture.key)
        .setDisplaySize(this.tileSize * 0.7, this.tileSize * 0.7);
    
    // Create circular mask for portrait
    const mask = this.scene.add.graphics()
        .fillCircle(0, 0, this.tileSize * 0.35);
    this.portraitSprite.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, mask));
    
    this.add([mask, this.portraitSprite]);

    // Add constant pulsing range indicator
    this.createPulsingRange();
  }

  protected abstract createPulsingRange(): void;

  private createHealthRing(): void {
    this.healthRing = this.scene.add.graphics();
    this.add(this.healthRing);
    this.updateHealthRing();
  }

  protected updateHealthRing(): void {
    const healthPercent = this.stats.hp / this.stats.maxHp;
    const radius = this.tileSize / 2;
    
    this.healthRing.clear();
    
    // Background ring
    this.healthRing.lineStyle(3, 0x333333, 0.5);
    this.healthRing.strokeCircle(0, 0, radius);
    
    // Health fill
    if (healthPercent > 0) {
      const color = this.getHealthColor(healthPercent);
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (Math.PI * 2 * healthPercent);
      
      this.healthRing.lineStyle(3, color, 1);
      this.healthRing.beginPath();
      this.healthRing.arc(0, 0, radius, startAngle, endAngle);
      this.healthRing.strokePath();
    }
  }

  private onActionClick(actionKey: string): void {
    console.log(`Action clicked: ${actionKey}`);
    // Emit the event to both the character and the scene
    this.emit('actionTriggered', { action: actionKey, character: this });
    this.scene.events.emit('actionTriggered', { action: actionKey, character: this });
  }

  private setupInteractions(): void {
    // First, make the container itself interactive
    this.setInteractive({
      draggable: true,
      useHandCursor: true,
      hitArea: new Phaser.Geom.Rectangle(
        -this.tileSize / 2,
        -this.tileSize / 2,
        this.tileSize,
        this.tileSize
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains
    });
    
    // Debug drag state
    this.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      console.log('Drag started');
      this.isDragging = true;
      this.showMoveRange();
      
      // Store initial offset
      this.dragStartOffset.x = this.x - pointer.x;
      this.dragStartOffset.y = this.y - pointer.y;
      
      // Emit event for camera control
      this.emit('characterDragStart');
    });

    this.on('drag', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      
      // Update position with offset
      const newX = pointer.x + this.dragStartOffset.x;
      const newY = pointer.y + this.dragStartOffset.y;
      
      // Get current tile position using fixed tile size
      const currentTileX = Math.floor(newX / this.tileSize);
      const currentTileY = Math.floor(newY / this.tileSize);
      
      // Check if the tile is reachable
      const isReachable = this.reachableTiles.some(tile => 
        tile.x === currentTileX && tile.y === currentTileY
      );
      
      console.log('Drag position:', {
        worldPos: { x: newX, y: newY },
        tilePos: { x: currentTileX, y: currentTileY },
        isReachable,
        tileSize: this.tileSize
      });
      
      // Update position and visual feedback
      this.setPosition(newX, newY);
      if (isReachable) {
        this.clearTint();
        this.setAlpha(1);
      } else {
        this.setTint(0xff0000);
        this.setAlpha(0.7);
      }
    });

    this.on('dragend', (pointer: Phaser.Input.Pointer) => {
      console.log('Drag ended');
      if (!this.isDragging) return;
      
      // Get final grid position using fixed tile size
      const newGridX = Math.floor(this.x / this.tileSize);
      const newGridY = Math.floor(this.y / this.tileSize);
      
      console.log('Current position:', {
        x: this.x,
        y: this.y,
        gridX: newGridX,
        gridY: newGridY,
        currentGridPosition: this.gridPosition,
        tileSize: this.tileSize
      });

      // Check if the tile is reachable
      const isValidMove = this.reachableTiles.some(tile => {
        const match = tile.x === newGridX && tile.y === newGridY;
        console.log('Checking tile:', { 
          tileX: tile.x, 
          tileY: tile.y, 
          newGridX, 
          newGridY, 
          match,
          reachableTile: tile
        });
        return match;
      });

      console.log('Move validation:', { 
        isValidMove, 
        reachableTilesCount: this.reachableTiles.length,
        reachableTiles: this.reachableTiles.map(t => ({ x: t.x, y: t.y }))
      });

      // Get target position in world coordinates
      const targetX = newGridX * this.tileSize + this.tileSize / 2;
      const targetY = newGridY * this.tileSize + this.tileSize / 2;

      // Calculate Manhattan distance for movement range check
      const distance = Math.abs(newGridX - this.gridPosition.x) + 
                      Math.abs(newGridY - this.gridPosition.y);
      
      const isWithinRange = distance <= this.stats.movement;
      const isWalkable = this.isWalkableScene(this.scene) && 
                        (this.scene as WalkableScene).isTileWalkable(newGridX, newGridY);

      console.log('Move checks:', { 
        isValidMove, 
        isWithinRange, 
        isWalkable, 
        distance,
        newPosition: { x: newGridX, y: newGridY },
        currentPosition: this.gridPosition,
        tileSize: this.tileSize
      });

      if (isValidMove && isWithinRange && isWalkable) {
        // Snap to grid with animation
        this.scene.tweens.add({
          targets: this,
          x: targetX,
          y: targetY,
          duration: 200,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.gridPosition = { x: newGridX, y: newGridY };
            // Emit event with final position
            this.emit('characterDragEnd', { x: targetX, y: targetY });
          }
        });
      } else {
        // Return to original position with animation
        const returnX = this.gridPosition.x * this.tileSize + this.tileSize / 2;
        const returnY = this.gridPosition.y * this.tileSize + this.tileSize / 2;
        this.scene.tweens.add({
          targets: this,
          x: returnX,
          y: returnY,
          duration: 300,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Emit event with original position
            this.emit('characterDragEnd', { x: returnX, y: returnY });
          }
        });
      }
      
      // Reset state
      this.isDragging = false;
      this.clearTint();
      this.setAlpha(1);
      this.hideMoveRange();
    });

    // Add hover effects
    this.on('pointerover', () => {
      if (!this.isDragging) {
        this.scene.tweens.add({
          targets: this,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
          ease: 'Back.easeOut'
        });
      }
    });

    this.on('pointerout', () => {
      if (!this.isDragging) {
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Back.easeIn'
        });
      }
    });
  }

  private isWalkableScene(scene: Phaser.Scene): scene is WalkableScene {
    return 'isTileWalkable' in scene;
  }

  private isValidMove(newX: number, newY: number): boolean {
    if (!this.isWalkableScene(this.scene)) {
        return false;
    }
    
    const walkableScene = this.scene as WalkableScene;
    const groundLayer = walkableScene.getGroundLayer();
    
    // Get the tile at the target position
    const targetTile = groundLayer.getTileAt(newX, newY);
    if (!targetTile) {
        return false;
    }

    // Check if tile is a wall
    if (targetTile.properties?.State === 3) {
        return false;
    }
    
    // Calculate Manhattan distance for movement range check
    const distance = Math.abs(newX - this.gridPosition.x) + 
                    Math.abs(newY - this.gridPosition.y);
                    
    const isValid = distance <= this.stats.movement;
    console.log('Move validation:', { newX, newY, distance, isValid });
    return isValid;
  }

  private snapToGrid(gridX: number, gridY: number): void {
    // Position at the center of the tile
    this.x = gridX * this.tileSize + this.tileSize / 2;
    this.y = gridY * this.tileSize + this.tileSize / 2;
  }

  public showMoveRange(): void {
    if (!this.moveRangeGraphics) {
        this.moveRangeGraphics = this.scene.add.graphics();
        this.moveRangeGraphics.setDepth(5);
    }
    
    const walkableScene = this.scene as WalkableScene;
    const groundLayer = walkableScene.getGroundLayer();
    
    // Use current world position directly
    console.log('Calculating reachable tiles from:', {
      worldPosition: { x: this.x, y: this.y },
      gridPosition: this.gridPosition,
      movement: this.stats.movement,
      tileSize: this.tileSize
    });
    
    // Calculate reachable tiles
    this.reachableTiles = TileUtils.getReachableTiles(
        this.scene,
        this.x,
        this.y,
        this.stats.movement,
        groundLayer
    );
    
    // Draw move range
    this.moveRangeGraphics.clear();
    this.moveRangeGraphics.lineStyle(2, 0x00ff00, 0.5);
    this.moveRangeGraphics.fillStyle(0x00ff00, 0.2);
    
    this.reachableTiles.forEach(tile => {
        // Convert tile coordinates to world coordinates using fixed tile size
        const worldX = tile.x * this.tileSize;
        const worldY = tile.y * this.tileSize;
        
        this.moveRangeGraphics.strokeRect(
            worldX,
            worldY,
            this.tileSize,
            this.tileSize
        );
        
        this.moveRangeGraphics.fillRect(
            worldX,
            worldY,
            this.tileSize,
            this.tileSize
        );
    });

    console.log('Move range updated:', {
      reachableTiles: this.reachableTiles.map(tile => ({ x: tile.x, y: tile.y })),
      currentPosition: { x: this.x, y: this.y },
      tileSize: this.tileSize
    });
  }
  
  public hideMoveRange(): void {
    if (this.moveRangeGraphics) {
      this.moveRangeGraphics.clear();
    }
    this.reachableTiles = [];
  }
  
  public canMoveTo(worldX: number, worldY: number): boolean {
    const walkableScene = this.scene as WalkableScene;
    const groundLayer = walkableScene.getGroundLayer();
    const tileWidth = groundLayer.tilemap.tileWidth;
    const tileHeight = groundLayer.tilemap.tileHeight;
    
    // Convert world coordinates to tile coordinates using tilemap dimensions
    const tileX = Math.floor(worldX / tileWidth);
    const tileY = Math.floor(worldY / tileHeight);
    
    // Check if we have reachable tiles
    if (this.reachableTiles.length === 0) {
        this.reachableTiles = TileUtils.getReachableTiles(
            this.scene,
            this.x,
            this.y,
            this.stats.movement,
            groundLayer
        );
    }
    
    // Check if the target tile is in our reachable tiles
    const canMove = this.reachableTiles.some(tile => 
        tile.x === tileX && tile.y === tileY
    );
    
    console.log('Can move to:', { tileX, tileY, canMove, worldX, worldY });
    return canMove;
  }

  public moveToGrid(gridX: number, gridY: number): void {
    if (this.isMoving || !this.isValidMove(gridX, gridY)) return;
    
    const walkableScene = this.scene as WalkableScene;
    const groundLayer = walkableScene.getGroundLayer();
    const tileWidth = groundLayer.tilemap.tileWidth;
    const tileHeight = groundLayer.tilemap.tileHeight;
    
    const worldX = gridX * tileWidth + tileWidth / 2;
    const worldY = gridY * tileHeight + tileHeight / 2;
    
    this.moveTarget = new Phaser.Math.Vector2(worldX, worldY);
    this.isMoving = true;
  }

  public takeDamage(amount: number): void {
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    this.updateHealthRing();
    
    // Visual feedback
    this.scene.tweens.add({
      targets: this.portraitSprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.stats.hp <= 0) {
      this.onDeath();
    }
  }

  public heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  public update(): void {
    super.update();
    this.updateHealthRing();
    
    if (this.isMoving && this.moveTarget) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        this.moveTarget.x, this.moveTarget.y
      );

      if (distance < 4) {
        this.x = this.moveTarget.x;
        this.y = this.moveTarget.y;
        this.isMoving = false;
        this.moveTarget = undefined;
        this.emit('moveComplete');
      } else {
        const angle = Phaser.Math.Angle.Between(
          this.x, this.y,
          this.moveTarget.x, this.moveTarget.y
        );

        const speed = 4;
        this.x += Math.cos(angle) * speed;
        this.y += Math.sin(angle) * speed;
      }
    }
  }

  private initializeAnimations(): void {
    // Add idle floating animation to the sprite
    this.scene.tweens.add({
      targets: this.sprite,
      y: -2, // Move relative to container position
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  protected abstract onDeath(): void;

  protected abstract getHealthColor(percent: number): number;

  private createStatusEffectsContainer(): void {
    this.statusEffects = this.scene.add.container(0, this.tileSize * 0.4);
    this.add(this.statusEffects);
  }

  private createSelectionGlow(): void {
    this.selectionGlow = this.scene.add.graphics();
    this.add(this.selectionGlow);
    this.updateSelectionGlow(false);
  }

  private updateSelectionGlow(selected: boolean): void {
    this.selectionGlow.clear();
    
    if (selected) {
      const radius = this.tileSize / 2 + 4;
      this.selectionGlow.lineStyle(3, 0xffff00, 0.8);
      this.selectionGlow.strokeCircle(0, 0, radius);
      
      if (!this.glowTween) {
        this.glowTween = this.scene.add.tween({
          targets: this.selectionGlow,
          alpha: { from: 0.4, to: 0.8 },
          duration: 1000,
          yoyo: true,
          repeat: -1
        });
      }
    } else if (this.glowTween) {
      this.glowTween.stop();
      this.glowTween = undefined;
    }
  }

  // Add a public method to handle selection state
  public setSelected(selected: boolean): void {
    this.updateSelectionGlow(selected);
  }

  public setTargetable(targetable: boolean): void {
    this.isTargetable = targetable;
    
    if (targetable) {
        if (!this.targetingGlow) {
            this.targetingGlow = this.scene.add.graphics();
            this.add(this.targetingGlow);
        }
        
        // Draw targeting glow with better visual feedback
        this.targetingGlow.clear()
            .lineStyle(2, 0xf7a072, 0.8)
            .strokeCircle(0, 0, this.tileSize / 2 + 4);
            
        // Add smoother pulsing animation using Phaser's built-in easing
        this.scene.tweens.add({
            targets: this.targetingGlow,
            alpha: { from: 0.8, to: 0.4 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut' // Smoother transition
        });

        // Add subtle scale effect
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeInOut'
        });
    } else {
        if (this.targetingGlow) {
            this.scene.tweens.killTweensOf(this.targetingGlow);
            this.scene.tweens.killTweensOf(this);
            this.targetingGlow.clear();
            this.setScale(1);
        }
    }
  }

  public setHovered(hovered: boolean): void {
    if (!this.isTargetable) return;
    
    if (hovered) {
      // Use simpler visual feedback that works in both Canvas and WebGL
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 200,
        ease: 'Back.easeOut'
      });
    } else {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: 'Back.easeIn'
      });
    }
  }

  public setTint(color: number): this {
    this.sprite.setTint(color);
    return this;
  }

  public clearTint(): this {
    this.sprite.clearTint();
    return this;
  }

  public get preFX(): any {
    return (this.sprite as any).preFX;
  }

  public getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      this.x - this.tileSize/2,
      this.y - this.tileSize/2,
      this.tileSize,
      this.tileSize
    );
  }

  public startTargeting(): void {
    this.setTargetable(true);
    this.showTargetingRange();
  }

  public stopTargeting(): void {
    this.setTargetable(false);
    this.clearTargetingRange();
  }

  private showTargetingRange(): void {
    // Move the targeting range visualization code here from GameScene
    const rangeInPixels = this.stats.attackRange * this.tileSize;
    
    if (!this.targetingGlow) {
      this.targetingGlow = this.scene.add.graphics();
      this.add(this.targetingGlow);
    }
    
    this.targetingGlow.clear()
      .fillStyle(0xf7a072, 0.08)
      .fillCircle(0, 0, rangeInPixels)
      .lineStyle(2, 0xf7a072, 0.8);
      
    // Add the pulsing effect
    this.scene.tweens.add({
      targets: this.targetingGlow,
      alpha: { from: 0.8, to: 0.4 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private clearTargetingRange(): void {
    if (this.targetingGlow) {
      this.scene.tweens.killTweensOf(this.targetingGlow);
      this.targetingGlow.clear();
    }
  }
} 