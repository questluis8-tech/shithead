import React from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';

interface MultiplayerLobbyProps {
  onBackToMenu: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onBackToMenu
}) => {
  const { playerName, setPlayerName } = useMultiplayer();
  const [roomName, setRoomName] = React.useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
      <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4">
        <h1 className="text-3xl font-bold text-white mb-6">Multiplayer Lobby</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Enter room name"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => createRoom(roomName, 4)}
            disabled={!playerName.trim() || !roomName.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all flex-1"
          >
            Create New Room
          </button>
        </div>
        
        <button
          onClick={onBackToMenu}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all mt-4"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};