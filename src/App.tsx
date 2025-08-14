import React from 'react';
import { useGame } from './hooks/useGame';
import { Card } from './components/Card';
import { GameOverModal } from './components/GameOverModal';
import { Volume2, VolumeX, RotateCcw, Play } from 'lucide-react';
import { soundManager } from './utils/soundManager';

function App() {
  // Debug log to see if component is rendering
  console.log('App component rendering');
  
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

  const [soundEnabled, setSoundEnabled] = React.useState(soundManager.isEnabled());

  const toggleSound = () => {
    soundManager.toggle();
    setSoundEnabled(soundManager.isEnabled());
  };

  const humanPlayer = gameState.players[0];
  const aiPlayers = gameState.players.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-red-700 relative overflow-hidden">
      {/* Table surface effect */}
      <div className="absolute inset-0 bg-gradient-radial from-orange-300 via-red-500 to-red-800 opacity-80"></div>
      
      {/* Game Controls - Top Left */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-4 text-white border-2 border-yellow-400 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-xl font-bold text-yellow-400">Shithead</h1>
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-yellow-500 bg-opacity-40 hover:bg-opacity-60 transition-all"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
          
          <div className="text-sm space-y-1 mb-3">
            <div>Phase: <span className="text-yellow-300">{gameState.gamePhase === 'setup' ? 'Setup' : 
                         gameState.gamePhase === 'swapping' ? 'Swapping' : 
                         gameState.gamePhase === 'playing' ? 'Playing' : 'Finished'}</span></div>
            <div>Current: <span className="text-yellow-300">{gameState.players[gameState.currentPlayerIndex]?.name}</span></div>
          </div>

          {/* Action Buttons */}
          {gameState.gamePhase === 'setup' && humanPlayer.hand.length === 0 && (
            <button
              onClick={dealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all w-full shadow-lg"
            >
              <RotateCcw size={16} />
              Deal Cards
            </button>
          )}
          
          {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
            <button
              onClick={confirmFaceUpCards}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all w-full shadow-lg"
            >
              Confirm Cards
            </button>
          )}
          
          {gameState.gamePhase === 'swapping' && (
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all w-full shadow-lg"
            >
              <Play size={16} />
              Start Game
            </button>
          )}
        </div>
      </div>

      {/* Game Rules - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-4 text-white border-2 border-yellow-400 max-w-xs shadow-2xl">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">Special Cards</h3>
          <div className="text-sm space-y-1">
            <div>• <span className="text-yellow-300 font-bold">2</span> can be played on anything</div>
            <div>• <span className="text-yellow-300 font-bold">7</span> forces next card ≤ 7</div>
            <div>• <span className="text-yellow-300 font-bold">10</span> clears the pile</div>
            <div>• <span className="text-yellow-300 font-bold">4 same rank</span> burns pile</div>
          </div>
        </div>
      </div>

      {/* Top Player (AI 1) */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-center mb-6">
          <div className={`inline-block px-6 py-3 rounded-full border-3 shadow-lg ${
            gameState.currentPlayerIndex === 1 
              ? 'bg-yellow-400 border-yellow-300 text-black shadow-yellow-400/50' 
              : 'bg-blue-600 border-blue-400 text-white shadow-blue-600/50'
          }`}>
            <div className="font-bold text-lg">{aiPlayers[0]?.name || 'AI 1'}</div>
            <div className="text-sm opacity-90">{aiPlayers[0]?.hand.length || 0} cards</div>
          </div>
        </div>
        
        {/* Cards held up in fan formation */}
        <div className="flex justify-center items-end" style={{ height: '120px' }}>
          {aiPlayers[0]?.hand.slice(0, 8).map((_, index) => {
            const totalCards = Math.min(aiPlayers[0]?.hand.length || 0, 8);
            const centerIndex = (totalCards - 1) / 2;
            const angleStep = Math.min(12, 80 / Math.max(totalCards - 1, 1));
            const angle = (index - centerIndex) * angleStep;
            const yOffset = Math.abs(index - centerIndex) * 4;
            
            return (
              <Card
                key={`top-hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                className="w-14 h-20 shadow-xl"
                style={{
                  transform: `rotate(${angle + 180}deg) translateY(${yOffset}px)`,
                  marginLeft: index > 0 ? '-12px' : '0',
                  zIndex: totalCards - Math.abs(index - centerIndex)
                }}
              />
            );
          })}
          {(aiPlayers[0]?.hand.length || 0) > 8 && (
            <div className="ml-2 text-white text-sm bg-black bg-opacity-60 px-2 py-1 rounded-full">
              +{(aiPlayers[0]?.hand.length || 0) - 8}
            </div>
          )}
        </div>
      </div>

      {/* Left Player (AI 2) */}
      <div className="absolute left-12 top-1/2 transform -translate-y-1/2 z-10">
        <div className="text-center mb-6">
          <div className={`inline-block px-6 py-3 rounded-full border-3 shadow-lg ${
            gameState.currentPlayerIndex === 2 
              ? 'bg-yellow-400 border-yellow-300 text-black shadow-yellow-400/50' 
              : 'bg-blue-600 border-blue-400 text-white shadow-blue-600/50'
          }`}>
            <div className="font-bold text-lg">{aiPlayers[1]?.name || 'AI 2'}</div>
            <div className="text-sm opacity-90">{aiPlayers[1]?.hand.length || 0} cards</div>
          </div>
        </div>
        
        {/* Cards held up in fan formation - rotated for left side */}
        <div className="flex flex-col items-center" style={{ width: '120px' }}>
          {aiPlayers[1]?.hand.slice(0, 8).map((_, index) => {
            const totalCards = Math.min(aiPlayers[1]?.hand.length || 0, 8);
            const centerIndex = (totalCards - 1) / 2;
            const angleStep = Math.min(12, 80 / Math.max(totalCards - 1, 1));
            const angle = (index - centerIndex) * angleStep;
            const xOffset = Math.abs(index - centerIndex) * 4;
            
            return (
              <Card
                key={`left-hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                className="w-14 h-20 shadow-xl"
                style={{
                  transform: `rotate(${angle - 90}deg) translateX(${xOffset}px)`,
                  marginTop: index > 0 ? '-12px' : '0',
                  zIndex: totalCards - Math.abs(index - centerIndex)
                }}
              />
            );
          })}
          {(aiPlayers[1]?.hand.length || 0) > 8 && (
            <div className="mt-2 text-white text-sm bg-black bg-opacity-60 px-2 py-1 rounded-full">
              +{(aiPlayers[1]?.hand.length || 0) - 8}
            </div>
          )}
        </div>
      </div>

      {/* Right Player (AI 3) */}
      <div className="absolute right-12 top-1/2 transform -translate-y-1/2 z-10">
        <div className="text-center mb-6">
          <div className={`inline-block px-6 py-3 rounded-full border-3 shadow-lg ${
            gameState.currentPlayerIndex === 3 
              ? 'bg-yellow-400 border-yellow-300 text-black shadow-yellow-400/50' 
              : 'bg-blue-600 border-blue-400 text-white shadow-blue-600/50'
          }`}>
            <div className="font-bold text-lg">{aiPlayers[2]?.name || 'AI 3'}</div>
            <div className="text-sm opacity-90">{aiPlayers[2]?.hand.length || 0} cards</div>
          </div>
        </div>
        
        {/* Cards held up in fan formation - rotated for right side */}
        <div className="flex flex-col items-center" style={{ width: '120px' }}>
          {aiPlayers[2]?.hand.slice(0, 8).map((_, index) => {
            const totalCards = Math.min(aiPlayers[2]?.hand.length || 0, 8);
            const centerIndex = (totalCards - 1) / 2;
            const angleStep = Math.min(12, 80 / Math.max(totalCards - 1, 1));
            const angle = (index - centerIndex) * angleStep;
            const xOffset = -Math.abs(index - centerIndex) * 4;
            
            return (
              <Card
                key={`right-hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                className="w-14 h-20 shadow-xl"
                style={{
                  transform: `rotate(${angle + 90}deg) translateX(${xOffset}px)`,
                  marginTop: index > 0 ? '-12px' : '0',
                  zIndex: totalCards - Math.abs(index - centerIndex)
                }}
              />
            );
          })}
          {(aiPlayers[2]?.hand.length || 0) > 8 && (
            <div className="mt-2 text-white text-sm bg-black bg-opacity-60 px-2 py-1 rounded-full">
              +{(aiPlayers[2]?.hand.length || 0) - 8}
            </div>
          )}
        </div>
      </div>

      {/* Center Area - Pile and Deck */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="flex items-center gap-12">
          {/* Deck */}
          <div className="text-center">
            <div className="text-white text-lg mb-3 font-bold drop-shadow-lg">Deck</div>
            <div className="relative">
              {gameState.deck.length > 0 ? (
                <>
                  <Card card={{ suit: 'hearts', rank: 2, id: 'deck-back' }} faceDown={true} className="w-20 h-28 shadow-2xl" />
                  <div className="absolute -top-1 -left-1 w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500 rounded-lg -z-10 shadow-xl" />
                  <div className="absolute -top-2 -left-2 w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500 rounded-lg -z-20 shadow-lg" />
                </>
              ) : (
                <div className="w-20 h-28 border-3 border-dashed border-yellow-400 rounded-lg flex items-center justify-center text-yellow-400 text-sm font-bold shadow-lg">
                  Empty
                </div>
              )}
            </div>
            <div className="text-white text-sm mt-2 font-bold drop-shadow">{gameState.deck.length} cards</div>
          </div>

          {/* Pile */}
          <div className="text-center">
            <div className="text-white text-lg mb-3 font-bold drop-shadow-lg">Pile</div>
            <div className="relative">
              {gameState.pile.length > 0 ? (
                <Card card={gameState.pile[gameState.pile.length - 1]} className="w-20 h-28 shadow-2xl" />
              ) : (
                <div className="w-20 h-28 border-3 border-dashed border-yellow-400 rounded-lg flex items-center justify-center text-yellow-400 text-sm font-bold shadow-lg">
                  Empty
                </div>
              )}
            </div>
            <div className="text-white text-sm mt-2 font-bold drop-shadow">{gameState.pile.length} cards</div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Center */}
      {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0 && (
        <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex gap-6">
            {selectedCards.length > 0 && (
              <button
                onClick={playCards}
                disabled={!canPlaySelected}
                className={`px-8 py-4 rounded-xl font-bold text-xl transition-all border-3 shadow-2xl ${
                  canPlaySelected
                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-400 transform hover:scale-110 shadow-green-600/50'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-500'
                }`}
              >
                Play Cards ({selectedCards.length})
              </button>
            )}
            
            {selectedCards.length === 0 && !canPlayAnyCard && gameState.pile.length > 0 && (
              <button
                onClick={pickupCards}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all border-3 border-red-400 transform hover:scale-110 shadow-2xl shadow-red-600/50"
              >
                Pick up Cards ({gameState.pile.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Player (Human) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-center mb-6">
          <div className={`inline-block px-6 py-3 rounded-full border-3 shadow-lg ${
            gameState.currentPlayerIndex === 0 
              ? 'bg-yellow-400 border-yellow-300 text-black shadow-yellow-400/50' 
              : 'bg-blue-600 border-blue-400 text-white shadow-blue-600/50'
          }`}>
            <div className="font-bold text-lg">{humanPlayer.name}</div>
            <div className="text-sm opacity-90">
              {gameState.gamePhase === 'setup' ? 'Choose face-up cards' : 
               gameState.gamePhase === 'swapping' ? 'Swap cards if needed' : 'Your turn'}
            </div>
          </div>
        </div>

        {/* Face Down Cards */}
        {humanPlayer.faceDownCards.length > 0 && (
          <div className="flex justify-center gap-3 mb-3">
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
                className={`w-16 h-24 shadow-xl ${
                  humanPlayer.hand.length === 0 && 
                  humanPlayer.faceUpCards.length === 0 && 
                  gameState.currentPlayerIndex === 0 && 
                  gameState.gamePhase === 'playing'
                    ? 'cursor-pointer hover:scale-110 hover:-translate-y-2'
                    : ''
                }`}
              />
            ))}
          </div>
        )}

        {/* Face Up Cards */}
        <div className="flex justify-center gap-3 mb-3">
          {humanPlayer.faceUpCards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card, 'faceUp')}
              selected={selectedCards.some(c => c.id === card.id)}
              disabled={humanPlayer.hand.length > 0 && gameState.gamePhase === 'playing'}
              className="w-16 h-24 shadow-xl"
            />
          ))}
          {/* Empty slots during setup */}
          {gameState.gamePhase === 'setup' && Array.from({ length: 3 - humanPlayer.faceUpCards.length }).map((_, index) => (
            <div key={`empty-${index}`} className="w-16 h-24 border-3 border-dashed border-yellow-400 rounded-lg flex items-center justify-center text-yellow-400 text-sm font-bold shadow-lg">
              Empty
            </div>
          ))}
        </div>

        {/* Hand - Fan formation */}
        {humanPlayer.hand.length > 0 && (
          <div className="flex justify-center items-end" style={{ height: '140px' }}>
            {humanPlayer.hand.map((card, index) => {
              const totalCards = humanPlayer.hand.length;
              const centerIndex = (totalCards - 1) / 2;
              const angleStep = Math.min(15, 120 / Math.max(totalCards - 1, 1));
              const angle = (index - centerIndex) * angleStep;
              const yOffset = Math.abs(index - centerIndex) * 6;
              
              return (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleCardClick(card, 'hand')}
                  selected={selectedCards.some(c => c.id === card.id)}
                  disabled={gameState.gamePhase !== 'playing' && gameState.gamePhase !== 'swapping' && gameState.gamePhase !== 'setup'}
                  className="w-16 h-24 shadow-2xl"
                  style={{
                    transform: `rotate(${angle}deg) translateY(${yOffset}px)`,
                    marginLeft: index > 0 ? '-14px' : '0',
                    zIndex: selectedCards.some(c => c.id === card.id) ? 100 : totalCards - Math.abs(index - centerIndex)
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      <GameOverModal
        winner={gameState.winner}
        loser={gameState.loser}
        players={gameState.players}
        onNewGame={dealCards}
      />
    </div>
  );
}

export default App;