import React from 'react';
import { useGame } from './hooks/useGame';
import { Card } from './components/Card';

function App() {
  const {
    gameState,
    selectedCards,
    dealCards,
    confirmFaceUpCards,
    startGame,
    handleCardClick,
    playCards,
    canPlaySelected,
    pickupCards,
    canPlayAnyCard,
    playFaceDownCard
  } = useGame();

  const humanPlayer = gameState.players[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-red-700 relative overflow-hidden">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300 to-transparent transform -skew-y-12"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-red-400 to-transparent transform skew-y-12"></div>
      </div>
      
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top UI Bar */}
        <div className="flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Shithead</h1>
          <div className="text-white text-sm">
            Phase: {gameState.gamePhase}
          </div>
        </div>
        
        {/* Main Game Area */}
        <div className="flex-1 relative">
          {/* This is where we'll add the positioned players and center area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-xl">Game Area - Players will be positioned here</div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;