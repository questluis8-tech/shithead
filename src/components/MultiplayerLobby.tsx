import React from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { Card } from './Card';
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
    gameState,
    startGame,
    playerId,
    leaveRoom
  } = useMultiplayer();
  const [roomName, setRoomName] = React.useState('');

  const handleCreateRoom = () => {
    console.log('Create room clicked with:', { playerName, roomName });
    createRoom(roomName, 4);
  };

  // Add logging to see state changes
  React.useEffect(() => {
    console.log('Room state changed:', { currentRoom, isConnected });
  }, [currentRoom, isConnected]);

  // Fetch available rooms when component mounts
  React.useEffect(() => {
    fetchAvailableRooms();
  }, [fetchAvailableRooms]);

  // Check if current player is the host
  const isHost = currentRoom && roomPlayers.some(player => 
    player.player_id === playerId && player.is_host
  );

  // Show game starting state
  if (currentRoom?.status === 'playing') {
    // Check if game state is loaded
    if (currentRoom.game_state && currentRoom.game_state.players && currentRoom.game_state.players.length > 0) {
      // Find the human player from the game state
      const humanPlayer = currentRoom.game_state.players.find(p => p.id === playerId);
      
      if (!humanPlayer) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
            <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
              <h1 className="text-3xl font-bold text-white mb-6">Error</h1>
              <div className="text-white">Player not found in game state</div>
            </div>
          </div>
        );
      }
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
          <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
            <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
              <h1 className="text-3xl font-bold text-white mb-6">Multiplayer Game</h1>
              <div className="text-white mb-4">
                <div>Your name: {currentRoom.game_state.players.find(p => p.id === playerId)?.name}</div>
                <div>Phase: {currentRoom.game_state.gamePhase}</div>
                <div>Players: {currentRoom.game_state.players.length}</div>
                <div>Your hand: {currentRoom.game_state.players.find(p => p.id === playerId)?.hand?.length || 0} cards</div>
              
              {/* Center Area - Pile and Deck */}
              <div className="mt-8 flex items-center justify-center gap-8">
                {/* Pile */}
                <div className="text-center">
                  <h3 className="text-white font-bold mb-2">Pile ({currentRoom.game_state.pile.length})</h3>
                  <div className="w-20 h-28">
                    {currentRoom.game_state.pile.length === 0 ? (
                      <div className="w-full h-full border-2 border-dashed border-white rounded-lg flex items-center justify-center text-white text-xs">
                        Empty
                      </div>
                    ) : (
                      <Card
                        card={currentRoom.game_state.pile[currentRoom.game_state.pile.length - 1]}
                        className="w-20 h-28"
                      />
                    )}
                  </div>
                </div>

                {/* Deck */}
                <div className="text-center">
                  <h3 className="text-white font-bold mb-2">Deck ({currentRoom.game_state.deck.length})</h3>
                  <div className="w-20 h-28">
                    {currentRoom.game_state.deck.length > 0 ? (
                      <Card card={{ suit: 'hearts', rank: 2, id: 'deck-back' }} faceDown={true} className="w-20 h-28" />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>

              {/* Human Player - Bottom */}
              <div className="mt-8">
                <div className="text-center mb-4">
                  <div className="text-lg font-bold text-yellow-300">
                    {humanPlayer.name} (You)
                  </div>
                </div>
                
                {/* Face-down cards */}
                {humanPlayer.faceDownCards.length > 0 && (
                  <div className="flex gap-2 justify-center mb-2">
                    {humanPlayer.faceDownCards.map((_, index) => (
                      <Card
                        key={`human-down-${index}`}
                        card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                        faceDown={true}
                        playerColor="blue"
                        className="w-14 h-20"
                      />
                    ))}
                  </div>
                )}
                
                {/* Face-up cards */}
                <div className="flex gap-2 justify-center mb-2">
                  {humanPlayer.faceUpCards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      className="w-14 h-20"
                    />
                  ))}
                  {/* Empty slots during setup */}
                  {gameState.gamePhase === 'setup' && Array.from({ length: 3 - humanPlayer.faceUpCards.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="w-14 h-20 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      Empty
                    </div>
                  ))}
                </div>

                {/* Hand */}
                {humanPlayer.hand.length > 0 && (
                  <div className="flex gap-2 justify-center flex-wrap max-w-2xl mx-auto">
                    {humanPlayer.hand.map((card) => (
                      <Card
                        key={card.id}
                        card={card}
                        className="w-14 h-20"
                      />
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  leaveRoom();
                  onBackToMenu();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Leave Game
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
          <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
            <h1 className="text-3xl font-bold text-white mb-6">Loading Game...</h1>
            <div className="text-white">Game is starting, please wait...</div>
          </div>
        </div>
      );
    }
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
            <p className="text-white">Room "{currentRoom.name}" created successfully!</p>
            <p className="text-white text-sm">Room ID: {currentRoom.id}</p>
            
            <div className="mt-3">
              <p className="text-white font-bold mb-2">Players ({roomPlayers.length}/{currentRoom.max_players}):</p>
              <div className="space-y-1">
                {roomPlayers.map((player) => (
                  <div key={player.player_id} className="text-white text-sm">
                    {player.player_name} {player.is_host && '(Host)'}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Start Game button for host */}
            {isHost && roomPlayers.length >= 2 && (
              <div className="mt-4">
                <button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all w-full"
                >
                  Start Game
                </button>
              </div>
            )}
            
            {/* Leave Room button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  leaveRoom();
                  onBackToMenu();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all w-full"
              >
                Leave Room
              </button>
            </div>
            
            {/* Waiting for more players message */}
            {isHost && roomPlayers.length < 2 && (
              <div className="mt-4 p-3 bg-yellow-800 bg-opacity-50 rounded-lg">
                <p className="text-yellow-200 text-sm text-center">
                  Waiting for more players to join (minimum 2 players needed)
                </p>
              </div>
            )}
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