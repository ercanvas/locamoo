"use client";
import { useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

type GameMode = 'car' | 'plane' | 'weather' | null;

type Props = {
    onSelectMode: (mode: GameMode) => void;
};

export default function GameModeSelector({ onSelectMode }: Props) {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-black/90 rounded-lg p-6 text-white shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-6">Choose Game Mode</h2>
                <div className="flex gap-6">
                    <button
                        onClick={() => onSelectMode('car')}
                        className="flex flex-col items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <DirectionsCarIcon className="text-3xl mb-2" />
                        <span className="text-sm">Driving Time</span>
                        <span className="text-xs text-gray-400">Guess car travel time</span>
                    </button>

                    <button
                        onClick={() => onSelectMode('plane')}
                        className="flex flex-col items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <FlightIcon className="text-3xl mb-2" />
                        <span className="text-sm">Flight Time</span>
                        <span className="text-xs text-gray-400">Guess plane travel time</span>
                    </button>

                    <button
                        onClick={() => onSelectMode('weather')}
                        className="flex flex-col items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <WbSunnyIcon className="text-3xl mb-2" />
                        <span className="text-sm">Weather</span>
                        <span className="text-xs text-gray-400">Guess city weather</span>
                    </button>
                </div>
                <div className="mt-6 text-center text-sm text-gray-400">
                    Win matches to earn 2000 points!
                </div>
            </div>
        </div>
    );
}
