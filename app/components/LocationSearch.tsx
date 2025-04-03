"use client";
import { useState } from 'react';

type Props = {
    onLocationSelect: (type: 'departure' | 'arrival', coords: [number, number]) => void;
    mapboxgl: any;
    onPlaceSelect: (placeName: string) => void;
};

export default function LocationSearch({ onLocationSelect, mapboxgl, onPlaceSelect }: Props) {
    const [departureQuery, setDepartureQuery] = useState('');
    const [arrivalQuery, setArrivalQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [activeInput, setActiveInput] = useState<'departure' | 'arrival' | null>(null);

    const searchLocation = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxgl.accessToken}`
            );
            const data = await response.json();
            setSuggestions(data.features);
        } catch (error) {
            console.error('Error searching location:', error);
        }
    };

    const handleSuggestionClick = (suggestion: any) => {
        const coords: [number, number] = suggestion.center;
        if (activeInput) {
            onLocationSelect(activeInput, coords);
            if (activeInput === 'departure') {
                setDepartureQuery(suggestion.place_name);
            } else {
                setArrivalQuery(suggestion.place_name);
            }
            onPlaceSelect(suggestion.place_name);
            setSuggestions([]);
            setActiveInput(null);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg w-96">
            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Departure location"
                        value={departureQuery}
                        onChange={(e) => {
                            setDepartureQuery(e.target.value);
                            searchLocation(e.target.value);
                        }}
                        onFocus={() => setActiveInput('departure')}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Arrival location"
                        value={arrivalQuery}
                        onChange={(e) => {
                            setArrivalQuery(e.target.value);
                            searchLocation(e.target.value);
                        }}
                        onFocus={() => setActiveInput('arrival')}
                        className="w-full p-2 border rounded"
                    />
                </div>
                {suggestions.length > 0 && (
                    <ul className="absolute bg-white w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                            >
                                {suggestion.place_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
