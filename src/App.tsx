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
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Shithead Card Game</h1>
        
        {/* Game Status */}
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 text-white mb-6">
          <div className="text-center">
            <p className="text-lg">
              Phase: {gameState.gamePhase === 'setup' ? 'Choose Face-Up Cards' : 
                     gameState.gamePhase === 'swapping' ? 'Swap Cards (Optional)' : 
                     gameState.gamePhase}
            </p>
            <p>Current Player: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
            <p>Pile: {gameState.pile.length} cards</p>
          </div>
        </div>

        {/* Controls */}
        <div className="text-center mb-8">
          {gameState.gamePhase === 'setup' && humanPlayer.hand.length === 0 && (
            <button
              onClick={dealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all"
            >
              Deal Cards
            </button>
          )}
          
          {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
            <button
              onClick={confirmFaceUpCards}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all"
            >
              Confirm Face-Up Cards
            </button>
          )}
          
          {gameState.gamePhase === 'swapping' && (
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all"
            >
              Start Game
            </button>
          )}
        </div>

        {/* Play Cards Button */}
        {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0 && selectedCards.length > 0 && (
          <div className="text-center mb-4">
            <button
              onClick={playCards}
              disabled={!canPlaySelected}
              className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                canPlaySelected
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white transform hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Play Cards ({selectedCards.length})
            </button>
          </div>
        )}

        {/* Pick up Cards Button */}
        {gameState.gamePhase === 'playing' && 
         gameState.currentPlayerIndex === 0 && 
         selectedCards.length === 0 && 
         !canPlayAnyCard && 
         gameState.pile.length > 0 && (
          <div className="text-center mb-4">
            <button
              onClick={pickupCards}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Pick up Cards ({gameState.pile.length})
            </button>
          </div>
        )}

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

        {/* AI Players */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {gameState.players.slice(1).map((player, index) => (
            <div key={player.id} className="bg-black bg-opacity-30 rounded-lg p-4 text-center">
              <h3 className={`text-lg font-bold mb-2 ${
                gameState.currentPlayerIndex === gameState.players.indexOf(player) 
                  ? 'text-yellow-300' 
                  : 'text-white'
              }`}>
                {player.name}
              </h3>
              <div className="text-sm text-white opacity-75 space-y-1">
                <div>Hand: {player.hand.length} cards</div>
                <div>Face Up: {player.faceUpCards.length} cards</div>
                <div>Face Down: {player.faceDownCards.length} cards</div>
              </div>
            </div>
          ))}
        </div>

        {/* Human Player */}
        <div className="bg-black bg-opacity-30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white text-center mb-4">{humanPlayer.name}</h2>
          
          {/* Face Down Cards */}
          {humanPlayer.faceDownCards.length > 0 && (
            <div className="mb-4">
              <h3 className="text-white text-center mb-2">
                Face Down Cards
                {humanPlayer.hand.length === 0 && humanPlayer.faceUpCards.length === 0 && 
                 gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'playing' && (
                  <span className="text-yellow-300 text-sm block">Click a card to reveal and play</span>
                )}
              </h3>
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
                    className={
                      humanPlayer.hand.length === 0 && 
                      humanPlayer.faceUpCards.length === 0 && 
                      gameState.currentPlayerIndex === 0 && 
                      gameState.gamePhase === 'playing'
                        ? 'cursor-pointer hover:scale-105'
                        : ''
                    }
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Face Up Cards */}
          <div className="mb-4">
            <h3 className="text-white text-center mb-2">Face Up Cards</h3>
            <div className="flex justify-center gap-2">
              {humanPlayer.faceUpCards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleCardClick(card, 'faceUp')}
                  selected={selectedCards.some(c => c.id === card.id)}
                  disabled={humanPlayer.hand.length > 0}
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
              <h3 className="text-white text-center mb-2">Hand</h3>
              <div className="flex justify-center gap-2 flex-wrap">
                {humanPlayer.hand.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(card, 'hand')}
                    selected={selectedCards.some(c => c.id === card.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;