"use client";
import { useEffect, useState } from 'react';

type Props = {
    placeName: string;
    coords: [number, number];
    onClose: () => void;
};

type WeatherData = {
    main: {
        temp: number;
        humidity: number;
    };
    weather: [{
        description: string;
        icon: string;
    }];
    wind: {
        speed: number;
    };
} | null;

export default function InfoPanel({ placeName, coords, onClose }: Props) {
    const [wikiData, setWikiData] = useState<string>('');
    const [weather, setWeather] = useState<WeatherData>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const api = '2a2d5ad6b95d9062d59447ac04391745';  // Updated API key

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        // Fetch Wikipedia data
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName.split(',')[0])}`)
            .then(res => res.json())
            .then(data => setWikiData(data.extract || 'No information available'))
            .catch(() => setWikiData('No information available'));

        // Updated Weather API call
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords[1]}&lon=${coords[0]}&units=metric&appid=${api}`)
            .then(async res => {
                const data = await res.json();
                if (data.cod === '401') {  // API returns string '401' not number 401
                    throw new Error('Weather API authentication failed');
                }
                if (!res.ok || data.cod !== 200) {
                    throw new Error(data.message || 'Weather data not available');
                }
                return data;
            })
            .then(data => {
                setWeather(data);
                setError(null);
            })
            .catch(err => {
                console.error('Weather fetch error:', err);
                setError(err.message || 'Unable to load weather data');
                setWeather(null);
            })
            .finally(() => setIsLoading(false));
    }, [placeName, coords]);

    return (
        <div className="fixed right-4 top-20 w-80 bg-black/90 text-white rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{placeName.split(',')[0]}</h3>
                <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
            </div>

            {isLoading ? (
                <div className="text-center py-4">Loading weather data...</div>
            ) : error ? (
                <div className="text-red-400 py-2">{error}</div>
            ) : weather && (
                <div className="mb-4 p-3 bg-black/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl">{Math.round(weather.main.temp)}°C</div>
                            <div className="text-white/70">{weather.weather[0].description}</div>
                        </div>
                        <img
                            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                            alt="weather"
                            className="w-16 h-16"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>Humidity: {weather.main.humidity}%</div>
                        <div>Wind: {weather.wind.speed} m/s</div>
                    </div>
                </div>
            )}

            <div className="text-sm text-white/80">
                {wikiData}
            </div>
        </div>
    );
}
