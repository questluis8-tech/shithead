import React, { useState } from 'react';
import { Users, Plus, RefreshCw, Play, Crown, LogOut } from 'lucide-react';
import { GameRoom, RoomPlayer } from '../types/multiplayer';

interface MultiplayerLobbyProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  availableRooms: GameRoom[];
  currentRoom: GameRoom | null;
  roomPlayers: RoomPlayer[];
  isConnected: boolean;
  onCreateRoom: (name: string, maxPlayers: number) => Promise<void>;
  onJoinRoom: (roomId: string) => Promise<void>;
  onLeaveRoom: () => Promise<void>;
  onRefreshRooms: () => Promise<void>;
  onStartGame: () => void;
  playerId: string;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  playerName,
  setPlayerName,
  availableRooms,
  currentRoom,
  roomPlayers,
  isConnected,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onRefreshRooms,
  onStartGame,
  playerId
}) => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    setIsLoading(true);
    try {
      await onCreateRoom(newRoomName, maxPlayers);
      setNewRoomName('');
      setShowCreateRoom(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    setIsLoading(true);
    try {
      await onJoinRoom(roomId);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const isHost = roomPlayers.find(p => p.player_id === playerId)?.is_host || false;
  const canStartGame = isHost && roomPlayers.length >= 2;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-12 text-center max-w-2xl mx-4">
          <h1 className="text-4xl font-bold text-white mb-8">Multiplayer Shithead</h1>
          
          {/* Player name input */}
          <div className="mb-8">
            <label className="block text-white text-lg mb-4">Enter your name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-lg text-center bg-white border-2 border-gray-300 focus:border-green-500 focus:outline-none"
              placeholder="Your name"
              maxLength={20}
            />
          </div>

          {/* Available rooms */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Available Rooms</h2>
              <button
                onClick={onRefreshRooms}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
                disabled={isLoading}
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableRooms.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  No rooms available. Create one to get started!
                </div>
              ) : (
                availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-gray-800 bg-opacity-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="text-left">
                      <div className="text-white font-bold">{room.name}</div>
                      <div className="text-gray-300 text-sm flex items-center gap-2">
                        <Users size={16} />
                        {room.current_players}/{room.max_players} players
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={!playerName.trim() || isLoading || room.current_players >= room.max_players}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold transition-all"
                    >
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Create room section */}
          {!showCreateRoom ? (
            <button
              onClick={() => setShowCreateRoom(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <Plus size={24} />
              Create New Room
            </button>
          ) : (
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Create New Room</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm mb-2">Room Name:</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border-2 border-gray-300 focus:border-green-500 focus:outline-none"
                    placeholder="Enter room name"
                    maxLength={30}
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm mb-2">Max Players:</label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border-2 border-gray-300 focus:border-green-500 focus:outline-none"
                  >
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                    <option value={5}>5 Players</option>
                    <option value={6}>6 Players</option>
                  </select>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateRoom}
                    disabled={!playerName.trim() || !newRoomName.trim() || isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold transition-all"
                  >
                    {isLoading ? 'Creating...' : 'Create Room'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateRoom(false);
                      setNewRoomName('');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Room lobby view
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
      <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-12 text-center max-w-2xl mx-4 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">{currentRoom?.name}</h1>
          <button
            onClick={onLeaveRoom}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
          >
            <LogOut size={16} />
            Leave
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Users size={24} />
            Players ({roomPlayers.length}/{currentRoom?.max_players})
          </h2>
          
          <div className="space-y-3">
            {roomPlayers.map((player) => (
              <div
                key={player.id}
                className={`bg-gray-800 bg-opacity-50 rounded-lg p-4 flex items-center justify-between ${
                  player.player_id === playerId ? 'ring-2 ring-green-400' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {player.is_host && <Crown size={20} className="text-yellow-400" />}
                  <span className="text-white font-bold">{player.player_name}</span>
                  {player.player_id === playerId && (
                    <span className="text-green-400 text-sm">(You)</span>
                  )}
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  player.is_connected ? 'bg-green-400' : 'bg-red-400'
                }`} />
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: (currentRoom?.max_players || 0) - roomPlayers.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-gray-800 bg-opacity-30 rounded-lg p-4 border-2 border-dashed border-gray-600"
              >
                <span className="text-gray-400">Waiting for player...</span>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <div className="mb-6">
            <p className="text-yellow-300 text-sm mb-4">
              You are the host. You can start the game when ready.
            </p>
            <button
              onClick={onStartGame}
              disabled={!canStartGame}
              className={`px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto ${
                canStartGame
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Play size={24} />
              Start Game
            </button>
          </div>
        )}

        {!isHost && (
          <div className="text-gray-300">
            Waiting for host to start the game...
          </div>
        )}

        <div className="mt-8 text-sm text-gray-400">
          <p>Room ID: {currentRoom?.id}</p>
          <p>Share this ID with friends to let them join!</p>
        </div>
      </div>
    </div>
  );
};