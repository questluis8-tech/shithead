import React from 'react';
import { useGame } from './hooks/useGame';
import { Card } from './components/Card';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 relative overflow-hidden">
      {/* Game Status Panel - Top Left */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4 text-white z-10 min-w-48">
        <h1 className="text-2xl font-bold mb-2">Shithead</h1>
        <div className="space-y-1 text-sm">
          <p>Phase: {gameState.gamePhase === 'setup' ? 'Choose Face-Up Cards' : 
                   gameState.gamePhase === 'swapping' ? 'Swap Cards (Optional)' : 
                   gameState.gamePhase}</p>
          <p>Current: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
          <p>Pile: {gameState.pile.length} cards</p>
        </div>

        {/* Control Buttons */}
        <div className="mt-4 space-y-2">
          {gameState.gamePhase === 'setup' && humanPlayer.hand.length === 0 && (
            <button
              onClick={dealCards}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
            >
              Deal Cards
            </button>
          )}
          
          {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
            <button
              onClick={confirmFaceUpCards}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
            >
              Confirm Face-Up Cards
            </button>
          )}
          
          {gameState.gamePhase === 'swapping' && (
            <button
              onClick={startGame}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
            >
              Start Game
            </button>
          )}

          {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0 && selectedCards.length > 0 && (
            <button
              onClick={playCards}
              disabled={!canPlaySelected}
              className={`w-full px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                canPlaySelected
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white transform hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Play Cards ({selectedCards.length})
            </button>
          )}

          {gameState.gamePhase === 'playing' && 
           gameState.currentPlayerIndex === 0 && 
           selectedCards.length === 0 && 
           !canPlayAnyCard && 
           gameState.pile.length > 0 && (
            <button
              onClick={pickupCards}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105"
            >
              Pick up Cards ({gameState.pile.length})
            </button>
          )}
        </div>
      </div>

      {/* AI Player 1 - Top Center */}
      {gameState.players[1] && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-2 ${
              gameState.currentPlayerIndex === 1 ? 'text-yellow-300' : 'text-white'
            }`}>
              {gameState.players[1].name}
            </h3>
            <div className="text-xs text-white opacity-75 mb-2">
              H:{gameState.players[1].hand.length} U:{gameState.players[1].faceUpCards.length} D:{gameState.players[1].faceDownCards.length}
            </div>
            
            {/* Face Down Cards */}
            <div className="flex justify-center gap-1 mb-1">
              {gameState.players[1].faceDownCards.map((_, index) => (
                <Card
                  key={`ai1-down-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-12 h-16"
                />
              ))}
            </div>
            
            {/* Face Up Cards */}
            <div className="flex justify-center gap-1 mb-1">
              {gameState.players[1].faceUpCards.map((card, index) => (
                <Card
                  key={`ai1-up-${index}`}
                  card={card}
                  className="w-12 h-16"
                />
              ))}
            </div>
            
            {/* Hand (face down) */}
            <div className="flex justify-center gap-1">
              {gameState.players[1].hand.slice(0, 5).map((_, index) => (
                <Card
                  key={`ai1-hand-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-10 h-14"
                />
              ))}
              {gameState.players[1].hand.length > 5 && (
                <div className="w-10 h-14 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                  +{gameState.players[1].hand.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Player 2 - Left Side */}
      {gameState.players[2] && (
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-2 ${
              gameState.currentPlayerIndex === 2 ? 'text-yellow-300' : 'text-white'
            }`}>
              {gameState.players[2].name}
            </h3>
            <div className="text-xs text-white opacity-75 mb-2">
              H:{gameState.players[2].hand.length} U:{gameState.players[2].faceUpCards.length} D:{gameState.players[2].faceDownCards.length}
            </div>
            
            {/* Face Down Cards */}
            <div className="flex justify-center gap-1 mb-1">
              {gameState.players[2].faceDownCards.map((_, index) => (
                <Card
                  key={`ai2-down-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-12 h-16"
                />
              ))}
            </div>
            
            {/* Face Up Cards */}
            <div className="flex justify-center gap-1 mb-1">
              {gameState.players[2].faceUpCards.map((card, index) => (
                <Card
                  key={`ai2-up-${index}`}
                  card={card}
                  className="w-12 h-16"
                />
              ))}
            </div>
            
            {/* Hand (face down) */}
            <div className="flex justify-center gap-1">
              {gameState.players[2].hand.slice(0, 5).map((_, index) => (
                <Card
                  key={`ai2-hand-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-10 h-14"
                />
              ))}
              {gameState.players[2].hand.length > 5 && (
                <div className="w-10 h-14 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                  +{gameState.players[2].hand.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Player 3 - Right Side */}
      {gameState.players[3] && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-2 ${
              gameState.currentPlayerIndex === 3 ? 'text-yellow-300' : 'text-white'
            }`}>
              {gameState.players[3].name}
            </h3>
            <div className="text-xs text-white opacity-75 mb-2">
              H:{gameState.players[3].hand.length} U:{gameState.players[3].faceUpCards.length} D:{gameState.players[3].faceDownCards.length}
            </div>
            
            {/* Face Down Cards */}
            <div className="flex justify-center gap-1 mb-1">
              {gameState.players[3].faceDownCards.map((_, index) => (
                <Card
                  key={`ai3-down-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-12 h-16"
                />
              ))}
            </div>
            
            {/* Face Up Cards */}
            <div className="flex justify-center gap-1 mb-1">
              {gameState.players[3].faceUpCards.map((card, index) => (
                <Card
                  key={`ai3-up-${index}`}
                  card={card}
                  className="w-12 h-16"
                />
              ))}
            </div>
            
            {/* Hand (face down) */}
            <div className="flex justify-center gap-1">
              {gameState.players[3].hand.slice(0, 5).map((_, index) => (
                <Card
                  key={`ai3-hand-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-10 h-14"
                />
              ))}
              {gameState.players[3].hand.length > 5 && (
                <div className="w-10 h-14 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                  +{gameState.players[3].hand.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Center Area - Pile and Deck */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-16">
        {/* Pile */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Pile ({gameState.pile.length})</h2>
          <div className="flex justify-center">
            {gameState.pile.length > 0 ? (
              <Card card={gameState.pile[gameState.pile.length - 1]} className="w-20 h-28" />
            ) : (
              <div className="w-20 h-28 border-2 border-dashed border-white rounded-lg flex items-center justify-center text-white text-sm">
                Empty
              </div>
            )}
          </div>
        </div>

        {/* Deck */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Deck ({gameState.deck.length})</h2>
          <div className="flex justify-center">
            {gameState.deck.length > 0 ? (
              <div className="relative">
                <Card card={{ suit: 'hearts', rank: 2, id: 'deck-back' }} faceDown={true} className="w-20 h-28" />
                {/* Stack effect */}
                <div className="absolute -top-1 -left-1 w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500 rounded-lg -z-10" />
                <div className="absolute -top-2 -left-2 w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500 rounded-lg -z-20" />
              </div>
            ) : (
              <div className="w-20 h-28 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                Empty
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Human Player - Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="text-center mb-4">
          <h2 className={`text-xl font-bold ${
            gameState.currentPlayerIndex === 0 ? 'text-yellow-300' : 'text-white'
          }`}>
            {humanPlayer.name}
          </h2>
        </div>
        
        {/* Face Down Cards */}
        {humanPlayer.faceDownCards.length > 0 && (
          <div className="mb-3">
            <div className="flex justify-center gap-2">
              {humanPlayer.faceDownCards.map((_, index) => (
                <Card
                  key={`facedown-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  onClick={
                    humanPlayer.hand.length === 0 && 
                    humanPlayer.faceUpCards.length === 0 && 
                    gameState.currentPlayerIndex === 0 && 
                    gameState.gamePhase === 'playing'
                      ? () => playFaceDownCard(index)
                      : undefined
                  }
                  onMouseDown={() => console.log(`Mouse down on face-down card ${index}`)}
                  onMouseUp={() => console.log(`Mouse up on face-down card ${index}`)}
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
            {humanPlayer.hand.length === 0 && humanPlayer.faceUpCards.length === 0 && 
             gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'playing' && (
              <p className="text-yellow-300 text-sm text-center mt-2">Click a face-down card to reveal and play</p>
            )}
          </div>
        )}
        
        {/* Face Up Cards */}
        <div className="mb-3">
          <div className="flex justify-center gap-2">
            {humanPlayer.faceUpCards.map((card) => (
              <Card
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card, 'faceUp')}
                selected={selectedCards.some(c => c.id === card.id)}
                disabled={humanPlayer.hand.length > 0}
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
        </div>

        {/* Hand */}
        {humanPlayer.hand.length > 0 && (
          <div>
            <div className="flex justify-center gap-2 flex-wrap max-w-4xl">
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
          </div>
        )}
      </div>
    </div>
  );
}

export default App;