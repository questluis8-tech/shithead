import React, { useState } from 'react';
import { useGame } from './hooks/useGame';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { GameOverModal } from './components/GameOverModal';
import { Card } from './components/Card';
import { getEffectiveTopCard } from './utils/cardUtils';
import { soundManager } from './utils/soundManager';

function App() {
  const [playerCount, setPlayerCount] = useState(4);
  const [showPlayerSelect, setShowPlayerSelect] = useState(true);
  
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
    playFaceDownCard,
    jumpInWindow,
    lastAction,
    clearLastAction
  } = useGame(playerCount);

  // Clear last action after showing it briefly
  React.useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => {
        clearLastAction();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastAction, clearLastAction]);

  // Play sound effects
  React.useEffect(() => {
    if (lastAction === 'burn') {
      soundManager.burn();
    }
  }, [lastAction]);

  const handleStartGame = () => {
    setShowPlayerSelect(false);
    dealCards();
  };

  const handleExitGame = () => {
    setShowPlayerSelect(true);
  };

  if (showPlayerSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-12 text-center max-w-2xl mx-4">
          <h1 className="text-6xl font-bold text-white mb-8">💩 Shithead 💩</h1>
          <p className="text-xl text-gray-300 mb-8">The classic card game</p>
          
          <div className="mb-8">
            <label className="block text-white text-lg mb-4">Number of Players:</label>
            <div className="flex gap-2 justify-center">
              {[2, 3, 4, 5, 6].map(count => (
                <button
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    playerCount === count
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleStartGame}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Last Action Notification */}
      {lastAction && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className={`text-6xl font-bold animate-bounce ${
            lastAction === 'burn' ? 'text-red-500' : 'text-blue-500'
          }`}>
            {lastAction === 'burn' ? '🔥 BURN! 🔥' : '📚 PICKUP! 📚'}
          </div>
        </div>
      )}

      {/* Jump-in Window Notification */}
      {jumpInWindow && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold text-xl animate-pulse">
            🚀 JUMP IN AVAILABLE! Play {jumpInWindow.rank === 11 ? 'J' : jumpInWindow.rank === 12 ? 'Q' : jumpInWindow.rank === 13 ? 'K' : jumpInWindow.rank === 14 ? 'A' : jumpInWindow.rank}
          </div>
        </div>
      )}

      <GameBoard
        players={gameState.players}
        currentPlayerIndex={gameState.currentPlayerIndex}
        pile={gameState.pile}
        onCardClick={handleCardClick}
        selectedCards={selectedCards}
        gamePhase={gameState.gamePhase}
      />
      
      <GameControls
        gamePhase={gameState.gamePhase}
        selectedCards={selectedCards}
        onDealCards={dealCards}
        onStartGame={startGame}
        onPlayCards={playCards}
        canPlaySelected={canPlaySelected}
      />

      {/* Setup Phase - Choose face-up cards */}
      {gameState.gamePhase === 'setup' && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4 text-center">
            <p className="text-white mb-4">Choose 3 cards from your hand to be face-up</p>
            {gameState.players[0].faceUpCards.length === 3 && (
              <button
                onClick={confirmFaceUpCards}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
              >
                Confirm Selection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Swapping Phase */}
      {gameState.gamePhase === 'swapping' && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4 text-center">
            <p className="text-white mb-4">You can swap cards between your hand and face-up cards</p>
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
            >
              Start Playing
            </button>
          </div>
        </div>
      )}

      {/* Playing Phase - Action buttons */}
      {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0 && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4 flex gap-4">
            {selectedCards.length > 0 && (
              <button
                onClick={playCards}
                disabled={!canPlaySelected}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  canPlaySelected
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Play Cards ({selectedCards.length})
              </button>
            )}
            
            {selectedCards.length === 0 && !canPlayAnyCard && gameState.pile.length > 0 && (
              <button
                onClick={pickupCards}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
              >
                Pick up Cards ({gameState.pile.length})
              </button>
            )}

            {/* Face-down card buttons when hand and face-up are empty */}
            {gameState.players[0].hand.length === 0 && 
             gameState.players[0].faceUpCards.length === 0 && 
             gameState.players[0].faceDownCards.length > 0 && (
              <div className="flex gap-2">
                {gameState.players[0].faceDownCards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => playFaceDownCard(index)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                  >
                    Play Face-Down #{index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <GameOverModal
        winner={gameState.winner}
        loser={gameState.loser}
        players={gameState.players}
        onNewGame={dealCards}
        onExitGame={handleExitGame}
      />
    </div>
  );
}

export default App;