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
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900">
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