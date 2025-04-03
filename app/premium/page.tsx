"use client";
import { useState } from 'react';
import { MdCheckCircle, MdArrowBack, MdLightMode, MdDarkMode } from 'react-icons/md';
import Link from 'next/link';
import Image from 'next/image';

export default function Premium() {
    const [isDark, setIsDark] = useState(true);

    const premiumFeatures = [
        "No donation reminders",
        "Ad-free experience",
        "Exclusive weather patterns",
        "Premium profile badge",
        "Advanced statistics",
        "Custom game modes",
        "Priority support",
        "Early access to new features"
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
            <div className="container mx-auto px-4 py-8">
                {/* Update Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Image
                            src={isDark ? "/logo.png" : "/dark_logo.png"}
                            alt="Locamoo"
                            width={120}
                            height={40}
                            priority
                        />
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mb-12">
                    <Link
                        href="/"
                        className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'} hover:opacity-80`}
                    >
                        <MdArrowBack className="text-2xl" />
                        <span>Back to Game</span>
                    </Link>
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className={`p-2 rounded-full ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                    >
                        {isDark ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
                    </button>
                </div>

                {/* Premium Content */}
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className={`text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
                        Upgrade to Premium
                    </h1>
                    <p className={`text-xl mb-12 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Enhance your Locamoo experience with exclusive features
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {premiumFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-4 p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-100'
                                    }`}
                            >
                                <MdCheckCircle className="text-2xl text-green-500" />
                                <span className={isDark ? 'text-white' : 'text-black'}>
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Pricing */}
                    <div className={`p-8 rounded-2xl mb-8 ${isDark ? 'bg-gray-900' : 'bg-gray-100'
                        }`}>
                        <div className={`text-6xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'
                            }`}>
                            $4.99
                            <span className="text-lg">/month</span>
                        </div>
                        <button
                            onClick={() => window.open('https://example.com/premium', '_blank')}
                            className="bg-green-500 hover:bg-green-600 text-white py-4 px-8 rounded-xl text-xl font-bold transition-colors w-full max-w-md"
                        >
                            Get Premium Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
