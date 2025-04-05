"use client";
import { useState, useEffect } from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';

interface HiddenWord {
    word: string;
    addedBy: string;
    addedAt: string;
}

export default function HiddenWords() {
    const [words, setWords] = useState<HiddenWord[]>([]);
    const [newWord, setNewWord] = useState('');

    useEffect(() => {
        fetchHiddenWords();
    }, []);

    const fetchHiddenWords = async () => {
        try {
            const username = localStorage.getItem('username');
            const res = await fetch('/api/settings/hidden-words', {
                headers: {
                    'x-user': username || ''
                }
            });
            const data = await res.json();
            setWords(data.words);
        } catch (error) {
            console.error('Failed to fetch hidden words:', error);
        }
    };

    const addWord = async () => {
        if (!newWord.trim()) return;

        try {
            const username = localStorage.getItem('username');
            const res = await fetch('/api/settings/hidden-words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user': username || ''
                },
                body: JSON.stringify({ word: newWord.trim() })
            });

            if (res.ok) {
                fetchHiddenWords();
                setNewWord('');
            }
        } catch (error) {
            console.error('Failed to add word:', error);
        }
    };

    const deleteWord = async (word: string) => {
        try {
            const username = localStorage.getItem('username');
            const res = await fetch('/api/settings/hidden-words', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user': username || ''
                },
                body: JSON.stringify({ word })
            });

            if (res.ok) {
                fetchHiddenWords();
            }
        } catch (error) {
            console.error('Failed to delete word:', error);
        }
    };

    return (
        <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Prohibited Words</h2>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Add new word..."
                    className="flex-1 bg-gray-800 text-white p-3 rounded-lg"
                />
                <button
                    onClick={addWord}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
                >
                    <MdAdd size={24} />
                </button>
            </div>

            <div className="space-y-2">
                {words.map(({ word, addedBy, addedAt }) => (
                    <div
                        key={word}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                        <div>
                            <p className="text-white font-medium">{word}</p>
                            <p className="text-sm text-gray-400">
                                Added by {addedBy} on {new Date(addedAt).toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            onClick={() => deleteWord(word)}
                            className="text-red-500 hover:text-red-600"
                        >
                            <MdDelete size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
