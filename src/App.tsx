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
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative overflow-hidden">
      {/* Game Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-3xl font-bold text-white text-center">Shithead Card Game</h1>
      </div>
        
      {/* Game Status - Top Right */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-10">
        <div className="space-y-1">
          <p>Phase: {gameState.gamePhase === 'setup' ? 'Choose Face-Up Cards' : 
                   gameState.gamePhase === 'swapping' ? 'Swap Cards (Optional)' : 
                   gameState.gamePhase}</p>
          <p>Current: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
          <p>Pile: {gameState.pile.length} cards</p>
        </div>
      </div>

      {/* Controls - Top Left */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
          {gameState.gamePhase === 'setup' && humanPlayer.hand.length === 0 && (
            <button
              onClick={dealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all block"
            >
              Deal Cards
            </button>
          )}
          
          {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
            <button
              onClick={confirmFaceUpCards}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all block"
            >
              Confirm Face-Up Cards
            </button>
          )}
          
          {gameState.gamePhase === 'swapping' && (
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all block"
            >
              Start Game
            </button>
          )}
      </div>

      {/* Action Buttons - Bottom Center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 space-y-2">
        {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0 && selectedCards.length > 0 && (
            <button
              onClick={playCards}
              disabled={!canPlaySelected}
              className={`px-6 py-2 rounded-lg font-bold transition-all block ${
                canPlaySelected
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
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
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-all block"
            >
              Pick up Cards ({gameState.pile.length})
            </button>
        )}
      </div>


        {/* Game Area - Center Pile and Deck */}
        <div className="flex justify-center items-start gap-16 mb-8">
          {/* Center Pile */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Pile ({gameState.pile.length})</h2>
            <div className="flex justify-center">
              {gameState.pile.length > 0 ? (
                <Card card={gameState.pile[gameState.pile.length - 1]} />
              ) : (
                <div className="w-16 h-24 border-2 border-dashed border-white rounded-lg flex items-center justify-center text-white">
                  Empty
                </div>
              )}
            </div>
          </div>

          {/* Deck */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Deck ({gameState.deck.length})</h2>
            <div className="flex justify-center">
              {gameState.deck.length > 0 ? (
                <div className="relative">
                  <Card card={{ suit: 'hearts', rank: 2, id: 'deck-back' }} faceDown={true} />
                  {/* Stack effect */}
                  <div className="absolute -top-1 -left-1 w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500 rounded-lg -z-10" />
                  <div className="absolute -top-2 -left-2 w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500 rounded-lg -z-20" />
                </div>
              ) : (
                <div className="w-16 h-24 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  Empty
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Human Player - Bottom */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
        <div className="text-center">
          <h3 className={`text-lg font-bold mb-2 ${
            gameState.currentPlayerIndex === 0 ? 'text-yellow-300' : 'text-white'
          }`}>
            {humanPlayer.name}
          </h3>
          
          {/* Hand Cards */}
          {humanPlayer.hand.length > 0 && (
            <div className="flex justify-center gap-2 mb-3">
              {humanPlayer.hand.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleCardClick(card, 'hand')}
                  selected={selectedCards.some(c => c.id === card.id)}
                  className="w-14 h-20"
                />
              ))}
            </div>
          )}
          
          <div className="flex justify-center gap-8">
            {/* Face Down Cards */}
            <div>
              <div className="text-white text-sm mb-1">Face Down</div>
              <div className="flex gap-1">
                {humanPlayer.faceDownCards.map((_, index) => (
                  <Card
                    key={`human-facedown-${index}`}
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
                    className={`w-12 h-16 ${
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
            </div>
            
            {/* Face Up Cards */}
            <div>
              <div className="text-white text-sm mb-1">Face Up</div>
              <div className="flex gap-1">
                {humanPlayer.faceUpCards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(card, 'faceUp')}
                    selected={selectedCards.some(c => c.id === card.id)}
                    disabled={humanPlayer.hand.length > 0}
                    className="w-12 h-16"
                  />
                ))}
                {/* Empty slots during setup */}
                {gameState.gamePhase === 'setup' && Array.from({ length: 3 - humanPlayer.faceUpCards.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="w-12 h-16 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    Empty
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

export default App;