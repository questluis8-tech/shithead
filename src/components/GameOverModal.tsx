import React from 'react';
import { Trophy, Frown } from 'lucide-react';

interface GameOverModalProps {
  winner: string | null;
  loser: string | null;
  players: any[];
  onNewGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  loser,
  players,
  onNewGame
}) => {
  if (!winner) return null;

  const winnerPlayer = players.find(p => p.id === winner);
  const loserPlayer = players.find(p => p.id === loser);
  const isPlayerWinner = winner === 'human';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4 shadow-2xl">
        <div className="mb-6">
          {isPlayerWinner ? (
            <div className="text-green-600">
              <Trophy size={64} className="mx-auto mb-4" />
              <h2 className="text-3xl font-bold">Victory!</h2>
              <p className="text-lg mt-2">Congratulations! You won!</p>
            </div>
          ) : (
            <div className="text-red-600">
              <Frown size={64} className="mx-auto mb-4" />
              <h2 className="text-3xl font-bold">Game Over</h2>
              <p className="text-lg mt-2">{winnerPlayer?.name} won this round!</p>
            </div>
          )}
        </div>
        
        {loserPlayer && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-700">
              <span className="font-bold">{loserPlayer.name}</span> is the Shithead! 💩
            </p>
          </div>
        )}
        
        <button
          onClick={onNewGame}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};