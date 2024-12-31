import { Scene } from 'phaser';
import { gameEventBus } from '../events/GameEventBus';
import { CharacterFactory } from '../characters/CharacterFactory';
import { PlayerCharacter } from '../characters/PlayerCharacter';

interface CharacterPreviewData {
    sprite?: string;
    stats?: {
        hp: number;
        maxHp: number;
        attack: number;
        defense: number;
        movement: number;
        attackRange: number;
        abilityRange: number;
    };
    name?: string;
}

export class CharacterPreviewScene extends Scene {
    private character: PlayerCharacter | null = null;
    private characterFactory!: CharacterFactory;

    constructor() {
        super({ key: 'CharacterPreviewScene' });
    }

    create(): void {
        this.characterFactory = new CharacterFactory(this);
        
        // Center of the preview
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create initial character
        this.character = this.characterFactory.createPlayerCharacter(centerX, centerY);
        
        // Listen for character updates from React
        gameEventBus.on('updateCharacterPreview', this.updateCharacter.bind(this));

        // Add some ambient animation
        this.tweens.add({
            targets: this.character,
            y: centerY - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private updateCharacter(data: CharacterPreviewData): void {
        if (!this.character) return;

        // Update character appearance based on customization
        if (data.sprite) {
            this.character.setTint(0xFFFFFF); // Reset tint
            // Note: Sprite update would need to be handled by the CharacterFactory
            // or by extending PlayerCharacter with a method to change sprites
        }

        // Update character stats
        if (data.stats) {
            Object.assign(this.character.stats, data.stats);
        }

        // Update character name
        if (data.name) {
            this.character.name = data.name;
        }
    }

    public cleanup(): void {
        gameEventBus.off('updateCharacterPreview', this.updateCharacter.bind(this));
    }
} 