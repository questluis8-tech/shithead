import React from 'react';
import { LogOut } from 'lucide-react';
import { Card } from './Card';
import { getCardDisplay, getSuitSymbol } from '../utils/cardUtils';

interface MultiplayerGameProps {
  gameState: any;
  roomPlayers: any[];
  playerId: string;
  onLeaveRoom: () => void;
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  gameState,
  roomPlayers,
  playerId,
  onLeaveRoom,
}) => {
  const [selectedCards, setSelectedCards] = React.useState<any[]>([]);

  // Safety checks
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Loading Game...</h1>
          <p className="text-white mb-4">Setting up your game...</p>
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

  if (!gameState.players || !Array.isArray(gameState.players)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Game Error</h1>
          <p className="text-white mb-4">Invalid game state - no players found</p>
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

  const humanPlayer = gameState.players.find((p: any) => p.id === playerId);
  
  if (!humanPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Player Not Found</h1>
          <p className="text-white mb-4">You are not in this game</p>
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

  const otherPlayers = gameState.players.filter((p: any) => p.id !== playerId);
  const currentPlayerName = gameState.players[gameState.currentPlayerIndex]?.name || 'Unknown';
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;

  const handleCardClick = (card: any, source: 'hand' | 'faceUp') => {
    if (gameState.gamePhase === 'setup' && gameState.currentPlayerIndex === gameState.players.findIndex((p: any) => p.id === playerId)) {
      // Handle choosing face-up cards from hand
      if (source === 'hand') {
        if (humanPlayer.faceUpCards.length >= 3) {
          return;
        }
        console.log('Would move card from hand to face-up:', card);
      } else if (source === 'faceUp') {
        console.log('Would move card from face-up to hand:', card);
      }
    } else if (gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === gameState.players.findIndex((p: any) => p.id === playerId)) {
      // Handle card selection for playing
      if (source === 'faceUp' && humanPlayer.hand.length > 0) {
        return;
      }

      setSelectedCards(prev => {
        const isSelected = prev.some(c => c.id === card.id);
        if (isSelected) {
          return prev.filter(c => c.id !== card.id);
        } else {
          // Only allow selecting cards of the same rank
          if (prev.length === 0 || prev[0].rank === card.rank) {
            return [...prev, card];
          }
          return [card]; // Start new selection
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
          <div>Phase: {gameState.gamePhase || 'unknown'}</div>
          <div>Current: {currentPlayerName} {isMyTurn ? '(You)' : ''}</div>
          <div>Pile: {gameState.pile?.length || 0} cards</div>
          <div>Players: {gameState.players.length}</div>
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

      {/* Other Players - positioned around the table */}
      {otherPlayers.map((player: any, index: number) => {
        const totalOthers = otherPlayers.length;
        const angle = (index * 360) / totalOthers - 90; // Start from top
        const radius = 180;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        
        const isCurrentPlayer = gameState.currentPlayerIndex === gameState.players.findIndex((p: any) => p.id === player.id);
        
        return (
          <div
            key={player.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(35% + ${y}px)`
            }}
          >
            <div className="text-center mb-2">
              <div className={`text-sm font-bold ${isCurrentPlayer ? 'text-yellow-300' : 'text-white'}`}>
                {player.name}
              </div>
              <div className="text-xs text-white opacity-75">
                {player.hand?.length || 0} cards
              </div>
            </div>
            
            {/* Face-down cards */}
            <div className="flex gap-1 justify-center mb-1">
              {(player.faceDownCards || []).map((_: any, cardIndex: number) => (
                <Card
                  key={`${player.id}-down-${cardIndex}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-12 h-16"
                />
              ))}
            </div>
            
            {/* Face-up cards */}
            <div className="flex gap-1 justify-center mb-1">
              {(player.faceUpCards || []).map((card: any, cardIndex: number) => (
                <Card
                  key={`${player.id}-up-${cardIndex}`}
                  card={card}
                  className="w-12 h-16"
                />
              ))}
            </div>
            
            {/* Hand (face-down for others) */}
            <div className="flex gap-1 justify-center">
              {(player.hand || []).slice(0, Math.min(5, player.hand?.length || 0)).map((_: any, cardIndex: number) => (
                <Card
                  key={`${player.id}-hand-${cardIndex}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-10 h-14"
                />
              ))}
              {(player.hand?.length || 0) > 5 && (
                <div className="w-10 h-14 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                  +{(player.hand?.length || 0) - 5}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Center Area - Pile */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="text-center mb-4">
          <h3 className="text-white font-bold mb-2">Pile ({gameState.pile?.length || 0})</h3>
          {gameState.pile && gameState.pile.length > 0 && (
            <div className="text-sm text-white opacity-75">
              Last: {getCardDisplay(gameState.pile[gameState.pile.length - 1].rank)}{getSuitSymbol(gameState.pile[gameState.pile.length - 1].suit)}
            </div>
          )}
        </div>
        
        <div className="w-20 h-28">
          {!gameState.pile || gameState.pile.length === 0 ? (
            <div className="w-full h-full border-2 border-dashed border-white rounded-lg flex items-center justify-center text-white text-xs">
              Empty
            </div>
          ) : (
            <div className="relative w-20 h-28 overflow-visible">
              {/* Show last 3 cards with specific positioning */}
              {gameState.pile.slice(-3).map((card: any, index: number) => (
                <div
                  key={card.id}
                  className="absolute top-0"
                  style={{
                    left: `${index * 12}px`,
                    top: `${index * 3}px`,
                    zIndex: index,
                    transform: `rotate(${index * 5 - 5}deg)`
                  }}
                >
                  <Card
                    card={card}
                    className="w-20 h-28"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="flex justify-center mt-4">
          {gameState.gamePhase === 'setup' && (humanPlayer.faceUpCards?.length || 0) === 3 && isMyTurn && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
            >
              Confirm Face-Up Cards
            </button>
          )}
          
          {gameState.gamePhase === 'playing' && isMyTurn && selectedCards.length > 0 && (
            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
            >
              Play Cards ({selectedCards.length})
            </button>
          )}
        </div>
      </div>

      {/* Human Player - Bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="text-center mb-4">
          <div className={`text-lg font-bold ${isMyTurn ? 'text-yellow-300' : 'text-white'}`}>
            You ({humanPlayer.name})
          </div>
          {gameState.gamePhase === 'setup' && (humanPlayer.faceUpCards?.length || 0) < 3 && (
            <div className="text-sm text-white opacity-75">Choose face-up cards</div>
          )}
          {isMyTurn && gameState.gamePhase === 'playing' && (
            <div className="text-sm text-yellow-300">Your turn!</div>
          )}
        </div>
        
        {/* Face-down cards */}
        {(humanPlayer.faceDownCards?.length || 0) > 0 && (
          <div className="flex gap-2 justify-center mb-2">
            {(humanPlayer.faceDownCards || []).map((_: any, index: number) => (
              <Card
                key={`human-down-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="blue"
                className="w-16 h-24"
              />
            ))}
          </div>
        )}
        
        {/* Face-up cards */}
        <div className="flex gap-2 justify-center mb-2">
          {(humanPlayer.faceUpCards || []).map((card: any) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card, 'faceUp')}
              selected={selectedCards.some(c => c.id === card.id)}
              disabled={(humanPlayer.hand?.length || 0) > 0 && gameState.gamePhase === 'playing'}
              className="w-16 h-24"
            />
          ))}
          {/* Empty slots during setup */}
          {gameState.gamePhase === 'setup' && Array.from({ length: 3 - (humanPlayer.faceUpCards?.length || 0) }).map((_, index) => (
            <div key={`empty-${index}`} className="w-16 h-24 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs">
              Empty
            </div>
          ))}
        </div>

        {/* Hand */}
        {(humanPlayer.hand?.length || 0) > 0 && (
          <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
            {(humanPlayer.hand || []).map((card: any) => (
              <Card
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card, 'hand')}
                selected={selectedCards.some(c => c.id === card.id)}
                className="w-16 h-24"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};