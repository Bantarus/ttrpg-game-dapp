import { BaseScene } from './BaseScene';

export class MenuScene extends BaseScene {
  private startButton!: Phaser.GameObjects.Text;
  private characterButton!: Phaser.GameObjects.Text;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // Title
    this.add.text(width / 2, height * 0.3, 'MMO TTRPG', {
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Start Game Button
    this.startButton = this.add.text(width / 2, height * 0.5, 'Start Game', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 },
    })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.startGame())
    .on('pointerover', () => this.startButton.setTint(0x888888))
    .on('pointerout', () => this.startButton.clearTint());

    // Character Selection Button
    this.characterButton = this.add.text(width / 2, height * 0.6, 'Character Selection', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 },
    })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.openCharacterSelection())
    .on('pointerover', () => this.characterButton.setTint(0x888888))
    .on('pointerout', () => this.characterButton.clearTint());
  }

  private startGame(): void {
    this.scene.start('GameScene');
  }

  private openCharacterSelection(): void {
    // TODO: Implement character selection
    console.log('Opening character selection...');
  }
} 