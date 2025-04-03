"use client";
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const theme = localStorage.getItem('theme') || 'dark';
        setIsDark(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setIsDark(!isDark);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', !isDark);
    };

    return (
        <button
            onClick={toggleTheme}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <MdLightMode className="text-2xl text-yellow-500" />
            ) : (
                <MdDarkMode className="text-2xl text-blue-500" />
            )}
        </button>
    );
}
