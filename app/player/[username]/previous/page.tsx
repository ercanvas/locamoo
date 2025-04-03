"use client";
import { useState, use, useEffect } from 'react';
import { MdOutlineArrowBack } from 'react-icons/md';
import Link from 'next/link';
import GameDetails from '../../../components/GameDetails';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/app/components/LoadingScreen';
import ThemeToggle from '@/app/components/ThemeToggle';
import Image from 'next/image';

interface Game {
    id: string;
    date: string;
    mode: 'car' | 'plane' | 'weather';
    result: 'win' | 'loss';
    score: number;
    opponent: {
        username: string;
        photoUrl: string;
    };
    player: {
        photoUrl: string;
    };
}

export default function PreviousGames({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const router = useRouter();
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            router.replace('/auth');
        } else {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch(`/api/player/${username}/games`);
                const data = await response.json();
                setGames(data.games);
            } catch (error) {
                console.error('Failed to fetch games:', error);
            }
        };

        fetchGames();
    }, [username]);

    const handleBackClick = () => {
        router.back();
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8 relative">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackClick}
                            className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700"
                        >
                            <MdOutlineArrowBack className="text-2xl text-white" />
                        </button>
                        <h1 className="text-3xl font-bold text-white">Match History</h1>
                    </div>
                    <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                        <Image
                            src="/logo.png"
                            alt="Locamoo"
                            width={120}
                            height={40}
                            priority
                        />
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="space-y-4">
                    {games.map((game) => (
                        <div key={game.id} className="bg-gray-900 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                {/* Player Side */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden">
                                        <img
                                            src={game.player.photoUrl}
                                            alt={username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{username}</div>
                                        <div className={`text-sm ${game.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                                            {game.result === 'win' ? 'Winner' : 'Lost'}
                                        </div>
                                    </div>
                                </div>

                                {/* Game Info */}
                                <div className="text-center">
                                    <div className="text-gray-400 text-sm">{game.mode}</div>
                                    <div className="text-white font-mono">{game.score} points</div>
                                    <div className="text-gray-400 text-xs">{game.date}</div>
                                </div>

                                {/* Opponent Side */}
                                <div className="flex items-center gap-4">
                                    <div>
                                        <div className="text-white font-medium text-right">{game.opponent.username}</div>
                                        <div className={`text-sm text-right ${game.result === 'win' ? 'text-red-500' : 'text-green-500'}`}>
                                            {game.result === 'win' ? 'Lost' : 'Winner'}
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full overflow-hidden">
                                        <img
                                            src={game.opponent.photoUrl}
                                            alt={game.opponent.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedGame(game.id)}
                                className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm"
                            >
                                See Match Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {selectedGame && (
                <GameDetails
                    gameId={selectedGame}
                    username={username}
                    onClose={() => setSelectedGame(null)}
                />
            )}
        </div>
    );
}
