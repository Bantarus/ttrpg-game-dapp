import { BaseScene } from './BaseScene';
import { AssetManager } from '../managers/AssetManager';
import { gameAssets, assetGroups } from '../config/assets';

export class BootScene extends BaseScene {
  private assetManager!: AssetManager;
  private loadingBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super('BootScene');
    console.log('BootScene: Constructor called');
  }

  init(): void {
    console.log('BootScene: Init called');
    super.init();
  }

  preload(): void {
    console.log('BootScene: Preload started');
    // Initialize asset manager
    this.assetManager = new AssetManager(this);
    console.log('BootScene: Initialized AssetManager');

    // Create loading bar
    this.createLoadingBar();
    console.log('BootScene: Created loading bar');

    // Load all assets at once
    console.log('BootScene: Starting asset loading');
    this.assetManager.preloadAssets(gameAssets);

    // Loading events
    this.load.on('progress', (value: number) => {
      console.log(`BootScene: Loading progress: ${Math.round(value * 100)}%`);
      this.updateLoadingBar(value);
    });

    this.load.on('complete', () => {
      console.log('BootScene: All assets loaded successfully');
      this.verifyLoadedAssets();
      this.loadingBar.destroy();
      this.scene.start('GameScene');
    });
  }

  private createLoadingBar(): void {
    this.loadingBar = this.add.graphics({
      fillStyle: {
        color: 0xffffff
      }
    });
  }

  private updateLoadingBar(value: number): void {
    this.loadingBar.clear();
    this.loadingBar.fillRect(
      this.cameras.main.width / 4,
      this.cameras.main.height / 2,
      (this.cameras.main.width / 2) * value,
      20
    );
  }

  private verifyLoadedAssets(): void {
    console.log('BootScene: Verifying loaded assets...');
    const loadedAssets = gameAssets.map(asset => ({
      key: asset.key,
      loaded: this.assetManager.isAssetLoaded(asset.key),
      version: this.assetManager.getAssetVersion(asset.key)
    }));

    console.log('BootScene: Asset loading summary:');
    loadedAssets.forEach(asset => {
      console.log(`- ${asset.key}: ${asset.loaded ? 'Loaded' : 'Failed'} (v${asset.version})`);
    });

    const failedAssets = loadedAssets.filter(asset => !asset.loaded);
    if (failedAssets.length > 0) {
      console.warn('BootScene: Some assets failed to load:', failedAssets.map(a => a.key));
    }
  }

  create(): void {
    console.log('BootScene: Create called');
    // Clean up old cached assets
    this.assetManager.cleanupCache();
  }

  // Called when scene is put to sleep or switched
  wake(): void {
    console.log('BootScene: Wake called');
  }

  // Called when scene is put to sleep
  sleep(): void {
    console.log('BootScene: Sleep called');
  }

  // Called when scene is stopped or removed
  stop(): void {
    console.log('BootScene: Stop called');
    this.load.off('progress');
    this.load.off('complete');
  }
} 