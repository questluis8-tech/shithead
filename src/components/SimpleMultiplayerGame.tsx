import React from 'react';
import { LogOut } from 'lucide-react';

interface SimpleMultiplayerGameProps {
  currentRoom: any;
  roomPlayers: any[];
  playerId: string;
  onLeaveRoom: () => void;
}

export const SimpleMultiplayerGame: React.FC<SimpleMultiplayerGameProps> = ({
  currentRoom,
  roomPlayers,
  playerId,
  onLeaveRoom,
}) => {
  console.log('SimpleMultiplayerGame props:', { currentRoom, roomPlayers, playerId });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
      <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Multiplayer Shithead</h1>
          <button
            onClick={onLeaveRoom}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
          >
            <LogOut size={16} />
            Leave
          </button>
        </div>

        {/* Game Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-white text-xl font-bold mb-2">Room: {currentRoom?.name}</h2>
          <div className="text-white">
            <p>Status: {currentRoom?.status}</p>
            <p>Players: {roomPlayers.length}</p>
            <p>Your ID: {playerId}</p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-white text-lg font-bold mb-2">Players:</h3>
          <div className="space-y-2">
            {roomPlayers.map((player) => (
              <div key={player.id} className="bg-gray-700 p-2 rounded flex justify-between items-center">
                <span className="text-white">
                  {player.player_name} {player.is_host && '(Host)'} {player.player_id === playerId && '(You)'}
                </span>
                <span className={`text-sm ${player.is_connected ? 'text-green-400' : 'text-red-400'}`}>
                  {player.is_connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Game State Debug */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-white text-lg font-bold mb-2">Game State:</h3>
          <div className="text-white text-sm">
            {currentRoom?.game_state ? (
              <div>
                <p>Game Phase: {currentRoom.game_state.gamePhase}</p>
                <p>Current Player: {currentRoom.game_state.currentPlayerIndex}</p>
                <p>Players in Game: {currentRoom.game_state.players?.length || 0}</p>
                <p>Pile Cards: {currentRoom.game_state.pile?.length || 0}</p>
                <p>Deck Cards: {currentRoom.game_state.deck?.length || 0}</p>
              </div>
            ) : (
              <p>No game state loaded</p>
            )}
          </div>
        </div>

        {/* Simple Game Area */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white text-lg font-bold mb-4">Game Area</h3>
          
          {currentRoom?.game_state ? (
            <div className="text-center">
              <div className="text-white mb-4">
                <p>Phase: {currentRoom.game_state.gamePhase}</p>
                <p>Turn: Player {currentRoom.game_state.currentPlayerIndex}</p>
              </div>
              
              {/* Simple pile display */}
              <div className="bg-green-700 rounded-lg p-4 mb-4">
                <h4 className="text-white font-bold mb-2">Pile ({currentRoom.game_state.pile?.length || 0} cards)</h4>
                {currentRoom.game_state.pile?.length > 0 ? (
                  <div className="text-white">
                    Last card: {JSON.stringify(currentRoom.game_state.pile[currentRoom.game_state.pile.length - 1])}
                  </div>
                ) : (
                  <div className="text-gray-400">Empty pile</div>
                )}
              </div>

              {/* Your cards */}
              <div className="bg-blue-700 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">Your Cards</h4>
                {currentRoom.game_state.players?.find((p: any) => p.id === playerId) ? (
                  <div className="text-white text-sm">
                    <p>Hand: {currentRoom.game_state.players.find((p: any) => p.id === playerId).hand?.length || 0} cards</p>
                    <p>Face Up: {currentRoom.game_state.players.find((p: any) => p.id === playerId).faceUpCards?.length || 0} cards</p>
                    <p>Face Down: {currentRoom.game_state.players.find((p: any) => p.id === playerId).faceDownCards?.length || 0} cards</p>
                  </div>
                ) : (
                  <div className="text-gray-400">Player not found in game</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p>Waiting for game to initialize...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};