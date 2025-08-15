import React from 'react';
import { useGame } from './hooks/useGame';
import { Card } from './components/Card';
import { getCardDisplay, getSuitSymbol, getEffectiveTopCard } from './utils/cardUtils';

function App() {
  const [showFireEffect, setShowFireEffect] = React.useState(false);
  const [showPickupEffect, setShowPickupEffect] = React.useState(false);
  const [gameMode, setGameMode] = React.useState<'menu' | 'singleplayer' | 'multiplayer'>('menu');
  const [playerCount, setPlayerCount] = React.useState<number | null>(null);

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
    playFaceDownCard,
    jumpInWindow,
    lastAction,
    clearLastAction
  } = useGame(playerCount || 4);

  // Show effects based on last action
  React.useEffect(() => {
    if (lastAction === 'burn') {
      setShowFireEffect(true);
      setTimeout(() => setShowFireEffect(false), 1500);
      clearLastAction();
    }
    
    if (lastAction === 'pickup') {
      setShowPickupEffect(true);
      setTimeout(() => setShowPickupEffect(false), 1500);
      clearLastAction();
    }
  }, [lastAction, clearLastAction]);

  const humanPlayer = gameState.players[0];
  const topCard = gameState.pile.length > 0 ? gameState.pile[gameState.pile.length - 1] : null;
  const effectiveTopCard = getEffectiveTopCard(gameState.pile);

  // Show menu screen
  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-12 text-center max-w-md">
          <h1 className="text-4xl font-bold text-white mb-8">Shithead</h1>
          <div className="space-y-4">
            <button
              onClick={() => setGameMode('singleplayer')}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105"
            >
              SINGLE PLAYER
            </button>
            <button
              onClick={() => {/* Do nothing for now */}}
              className="w-full bg-gray-600 text-gray-400 px-8 py-4 rounded-lg font-bold text-xl cursor-not-allowed"
            >
              MULTIPLAYER
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show player count selection screen
  if (gameMode === 'singleplayer' && playerCount === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-12 text-center max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4">Shithead</h1>
          <h2 className="text-xl text-white mb-8">Choose Number of Players</h2>
          <div className="grid grid-cols-2 gap-4">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => setPlayerCount(count)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-lg font-bold text-2xl transition-all transform hover:scale-105"
              >
                {count}
              </button>
            ))}
          </div>
          <button
            onClick={() => setGameMode('menu')}
            className="mt-6 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative overflow-hidden">

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
      {gameState.players.length === 4 && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="text-center mb-2">
          <div className={`text-sm font-bold ${gameState.currentPlayerIndex === 1 ? 'text-yellow-300' : 'text-white'}`}>
            {gameState.players[1]?.name}
          </div>
        </div>
        
        {/* Alice's cards - horizontal rows */}
        <div className="flex flex-col items-center gap-2">
          {/* Face-down cards */}
          <div className="flex gap-2">
            {gameState.players[1]?.faceDownCards.map((_, index) => (
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
            {gameState.players[1]?.faceUpCards.map((card, index) => (
              <Card
                key={`alice-up-${index}`}
                card={card}
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Hand (face-down) */}
          <div className="flex gap-2">
            {gameState.players[1]?.hand.slice(0, Math.min(6, gameState.players[1]?.hand.length || 0)).map((_, index) => (
              <Card
                key={`alice-hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="black"
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
      )}

      {/* Second AI Player - Left Side (Carol in 3p, Alice in 4p) */}
      {gameState.players.length === 3 && (
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
        <div className="text-center mb-2">
          <div className={`text-sm font-bold ${gameState.currentPlayerIndex === 2 ? 'text-yellow-300' : 'text-white'}`}>
            {gameState.players[2]?.name}
          </div>
        </div>
        
        {/* Carol's cards - horizontal rows */}
        <div className="flex flex-col items-center gap-1">
          {/* Face-down cards */}
          <div className="flex gap-1">
            {gameState.players[2]?.faceDownCards.map((_, index) => (
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
                key={`bob-left-up-${index}`}
                card={card}
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Hand (face-down) */}
          <div className="flex gap-1">
            {gameState.players[1]?.hand.slice(0, Math.min(6, gameState.players[1]?.hand.length || 0)).map((_, index) => (
              <Card
                key={`bob-left-hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="green"
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
      )}

      {/* Alice - Left Side (4 player only) */}
      {gameState.players.length > 3 && (
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
        <div className="text-center mb-2">
          <div className={`text-sm font-bold ${gameState.currentPlayerIndex === 2 ? 'text-yellow-300' : 'text-white'}`}>
            {gameState.players[2]?.name}
          </div>
        </div>
        
        {/* Alice's cards - horizontal rows */}
        <div className="flex flex-col items-center gap-1">
          {/* Face-down cards */}
          <div className="flex gap-1">
            {gameState.players[2]?.faceDownCards.map((_, index) => (
              <Card
                key={`alice-left-down-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="black"
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Face-up cards */}
          <div className="flex gap-1">
            {gameState.players[2]?.faceUpCards.map((card, index) => (
              <Card
                key={`alice-left-up-${index}`}
                card={card}
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Hand (face-down) */}
          <div className="flex gap-1">
            {gameState.players[2]?.hand.slice(0, Math.min(6, gameState.players[2]?.hand.length || 0)).map((_, index) => (
              <Card
                key={`alice-left-hand-${index}`}
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
      )}

      {/* Third AI Player - Right Side (Bob in 3p, Carol in 4p) */}
      {gameState.players.length === 3 && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
        <div className="text-center mb-2">
          <div className={`text-sm font-bold ${gameState.currentPlayerIndex === 2 ? 'text-yellow-300' : 'text-white'}`}>
            {gameState.players[2]?.name}
          </div>
        </div>
        
        {/* Alice's cards - horizontal rows */}
        <div className="flex flex-col items-center gap-2">
          {/* Face-down cards */}
          <div className="flex gap-2">
            {gameState.players[2]?.faceDownCards.map((_, index) => (
              <Card
                key={`alice-right-down-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="black"
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Face-up cards */}
          <div className="flex gap-2">
            {gameState.players[1]?.faceUpCards.map((card, index) => (
              <Card
                key={`alice-right-up-${index}`}
                card={card}
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Hand (face-down) */}
          <div className="flex gap-2">
            {gameState.players[1]?.hand.slice(0, Math.min(6, gameState.players[1]?.hand.length || 0)).map((_, index) => (
              <Card
                key={`alice-right-hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="black"
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
      )}

      {/* Carol - Right Side (4 player only) */}
      {gameState.players.length > 3 && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
        <div className="text-center mb-2">
          <div className={`text-sm font-bold ${gameState.currentPlayerIndex === 3 ? 'text-yellow-300' : 'text-white'}`}>
            {gameState.players[3]?.name}
          </div>
        </div>
        
        {/* Carol's cards - horizontal rows */}
        <div className="flex flex-col items-center gap-2">
          {/* Face-down cards */}
          <div className="flex gap-2">
            {gameState.players[3]?.faceDownCards.map((_, index) => (
              <Card
                key={`bob-left-down-${index}`}
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
                key={`carol-right-up-${index}`}
                card={card}
                className="w-14 h-20"
              />
            ))}
          </div>
          
          {/* Hand (face-down) */}
          <div className="flex gap-2">
            {gameState.players[3]?.hand.slice(0, Math.min(6, gameState.players[3]?.hand.length || 0)).map((_, index) => (
              <Card
                key={`carol-right-hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                playerColor="red"
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
      )}

      {/* Center Area - Pile, Deck, and Controls */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Fire flash for burns */}
        {showFireEffect && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20">
            <div className="text-6xl animate-bounce">
              🔥
            </div>
          </div>
        )}
        
        {/* Pickup effect */}
        {showPickupEffect && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20">
            <div className="text-6xl animate-pulse">
              😰
            </div>
          </div>
        )}
        
        {/* Jump-in indicator */}
        {jumpInWindow && (
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              JUMP-IN!
            </div>
          </div>
        )}
        
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
                <div className="relative w-20 h-28 overflow-visible">
                  {/* Show last 3 cards with specific positioning */}
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
                  className={`w-16 h-24 ${
                    jumpInWindow && card.rank === jumpInWindow.rank 
                      ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' 
                      : ''
                  }`}
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