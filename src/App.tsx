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
  const aiPlayers = gameState.players.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 relative overflow-hidden">
      {/* Game Status - Top Left */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 text-white z-10">
        <h1 className="text-2xl font-bold mb-2">Shithead</h1>
        <div className="text-sm space-y-1">
          <p>Phase: {gameState.gamePhase === 'setup' ? 'Choose Face-Up Cards' : 
                   gameState.gamePhase === 'swapping' ? 'Swap Cards (Optional)' : 
                   gameState.gamePhase}</p>
          <p>Current: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
          <p>Pile: {gameState.pile.length} cards</p>
        </div>
      </div>

      {/* Controls - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        {gameState.gamePhase === 'setup' && humanPlayer.hand.length === 0 && (
          <button
            onClick={dealCards}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
          >
            Deal Cards
          </button>
        )}
        
        {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
          <button
            onClick={confirmFaceUpCards}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
          >
            Confirm Face-Up Cards
          </button>
        )}
        
        {gameState.gamePhase === 'swapping' && (
          <button
            onClick={startGame}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
          >
            Start Game
          </button>
        )}
      </div>

      {/* AI Player 1 - Top */}
      {aiPlayers[0] && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className={`text-center mb-2 ${
            gameState.currentPlayerIndex === 1 ? 'text-yellow-300' : 'text-white'
          }`}>
            <div className="text-sm font-bold">{aiPlayers[0].name}</div>
            <div className="text-xs opacity-75">
              H:{aiPlayers[0].hand.length} U:{aiPlayers[0].faceUpCards.length} D:{aiPlayers[0].faceDownCards.length}
            </div>
          </div>
          
          {/* Cards arranged horizontally, rotated 180 degrees */}
          <div className="transform rotate-180">
            {/* Face Down Cards */}
            <div className="flex gap-1 justify-center mb-1">
              {aiPlayers[0].faceDownCards.map((_, index) => (
                <Card
                  key={`ai1-down-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-8 h-12"
                />
              ))}
            </div>
            
            {/* Face Up Cards */}
            <div className="flex gap-1 justify-center mb-1">
              {aiPlayers[0].faceUpCards.map((card, index) => (
                <Card
                  key={`ai1-up-${index}`}
                  card={card}
                  className="w-8 h-12"
                />
              ))}
            </div>
            
            {/* Hand (face down) */}
            <div className="flex gap-1 justify-center">
              {aiPlayers[0].hand.slice(0, 5).map((_, index) => (
                <Card
                  key={`ai1-hand-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-8 h-12"
                />
              ))}
              {aiPlayers[0].hand.length > 5 && (
                <div className="w-8 h-12 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                  +{aiPlayers[0].hand.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Player 2 - Right */}
      {aiPlayers[1] && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <div className={`text-center mb-2 ${
            gameState.currentPlayerIndex === 2 ? 'text-yellow-300' : 'text-white'
          }`}>
            <div className="text-sm font-bold">{aiPlayers[1].name}</div>
            <div className="text-xs opacity-75">
              H:{aiPlayers[1].hand.length} U:{aiPlayers[1].faceUpCards.length} D:{aiPlayers[1].faceDownCards.length}
            </div>
          </div>
          
          {/* Cards arranged vertically, rotated 90 degrees */}
          <div className="transform -rotate-90">
            {/* Face Down Cards */}
            <div className="flex gap-1 justify-center mb-1">
              {aiPlayers[1].faceDownCards.map((_, index) => (
                <Card
                  key={`ai2-down-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-8 h-12"
                />
              ))}
            </div>
            
            {/* Face Up Cards */}
            <div className="flex gap-1 justify-center mb-1">
              {aiPlayers[1].faceUpCards.map((card, index) => (
                <Card
                  key={`ai2-up-${index}`}
                  card={card}
                  className="w-8 h-12"
                />
              ))}
            </div>
            
            {/* Hand (face down) */}
            <div className="flex gap-1 justify-center">
              {aiPlayers[1].hand.slice(0, 5).map((_, index) => (
                <Card
                  key={`ai2-hand-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-8 h-12"
                />
              ))}
              {aiPlayers[1].hand.length > 5 && (
                <div className="w-8 h-12 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                  +{aiPlayers[1].hand.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Player 3 - Left */}
      {aiPlayers[2] && (
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
          <div className={`text-center mb-2 ${
            gameState.currentPlayerIndex === 3 ? 'text-yellow-300' : 'text-white'
          }`}>
            <div className="text-sm font-bold">{aiPlayers[2].name}</div>
            <div className="text-xs opacity-75">
              H:{aiPlayers[2].hand.length} U:{aiPlayers[2].faceUpCards.length} D:{aiPlayers[2].faceDownCards.length}
            </div>
          </div>
          
          {/* Cards arranged vertically, rotated 90 degrees */}
          <div className="transform rotate-90">
            {/* Face Down Cards */}
            <div className="flex gap-1 justify-center mb-1">
              {aiPlayers[2].faceDownCards.map((_, index) => (
                <Card
                  key={`ai3-down-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-8 h-12"
                />
              ))}
            </div>
            
            {/* Face Up Cards */}
            <div className="flex gap-1 justify-center mb-1">
              {aiPlayers[2].faceUpCards.map((card, index) => (
                <Card
                  key={`ai3-up-${index}`}
                  card={card}
                  className="w-8 h-12"
                />
              ))}
            </div>
            
            {/* Hand (face down) */}
            <div className="flex gap-1 justify-center">
              {aiPlayers[2].hand.slice(0, 5).map((_, index) => (
                <Card
                  key={`ai3-hand-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-8 h-12"
                />
              ))}
              {aiPlayers[2].hand.length > 5 && (
                <div className="w-8 h-12 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                  +{aiPlayers[2].hand.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Center Area - Pile and Deck */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-8">
          {/* Pile */}
          <div className="text-center">
            <h3 className="text-white font-bold mb-2">Pile ({gameState.pile.length})</h3>
            <div className="w-16 h-24">
              {gameState.pile.length > 0 ? (
                <Card card={gameState.pile[gameState.pile.length - 1]} />
              ) : (
                <div className="w-16 h-24 border-2 border-dashed border-white rounded-lg flex items-center justify-center text-white text-xs">
                  Empty
                </div>
              )}
            </div>
          </div>

          {/* Deck */}
          <div className="text-center">
            <h3 className="text-white font-bold mb-2">Deck ({gameState.deck.length})</h3>
            <div className="w-16 h-24">
              {gameState.deck.length > 0 ? (
                <div className="relative">
                  <Card card={{ suit: 'hearts', rank: 2, id: 'deck-back' }} faceDown={true} />
                  <div className="absolute -top-1 -left-1 w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500 rounded-lg -z-10" />
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

      {/* Action Buttons - Center Bottom */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-4">
        {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0 && selectedCards.length > 0 && (
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
        )}

        {gameState.gamePhase === 'playing' && 
         gameState.currentPlayerIndex === 0 && 
         selectedCards.length === 0 && 
         !canPlayAnyCard && 
         gameState.pile.length > 0 && (
          <button
            onClick={pickupCards}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
          >
            Pick up Cards ({gameState.pile.length})
          </button>
        )}
      </div>

      {/* Human Player - Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className={`text-center mb-4 ${
          gameState.currentPlayerIndex === 0 ? 'text-yellow-300' : 'text-white'
        }`}>
          <div className="text-lg font-bold">{humanPlayer.name}</div>
        </div>
        
        {/* Face Down Cards */}
        {humanPlayer.faceDownCards.length > 0 && (
          <div className="mb-2">
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
        <div className="mb-2">
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
          <div className="flex justify-center gap-2 flex-wrap max-w-4xl">
            {humanPlayer.hand.map((card) => (
              <Card
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card, 'hand')}
                selected={selectedCards.some(c => c.id === card.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;