import React from 'react';
import { MultiplayerGameState } from '../types/multiplayer';
import { RoomPlayer } from '../types/multiplayer';
import { LogOut, Users } from 'lucide-react';

interface MultiplayerGameProps {
  gameState: MultiplayerGameState;
  roomPlayers: RoomPlayer[];
  playerId: string;
  onLeaveRoom: () => void;
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  gameState,
  roomPlayers,
  playerId,
  onLeaveRoom,
}) => {
  const humanPlayer = gameState.players.find(p => p.id === playerId);

  if (!humanPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Error: Player not found</h1>
          <button
            onClick={onLeaveRoom}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative overflow-hidden">
      {/* Simple debug info for now */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4 text-white z-10">
        <h1 className="text-xl font-bold mb-2">Multiplayer Game</h1>
        <div className="text-sm">
          <div>Your name: {humanPlayer.name}</div>
          <div>Phase: {gameState.gamePhase}</div>
          <div>Players: {gameState.players.length}</div>
          <div>Your hand: {humanPlayer.hand.length} cards</div>
        </div>
      </div>

      {/* Leave button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onLeaveRoom}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
        >
          <LogOut size={16} />
          Leave
        </button>
      </div>



      {/* Center content - just show basic game info for now */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Game Started!</h2>
          <div className="text-lg mb-2">Phase: {gameState.gamePhase}</div>
          <div className="text-lg mb-4">Your hand: {humanPlayer.hand.length} cards</div>
          <div className="text-sm opacity-75">More game features coming next...</div>
        </div>
      </div>
    </div>
  );
};