"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import FlightIcon from "@mui/icons-material/Flight";
import Map from './Map';
import DonatePopup from './DonatePopup';
import DonateReminder from './DonateReminder';

export default function Header() {
    const [isHovered, setIsHovered] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationError, setLocationError] = useState<string>("");
    const [cityName, setCityName] = useState<string>("");
    const [showDonate, setShowDonate] = useState(false);

    const getCityName = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'en',
                        'User-Agent': 'Locamoo App (educational project)'
                    }
                }
            );
            const data = await response.json();

            // Try different address levels to get the most appropriate name
            const locationName =
                data.address.city ||
                data.address.town ||
                data.address.suburb ||
                data.address.village ||
                data.address.municipality ||
                data.address.district ||
                data.address.state;

            setCityName(locationName || "Unknown location");
        } catch (error) {
            console.error("Error fetching city name:", error);
            setCityName("Location error");
        }
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = parseFloat(position.coords.latitude.toFixed(2));
                    const lon = parseFloat(position.coords.longitude.toFixed(2));
                    setLocation({ lat, lon });
                    getCityName(lat, lon);
                },
                (error) => {
                    setLocationError("Location access denied");
                }
            );
        } else {
            setLocationError("Geolocation not supported");
        }
    }, []);

    // Icon descriptions
    const iconDescriptions: { [key: string]: string } = {
        home: "Home - Go to main page",
        features: "Features - Explore functionalities",
        pricing: "Pricing - Check our plans",
        contact: "Contact - Get in touch",
        donate: "Donate - Support us",
    };

    return (
        <>
            {/* Map Component (lowest z-index) */}
            {location && typeof window !== 'undefined' && (
                <div className="fixed inset-0 z-[1]">
                    <Map
                        position={[location.lat, location.lon]}
                        cityName={cityName}
                    />
                </div>
            )}

            {/* Donate Reminder (middle z-index) */}
            <DonateReminder onCountdownComplete={() => setShowDonate(true)} />

            {/* Header Components (higher z-index) */}
            <div className="relative z-[100]">
                {/* Animated Header Background */}
                <div className={`fixed bottom-32 left-1/2 -translate-x-1/2 bg-black text-white flex items-center justify-center 
                    transition-all duration-500 overflow-hidden ${isHovered ? "w-80 h-16 rounded-full" : "w-16 h-16 rounded-full"}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Flying Plane Animation (Only visible when not hovered) */}
                    {!isHovered && (
                        <div className="absolute w-full h-full flex justify-center items-center">
                            <FlightIcon
                                fontSize="large"
                                className="text-blue-400 animate-fly transform-gpu"
                            />
                        </div>
                    )}

                    {/* Logo and Text (Visible only when hovered) */}
                    <div className={`flex items-center transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                        <img src="/dark_logo.png" alt="Locamoo Logo" className="h-8 w-8 mr-2" />
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold">Locamoo</h2>
                            <span className="text-xs text-gray-300">
                                {location ?
                                    `${cityName ? `${cityName} ` : ''}(${location.lat}°N, ${location.lon}°E)` :
                                    locationError ? locationError : "Loading..."
                                }
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Header Menu */}
                <header className="flex items-center justify-between w-1/4 h-20 p-4 bg-black shadow-md fixed bottom-10 left-1/2 -translate-x-1/2 rounded-lg">
                    <nav className="flex items-center justify-around w-full h-full">
                        <ul className="relative h-full flex space-x-6">
                            {[
                                { href: "/", icon: <HomeIcon fontSize="large" className="text-blue-500" />, name: "home" },
                                { href: "/features", icon: <SettingsIcon fontSize="large" className="text-blue-500" />, name: "features" },
                                {
                                    icon: <AttachMoneyIcon fontSize="large" className="text-green-500" />,
                                    name: "donate",
                                    onClick: () => setShowDonate(true)
                                },
                                { href: "/contact", icon: <DescriptionIcon fontSize="large" className="text-purple-500" />, name: "contact" },
                            ].map((item) => (
                                <li
                                    key={item.name}
                                    className="relative flex flex-col items-center"
                                    onMouseEnter={() => setHoveredItem(item.name)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    {/* Tooltip */}
                                    {hoveredItem === item.name && (
                                        <div className="absolute bottom-12 px-3 py-1 bg-gray-800 text-white text-sm rounded-md transition-all duration-300 opacity-100">
                                            {iconDescriptions[item.name]}
                                        </div>
                                    )}
                                    {/* Icon */}
                                    {item.href ? (
                                        <Link href={item.href} className="flex items-center justify-around w-full h-full text-white hover:text-blue-500">
                                            {item.icon}
                                        </Link>
                                    ) : (
                                        <button onClick={item.onClick} className="flex items-center justify-around w-full h-full text-white hover:text-blue-500">
                                            {item.icon}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </header>
            </div>

            {/* Donate Popup (highest z-index) */}
            {showDonate && <DonatePopup onClose={() => setShowDonate(false)} />}
        </>
    );
}
