import React from 'react';
import { useGame } from './hooks/useGame';
import { GameTable } from './components/GameTable';
import { GameControls } from './components/GameControls';
import { GameOverModal } from './components/GameOverModal';
import './index.css';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Game Table */}
      <GameTable
        gameState={gameState}
        selectedCards={selectedCards}
        onCardClick={handleCardClick}
        onPlayFaceDownCard={playFaceDownCard}
        canPlayAnyCard={canPlayAnyCard}
      />

      {/* Game Controls */}
      <GameControls
        gameState={gameState}
        selectedCards={selectedCards}
        onDealCards={dealCards}
        onConfirmFaceUpCards={confirmFaceUpCards}
        onStartGame={startGame}
        onPlayCards={playCards}
        onPickupCards={pickupCards}
        canPlaySelected={canPlaySelected}
        canPlayAnyCard={canPlayAnyCard}
      />

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