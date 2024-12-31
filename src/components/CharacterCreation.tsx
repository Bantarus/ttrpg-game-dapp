import React, { useState, useEffect } from 'react';
import { Game } from 'phaser';
import { gameEventBus } from '../game/events/GameEventBus';
import { CharacterPreviewScene } from '../game/scenes/CharacterPreviewScene';

interface CharacterStats {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    movement: number;
    attackRange: number;
    abilityRange: number;
}

export interface Character {
    id: string;
    name: string;
    level: number;
    stats: CharacterStats;
    lastPlayed?: Date;
}

interface CharacterCreationProps {
    existingCharacter?: Character | null;
    onComplete: (character: Character) => void;
}

const defaultStats: CharacterStats = {
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    movement: 3,
    attackRange: 2,
    abilityRange: 3
};

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ existingCharacter, onComplete }) => {
    const [name, setName] = useState(existingCharacter?.name || '');
    const [stats, setStats] = useState<CharacterStats>(existingCharacter?.stats || defaultStats);
    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        // Initialize Phaser preview
        const config = {
            type: Phaser.AUTO,
            width: 300,
            height: 300,
            transparent: true,
            scene: CharacterPreviewScene,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        const newGame = new Game(config);
        setGame(newGame);

        return () => {
            if (newGame) {
                const scene = newGame.scene.getScene('CharacterPreviewScene') as CharacterPreviewScene;
                if (scene) {
                    scene.cleanup();
                }
                newGame.destroy(true);
            }
        };
    }, []);

    const handleStatChange = (stat: keyof CharacterStats, value: number) => {
        setStats(prev => {
            const newStats = { ...prev, [stat]: value };
            gameEventBus.emit('updateCharacterPreview', { stats: newStats });
            return newStats;
        });
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newName = event.target.value;
        setName(newName);
        gameEventBus.emit('updateCharacterPreview', { name: newName });
    };

    const handleSubmit = () => {
        const character: Character = {
            id: existingCharacter?.id || crypto.randomUUID(),
            name,
            level: existingCharacter?.level || 1,
            stats,
            lastPlayed: existingCharacter?.lastPlayed
        };
        onComplete(character);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 p-6 max-w-4xl mx-auto">
            <div className="flex-1">
                <h2 className="text-2xl font-bold mb-6">
                    {existingCharacter ? 'Edit Character' : 'Create New Character'}
                </h2>
                
                {/* Name Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                        Character Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter character name"
                    />
                </div>

                {/* Stats */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-3">Stats</h3>
                    {Object.entries(stats).map(([stat, value]) => (
                        <div key={stat} className="flex items-center gap-4">
                            <label className="w-32 text-sm font-medium capitalize">
                                {stat.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max={stat.includes('Range') ? 5 : 100}
                                value={value}
                                onChange={(e) => handleStatChange(stat as keyof CharacterStats, Number(e.target.value))}
                                className="flex-1"
                            />
                            <span className="w-12 text-right">{value}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    className="mt-8 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {existingCharacter ? 'Save Changes' : 'Create Character'}
                </button>
            </div>

            {/* Character Preview */}
            <div className="flex-1 flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-4">Preview</h3>
                <div id="character-preview" className="w-[300px] h-[300px] bg-gray-100 rounded-lg" />
            </div>
        </div>
    );
}; 