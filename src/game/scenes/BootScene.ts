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
    console.log('Loading character assets...');
    this.load.image('player', 'assets/characters/player.png');
    this.load.image('enemy', 'assets/characters/enemy.png');

    // Load action icons atlas
    console.log('Loading UI assets...');
    this.load.atlas(
      'action-icons',
      'assets/ui/action-icons.png',
      'assets/ui/action-icons.json'
    );

    // Debug loading
    this.load.on('filecomplete', (key: string) => {
      console.log(`Successfully loaded asset: ${key}`);
      if (key === 'enemy') {
        console.log('Enemy texture details:', this.textures.get('enemy'));
      }
    });

    this.load.on('loaderror', (file: any) => {
      console.error('Error loading file:', file.key, file.src);
      console.error('Error details:', file.error);
    });

    this.load.on('complete', () => {
      console.log('All assets loaded successfully');
      console.log('Available textures:', this.textures.list);
      loadingBar.destroy();
      this.scene.start('GameScene');
    });
  }
} 