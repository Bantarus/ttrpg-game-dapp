import { BaseScene } from './BaseScene';

export class BootScene extends BaseScene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // Create loading bar
    const loadingBar = this.add.graphics({
      fillStyle: {
        color: 0xffffff
      }
    });

    // Loading events
    this.load.on('progress', (value: number) => {
      loadingBar.clear();
      loadingBar.fillRect(
        this.cameras.main.width / 4,
        this.cameras.main.height / 2,
        (this.cameras.main.width / 2) * value,
        20
      );
    });

    // Load character sprites
    this.load.image('player', 'assets/characters/player.png');
    this.load.image('enemy', 'assets/characters/enemy.png');

    // Load action icons atlas
    this.load.atlas(
      'action-icons',
      'assets/ui/action-icons.png',
      'assets/ui/action-icons.json'
    );

    // Debug loading
    this.load.on('filecomplete', (key: string) => {
      console.log(`Loaded: ${key}`);
    });

    this.load.on('loaderror', (file: any) => {
      console.error('Error loading file:', file.src);
    });

    this.load.on('complete', () => {
      console.log('All assets loaded');
      loadingBar.destroy();
      this.scene.start('GameScene');
    });
  }
} 