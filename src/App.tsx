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
      </div>

      {/* AI Players positioned around the table */}
      {/* Top Player */}
      {gameState.players[1] && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-2 ${
              gameState.currentPlayerIndex === 1 ? 'text-yellow-300' : 'text-white'
            }`}>
              {gameState.players[1].name}
            </h3>
            
            {/* Face Down Cards */}
            <div className="flex justify-center gap-1 mb-1">
              {gameState.players[1].faceDownCards.map((_, index) => (
                <Card
                  key={`top-facedown-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-10 h-14"
                />
              ))}
            </div>
            
            {/* Face Up Cards */}
            <div className="flex justify-center gap-1 mb-2">
              {gameState.players[1].faceUpCards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  className="w-10 h-14"
                />
              ))}
            </div>
            
            {/* Hand Cards (face down) */}
            <div className="flex justify-center gap-1">
              {gameState.players[1].hand.map((_, index) => (
                <Card
                  key={`top-hand-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-8 h-12"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Left Player */}
      {gameState.players[2] && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-2 ${
              gameState.currentPlayerIndex === 2 ? 'text-yellow-300' : 'text-white'
            }`}>
              {gameState.players[2].name}
            </h3>
            
            {/* Hand Cards (rotated, face down) */}
            <div className="flex flex-col gap-1 mb-2">
              {gameState.players[2].hand.map((_, index) => (
                <Card
                  key={`left-hand-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-8 h-12 transform rotate-90"
                />
              ))}
            </div>
            
            <div className="space-y-1">
              {/* Face Down Cards */}
              <div className="flex justify-center gap-1">
                {gameState.players[2].faceDownCards.map((_, index) => (
                  <Card
                    key={`left-facedown-${index}`}
                    card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                    faceDown={true}
                    className="w-8 h-12"
                  />
                ))}
              </div>
              
              {/* Face Up Cards */}
              <div className="flex justify-center gap-1">
                {gameState.players[2].faceUpCards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    className="w-8 h-12"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Player */}
      {gameState.players[3] && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-2 ${
              gameState.currentPlayerIndex === 3 ? 'text-yellow-300' : 'text-white'
            }`}>
              {gameState.players[3].name}
            </h3>
            
            {/* Hand Cards (rotated, face down) */}
            <div className="flex flex-col gap-1 mb-2">
              {gameState.players[3].hand.map((_, index) => (
                <Card
                  key={`right-hand-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-8 h-12 transform -rotate-90"
                />
              ))}
            </div>
            
            <div className="space-y-1">
              {/* Face Down Cards */}
              <div className="flex justify-center gap-1">
                {gameState.players[3].faceDownCards.map((_, index) => (
                  <Card
                    key={`right-facedown-${index}`}
                    card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                    faceDown={true}
                    className="w-8 h-12"
                  />
                ))}
              </div>
              
              {/* Face Up Cards */}
              <div className="flex justify-center gap-1">
                {gameState.players[3].faceUpCards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    className="w-8 h-12"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Center Area - Pile and Deck */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-8">
          {/* Deck */}
          <div className="text-center">
            <h3 className="text-white font-bold mb-2">Deck</h3>
            <h3 className="text-white text-sm mb-2">({gameState.deck.length})</h3>
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

          {/* Center Pile */}
          <div className="text-center">
            <h3 className="text-white font-bold mb-2">Pile</h3>
            <h3 className="text-white text-sm mb-2">({gameState.pile.length})</h3>
            {gameState.pile.length > 0 ? (
              <Card card={gameState.pile[gameState.pile.length - 1]} />
            ) : (
              <div className="w-16 h-24 border-2 border-dashed border-white rounded-lg flex items-center justify-center text-white text-xs">
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