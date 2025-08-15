import React from 'react';
import { useMultiplayer } from './hooks/useMultiplayer';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MultiplayerGame } from './components/MultiplayerGame';
import { canPlayCard, getEffectiveTopCard } from './utils/cardUtils';
import { Card } from './types/game';

function App() {
  const {
    playerId,
    playerName,
    setPlayerName,
    currentRoom,
    roomPlayers,
    gameState,
    availableRooms,
    isConnected,
    selectedCards,
    setSelectedCards,
    createRoom,
    joinRoom,
    leaveRoom,
    fetchAvailableRooms,
    dealCards,
    playCards,
    pickupCards,
    playFaceDownCard,
    confirmFaceUpCards,
    startGame
  } = useMultiplayer();

  // Handle card clicks
  const handleCardClick = React.useCallback((card: Card, source: 'hand' | 'faceUp') => {
    if (!gameState) return;
    
    const humanPlayer = gameState.players.find(p => p.id === playerId);
    if (!humanPlayer) return;

    if (gameState.gamePhase === 'setup' && gameState.currentPlayerIndex === 0) {
      // Handle choosing face-up cards from hand
      if (source === 'hand') {
        if (humanPlayer.faceUpCards.length >= 3) return;
        
        // Move card from hand to face-up (this would need to be handled by the host)
        // For now, just update local selection
        setSelectedCards(prev => {
          const isSelected = prev.some(c => c.id === card.id);
          if (isSelected) {
            return prev.filter(c => c.id !== card.id);
          } else if (prev.length < 3 - humanPlayer.faceUpCards.length) {
            return [...prev, card];
          }
          return prev;
        });
      }
    } else if (gameState.gamePhase === 'playing') {
      // Handle card selection for playing
      if (source === 'faceUp' && humanPlayer.hand.length > 0) return;
      
      setSelectedCards(prev => {
        const isSelected = prev.some(c => c.id === card.id);
        if (isSelected) {
          return prev.filter(c => c.id !== card.id);
        } else {
          // Only allow selecting cards of the same rank
          if (prev.length === 0 || prev[0].rank === card.rank) {
            return [...prev, card];
          }
          return [card]; // Start new selection
        }
      });
    }
  }, [gameState, playerId, setSelectedCards]);
}

  // Check if selected cards can be played
  const canPlaySelected = React.useMemo(() => {
  // Check if player can play any card
  const canPlayAnyCard = React.useMemo(() => {
    if (!gameState) return true;
    
    const humanPlayer = gameState.players.find(p => p.id === playerId);
    if (!humanPlayer) return true;
    
    const topCard = getEffectiveTopCard(gameState.pile);
    
    // Check if any card in hand can be played
    const canPlayFromHand = humanPlayer.hand.some(card => canPlayCard(card, topCard));
    
    // Check if any face-up card can be played (when hand is empty)
    const canPlayFromFaceUp = humanPlayer.hand.length === 0 && 
                              humanPlayer.faceUpCards.some(card => canPlayCard(card, topCard));
    
    return canPlayFromHand || canPlayFromFaceUp;
  }, [gameState, playerId]);
    if (!gameState || selectedCards.length === 0) return false;
  // Show lobby if not in a game
  if (!gameState || gameState.gamePhase === 'setup') {
    return (
      <MultiplayerLobby
        playerName={playerName}
        setPlayerName={setPlayerName}
        availableRooms={availableRooms}
        currentRoom={currentRoom}
        roomPlayers={roomPlayers}
        isConnected={isConnected}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onLeaveRoom={leaveRoom}
        onRefreshRooms={fetchAvailableRooms}
        onStartGame={dealCards}
        playerId={playerId}
      />
    );
  }
    const topCard = getEffectiveTopCard(gameState.pile);
  // Show game
  return (
    <MultiplayerGame
      gameState={gameState}
      roomPlayers={roomPlayers}
      playerId={playerId}
      selectedCards={selectedCards}
      onCardClick={handleCardClick}
      onPlayCards={() => playCards(selectedCards)}
      onPickupCards={pickupCards}
      onPlayFaceDownCard={playFaceDownCard}
      onConfirmFaceUpCards={confirmFaceUpCards}
      onStartGame={startGame}
      onLeaveRoom={leaveRoom}
      canPlaySelected={canPlaySelected}
      canPlayAnyCard={canPlayAnyCard}
    />
  );
    return canPlayCard(selectedCards[0], topCard);
  }, [selectedCards, gameState]);
export default App;