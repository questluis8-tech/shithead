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
              { top: '8%', left: '50%', transform: 'translateX(-50%)' }, // Top
              { top: '50%', right: '3%', transform: 'translateY(-50%)' }, // Right
              { top: '50%', left: '3%', transform: 'translateY(-50%)' }   // Left
            ];
            const position = positions[index] || positions[0];
            const isCurrentPlayer = gameState.currentPlayerIndex === index + 1;
            
            return (
              <div
                key={player.id}
                className="absolute"
                style={position}
              >
                {/* Player info */}
                <div className={`rounded-lg p-3 text-white text-center min-w-32 transition-all ${
                  isCurrentPlayer 
                    ? 'bg-yellow-600 bg-opacity-80 shadow-lg ring-2 ring-yellow-400' 
                    : 'bg-black bg-opacity-50'
                }`}>
                  <div className={`text-sm font-bold mb-1 ${isCurrentPlayer ? 'text-yellow-100' : ''}`}>
                    {player.name}
                  </div>
                  <div className="text-xs opacity-75 mb-2">
                    {player.hand.length} cards in hand
                  </div>
                  
                  {/* Face-down cards */}
                  {player.faceDownCards.length > 0 && (
                    <div className="flex justify-center gap-1 mb-1">
                      {player.faceDownCards.map((_, cardIndex) => (
                        <div
                          key={`${player.id}-down-${cardIndex}`}
                          className="w-4 h-6 bg-blue-800 border border-blue-600 rounded-sm"
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Face-up cards */}
                  {player.faceUpCards.length > 0 && (
                    <div className="flex justify-center gap-1 mb-2">
                      {player.faceUpCards.map((card, cardIndex) => (
                        <Card
                          key={`${player.id}-up-${cardIndex}`}
                          card={card}
                          className="w-4 h-6"
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Hand cards (face down for AI) */}
                  <div className="flex justify-center">
                    {Array.from({ length: Math.min(player.hand.length, 8) }).map((_, cardIndex) => {
                      const totalCards = Math.min(player.hand.length, 8);
                      const rotation = index === 0 ? 0 : // Top player - no rotation
                                     index === 1 ? (cardIndex - totalCards / 2) * 8 : // Right player
                                     (cardIndex - totalCards / 2) * -8; // Left player
                      
                      return (
                        <div
                          key={cardIndex}
                          className="w-6 h-9 bg-blue-600 border border-blue-500 rounded-sm shadow-md"
                          style={{
                            transform: `rotate(${rotation}deg) ${index === 0 ? 'translateY(0)' : ''}`,
                            zIndex: cardIndex,
                            marginLeft: cardIndex > 0 ? '-4px' : '0'
                          }}
                        />
                      );
                    })}
                    {player.hand.length > 8 && (
                      <div className="text-xs text-white ml-1 self-center">
                        +{player.hand.length - 8}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Center area - pile and game controls */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-center relative">
              {/* Draw pile (deck) */}
              <div className="absolute -left-20 top-0">
                <div className="relative">
                  {/* Stack effect for deck */}
                  <div className="w-16 h-24 bg-blue-800 border-2 border-blue-600 rounded-lg absolute transform rotate-1"></div>
                  <div className="w-16 h-24 bg-blue-700 border-2 border-blue-500 rounded-lg absolute transform -rotate-1"></div>
                  <div className="w-16 h-24 bg-blue-600 border-2 border-blue-400 rounded-lg relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white rounded-full opacity-50"></div>
                    </div>
                  </div>
                  <div className="text-white text-xs text-center mt-1">Deck</div>
                </div>
              </div>
              
              {/* Center pile */}
              <div className="relative">
                {gameState.pile.length === 0 ? (
                  <div className="w-16 h-24 border-2 border-dashed border-yellow-400 rounded-lg flex items-center justify-center text-yellow-400 text-xs bg-black bg-opacity-20">
                    Pile
                  </div>
                ) : (
                  <div className="relative">
                    {/* Show last few cards in pile with slight rotation */}
                    {gameState.pile.slice(-3).map((card, index) => (
                      <Card
                        key={card.id}
                        card={card}
                        className={`absolute w-16 h-24 ${
                          index === 0 ? 'transform rotate-3' : 
                          index === 1 ? 'transform -rotate-2' : 
                          'transform rotate-1'
                        }`}
                        style={{
                          zIndex: index,
                          left: `${index * 2}px`,
                          top: `${index * 1}px`
                        }}
                      />
                    ))}
                    {/* Invisible spacer to maintain layout */}
                    <div className="w-16 h-24 opacity-0"></div>
                  </div>
                )}
                <div className="text-white text-xs text-center mt-1">
                  Pile ({gameState.pile.length})
                </div>
              </div>
              
              {/* Game status below pile */}
              <div className="mt-6 bg-black bg-opacity-40 rounded-lg px-4 py-2 text-white text-sm backdrop-blur-sm">
                {gameState.gamePhase === 'setup' && (
                  <div className="text-center">
                    <button
                      onClick={dealCards}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl shadow-lg transition-all transform hover:scale-105 mb-2"
                    >
                      Deal Cards
                    </button>
                    <div className="text-xs opacity-75">Click to start a new game</div>
                  </div>
                )}
                {gameState.gamePhase === 'swapping' && 'Choose your face-up cards'}
                {gameState.gamePhase === 'playing' && (
                  <div>
                    <div className="font-bold text-yellow-300">
                      {gameState.players[gameState.currentPlayerIndex].name}'s turn
                    </div>
                    {gameState.currentPlayerIndex === 0 && selectedCards.length > 0 && (
                      <div className="text-xs mt-1">
                        {selectedCards.length} card{selectedCards.length > 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>
                )}
                {gameState.gamePhase === 'finished' && (
                  <div className="font-bold text-green-300">Game Over!</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Human player at bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="text-center max-w-4xl">
              {/* Player name */}
              <div className={`font-bold mb-3 text-lg ${
                gameState.currentPlayerIndex === 0 
                  ? 'text-yellow-300 drop-shadow-lg' 
                  : 'text-white'
              }`}>
                {humanPlayer.name}
                {gameState.currentPlayerIndex === 0 && (
                  <div className="text-sm text-yellow-200 opacity-75">Your turn</div>
                )}
              </div>
              
              {/* Face-down cards */}
              {humanPlayer.faceDownCards.length > 0 && (
                <div className="flex justify-center gap-2 mb-2">
                  {humanPlayer.faceDownCards.map((_, cardIndex) => (
                    <div
                      key={`human-down-${cardIndex}`}
                      className="w-12 h-18 bg-blue-800 border-2 border-blue-600 rounded-lg cursor-pointer hover:scale-105 transition-all shadow-lg"
                      onClick={() => playFaceDownCard(cardIndex)}
                    />
                  ))}
                </div>
              )}
              
              {/* Face-up cards */}
              {humanPlayer.faceUpCards.length > 0 && (
                <div className="flex justify-center gap-2 mb-3">
                  {humanPlayer.faceUpCards.map((card, cardIndex) => (
                    <Card
                      key={`human-up-${cardIndex}`}
                      card={card}
                      onClick={() => handleCardClick(card, 'faceUp')}
                      selected={selectedCards.some(c => c.id === card.id)}
                      className="w-12 h-18 hover:scale-105 hover:-translate-y-2 transition-all shadow-lg"
                      disabled={humanPlayer.hand.length > 0 || gameState.currentPlayerIndex !== 0}
                    />
                  ))}
                </div>
              )}
              
              {/* Player's hand */}
              <div className="flex justify-center" style={{ minHeight: '80px' }}>
                {humanPlayer.hand.map((card, index) => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(card, 'hand')}
                    selected={selectedCards.some(c => c.id === card.id)}
                    className="w-14 h-20 hover:scale-110 hover:-translate-y-4 transition-all shadow-lg cursor-pointer"
                    style={{
                      transform: `rotate(${(index - humanPlayer.hand.length / 2) * 4}deg)`,
                      zIndex: selectedCards.some(c => c.id === card.id) ? 100 : index,
                      marginLeft: index > 0 ? '-8px' : '0'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Game controls */}
        <div className="absolute top-4 right-4">
          <div className="flex flex-col gap-2">
            {gameState.gamePhase === 'swapping' && (
              <button
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105"
              >
                Start Game
              </button>
            )}
            
            {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0 && (
              <div className="flex flex-col gap-2">
                {selectedCards.length > 0 && (
                  <button
                    onClick={playCards}
                    disabled={!canPlaySelected}
                    className={`px-6 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 ${
                      canPlaySelected
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Play Cards ({selectedCards.length})
                  </button>
                )}
                
                {!canPlayAnyCard && (
                  <button
                    onClick={pickupCards}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105"
                  >
                    Pick Up Pile
                  </button>
                )}
              </div>
            )}
            
            {gameState.gamePhase === 'finished' && (
              <button
                onClick={dealCards}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105"
              >
                New Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;