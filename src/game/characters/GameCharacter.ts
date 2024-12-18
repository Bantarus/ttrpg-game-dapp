import { CharacterConfig, CharacterStats, GridPosition } from '../types/character';

export class GameCharacter extends Phaser.GameObjects.Container {
  public id: string;
  public owner: string;
  public name: string;
  public stats: CharacterStats;
  
  private sprite: Phaser.GameObjects.Image;
  private moveTarget?: Phaser.Math.Vector2;
  private isMoving: boolean = false;
  private gridPosition: GridPosition;
  public isDragging: boolean = false;
  private moveRange: number = 3;
  private highlightedTiles: Phaser.GameObjects.Rectangle[] = [];
  private tileSize: number = 64; // Match this with your grid size
  private dragStartOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  private portraitSprite: Phaser.GameObjects.Sprite;
  private healthRing: Phaser.GameObjects.Graphics;
  private actionButtons: Map<string, Phaser.GameObjects.Container>;
  private selectionGlow: Phaser.GameObjects.Graphics;
  private glowTween?: Phaser.Tweens.Tween;
  private statusEffects: Phaser.GameObjects.Container;

  private targetingGlow?: Phaser.GameObjects.Graphics;
  private isTargetable: boolean = false;

  constructor(config: CharacterConfig) {
    super(config.scene, config.x, config.y);

    // Initialize base container and properties
    this.setSize(this.tileSize, this.tileSize);
    
    // Initialize properties first (this creates the sprite)
    this.initializeProperties(config);

    // Then create the visual elements
    this.createBaseVisuals();
    this.createHealthRing();
    this.createStatusEffectsContainer();
    this.createSelectionGlow();

    // Set up interactions
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

  private createPulsingRange(): void {
    const rangeGraphics = this.scene.add.graphics();
    const range = this.moveRange * this.tileSize;
    
    // Draw the range circle
    const updateRange = () => {
        rangeGraphics.clear();
        
        // Draw filled range with very low alpha
        rangeGraphics.fillStyle(0xf7a072, 0.05);
        rangeGraphics.fillCircle(0, 0, range);
        
        // Draw range border
        rangeGraphics.lineStyle(2, 0xf7a072, 0.4);
        rangeGraphics.strokeCircle(0, 0, range);
        
        // Draw segments for better visual feedback
        const segments = 32;
        const angleStep = (Math.PI * 2) / segments;
        
        for (let i = 0; i < segments; i++) {
            const startAngle = i * angleStep;
            const endAngle = startAngle + (angleStep * 0.6);
            
            rangeGraphics.lineStyle(2, 0xf7a072, 0.3)
                .beginPath()
                .arc(0, 0, range, startAngle, endAngle)
                .strokePath();
        }
    };

    updateRange();
    this.add(rangeGraphics);

    // Add constant pulsing effect
    this.scene.tweens.add({
        targets: rangeGraphics,
        alpha: { from: 1, to: 0.6 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
  }

  private createHealthRing(): void {
    this.healthRing = this.scene.add.graphics();
    this.add(this.healthRing);
    this.updateHealthRing();
  }

  private updateHealthRing(): void {
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

  private onDragStart(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    this.isDragging = true;
    this.showMoveRange();
  }

  private onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    this.setPosition(dragX, dragY);
  }

  private onDragEnd(pointer: Phaser.Input.Pointer, dragX: number, dragY: number, dropped: boolean): void {
    this.isDragging = false;
    const newGridX = Math.floor(this.x / this.tileSize);
    const newGridY = Math.floor(this.y / this.tileSize);

    if (this.isValidMove(newGridX, newGridY)) {
      this.snapToGrid(newGridX, newGridY);
      this.gridPosition = { x: newGridX, y: newGridY };
      this.emit('moveComplete', this.gridPosition);
    } else {
      this.snapToGrid(this.gridPosition.x, this.gridPosition.y);
    }

    this.clearMoveRange();
  }

  private isValidMove(newX: number, newY: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.gridPosition.x,
      this.gridPosition.y,
      newX,
      newY
    );
    return distance <= this.moveRange;
  }

  private snapToGrid(gridX: number, gridY: number): void {
    this.x = gridX * this.tileSize + this.tileSize / 2;
    this.y = gridY * this.tileSize + this.tileSize / 2;
  }

  private showMoveRange(): void {
    const range = this.moveRange;
    
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const distance = Math.abs(dx) + Math.abs(dy);
        if (distance <= range) {
          const x = (this.gridPosition.x + dx) * this.tileSize;
          const y = (this.gridPosition.y + dy) * this.tileSize;
          
          const highlight = this.scene.add.rectangle(
            x + this.tileSize / 2,
            y + this.tileSize / 2,
            this.tileSize,
            this.tileSize,
            0x00ff00,
            0.3
          );
          this.highlightedTiles.push(highlight);
        }
      }
    }
  }

  private clearMoveRange(): void {
    this.highlightedTiles.forEach(tile => tile.destroy());
    this.highlightedTiles = [];
  }

  public moveTo(gridX: number, gridY: number): void {
    if (this.isMoving || !this.isValidMove(gridX, gridY)) return;
    
    const worldX = gridX * this.tileSize + this.tileSize / 2;
    const worldY = gridY * this.tileSize + this.tileSize / 2;
    
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

  private onDeath(): void {
    this.scene.tweens.add({
      targets: [this, this.sprite],
      alpha: 0,
      y: '+=20', // Move relative to current position
      duration: 800,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  private getHealthColor(percent: number): number {
    // If this character is not the player, return red
    if (this !== this.scene.player) {
        return 0xff4a4a; // Red for enemies
    }
    
    // For player, keep the original color logic
    if (percent > 0.6) return 0x00ff00;    // Green
    if (percent > 0.3) return 0xffff00;    // Yellow
    return 0xff0000;                       // Red
  }

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

  private setupInteractions(): void {
    // Set up drag interactions
    this.setInteractive({ 
      hitArea: new Phaser.Geom.Rectangle(
        -this.tileSize / 2,
        -this.tileSize / 2,
        this.tileSize,
        this.tileSize
      ), 
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      draggable: true,
      useHandCursor: true
    });

    this.scene.input.setDraggable(this);

    // Set up event listeners
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

    this.on('dragstart', this.onDragStart, this);
    this.on('drag', this.onDrag, this);
    this.on('dragend', this.onDragEnd, this);

    // Add click/tap interaction
    this.on('pointerdown', () => {
      if (!this.isDragging) {
        this.emit('characterSelected', this);
      }
    });
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
    
    // Add glow effect when hovered
    if (hovered) {
        // Add FX glow for WebGL mode
        if (this.scene.game.config.renderType === Phaser.WEBGL) {
            this.preFX?.clear();
            this.preFX?.addGlow(0xf7a072, 4, 4);
        }
        
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 200,
            ease: 'Back.easeOut'
        });
    } else {
        if (this.scene.game.config.renderType === Phaser.WEBGL) {
            this.preFX?.clear();
        }
        
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            ease: 'Back.easeIn'
        });
    }
  }
} 