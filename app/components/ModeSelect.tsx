"use client";
import { MdDirectionsCar, MdFlight, MdWbSunny, MdHistory, MdPerson, MdWorkspacePremium } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import FindOpponent from './FindOpponent';
import DonatePopup from './DonatePopup';
import DonateReminder from './DonateReminder';
import Image from 'next/image';
import GlobalChat from '@/app/components/GlobalChat';
import Logo from './Logo';

type GameMode = 'car' | 'plane' | 'weather';

interface ModeSelectProps {
    onSelect: (mode: GameMode) => void;
    username: string; // Add username prop
}

export default function ModeSelect({ onSelect, username }: ModeSelectProps) {
    const [showFindOpponent, setShowFindOpponent] = useState(false);
    const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
    const [showDonate, setShowDonate] = useState(false);
    const [showReminder, setShowReminder] = useState(false);
    const [userRole, setUserRole] = useState<'admin' | 'moderator' | null>(null);
    const router = useRouter();
    const modes = [
        { id: 'car' as GameMode, icon: MdDirectionsCar, label: 'Driving Time' },
        { id: 'plane' as GameMode, icon: MdFlight, label: 'Flight Time' },
        { id: 'weather' as GameMode, icon: MdWbSunny, label: 'Weather Mode' }, // Changed from 'Weather Time'
    ];

    // Add useEffect for initial donation popup
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowDonate(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const res = await fetch(`/api/profile/${username}`);
                const data = await res.json();
                setUserRole(data.role);
            } catch (error) {
                console.error('Failed to fetch user role:', error);
            }
        };

        fetchUserRole();
    }, [username]);

    const handleModeClick = (mode: GameMode) => {
        setSelectedMode(mode);
        setShowFindOpponent(true);
    };

    const handleOpponentFound = (opponent: any) => {
        setShowFindOpponent(false);
        onSelect(selectedMode!);
    };

    const handleDonateClose = () => {
        setShowDonate(false);
        setShowReminder(true);
    };

    const handleReminderEnd = () => {
        setShowReminder(false);
        setShowDonate(true);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 flex flex-col">
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-8">
                    <Logo />
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white flex items-center gap-4">
                        <Link
                            href={`/player/${username}/previous`}
                            className="pointer-events-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
                        >
                            <MdHistory className="text-lg" />
                            <span>History</span>
                        </Link>

                        <Link
                            href={`/player/${username}`}
                            className="pointer-events-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
                        >
                            <MdPerson className="text-lg" />
                            <span>Profile</span>
                        </Link>

                        <button
                            onClick={() => router.push('/premium')}
                            className="pointer-events-auto flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 px-4 py-2 rounded-lg text-sm"
                        >
                            <MdWorkspacePremium className="text-lg" />
                            <span>Get Premium</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Move GlobalChat above DonateReminder */}
            <div className="fixed bottom-24 right-4"> {/* Changed from top-24 to bottom-24 */}
                <GlobalChat />
            </div>

            {/* Game Mode Selection */}
            <div className="flex-1 flex items-center justify-center">
                <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full mx-4">
                    <h2 className="text-3xl font-bold mb-8 text-center text-white">Choose Game Mode</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {modes.map(({ id, icon: Icon, label }) => (
                            <button
                                key={id}
                                onClick={() => handleModeClick(id)}
                                className="group flex flex-col items-center gap-4 p-6 rounded-lg 
                                    bg-gradient-to-br from-gray-800 to-gray-900
                                    hover:from-blue-600 hover:to-blue-800
                                    transition-all duration-300 transform hover:scale-105
                                    active:scale-95"
                            >
                                <Icon className="text-5xl text-white 
                                    transition-transform duration-300 
                                    group-hover:-translate-y-2" />
                                <span className="text-lg font-medium text-white
                                    transition-colors duration-300
                                    group-hover:text-blue-200">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Update donate popup and reminder logic */}
            {showDonate && (
                <DonatePopup
                    onClose={handleDonateClose}
                    message="Support our project to help us keep developing new features and maintaining the service! 🙏"
                    isAdminOrMod={!!userRole}
                />
            )}
            {showReminder && (
                <DonateReminder
                    onTimeEnd={handleReminderEnd}
                    timeInSeconds={180}
                    hasDonated={false}
                    isAdminOrMod={!!userRole}
                />
            )}
            {showFindOpponent && (
                <FindOpponent
                    onAccept={handleOpponentFound}
                    onCancel={() => setShowFindOpponent(false)}
                />
            )}
        </div>
    );
}
