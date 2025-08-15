import React from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { SimpleMultiplayerGame } from './SimpleMultiplayerGame';

interface MultiplayerLobbyProps {
  onBackToMenu: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onBackToMenu
}) => {
  const { 
    playerName, 
    setPlayerName, 
    createRoom, 
    joinRoom,
    fetchAvailableRooms,
    availableRooms,
    currentRoom, 
    isConnected, 
    roomPlayers,
    startGame,
    playerId,
    leaveRoom
  } = useMultiplayer();
  
  const [roomName, setRoomName] = React.useState('');

  const handleCreateRoom = () => {
    console.log('Create room clicked with:', { playerName, roomName });
    createRoom(roomName, 4);
  };

  // Fetch available rooms when component mounts
  React.useEffect(() => {
    fetchAvailableRooms();
  }, [fetchAvailableRooms]);

  // Check if current player is the host
  const isHost = currentRoom && roomPlayers.some(player => 
    player.player_id === playerId && player.is_host
  );

  // Show simple game when status is playing
  if (currentRoom && currentRoom.status === 'playing') {
    return (
      <SimpleMultiplayerGame 
        currentRoom={currentRoom}
        roomPlayers={roomPlayers}
        playerId={playerId}
        onLeaveRoom={() => {
          leaveRoom();
          onBackToMenu();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
      <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4">
        <h1 className="text-3xl font-bold text-white mb-6">Multiplayer Lobby</h1>
        
        {!currentRoom ? (
          <>
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
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleCreateRoom}
                disabled={!playerName.trim() || !roomName.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all flex-1"
              >
                Create New Room
              </button>
              <button
                onClick={fetchAvailableRooms}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Refresh
              </button>
            </div>

            {/* Available Rooms */}
            {availableRooms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white text-lg font-bold mb-3">Available Rooms</h3>
                <div className="space-y-2">
                  {availableRooms.map((room) => (
                    <div key={room.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold">{room.name}</div>
                        <div className="text-gray-400 text-sm">
                          {room.current_players}/{room.max_players} players
                        </div>
                      </div>
                      <button
                        onClick={() => joinRoom(room.id)}
                        disabled={!playerName.trim() || room.current_players >= room.max_players}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold transition-all"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 bg-green-800 rounded-lg">
            <h2 className="text-white text-xl font-bold mb-4">Room: {currentRoom.name}</h2>
            
            <div className="mb-4">
              <h3 className="text-white text-lg font-bold mb-2">Players ({roomPlayers.length}/{currentRoom.max_players})</h3>
              <div className="space-y-2">
                {roomPlayers.map((player) => (
                  <div key={player.id} className="bg-gray-700 p-2 rounded flex justify-between items-center">
                    <span className="text-white">
                      {player.player_name} {player.is_host && '(Host)'}
                    </span>
                    <span className={`text-sm ${player.is_connected ? 'text-green-400' : 'text-red-400'}`}>
                      {player.is_connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Start Game Button (Host Only) */}
            {isHost && roomPlayers.length >= 2 && (
              <div className="mt-4">
                <button
                  onClick={startGame}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold transition-all w-full"
                >
                  Start Game ({roomPlayers.length} players)
                </button>
              </div>
            )}
            
            {/* Waiting for more players message */}
            {isHost && roomPlayers.length < 2 && (
              <div className="mt-4 p-3 bg-yellow-800 bg-opacity-50 rounded-lg">
                <p className="text-yellow-200 text-sm text-center">
                  Waiting for more players to join (minimum 2 players needed)
                </p>
              </div>
            )}
            
            <button
              onClick={() => {
                leaveRoom();
                onBackToMenu();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all mt-4 w-full"
            >
              Leave Room
            </button>
          </div>
        )}
        
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