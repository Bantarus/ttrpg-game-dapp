import { BaseScene } from './BaseScene';

export class UIScene extends BaseScene {
  private minimap!: Phaser.GameObjects.Graphics;
  private statsDisplay!: Phaser.GameObjects.Container;

  constructor() {
    super('UIScene');
  }

  create(): void {
    this.createMinimap();
    this.createStatsDisplay();
    this.createActionButtons();
  }

  private createMinimap(): void {
    // Create minimap container in top-right corner
    const minimapSize = 150;
    const padding = 10;
    const { width, height } = this.cameras.main;

    this.minimap = this.add.graphics();
    this.minimap.lineStyle(2, 0xffffff);
    this.minimap.strokeRect(
      width - minimapSize - padding,
      padding,
      minimapSize,
      minimapSize
    );
    
    // TODO: Implement actual minimap rendering
  }

  private createStatsDisplay(): void {
    this.statsDisplay = this.add.container(10, 10);
    
    // Add background
    const bg = this.add.rectangle(0, 0, 200, 100, 0x000000, 0.5);
    this.statsDisplay.add(bg);

    // Add placeholder stats
    const stats = this.add.text(10, 10, 'HP: 100\nMP: 50', {
      color: '#ffffff',
      fontSize: '16px'
    });
    this.statsDisplay.add(stats);
  }

  private createActionButtons(): void {
    const { height } = this.cameras.main;
    
    // Create inventory button
    this.add.text(10, height - 50, 'Inventory', {
      backgroundColor: '#444444',
      padding: { x: 10, y: 5 },
      color: '#ffffff'
    })
    .setInteractive()
    .on('pointerdown', () => this.openInventory());
  }

  private openInventory(): void {
    // TODO: Implement inventory system
    console.log('Opening inventory...');
  }

  update(): void {
    // Update minimap and stats display
    this.updateMinimap();
    this.updateStats();
  }

  private updateMinimap(): void {
    // TODO: Update minimap with current game state
  }

  private updateStats(): void {
    // TODO: Update stats display with current character stats
  }
} 