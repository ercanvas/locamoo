"use client";
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DonatePopupProps {
    onClose: () => void;
    message?: string;
}

export default function DonatePopup({ onClose, message = "Support our project!" }: DonatePopupProps) {
    const [countdown, setCountdown] = useState(15);
    const timeEndCalled = useRef(false);
    const circumference = 2 * Math.PI * 20;
    const progress = (countdown / 15) * circumference;

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1 && !timeEndCalled.current) {
                    clearInterval(timer);
                    timeEndCalled.current = true;
                    setTimeout(() => onClose(), 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            timeEndCalled.current = false;
        };
    }, [onClose]);

    const handleDonate = () => {
        // Store donation timestamp
        localStorage.setItem('lastDonationTime', Date.now().toString());
        window.open('https://buymeacoffee.com/ercanyarmaci', '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-sm z-50 flex">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-black p-12 rounded-2xl max-w-2xl w-full relative border border-gray-800">
                    {/* Add Logo */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                        <Link href="/">
                            <Image
                                src="/logo.png"
                                alt="Locamoo"
                                width={120}
                                height={40}
                                priority
                            />
                        </Link>
                    </div>

                    {/* Countdown Circle */}
                    <div className="absolute top-6 right-6">
                        <svg className="w-16 h-16">
                            <circle
                                cx="20"
                                cy="20"
                                r="18"
                                stroke="#4B5563"
                                strokeWidth="2"
                                fill="none"
                                className="opacity-25"
                            />
                            <circle
                                cx="20"
                                cy="20"
                                r="18"
                                stroke="white"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - progress}
                                className="transition-all duration-1000 ease-linear"
                                transform="rotate(-90, 20, 20)"
                            />
                            <text
                                x="20"
                                y="20"
                                dy=".3em"
                                textAnchor="middle"
                                fill="white"
                                className="text-sm font-bold"
                            >
                                {countdown}
                            </text>
                        </svg>
                    </div>

                    <h1 className="text-4xl font-extrabold mb-6 text-white">❤️ Support Locamoo</h1>
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed">{message}</p>
                    <button
                        onClick={handleDonate}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-8 rounded-xl text-xl font-bold transition-colors"
                    >
                        Donate Now
                    </button>
                </div>
            </div>

            {/* Ad Section */}
            <div className="w-96 bg-black/50 backdrop-blur p-8 flex flex-col gap-6">
                <div className="bg-gray-800 rounded-xl p-6 h-64 flex items-center justify-center">
                    <span className="text-gray-400">Advertisement</span>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 h-64 flex items-center justify-center">
                    <span className="text-gray-400">Advertisement</span>
                </div>
            </div>
        </div>
    );
}
