export interface WalkableScene extends Phaser.Scene {
    isTileWalkable(tileX: number, tileY: number): boolean;
    getGroundLayer(): Phaser.Tilemaps.TilemapLayer;
} 