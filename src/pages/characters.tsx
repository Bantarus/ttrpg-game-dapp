import React, { useState } from 'react';
import { CharacterCreation, Character } from '../components/CharacterCreation';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const CharactersPage: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

    const handleCreateCharacter = () => {
        setIsCreating(true);
        setSelectedCharacter(null);
    };

    const handleDeleteCharacter = (id: string) => {
        setCharacters(prev => prev.filter(char => char.id !== id));
    };

    const handleEditCharacter = (character: Character) => {
        setSelectedCharacter(character);
        setIsCreating(true);
    };

    if (isCreating) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <button
                    onClick={() => setIsCreating(false)}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
                >
                    <span className="mr-2">←</span> Back to Roster
                </button>
                <CharacterCreation 
                    existingCharacter={selectedCharacter}
                    onComplete={(character) => {
                        if (selectedCharacter) {
                            setCharacters(prev => 
                                prev.map(char => 
                                    char.id === character.id ? character : char
                                )
                            );
                        } else {
                            setCharacters(prev => [...prev, character]);
                        }
                        setIsCreating(false);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Character Roster</h1>
                    <button
                        onClick={handleCreateCharacter}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create New Character
                    </button>
                </div>

                {characters.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Characters Yet</h3>
                        <p className="text-gray-500 mb-4">Create your first character to begin your adventure!</p>
                        <button
                            onClick={handleCreateCharacter}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Create Character
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {characters.map(character => (
                            <div
                                key={character.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{character.name}</h3>
                                            <p className="text-gray-500">Level {character.level}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditCharacter(character)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCharacter(character.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {Object.entries(character.stats).map(([stat, value]) => (
                                            <div key={stat} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {stat.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {character.lastPlayed && (
                                        <p className="mt-4 text-sm text-gray-500">
                                            Last played: {new Date(character.lastPlayed).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CharactersPage; 