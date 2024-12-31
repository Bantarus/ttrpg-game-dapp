import { Types } from 'phaser';
import { GameScene } from './scenes/GameScene';
import { CharacterPreviewScene } from './scenes/CharacterPreviewScene';
import { UIScene } from './scenes/UIScene';
import { BootScene } from './scenes/BootScene';

export const gameConfig: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [BootScene, GameScene, CharacterPreviewScene, UIScene]
}; 