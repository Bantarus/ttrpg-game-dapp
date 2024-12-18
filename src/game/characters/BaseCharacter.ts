import { CharacterConfig, CharacterStats, GridPosition } from '../types/character';

export abstract class BaseCharacter extends Phaser.GameObjects.Container {
  public id: string = Phaser.Utils.String.UUID();
  public owner: string = '';
  public name: string = '';
  public stats: CharacterStats = {
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    movement: 3,
    attackRange: 2,
    abilityRange: 3
  };
  
  protected sprite: Phaser.GameObjects.Image;
  protected moveTarget?: Phaser.Math.Vector2;
  protected isMoving: boolean = false;
  protected gridPosition: GridPosition;
  public isDragging: boolean = false;
  protected moveRange: number = 3;
  protected highlightedTiles: Phaser.GameObjects.Rectangle[] = [];
  protected tileSize: number = 64;
  protected dragStartOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  protected portraitSprite: Phaser.GameObjects.Sprite;
  protected healthRing: Phaser.GameObjects.Graphics;
  protected actionButtons: Map<string, Phaser.GameObjects.Container>;
  protected selectionGlow: Phaser.GameObjects.Graphics;
  protected glowTween?: Phaser.Tweens.Tween;
  protected statusEffects: Phaser.GameObjects.Container;

  protected targetingGlow?: Phaser.GameObjects.Graphics;
  protected isTargetable: boolean = false;

  constructor(config: CharacterConfig) {
    super(config.scene, config.x, config.y);
    
    // Initialize base container and properties
    this.setSize(this.tileSize, this.tileSize);
    
    // Initialize properties
    this.initializeProperties(config);

    // Create visual elements
    this.createBaseVisuals();
    this.createHealthRing();
    this.createStatusEffectsContainer();
    this.createSelectionGlow();

    // Set up interactions
    this.setupInteractions();

    this.scene.add.existing(this);
  }

  protected initializeProperties(config: CharacterConfig): void {
    // Create the sprite
    this.sprite = new Phaser.GameObjects.Image(this.scene, 0, 0, config.texture);
    
    // Scale the sprite to fit within the tile
    const scale = (this.tileSize * 0.8) / Math.max(this.sprite.width, this.sprite.height);
    this.sprite.setScale(scale);
    
    this.add(this.sprite);

    // Set container size to match tile size
    this.setSize(this.tileSize, this.tileSize);

    // Initialize stats
    this.stats = {
      hp: config.stats?.hp ?? 100,
      maxHp: config.stats?.maxHp ?? 100,
      attack: config.stats?.attack ?? 10,
      defense: config.stats?.defense ?? 5,
      movement: config.stats?.movement ?? 3,
      attackRange: config.stats?.attackRange ?? 2,
      abilityRange: config.stats?.abilityRange ?? 3
    };

    this.name = config.name || 'Character';
    this.owner = config.owner || '';

    // Initialize grid position
    this.gridPosition = {
      x: Math.floor(config.x / this.tileSize),
      y: Math.floor(config.y / this.tileSize)
    };
  }

  protected createBaseVisuals(): void {
    // Create circular background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x222222, 0.9);
    bg.lineStyle(2, 0x333333);
    bg.fillCircle(0, 0, this.tileSize / 2);
    bg.strokeCircle(0, 0, this.tileSize / 2);
    this.add(bg);

    // Create character portrait
    this.portraitSprite = this.scene.add.sprite(0, 0, this.sprite.texture.key)
      .setDisplaySize(this.tileSize * 0.7, this.tileSize * 0.7);
    
    // Create circular mask for portrait
    const mask = this.scene.add.graphics()
      .fillCircle(0, 0, this.tileSize * 0.35);
    this.portraitSprite.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, mask));
    
    this.add([mask, this.portraitSprite]);

    // Add pulsing range indicator
    this.createPulsingRange();
  }

  protected createHealthRing(): void {
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

  protected createStatusEffectsContainer(): void {
    this.statusEffects = this.scene.add.container(0, this.tileSize * 0.4);
    this.add(this.statusEffects);
  }

  protected createSelectionGlow(): void {
    this.selectionGlow = this.scene.add.graphics();
    this.add(this.selectionGlow);
    this.updateSelectionGlow(false);
  }

  protected updateSelectionGlow(selected: boolean): void {
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

  protected setupInteractions(): void {
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

    this.on('dragstart', this.onDragStart, this);
    this.on('drag', this.onDrag, this);
    this.on('dragend', this.onDragEnd, this);
    this.on('pointerdown', () => {
      if (!this.isDragging) {
        this.emit('characterSelected', this);
      }
    });
  }

  protected onDragStart(pointer: Phaser.Input.Pointer): void {
    this.isDragging = true;
    this.showMoveRange();
  }

  protected onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    this.setPosition(dragX, dragY);
  }

  protected onDragEnd(pointer: Phaser.Input.Pointer): void {
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

  public snapToGrid(gridX: number, gridY: number): void {
    this.x = gridX * this.tileSize + this.tileSize / 2;
    this.y = gridY * this.tileSize + this.tileSize / 2;
  }

  protected isValidMove(newX: number, newY: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.gridPosition.x,
      this.gridPosition.y,
      newX,
      newY
    );
    return distance <= this.moveRange;
  }

  protected showMoveRange(): void {
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

  protected clearMoveRange(): void {
    this.highlightedTiles.forEach(tile => tile.destroy());
    this.highlightedTiles = [];
  }

  public setTargetable(targetable: boolean): void {
    this.isTargetable = targetable;
    
    if (targetable) {
      if (!this.targetingGlow) {
        this.targetingGlow = this.scene.add.graphics();
        this.add(this.targetingGlow);
      }
      
      this.targetingGlow.clear()
        .lineStyle(2, 0xf7a072, 0.8)
        .strokeCircle(0, 0, this.tileSize / 2 + 4);
        
      this.scene.tweens.add({
        targets: this.targetingGlow,
        alpha: { from: 0.8, to: 0.4 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

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

  // Abstract methods that must be implemented by child classes
  protected abstract getHealthColor(percent: number): number;
  protected abstract createPulsingRange(): void;
  public abstract takeDamage(amount: number): void;

  protected onDeath(): void {
    // Emit death event before destroying
    this.emit('characterDeath', this);
    
    this.scene.tweens.add({
        targets: this,
        alpha: 0,
        y: '+=20',
        duration: 800,
        onComplete: () => {
            this.destroy();
        }
    });
  }
} 