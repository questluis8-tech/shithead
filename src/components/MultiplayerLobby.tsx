import React from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
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
    const gameState = currentRoom.game_state;
    const humanPlayer = gameState?.players.find(p => p.id === playerId);
    const [selectedCards, setSelectedCards] = React.useState([]);

    if (!humanPlayer || !gameState) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
          <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
            <h1 className="text-3xl font-bold text-white mb-6">Loading Game...</h1>
            <button
              onClick={() => {
                leaveRoom();
                onBackToMenu();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              Back to Menu
            </button>
          </div>
        </div>
      );
    }

    const handleCardClick = (card, source) => {
      if (gameState.gamePhase === 'setup' && gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === playerId)) {
        // Handle choosing face-up cards from hand
        if (source === 'hand') {
          if (humanPlayer.faceUpCards.length >= 3) return;
          
          // This would need to update the game state in the database
          console.log('Would move card from hand to face-up:', card);
        } else if (source === 'faceUp') {
          // Move card back from face-up to hand
          console.log('Would move card from face-up to hand:', card);
        }
      } else if (gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === playerId)) {
        // Handle card selection for playing
        if (source === 'faceUp' && humanPlayer.hand.length > 0) return;
        
        setSelectedCards(prev => {
          const isSelected = prev.some(c => c.id === card.id);
          if (isSelected) {
            return prev.filter(c => c.id !== card.id);
          } else {
            if (prev.length === 0 || prev[0].rank === card.rank) {
              return [...prev, card];
            }
            return [card];
          }
        });
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative overflow-hidden">
        {/* Game Info Panel - Top Left */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs z-10">
          <h1 className="text-xl font-bold mb-2">Multiplayer Shithead</h1>
          <div className="text-sm space-y-1">
            <div>Phase: {
              gameState.gamePhase === 'setup' ? 'Choose Face-Up Cards' : 
              gameState.gamePhase === 'swapping' ? 'Swap Cards (Optional)' : 
              gameState.gamePhase === 'playing' ? 'Playing' :
              'Game Over'
            }</div>
            <div>Current: {gameState.players[gameState.currentPlayerIndex]?.name}</div>
            <div>Pile: {gameState.pile.length} cards</div>
            <div>Your hand: {humanPlayer.hand.length} cards</div>
          </div>
        </div>

        {/* Leave button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => {
              leaveRoom();
              onBackToMenu();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
          >
            Leave Game
          </button>
        </div>

        {/* Other Players - positioned around the table */}
        {gameState.players.filter(p => p.id !== playerId).map((player, index) => {
          const totalOthers = gameState.players.length - 1;
          const angle = (index * 360) / totalOthers - 90;
          const radius = 200;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const playerIndex = gameState.players.findIndex(p => p.id === player.id);
          
          return (
            <div
              key={player.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(35% + ${y}px)`
              }}
            >
              <div className={`text-center mb-2 ${gameState.currentPlayerIndex === playerIndex ? 'text-yellow-300' : 'text-white'}`}>
                <div className="text-sm font-bold">{player.name}</div>
                <div className="text-xs opacity-75">
                  {player.hand.length} cards
                </div>
              </div>
              
              {/* Face-down cards */}
              <div className="flex gap-1 justify-center mb-1">
                {player.faceDownCards.map((_, cardIndex) => (
                  <div key={`${player.id}-down-${cardIndex}`} className="w-12 h-16 bg-gray-800 rounded border border-gray-600" />
                ))}
              </div>
              
              {/* Face-up cards */}
              <div className="flex gap-1 justify-center mb-1">
                {player.faceUpCards.map((card, cardIndex) => (
                  <div key={`${player.id}-up-${cardIndex}`} className="w-12 h-16 bg-white rounded border border-gray-600 flex items-center justify-center text-xs">
                    {card.rank === 11 ? 'J' : card.rank === 12 ? 'Q' : card.rank === 13 ? 'K' : card.rank === 14 ? 'A' : card.rank}
                  </div>
                ))}
              </div>
              
              {/* Hand (face-down for others) */}
              <div className="flex gap-1 justify-center">
                {player.hand.slice(0, Math.min(5, player.hand.length)).map((_, cardIndex) => (
                  <div key={`${player.id}-hand-${cardIndex}`} className="w-10 h-14 bg-gray-800 rounded border border-gray-600" />
                ))}
                {player.hand.length > 5 && (
                  <div className="w-10 h-14 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                    +{player.hand.length - 5}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Center Area - Pile and Controls */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Pile */}
          <div className="text-center mb-4">
            <h3 className="text-white font-bold mb-2">Pile ({gameState.pile.length})</h3>
            <div className="w-20 h-28 mx-auto">
              {gameState.pile.length === 0 ? (
                <div className="w-full h-full border-2 border-dashed border-white rounded-lg flex items-center justify-center text-white text-xs">
                  Empty
                </div>
              ) : (
                <div className="relative w-20 h-28">
                  {gameState.pile.slice(-3).map((card, index) => (
                    <div
                      key={card.id}
                      className="absolute bg-white rounded border border-gray-600 w-20 h-28 flex items-center justify-center"
                      style={{
                        left: `${index * 3}px`,
                        top: `${index * 2}px`,
                        zIndex: index,
                        transform: `rotate(${index * 2 - 2}deg)`
                      }}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {card.rank === 11 ? 'J' : card.rank === 12 ? 'Q' : card.rank === 13 ? 'K' : card.rank === 14 ? 'A' : card.rank}
                        </div>
                        <div className="text-xl">
                          {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex justify-center">
            {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Confirm Face-Up Cards
              </button>
            )}
            
            {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === playerId) && selectedCards.length > 0 && (
              <button
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Play Cards ({selectedCards.length})
              </button>
            )}
          </div>
        </div>

        {/* Human Player - Bottom */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className={`text-center mb-4 ${gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === playerId) ? 'text-yellow-300' : 'text-white'}`}>
            <div className="text-lg font-bold">You ({humanPlayer.name})</div>
            {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length < 3 && (
              <div className="text-sm opacity-75">Choose face-up cards</div>
            )}
          </div>
          
          {/* Face-down cards */}
          {humanPlayer.faceDownCards.length > 0 && (
            <div className="flex gap-2 justify-center mb-2">
              {humanPlayer.faceDownCards.map((_, index) => (
                <div key={`human-down-${index}`} className="w-16 h-24 bg-gray-800 rounded border border-gray-600" />
              ))}
            </div>
          )}
          
          {/* Face-up cards */}
          <div className="flex gap-2 justify-center mb-2">
            {humanPlayer.faceUpCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card, 'faceUp')}
                className={`w-16 h-24 bg-white rounded border border-gray-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-all ${
                  selectedCards.some(c => c.id === card.id) ? 'ring-4 ring-yellow-400 ring-opacity-75 scale-105 -translate-y-2' : ''
                } ${humanPlayer.hand.length > 0 && gameState.gamePhase === 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-center">
                  <div className="text-sm font-bold">
                    {card.rank === 11 ? 'J' : card.rank === 12 ? 'Q' : card.rank === 13 ? 'K' : card.rank === 14 ? 'A' : card.rank}
                  </div>
                  <div className="text-lg">
                    {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                  </div>
                </div>
              </div>
            ))}
            {/* Empty slots during setup */}
            {gameState.gamePhase === 'setup' && Array.from({ length: 3 - humanPlayer.faceUpCards.length }).map((_, index) => (
              <div key={`empty-${index}`} className="w-16 h-24 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                Empty
              </div>
            ))}
          </div>

          {/* Hand */}
          {humanPlayer.hand.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
              {humanPlayer.hand.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card, 'hand')}
                  className={`w-16 h-24 bg-white rounded border border-gray-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-all ${
                    selectedCards.some(c => c.id === card.id) ? 'ring-4 ring-yellow-400 ring-opacity-75 scale-105 -translate-y-2' : ''
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-bold">
                      {card.rank === 11 ? 'J' : card.rank === 12 ? 'Q' : card.rank === 13 ? 'K' : card.rank === 14 ? 'A' : card.rank}
                    </div>
                    <div className="text-lg">
                      {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
            <p className="text-white">Room "{currentRoom.name}" created successfully!</p>
            <p className="text-white text-sm">Room ID: {currentRoom.id}</p>
            
            <div className="mt-3">
              <p className="text-white font-bold mb-2">Players ({roomPlayers.length}/{currentRoom.max_players}):</p>
              <div className="space-y-1">
                {roomPlayers.map((player) => (
                  <div key={player.id} className="text-white text-sm flex items-center gap-2">
                    <span>{player.player_name}</span>
                    {player.is_host && <span className="text-yellow-300">(Host)</span>}
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