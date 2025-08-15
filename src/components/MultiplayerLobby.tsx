import React from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { Users, Crown, LogOut } from 'lucide-react';

interface MultiplayerLobbyProps {
  onBackToMenu: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onBackToMenu
}) => {
  const { playerName, setPlayerName, createRoom, currentRoom, isConnected } = useMultiplayer();
  const [roomName, setRoomName] = React.useState('');

  const handleCreateRoom = () => {
    console.log('Create room clicked with:', { playerName, roomName });
    createRoom(roomName, 4);
  };

  console.log('Render state:', { isConnected, currentRoom, playerName, roomName });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
      <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4">
        {isConnected && currentRoom ? (
          // Room interface
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">Room: {currentRoom.name}</h1>
              <button
                onClick={onBackToMenu}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
              >
                <LogOut size={16} />
                Leave Room
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-blue-400" size={20} />
                <span className="text-white font-bold">Players ({currentRoom.current_players}/{currentRoom.max_players})</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-gray-700 rounded p-3">
                  <Crown className="text-yellow-400" size={16} />
                  <span className="text-white font-bold">{playerName}</span>
                  <span className="text-yellow-400 text-sm">(Host)</span>
                </div>
                
                {Array.from({ length: currentRoom.max_players - 1 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-700 rounded p-3 opacity-50">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-400">Waiting for player...</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-white mb-4">Waiting for players to join...</p>
              <p className="text-gray-400 text-sm">Share the room name "{currentRoom.name}" with your friends!</p>
            </div>
          </>
        ) : (
          // Lobby creation interface
          <>
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
                onClick={handleCreateRoom}
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
          </>
        )}
      </div>
    </div>
  );
};