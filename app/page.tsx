"use client";
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import GameInterface from './components/GameInterface';
import DonatePopup from './components/DonatePopup';
import DonateReminder from './components/DonateReminder';
import ModeSelect from './components/ModeSelect';
import Rest5sec from './components/Rest5sec';
import AnnounceWinner from './components/AnnounceWinner';
import LoadingScreen from './components/LoadingScreen';

const Map = dynamic(() => import('./components/Map'), { ssr: false });

type GameMode = 'car' | 'plane' | 'weather';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [winner, setWinner] = useState<'opponent' | 'you'>('you');
  const [showWinner, setShowWinner] = useState(false);
  const [finalWinner, setFinalWinner] = useState<'you' | 'opponent'>('you');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasDonated, setHasDonated] = useState(false);

  // Update auth check
  useEffect(() => {
    const username = localStorage.getItem('username');
    const isSpectator = localStorage.getItem('isSpectator');

    if (!username) {
      setIsLoading(false);
      router.replace('/auth');
      return;
    }
    setUsername(username);
    setIsAuthenticated(true);

    if (isSpectator) {
      // Disable interactive features for spectators
      setGameStarted(false);
      setShowDonate(false);
      setShowReminder(false);
    }

    setIsLoading(false);
  }, [router]);

  // Show donate popup on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDonate(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Check donation status on load
  useEffect(() => {
    const lastDonationTime = localStorage.getItem('lastDonationTime');
    if (lastDonationTime) {
      const elapsed = Date.now() - parseInt(lastDonationTime);
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      setHasDonated(elapsed < twoHours);
      if (elapsed >= twoHours) {
        localStorage.removeItem('lastDonationTime');
      }
    }
  }, []);

  const handleDonateClose = () => {
    setShowDonate(false);
    setShowReminder(true);
  };

  const handleReminderEnd = useCallback(() => {
    setShowReminder(false);
    setShowDonate(true);
  }, []);

  // Add city pairs for rounds
  const cityPairs = [
    { city1: 'Paris', city2: 'London' },
    { city1: 'Berlin', city2: 'Rome' },
    { city1: 'Madrid', city2: 'Amsterdam' },
    { city1: 'Vienna', city2: 'Prague' },
    { city1: 'Barcelona', city2: 'Munich' },
  ];

  // Define cities with their coordinates
  const cities = {
    Paris: [2.3522, 48.8566] as [number, number],
    London: [-0.1276, 51.5074] as [number, number],
    Berlin: [13.4050, 52.5200] as [number, number],
    Rome: [12.4964, 41.9028] as [number, number],
    Madrid: [-3.7038, 40.4168] as [number, number],
    Amsterdam: [4.9041, 52.3676] as [number, number],
    Vienna: [16.3738, 48.2082] as [number, number],
    Prague: [14.4378, 50.0755] as [number, number],
    Barcelona: [2.1686, 41.3874] as [number, number],
    Munich: [11.5820, 48.1351] as [number, number],
  };

  const [currentRound, setCurrentRound] = useState(0);
  const [gameState] = useState({
    gameMode: 'car' as GameMode,
    city1: cityPairs[0].city1,
    city2: cityPairs[0].city2,
    opponentHistory: [] as boolean[],
  });

  const handleSubmit = (answer: string) => {
    if (gameState.gameMode === 'weather') {
      const userTemps = JSON.parse(answer);
      const actualTemps = { city1: 25, city2: 18 }; // Replace with real API data

      // Calculate differences for both players
      const userDiff = Math.abs(userTemps.city1 - actualTemps.city1) +
        Math.abs(userTemps.city2 - actualTemps.city2);
      const opponentDiff = Math.random() * 20; // Simulate opponent difference

      // Update winner based on who was closer
      setWinner(userDiff < opponentDiff ? 'you' : 'opponent');
    }
    console.log('Submitted answer:', answer);
  };

  const handleCountdownEnd = useCallback(() => {
    if (currentRound < 4) {
      setShowRest(true);
      setWinner(Math.random() > 0.5 ? 'you' : 'opponent'); // Random winner for demo
    } else {
      // Game finished after 5 rounds
      const youWin = Math.random() > 0.5; // Replace with actual win condition
      setFinalWinner(youWin ? 'you' : 'opponent');
      setShowWinner(true);
    }
  }, [currentRound]);

  const handleRestComplete = () => {
    setShowRest(false);
    // Move to next round
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    // Update cities
    gameState.city1 = cityPairs[nextRound].city1;
    gameState.city2 = cityPairs[nextRound].city2;
    // Simulate opponent result
    const isCorrect = Math.random() > 0.5;
    gameState.opponentHistory = [...gameState.opponentHistory, isCorrect];
  };

  const handleModeSelect = (mode: GameMode) => {
    gameState.gameMode = mode;
    setGameStarted(true);
  };

  const handleNewMatch = () => {
    setShowWinner(false);
    setGameStarted(false);
    setCurrentRound(0);
    gameState.opponentHistory = [];
  };

  const handleQuit = () => {
    setGameStarted(false);
    setCurrentRound(0);
    setFinalWinner('opponent');
    setShowWinner(true);
    gameState.opponentHistory = [];
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full h-screen relative">
      <Map
        position={cities[gameState.city1 as keyof typeof cities]}
        cityName=""
        city1={cities[gameState.city1 as keyof typeof cities]}
        city2={cities[gameState.city2 as keyof typeof cities]}
      />
      {!gameStarted ? (
        <ModeSelect onSelect={handleModeSelect} username={username} />
      ) : (
        <GameInterface
          gameMode={gameState.gameMode}
          city1={gameState.city1}
          city2={gameState.city2}
          onSubmit={handleSubmit}
          opponentHistory={gameState.opponentHistory}
          correctAnswer="02:30:00"
          onCountdownEnd={handleCountdownEnd}
          currentTemps={{ city1: 25, city2: 18 }} // Add actual temperatures
          onQuit={handleQuit}
          username={username}
        />
      )}
      {showDonate && !hasDonated && (
        <DonatePopup
          onClose={handleDonateClose}
          message="Support our project to help us keep developing new features and maintaining the service! 🙏"
        />
      )}
      {showReminder && (
        <DonateReminder
          onTimeEnd={handleReminderEnd}
          timeInSeconds={180}
          hasDonated={hasDonated}
        />
      )}
      {showRest && (
        <Rest5sec
          onComplete={handleRestComplete}
          winner={winner}
          correctAnswer="02:30:00"
        />
      )}
      {showWinner && (
        <AnnounceWinner
          winner={finalWinner}
          onNewMatch={handleNewMatch}
        />
      )}
    </div>
  );
}
