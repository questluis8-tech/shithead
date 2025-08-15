import React from 'react';
import { Card } from './Card';
import { MultiplayerGameState } from '../types/multiplayer';
import { RoomPlayer } from '../types/multiplayer';
import { Card as CardType } from '../types/game';
import { getCardDisplay, getSuitSymbol, getEffectiveTopCard } from '../utils/cardUtils';
import { LogOut, Users } from 'lucide-react';

interface MultiplayerGameProps {
  gameState: MultiplayerGameState;
  roomPlayers: RoomPlayer[];
  playerId: string;
  selectedCards: CardType[];
  onCardClick: (card: CardType, source: 'hand' | 'faceUp') => void;
  onPlayCards: () => void;
  onPickupCards: () => void;
  onPlayFaceDownCard: (cardIndex: number) => void;
  onConfirmFaceUpCards: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  canPlaySelected: boolean;
  canPlayAnyCard: boolean;
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  gameState,
  roomPlayers,
  playerId,
  selectedCards,
  onCardClick,
  onPlayCards,
  onPickupCards,
  onPlayFaceDownCard,
  onConfirmFaceUpCards,
  onStartGame,
  onLeaveRoom,
  canPlaySelected,
  canPlayAnyCard
}) => {
  const humanPlayer = gameState.players.find(p => p.id === playerId);
  const otherPlayers = gameState.players.filter(p => p.id !== playerId);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const topCard = gameState.pile.length > 0 ? gameState.pile[gameState.pile.length - 1] : null;

  if (!humanPlayer) {
    return <div>Error: Player not found</div>;
  }

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
          <div>Current: {currentPlayer?.name}</div>
          <div>Pile: {gameState.pile.length} cards</div>
          <div className="flex items-center gap-2 mt-2">
            <Users size={16} />
            <span>{roomPlayers.length} players</span>
          </div>
        </div>
      </div>

      {/* Leave Room Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onLeaveRoom}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
        >
          <LogOut size={16} />
          Leave
        </button>
      </div>

      {/* Other Players positioned around the table */}
      {otherPlayers.map((player, index) => {
        const totalOthers = otherPlayers.length;
        const angle = (index * 360) / totalOthers - 90; // Start from top
        const radius = Math.min(200, 150 + totalOthers * 10);
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        
        const isCurrentPlayer = gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === player.id);
        
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
              {isCurrentPlayer && (
                <div className="text-xs text-yellow-300">Current Turn</div>
              )}
            </div>
            
            {/* Player's cards - stacked vertically */}
            <div className="flex flex-col items-center gap-1">
              {/* Face-down cards */}
              {player.faceDownCards.length > 0 && (
                <div className="flex gap-1">
                  {player.faceDownCards.map((_, cardIndex) => (
                    <Card
                      key={`${player.id}-down-${cardIndex}`}
                      card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                      faceDown={true}
                      playerColor="black"
                      className="w-12 h-16"
                    />
                  ))}
                </div>
              )}
              
              {/* Face-up cards */}
              <div className="flex gap-1">
                {player.faceUpCards.map((card, cardIndex) => (
                  <Card
                    key={`${player.id}-up-${cardIndex}`}
                    card={card}
                    className="w-12 h-16"
                  />
                ))}
              </div>
              
              {/* Hand (face-down for other players) */}
              <div className="flex gap-1">
                {player.hand.slice(0, Math.min(6, player.hand.length)).map((_, cardIndex) => (
                  <Card
                    key={`${player.id}-hand-${cardIndex}`}
                    card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                    faceDown={true}
                    playerColor="green"
                    className="w-10 h-14"
                  />
                ))}
                {player.hand.length > 6 && (
                  <div className="w-10 h-14 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                    +{player.hand.length - 6}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Center Area - Pile, Deck, and Controls */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Pile and Deck */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* Pile */}
          <div className="text-center">
            <h3 className="text-white font-bold mb-2">Pile ({gameState.pile.length})</h3>
            <div className="w-20 h-28">
              {gameState.pile.length === 0 ? (
                <div className="w-full h-full border-2 border-dashed border-white rounded-lg flex items-center justify-center text-white text-xs">
                  Empty
                </div>
              ) : (
                <div className="relative w-20 h-28 overflow-visible">
                  {gameState.pile.slice(-3).map((card, index) => (
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
          </div>

          {/* Deck */}
          <div className="text-center">
            <h3 className="text-white font-bold mb-2">Deck ({gameState.deck.length})</h3>
            <div className="w-20 h-28">
              {gameState.deck.length > 0 ? (
                <Card card={{ suit: 'hearts', rank: 2, id: 'deck-back' }} faceDown={true} className="w-20 h-28" />
              ) : (
                <div className="w-full h-full border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  Empty
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex justify-center">
          <div className="w-64 flex justify-center">
            {/* Setup Phase - Confirm Face-Up Cards */}
            {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
              <button
                onClick={onConfirmFaceUpCards}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
              >
                Confirm Face-Up Cards
              </button>
            )}
            
            {/* Swapping Phase - Start Game (host only) */}
            {gameState.gamePhase === 'swapping' && gameState.host_id === playerId && (
              <button
                onClick={onStartGame}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
              >
                Start Game
              </button>
            )}

            {/* Playing Phase - Play Cards */}
            {gameState.gamePhase === 'playing' && isMyTurn && selectedCards.length > 0 && (
              <button
                onClick={onPlayCards}
                disabled={!canPlaySelected}
                className={`px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                  canPlaySelected
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Play Cards ({selectedCards.length})
              </button>
            )}

            {/* Playing Phase - Pick up Cards */}
            {gameState.gamePhase === 'playing' && 
             isMyTurn && 
             selectedCards.length === 0 && 
             !canPlayAnyCard && 
             gameState.pile.length > 0 && (
              <button
                onClick={onPickupCards}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
              >
                Pick up Cards ({gameState.pile.length})
              </button>
            )}

            {/* Waiting for other players */}
            {gameState.gamePhase === 'playing' && !isMyTurn && (
              <div className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold">
                Waiting for {currentPlayer?.name}...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Human Player - Bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="text-center mb-4">
          <div className={`text-lg font-bold ${isMyTurn ? 'text-yellow-300' : 'text-white'}`}>
            {humanPlayer.name} (You)
          </div>
          {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length < 3 && (
            <div className="text-sm text-white opacity-75">Choose face-up cards</div>
          )}
          {isMyTurn && gameState.gamePhase === 'playing' && gameState.pile.length > 0 && (
            <div className="text-sm text-yellow-300">Your turn!</div>
          )}
          {gameState.gamePhase === 'setup' && (
            <div className="text-sm text-white opacity-75">
              Choose {3 - humanPlayer.faceUpCards.length} more face-up cards
            </div>
          )}
        </div>
        
        {/* Human player cards - stacked vertically */}
        <div className="flex flex-col items-center gap-2">
          {/* Face-down cards */}
          {humanPlayer.faceDownCards.length > 0 && (
            <div className="flex gap-2">
              {humanPlayer.faceDownCards.map((_, index) => (
                <Card
                  key={`human-down-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  playerColor="blue"
                  onClick={
                    humanPlayer.hand.length === 0 && 
                    humanPlayer.faceUpCards.length === 0 && 
                    isMyTurn && 
                    gameState.gamePhase === 'playing'
                      ? () => onPlayFaceDownCard(index)
                      : undefined
                  }
                  className={`w-16 h-24 ${
                    humanPlayer.hand.length === 0 && 
                    humanPlayer.faceUpCards.length === 0 && 
                    isMyTurn && 
                    gameState.gamePhase === 'playing'
                      ? 'cursor-pointer hover:scale-105'
                      : ''
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Face-up cards */}
          <div className="flex gap-2">
            {humanPlayer.faceUpCards.map((card) => (
              <Card
                key={card.id}
                card={card}
                onClick={() => onCardClick(card, 'faceUp')}
                selected={selectedCards.some(c => c.id === card.id)}
                disabled={humanPlayer.hand.length > 0 && gameState.gamePhase === 'playing'}
                className="w-16 h-24"
              />
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
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => onCardClick(card, 'hand')}
                  selected={selectedCards.some(c => c.id === card.id)}
                  className="w-16 h-24"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameState.gamePhase === 'finished' && gameState.winner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4 shadow-2xl">
            <div className="mb-6">
              {gameState.winner === playerId ? (
                <div className="text-green-600">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold">Victory!</h2>
                  <p className="text-lg mt-2">Congratulations! You won!</p>
                </div>
              ) : (
                <div className="text-red-600">
                  <div className="text-6xl mb-4">😞</div>
                  <h2 className="text-3xl font-bold">Game Over</h2>
                  <p className="text-lg mt-2">{gameState.players.find(p => p.id === gameState.winner)?.name} won this round!</p>
                </div>
              )}
            </div>
            
            <button
              onClick={onLeaveRoom}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};