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
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-red-700 relative overflow-hidden">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300 to-transparent transform -skew-y-12"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-red-400 to-transparent transform skew-y-12"></div>
      </div>
      
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top UI Bar */}
        <div className="flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Shithead</h1>
          <div className="text-white text-sm">
            Phase: {gameState.gamePhase}
          </div>
        </div>
        
        {/* Main Game Area */}
        <div className="flex-1 relative">
          {/* AI Players positioned around the screen */}
          {gameState.players.slice(1).map((player, index) => {
            const positions = [
              { top: '10%', left: '50%', transform: 'translateX(-50%)' }, // Top
              { top: '50%', right: '5%', transform: 'translateY(-50%)' }, // Right
              { top: '50%', left: '5%', transform: 'translateY(-50%)' }   // Left
            ];
            const position = positions[index] || positions[0];
            
            return (
              <div
                key={player.id}
                className="absolute"
                style={position}
              >
                {/* Player info */}
                <div className="bg-black bg-opacity-50 rounded-lg p-3 text-white text-center min-w-32">
                  <div className="text-sm font-bold mb-1">{player.name}</div>
                  <div className="text-xs opacity-75 mb-2">
                    {player.hand.length} cards
                  </div>
                  
                  {/* Player's cards (face down for AI) */}
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: Math.min(player.hand.length, 7) }).map((_, cardIndex) => (
                      <div
                        key={cardIndex}
                        className="w-6 h-9 bg-blue-600 border border-blue-500 rounded-sm"
                        style={{
                          transform: `rotate(${(cardIndex - 3) * 5}deg)`,
                          zIndex: cardIndex
                        }}
                      />
                    ))}
                    {player.hand.length > 7 && (
                      <div className="text-xs text-white ml-1">
                        +{player.hand.length - 7}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Center area - pile and game controls */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-center">
              <div className="w-20 h-28 bg-gray-800 bg-opacity-50 border-2 border-dashed border-yellow-400 rounded-lg flex items-center justify-center text-yellow-400 text-sm mb-4">
                Pile
              </div>
              
              {/* Game phase indicator */}
              <div className="bg-black bg-opacity-50 rounded-lg px-4 py-2 text-white text-sm">
                {gameState.gamePhase === 'setup' && 'Click Deal Cards to start'}
                {gameState.gamePhase === 'swapping' && 'Choose your face-up cards'}
                {gameState.gamePhase === 'playing' && `${gameState.players[gameState.currentPlayerIndex].name}'s turn`}
                {gameState.gamePhase === 'finished' && 'Game Over!'}
              </div>
            </div>
          </div>
          
          {/* Human player at bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="text-center">
              {/* Player name */}
              <div className="text-white font-bold mb-2">{humanPlayer.name}</div>
              
              {/* Player's hand */}
              <div className="flex justify-center gap-2">
                {humanPlayer.hand.map((card, index) => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(card, 'hand')}
                    selected={selectedCards.some(c => c.id === card.id)}
                    className="w-12 h-18 hover:scale-105 hover:-translate-y-2 transition-all"
                    style={{
                      transform: `rotate(${(index - humanPlayer.hand.length / 2) * 3}deg)`,
                      zIndex: index
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Game controls */}
        <div className="absolute top-4 right-4">
          {gameState.gamePhase === 'setup' && (
            <button
              onClick={dealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg"
            >
              Deal Cards
            </button>
          )}
          
          {gameState.gamePhase === 'playing' && selectedCards.length > 0 && (
            <button
              onClick={playCards}
              disabled={!canPlaySelected}
              className={`px-6 py-3 rounded-lg font-bold shadow-lg ${
                canPlaySelected
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Play Cards
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


export default App;