import React from 'react';
import { useGame } from './hooks/useGame';
import { Card } from './components/Card';
import { getCardDisplay, getSuitSymbol, getEffectiveTopCard } from './utils/cardUtils';

function App() {
  const {
    gameState,
    selectedCards,
    dealCards,
    confirmFaceUpCards,
    startGame,
    handleCardClick,
    playCards,
    canPlaySelected,
    pickupCards,
    canPlayAnyCard,
    playFaceDownCard
  } = useGame();

  const humanPlayer = gameState.players[0];
  const topCard = gameState.pile.length > 0 ? gameState.pile[gameState.pile.length - 1] : null;
  const effectiveTopCard = getEffectiveTopCard(gameState.pile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative overflow-hidden">
      {/* Debug gridlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        {/* Vertical lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`v-${i}`} style={{ left: `${(i + 1) * 5}%` }}>
            <div className="absolute top-0 bottom-0 w-px bg-white" />
            <div 
              className="absolute top-2 text-xs text-yellow-300 font-mono bg-black bg-opacity-50 px-1 rounded"
              style={{ transform: 'translateX(-50%)' }}
            >
              {(i + 1) * 5}%
            </div>
          </div>
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-white"
            style={{ top: `${(i + 1) * 5}%` }}
          />
        ))}
        {/* Center crosshairs */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-yellow-400 opacity-50" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-yellow-400 opacity-50" />
      </div>

      {/* Game Info Panel - Top Left */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs z-10">
        <h1 className="text-xl font-bold mb-2">Shithead</h1>
        <div className="text-sm space-y-1">
          <div>Phase: {
            gameState.gamePhase === 'setup' ? 'Choose Face-Up Cards' : 
            gameState.gamePhase === 'swapping' ? 'Swap Cards (Optional)' : 
            gameState.gamePhase === 'playing' ? 'Playing' :
            'Game Over'
          }</div>
          <div>Current: {gameState.players[gameState.currentPlayerIndex]?.name}</div>
          <div>Pile: {gameState.pile.length} cards</div>
        </div>
      </div>

      {/* Alice - Top Center */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="text-center mb-2">
          <div className={`text-sm font-bold ${gameState.currentPlayerIndex === 2 ? 'text-yellow-300' : 'text-white'}`}>
            Alice
          </div>
        </div>
        
        {/* Alice's cards - horizontal rows */}
        <div className="flex flex-col items-center gap-2">
          {/* Face-down cards */}
          <div className="flex gap-2">
            {gameState.players[2]?.faceDownCards.map((_, index) => (
              <Card
                key={`alice-down-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="black"
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Face-up cards */}
          <div className="flex gap-2">
            {gameState.players[2]?.faceUpCards.map((card, index) => (
              <Card
                key={`alice-up-${index}`}
                card={card}
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Hand (face-down) */}
          <div className="flex gap-2">
            {gameState.players[2]?.hand.slice(0, Math.min(6, gameState.players[2]?.hand.length || 0)).map((_, index) => (
              <Card
                key={`alice-hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="black"
                className="w-12 h-16"
              />
            ))}
            {(gameState.players[2]?.hand.length || 0) > 6 && (
              <div className="w-12 h-16 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                +{(gameState.players[2]?.hand.length || 0) - 6}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carol - Left Side */}
      <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
        <div className="text-center mb-2">
          <div className={`text-sm font-bold ${gameState.currentPlayerIndex === 1 ? 'text-yellow-300' : 'text-white'}`}>
            Carol
          </div>
        </div>
        
        {/* Carol's cards - horizontal rows */}
        <div className="flex flex-col items-center gap-1">
          {/* Face-down cards */}
          <div className="flex gap-1">
            {gameState.players[1]?.faceDownCards.map((_, index) => (
              <Card
                key={`carol-down-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="red"
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Face-up cards */}
          <div className="flex gap-1">
            {gameState.players[1]?.faceUpCards.map((card, index) => (
              <Card
                key={`carol-up-${index}`}
                card={card}
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Hand (face-down) */}
          <div className="flex gap-1">
            {gameState.players[1]?.hand.slice(0, Math.min(6, gameState.players[1]?.hand.length || 0)).map((_, index) => (
              <Card
                key={`carol-hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="red"
                className="w-12 h-16"
              />
            ))}
            {(gameState.players[1]?.hand.length || 0) > 6 && (
              <div className="w-12 h-16 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                +{(gameState.players[1]?.hand.length || 0) - 6}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bob - Right Side */}
      <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
        <div className="text-center mb-2">
          <div className={`text-sm font-bold ${gameState.currentPlayerIndex === 3 ? 'text-yellow-300' : 'text-white'}`}>
            Bob
          </div>
        </div>
        
        {/* Bob's cards - horizontal rows */}
        <div className="flex flex-col items-center gap-2">
          {/* Face-down cards */}
          <div className="flex gap-2">
            {gameState.players[3]?.faceDownCards.map((_, index) => (
              <Card
                key={`bob-down-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="green"
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Face-up cards */}
          <div className="flex gap-2">
            {gameState.players[3]?.faceUpCards.map((card, index) => (
              <Card
                key={`bob-up-${index}`}
                card={card}
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Hand (face-down) */}
          <div className="flex gap-2">
            {gameState.players[3]?.hand.slice(0, Math.min(6, gameState.players[3]?.hand.length || 0)).map((_, index) => (
              <Card
                key={`bob-hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="green"
                className="w-12 h-16"
              />
            ))}
            {(gameState.players[3]?.hand.length || 0) > 6 && (
              <div className="w-12 h-16 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                +{(gameState.players[3]?.hand.length || 0) - 6}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Area - Pile, Deck, and Controls */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Pile and Deck - Fixed position */}
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
                <Card card={topCard} className="w-20 h-28" />
              )}
            </div>
          </div>

          {/* Deck */}
          <div className="text-center">
            <h3 className="text-white font-bold mb-2">Deck ({gameState.deck.length})</h3>
            <div className="w-20 h-28">
              {gameState.deck.length > 0 ? (
                <div className="relative">
                  <Card card={{ suit: 'hearts', rank: 2, id: 'deck-back' }} faceDown={true} className="w-20 h-28" />
                  {/* Stack effect */}
                  <div className="absolute -top-1 -left-1 w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500 rounded-lg -z-10" />
                </div>
              ) : (
                <div className="w-full h-full border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  Empty
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Controls - Fixed position below pile/deck */}
        <div className="flex justify-center">
          <div className="w-64 flex justify-center">
          {/* Setup Phase - Deal Cards */}
          {gameState.gamePhase === 'setup' && humanPlayer.hand.length === 0 && (
            <button
              onClick={dealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
            >
              Deal Cards
            </button>
          )}
          
          {/* Setup Phase - Confirm Face-Up Cards */}
          {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
            <button
              onClick={confirmFaceUpCards}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
            >
              Confirm Face-Up Cards
            </button>
          )}
          
          {/* Swapping Phase - Start Game */}
          {gameState.gamePhase === 'swapping' && (
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
            >
              Start Game
            </button>
          )}

          {/* Playing Phase - Play Cards */}
          {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0 && selectedCards.length > 0 && (
            <button
              onClick={playCards}
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
           gameState.currentPlayerIndex === 0 && 
           selectedCards.length === 0 && 
           !canPlayAnyCard && 
           gameState.pile.length > 0 && (
            <button
              onClick={pickupCards}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
            >
              Pick up Cards ({gameState.pile.length})
            </button>
          )}

          {/* Game Over - New Game */}
          {gameState.gamePhase === 'finished' && (
            <button
              onClick={dealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
            >
              New Game
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Human Player - Bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="text-center mb-4">
          <div className={`text-lg font-bold ${gameState.currentPlayerIndex === 0 ? 'text-yellow-300' : 'text-white'}`}>
            You
          </div>
          {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length < 3 && (
            <div className="text-sm text-white opacity-75">Choose face-up cards</div>
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
                    gameState.currentPlayerIndex === 0 && 
                    gameState.gamePhase === 'playing'
                      ? () => playFaceDownCard(index)
                      : undefined
                  }
                  className={`w-16 h-24 ${
                    humanPlayer.hand.length === 0 && 
                    humanPlayer.faceUpCards.length === 0 && 
                    gameState.currentPlayerIndex === 0 && 
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
                onClick={() => handleCardClick(card, 'faceUp')}
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
                  onClick={() => handleCardClick(card, 'hand')}
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
              {gameState.winner === 'human' ? (
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
              onClick={dealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;