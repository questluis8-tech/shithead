import React from 'react';
import { Trophy, Frown, RotateCcw, X } from 'lucide-react';

interface GameOverModalProps {
  winner: string | null;
  loser: string | null;
  players: any[];
  onNewGame: () => void;
  onExitGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  loser,
  players,
  onNewGame,
  onExitGame
}) => {
  if (!winner) return null;

  const winnerPlayer = players.find(p => p.id === winner);
  const loserPlayer = players.find(p => p.id === loser);
  const isPlayerWinner = winner === 'human';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-12 text-center max-w-2xl mx-4 shadow-2xl w-full max-h-screen overflow-y-auto">
        <div className="mb-6">
          {isPlayerWinner ? (
            <div className="text-green-600">
              <Trophy size={96} className="mx-auto mb-6" />
              <h2 className="text-5xl font-bold mb-4">Victory!</h2>
              <p className="text-2xl mt-4">Congratulations! You won!</p>
            </div>
          ) : (
            <div className="text-red-600">
              <Frown size={96} className="mx-auto mb-6" />
              <h2 className="text-5xl font-bold mb-4">Game Over</h2>
              <p className="text-2xl mt-4">{winnerPlayer?.name} won this round!</p>
            </div>
          )}
        </div>
        
        {loserPlayer && (
          <div className="mb-8 p-6 bg-gray-100 rounded-lg">
            <p className="text-gray-700 text-xl">
              <span className="font-bold">{loserPlayer.name}</span> is the Shithead! 💩
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNewGame}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <RotateCcw size={24} />
            Rematch
          </button>
          <button
            onClick={onExitGame}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <X size={24} />
            Exit Game
          </button>
        </div>
      </div>
    </div>
  );
};