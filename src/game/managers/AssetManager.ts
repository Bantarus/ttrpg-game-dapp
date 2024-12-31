import { Scene } from 'phaser';

export interface AssetConfig {
  key: string;
  path: string;
  type: 'image' | 'spritesheet' | 'atlas' | 'tilemapTiledJSON';
  fallback?: string;
  version?: string;
}

interface AssetCache {
  [key: string]: {
    loaded: boolean;
    version: string;
    lastUsed: Date;
  };
}

export class AssetManager {
  private scene: Scene;
  private assetCache: AssetCache = {};
  private readonly CACHE_VERSION = '1.0.0';
  private readonly FALLBACK_ASSETS = new Map<string, string>([
    ['player', 'assets/fallback/player.png'],
    ['enemy', 'assets/fallback/enemy.png'],
    ['action-icons', 'assets/fallback/action-icons.png']
  ]);

  constructor(scene: Scene) {
    this.scene = scene;
    console.log('Initializing AssetManager');
    // Clear the cache on initialization to ensure fresh loading
    this.assetCache = {};
    localStorage.removeItem('assetCache');
    console.log('Cleared asset cache');
  }

  private initializeCache(): void {
    // Try to load cache from localStorage
    const savedCache = localStorage.getItem('assetCache');
    if (savedCache) {
      try {
        this.assetCache = JSON.parse(savedCache);
      } catch (error) {
        console.error('Failed to load asset cache:', error);
        this.assetCache = {};
      }
    }
  }

  private saveCache(): void {
    try {
      localStorage.setItem('assetCache', JSON.stringify(this.assetCache));
    } catch (error) {
      console.error('Failed to save asset cache:', error);
    }
  }

  public preloadAssets(assets: AssetConfig[]): void {
    // Setup loading events only once
    if (!this.scene.load.listenerCount('filecomplete')) {
      this.setupLoadingEvents();
    }

    console.log(`Starting to load ${assets.length} assets`);
    let assetsToLoad = 0;
    
    assets.forEach(asset => {
      // Check if asset needs updating
      if (this.shouldLoadAsset(asset)) {
        assetsToLoad++;
        this.loadAsset(asset);
      } else {
        console.log(`Asset ${asset.key} is up to date, skipping load`);
      }
    });

    // Start the loader if there are assets to load
    if (assetsToLoad > 0) {
      console.log(`Starting Phaser loader for ${assetsToLoad} assets`);
      this.scene.load.start();
    } else {
      console.log('No assets to load, firing complete event');
      // If no assets need loading, manually trigger the complete event
      this.scene.load.emit('complete');
    }
  }

  private shouldLoadAsset(asset: AssetConfig): boolean {
    console.log(`Checking if asset ${asset.key} needs loading...`);
    
    const cached = this.assetCache[asset.key];
    console.log(`Cache state for ${asset.key}:`, cached);
    
    // Always load if not cached
    if (!cached) {
      console.log(`Asset ${asset.key} not in cache, will load`);
      return true;
    }
    
    // Load if versions don't match
    if (asset.version && cached.version !== asset.version) {
      console.log(`Asset ${asset.key} version mismatch (cached: ${cached.version}, new: ${asset.version}), will load`);
      return true;
    }
    
    // Load if marked as not loaded
    if (!cached.loaded) {
      console.log(`Asset ${asset.key} marked as not loaded in cache, will load`);
      return true;
    }

    // Check if the asset exists in the scene cache
    const exists = this.checkAssetExistsInScene(asset);
    if (!exists) {
      console.log(`Asset ${asset.key} not found in scene cache, will load`);
      return true;
    }
    
    console.log(`Asset ${asset.key} is up to date and loaded, skipping`);
    return false;
  }

  private checkAssetExistsInScene(asset: AssetConfig): boolean {
    try {
      switch (asset.type) {
        case 'image':
          return this.scene.textures.exists(asset.key);
        case 'spritesheet':
          return this.scene.textures.exists(asset.key);
        case 'atlas':
          return this.scene.textures.exists(asset.key);
        case 'tilemapTiledJSON':
          return this.scene.cache.tilemap.has(asset.key);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error checking if asset ${asset.key} exists:`, error);
      return false;
    }
  }

  private loadAsset(asset: AssetConfig): void {
    try {
      console.log(`Loading asset: ${asset.key}, Type: ${asset.type}, Path: ${asset.path}`);
      
      switch (asset.type) {
        case 'image':
          this.scene.load.image(asset.key, asset.path);
          console.log(`Started loading image: ${asset.key}`);
          break;
        case 'spritesheet':
          this.scene.load.spritesheet(asset.key, asset.path, {
            frameWidth: 32,
            frameHeight: 32
          });
          console.log(`Started loading spritesheet: ${asset.key}`);
          break;
        case 'atlas':
          const atlasJsonPath = asset.path.replace('.png', '.json');
          console.log(`Loading atlas: ${asset.key}, Image: ${asset.path}, JSON: ${atlasJsonPath}`);
          this.scene.load.atlas(asset.key, asset.path, atlasJsonPath);
          break;
        case 'tilemapTiledJSON':
          console.log(`Started loading tilemap: ${asset.key}`);
          this.scene.load.tilemapTiledJSON(asset.key, asset.path);
          break;
        default:
          console.warn(`Unknown asset type for ${asset.key}: ${asset.type}`);
          return;
      }

      // Update cache entry
      this.assetCache[asset.key] = {
        loaded: false,
        version: asset.version || this.CACHE_VERSION,
        lastUsed: new Date()
      };
    } catch (error) {
      console.error(`Failed to load asset ${asset.key}:`, error);
      this.loadFallbackAsset(asset.key);
    }
  }

  private setupLoadingEvents(): void {
    // Track individual asset loading
    this.scene.load.on('filecomplete', (key: string, type: string, data: any) => {
      console.log(`Asset loaded successfully - Key: ${key}, Type: ${type}`);
      if (this.assetCache[key]) {
        this.assetCache[key].loaded = true;
        this.assetCache[key].lastUsed = new Date();
        this.saveCache();
        
        // Verify the loaded asset
        this.verifyLoadedAsset(key, type);
      }
    });

    // Handle loading errors
    this.scene.load.on('loaderror', (file: { key: string, src: string, type: string }) => {
      console.error(`Error loading asset - Key: ${file.key}, Type: ${file.type}, Source: ${file.src}`);
      this.loadFallbackAsset(file.key);
    });

    // Add start event logging
    this.scene.load.on('loadstart', () => {
      console.log('Started loading assets batch');
    });

    // Add complete event logging
    this.scene.load.on('complete', () => {
      console.log('Completed loading assets batch');
      this.logLoadedAssets();
    });
  }

  private verifyLoadedAsset(key: string, type: string): void {
    try {
      switch (type) {
        case 'image':
          const texture = this.scene.textures.get(key);
          console.log(`Verified image ${key} - Size: ${texture.source[0].width}x${texture.source[0].height}`);
          break;
        case 'atlas':
          const frames = this.scene.textures.get(key).getFrameNames();
          console.log(`Verified atlas ${key} - Frames: ${frames.length}`);
          break;
        case 'tilemapTiledJSON':
          const mapData = this.scene.cache.tilemap.get(key);
          console.log(`Verified tilemap ${key} - Size: ${mapData.width}x${mapData.height}`);
          break;
      }
    } catch (error) {
      console.error(`Failed to verify asset ${key}:`, error);
    }
  }

  private logLoadedAssets(): void {
    console.log('Currently loaded assets:');
    Object.entries(this.assetCache).forEach(([key, value]) => {
      console.log(`- ${key}: ${value.loaded ? 'Loaded' : 'Not loaded'} (v${value.version})`);
    });
  }

  private loadFallbackAsset(key: string): void {
    const fallbackPath = this.FALLBACK_ASSETS.get(key);
    if (fallbackPath) {
      console.log(`Loading fallback asset for ${key}`);
      this.scene.load.image(key, fallbackPath);
    } else {
      console.error(`No fallback asset available for ${key}`);
    }
  }

  public cleanupCache(): void {
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    const now = new Date();

    // Remove old cache entries
    Object.entries(this.assetCache).forEach(([key, value]) => {
      const lastUsed = new Date(value.lastUsed);
      if (now.getTime() - lastUsed.getTime() > ONE_WEEK) {
        delete this.assetCache[key];
      }
    });

    this.saveCache();
  }

  public getAssetVersion(key: string): string | undefined {
    return this.assetCache[key]?.version;
  }

  public isAssetLoaded(key: string): boolean {
    return this.assetCache[key]?.loaded || false;
  }

  public updateAssetLastUsed(key: string): void {
    if (this.assetCache[key]) {
      this.assetCache[key].lastUsed = new Date();
      this.saveCache();
    }
  }
} 