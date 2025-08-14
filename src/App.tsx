import React from 'react';
import { useGame } from './hooks/useGame';
import { GameTable } from './components/GameTable';
import { GameControls } from './components/GameControls';
import { GameOverModal } from './components/GameOverModal';

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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-red-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />
      </div>

      <GameTable
        gameState={gameState}
        selectedCards={selectedCards}
        onCardClick={handleCardClick}
        onPlayFaceDownCard={playFaceDownCard}
        canPlayAnyCard={canPlayAnyCard}
      />

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

      {gameState.gamePhase === 'finished' && (
        <GameOverModal
          winner={gameState.winner}
          loser={gameState.loser}
          players={gameState.players}
          onNewGame={dealCards}
        />
      )}
    </div>
  );
}

export default App;