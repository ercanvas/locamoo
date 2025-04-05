"use client";
import { useEffect, useState, useCallback, useRef } from 'react';

interface DonateReminderProps {
    onTimeEnd: () => void;
    timeInSeconds?: number;
    hasDonated?: boolean;
    isAdminOrMod?: boolean;
}

export default function DonateReminder({ onTimeEnd, timeInSeconds = 180, hasDonated = false, isAdminOrMod = false }: DonateReminderProps) {
    const [countdown, setCountdown] = useState(hasDonated ? 7200 : timeInSeconds); // 2 hours if donated
    const [isPaused, setIsPaused] = useState(false);
    const timeEndCalled = useRef(false);

    // Format time as HH:MM:SS
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1 && !timeEndCalled.current) {
                    clearInterval(timer);
                    timeEndCalled.current = true;
                    setTimeout(() => onTimeEnd(), 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            timeEndCalled.current = false;
        };
    }, [onTimeEnd, isPaused]);

    return (
        <div className="fixed bottom-4 right-4 bg-black/90 p-4 rounded-lg text-white flex items-center gap-4">
            {hasDonated ? (
                <span>❤️ Thanks for donating! Reminders disabled for {formatTime(countdown)}</span>
            ) : (
                <>
                    <span>❤️ Consider supporting us!</span>
                    <span className="font-mono">{formatTime(countdown)}</span>
                </>
            )}
            {isAdminOrMod && (
                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`ml-2 px-3 py-1 rounded ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    {isPaused ? 'Resume' : 'Freeze'}
                </button>
            )}
        </div>
    );
}
