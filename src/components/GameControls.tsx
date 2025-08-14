import React from 'react';
import { Volume2, VolumeX, RotateCcw, Play, Hand, ArrowDown } from 'lucide-react';
import { soundManager } from '../utils/soundManager';
import { GameState, Card } from '../types/game';

interface GameControlsProps {
  gameState: GameState;
  selectedCards: Card[];
  onDealCards: () => void;
  onConfirmFaceUpCards: () => void;
  onStartGame: () => void;
  onPlayCards: () => void;
  onPickupCards: () => void;
  canPlaySelected: boolean;
  canPlayAnyCard: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  selectedCards,
  onDealCards,
  onConfirmFaceUpCards,
  onStartGame,
  onPlayCards,
  onPickupCards,
  canPlaySelected,
  canPlayAnyCard
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(soundManager.isEnabled());
  const humanPlayer = gameState.players[0];

  const toggleSound = () => {
    soundManager.toggle();
    setSoundEnabled(soundManager.isEnabled());
  };

  const getPhaseDescription = () => {
    switch (gameState.gamePhase) {
      case 'setup':
        if (humanPlayer.hand.length === 0) {
          return 'Click "Deal Cards" to start a new game';
        }
        if (humanPlayer.faceUpCards.length < 3) {
          return 'Choose 3 cards from your hand to place face-up';
        }
        return 'Click "Confirm" when you\'re happy with your face-up cards';
      case 'swapping':
        return 'Optional: Click a hand card, then a face-up card to swap them';
      case 'playing':
        if (gameState.currentPlayerIndex === 0) {
          return 'Your turn! Select cards and play them';
        }
        return `${gameState.players[gameState.currentPlayerIndex].name}'s turn`;
      case 'finished':
        return 'Game Over! Click "New Game" to play again';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Top-left game info */}
      <div className="fixed top-4 left-4 z-20">
        <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
          <h1 className="text-xl font-bold mb-2 text-yellow-300">Shithead</h1>
          <p className="text-sm mb-3">{getPhaseDescription()}</p>
          
          {/* Game rules reminder */}
          <div className="text-xs opacity-75 space-y-1">
            <div className="font-semibold text-yellow-200">Special Cards:</div>
            <div>• <span className="text-red-400">2</span> can be played on anything</div>
            <div>• <span className="text-red-400">7</span> forces next card ≤ 7</div>
            <div>• <span className="text-red-400">10</span> clears the pile</div>
            <div>• <span className="text-red-400">4 same rank</span> burns pile</div>
          </div>
        </div>
      </div>

      {/* Top-right controls */}
      <div className="fixed top-4 right-4 z-20 flex flex-col gap-2">
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="bg-black bg-opacity-60 backdrop-blur-sm p-3 rounded-lg text-white hover:bg-opacity-80 transition-all"
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Bottom-center action buttons */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-3">
          {/* Deal Cards */}
          {gameState.gamePhase === 'setup' && humanPlayer.hand.length === 0 && (
            <button
              onClick={onDealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <RotateCcw size={18} />
              Deal Cards
            </button>
          )}
          
          {/* Confirm Face-Up Cards */}
          {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
            <button
              onClick={onConfirmFaceUpCards}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <Hand size={18} />
              Confirm Cards
            </button>
          )}
          
          {/* Start Game */}
          {gameState.gamePhase === 'swapping' && (
            <button
              onClick={onStartGame}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <Play size={18} />
              Start Game
            </button>
          )}
          
          {/* Play Cards */}
          {gameState.gamePhase === 'playing' && 
           gameState.currentPlayerIndex === 0 && 
           selectedCards.length > 0 && (
            <button
              onClick={onPlayCards}
              disabled={!canPlaySelected}
              className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform shadow-lg ${
                canPlaySelected
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Play size={18} />
              Play Cards ({selectedCards.length})
            </button>
          )}
          
          {/* Pick up Cards */}
          {gameState.gamePhase === 'playing' && 
           gameState.currentPlayerIndex === 0 && 
           selectedCards.length === 0 && 
           !canPlayAnyCard && 
           gameState.pile.length > 0 && (
            <button
              onClick={onPickupCards}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <ArrowDown size={18} />
              Pick up Cards ({gameState.pile.length})
            </button>
          )}
          
          {/* New Game */}
          {gameState.gamePhase === 'finished' && (
            <button
              onClick={onDealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <RotateCcw size={18} />
              New Game
            </button>
          )}
        </div>
      </div>
    </>
  );
};