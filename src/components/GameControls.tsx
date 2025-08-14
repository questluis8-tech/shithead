import React from 'react';
import { Volume2, VolumeX, RotateCcw, Play } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

interface GameControlsProps {
  gamePhase: 'setup' | 'swapping' | 'playing' | 'finished';
  selectedCards: any[];
  onDealCards: () => void;
  onStartGame: () => void;
  onPlayCards: () => void;
  canPlaySelected: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gamePhase,
  selectedCards,
  onDealCards,
  onStartGame,
  onPlayCards,
  canPlaySelected
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(soundManager.isEnabled());

  const toggleSound = () => {
    soundManager.toggle();
    setSoundEnabled(soundManager.isEnabled());
  };

  return (
    <div className="fixed top-4 left-4 right-4 flex justify-between items-start z-10">
      {/* Left side - Game status and rules */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 text-white max-w-md">
        <h2 className="text-xl font-bold mb-2">Shithead</h2>
        <div className="text-sm space-y-1">
          {gamePhase === 'setup' && (
            <div>Click "Deal Cards" to start a new game</div>
          )}
          {gamePhase === 'swapping' && (
            <div>Click a hand card, then a face-up card to swap them. Click "Start Game" when ready.</div>
          )}
          {gamePhase === 'playing' && (
            <div>Select cards and click "Play Cards" to make your move.</div>
          )}
          {gamePhase === 'finished' && (
            <div>Game Over! Click "Deal Cards" for a new game.</div>
          )}
        </div>
        
        {/* Special rules reminder */}
        <div className="mt-3 text-xs opacity-75">
          <div><strong>Special Cards:</strong></div>
          <div>• 2 can be played on anything</div>
          <div>• 7 forces next card ≤ 7</div>
          <div>• 10 clears the pile</div>
          <div>• 4 of same rank burns pile</div>
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex flex-col gap-2">
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="bg-black bg-opacity-50 backdrop-blur-sm p-3 rounded-lg text-white hover:bg-opacity-75 transition-all"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        {/* Game action buttons */}
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 flex flex-col gap-2">
          {gamePhase === 'setup' && (
            <button
              onClick={onDealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
            >
              <RotateCcw size={16} />
              Deal Cards
            </button>
          )}
          
          {gamePhase === 'swapping' && (
            <button
              onClick={onStartGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
            >
              <Play size={16} />
              Start Game
            </button>
          )}
          
          {gamePhase === 'playing' && selectedCards.length > 0 && (
            <button
              onClick={onPlayCards}
              disabled={!canPlaySelected}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                canPlaySelected
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Play Cards ({selectedCards.length})
            </button>
          )}
          
          {gamePhase === 'finished' && (
            <button
              onClick={onDealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
            >
              <RotateCcw size={16} />
              New Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};