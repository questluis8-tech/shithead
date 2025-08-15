import React, { useState } from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { Users, Plus, ArrowLeft } from 'lucide-react';

interface MultiplayerLobbyProps {
  onBackToMenu: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onBackToMenu
}) => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  
  const {
    playerName,
    setPlayerName,
    availableRooms,
    createRoom,
    joinRoom
  } = useMultiplayer();

  const handleCreateRoom = async () => {
    if (roomName.trim() && playerName.trim()) {
      await createRoom(roomName.trim(), maxPlayers);
      setRoomName('');
      setShowCreateRoom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
      <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Multiplayer Lobby</h1>
          <button
            onClick={onBackToMenu}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Player Name Input */}
        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2">
            Your Name:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {!showCreateRoom ? (
          <>
            {/* Create Room Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreateRoom(true)}
                disabled={!playerName.trim()}
                className={`w-full px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  playerName.trim()
                    ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus size={20} />
                Create New Room
              </button>
            </div>

            {/* Available Rooms */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users size={20} />
                Available Rooms ({availableRooms.length})
              </h2>
              
              {availableRooms.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No rooms available. Create one to get started!
                </div>
              ) : (
                <div className="space-y-2">
                  {availableRooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-white font-bold">{room.name}</div>
                        <div className="text-gray-400 text-sm">
                          {room.current_players}/{room.max_players} players • {room.status}
                        </div>
                      </div>
                      <button
                        onClick={() => joinRoom(room.id)}
                        disabled={!playerName.trim() || room.current_players >= room.max_players}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${
                          playerName.trim() && room.current_players < room.max_players
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Create Room Form */
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Create New Room</h2>
            
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Room Name:
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Max Players:
              </label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateRoom(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!roomName.trim() || !playerName.trim()}
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  roomName.trim() && playerName.trim()
                    ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Create Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};