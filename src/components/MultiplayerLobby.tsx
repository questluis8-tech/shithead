import React from 'react';
import { supabase } from '../lib/supabase';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { Card } from './Card';
import { canPlayCard, getEffectiveTopCard, shouldBurn } from '../utils/cardUtils';
import { musicManager } from '../utils/musicManager';
interface MultiplayerLobbyProps {
  onBackToMenu: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onBackToMenu
}) => {
  const [showFireEffect, setShowFireEffect] = React.useState(false);
  const [showPickupEffect, setShowPickupEffect] = React.useState(false);
  
  const { 
    playerName, 
    setPlayerName, 
    createRoom, 
    joinRoom,
    fetchAvailableRooms,
    availableRooms,
    currentRoom, 
    isConnected, 
    roomPlayers,
    startGame,
    playerId,
    leaveRoom
  } = useMultiplayer();
  const [roomName, setRoomName] = React.useState('');
  const [selectedCards, setSelectedCards] = React.useState([]);
  const [isClosingRooms, setIsClosingRooms] = React.useState(false);
  const [musicEnabled, setMusicEnabled] = React.useState(musicManager.isActive());
  const [musicMuted, setMusicMuted] = React.useState(false);

  // Handle card clicks for setup phase
  const handleCardClick = React.useCallback(async (card, source) => {
    if (!currentRoom?.game_state) {
      return;
    }

    const humanPlayer = currentRoom.game_state.players.find(p => p.id === playerId);
    if (!humanPlayer) return;

    if (currentRoom.game_state.gamePhase === 'setup' && source === 'hand') {
      // Create new game state
      const newGameState = { ...currentRoom.game_state };
      const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
      const player = { ...newGameState.players[playerIndex] };
      
      // Move card from hand to face-up (if we have less than 3 face-up cards)
      if (player.faceUpCards.length >= 3) return;
      
      const handIndex = player.hand.findIndex(c => c.id === card.id);
      if (handIndex !== -1) {
        const cardToMove = player.hand.splice(handIndex, 1)[0];
        player.faceUpCards.push(cardToMove);
      }
      
      // Update the player in the game state
      newGameState.players[playerIndex] = player;

      try {
        // Save updated game state to database
        const { error } = await supabase
          .from('game_rooms')
          .update({ game_state: newGameState })
          .eq('id', currentRoom.id);

        if (error) {
          console.error('Error updating game state:', error);
        }
      } catch (error) {
        console.error('Error updating game state:', error);
      }
    } else if (currentRoom.game_state.gamePhase === 'setup' && source === 'faceUp') {
      // Create new game state
      const newGameState = { ...currentRoom.game_state };
      const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
      const player = { ...newGameState.players[playerIndex] };
      
      // Move card back from face-up to hand
      const faceUpIndex = player.faceUpCards.findIndex(c => c.id === card.id);
      if (faceUpIndex !== -1) {
        const cardToMove = player.faceUpCards.splice(faceUpIndex, 1)[0];
        player.hand.push(cardToMove);
      }
      
      // Update the player in the game state
      newGameState.players[playerIndex] = player;

      try {
        // Save updated game state to database
        const { error } = await supabase
          .from('game_rooms')
          .update({ game_state: newGameState })
          .eq('id', currentRoom.id);

        if (error) {
          console.error('Error updating game state:', error);
        }
      } catch (error) {
        console.error('Error updating game state:', error);
      }
    } else if (currentRoom.game_state.gamePhase === 'playing') {
      // Handle card selection for playing
      const currentPlayerIndex = currentRoom.game_state.players.findIndex(p => p.id === playerId);
      
      // Only allow card selection if it's the player's turn
      if (currentRoom.game_state.currentPlayerIndex !== currentPlayerIndex) {
        return;
      }
      
      // Can't play face-up cards if hand is not empty
      if (source === 'faceUp' && humanPlayer.hand.length > 0) {
        return;
      }
      
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
  }, [currentRoom, playerId, selectedCards]);

  const handleCreateRoom = () => {
    console.log('Create room clicked with:', { playerName, roomName });
    createRoom(roomName, 4);
  };

  // Add logging to see state changes
  React.useEffect(() => {
    console.log('Room state changed:', { currentRoom, isConnected });
  }, [currentRoom, isConnected]);

  // Fetch available rooms when component mounts
  React.useEffect(() => {
    fetchAvailableRooms();
  }, [fetchAvailableRooms]);

  // Function to close all available rooms
  const closeAllRooms = React.useCallback(async () => {
    setIsClosingRooms(true);
    try {
      // Update all waiting rooms to finished status
      const { error } = await supabase
        .from('game_rooms')
        .update({ status: 'finished' })
        .eq('status', 'waiting');

      if (error) {
        console.error('Error closing rooms:', error);
        alert('Failed to close rooms: ' + error.message);
      } else {
        console.log('All waiting rooms closed successfully');
        // Refresh the available rooms list
        fetchAvailableRooms();
      }
    } catch (error) {
      console.error('Error closing rooms:', error);
      alert('Failed to close rooms: ' + error.message);
    } finally {
      setIsClosingRooms(false);
    }
  }, [fetchAvailableRooms]);

  // Check if current player is the host
  const isHost = currentRoom && roomPlayers.some(player => 
    player.player_id === playerId && player.is_host
  );

  // Show game starting state
  if (currentRoom?.status === 'playing') {
    // Check if game state is loaded
    if (currentRoom.game_state && currentRoom.game_state.players && currentRoom.game_state.players.length > 0) {
      // Find the human player from the game state
      const humanPlayer = currentRoom.game_state.players.find(p => p.id === playerId);
      
      if (!humanPlayer) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
            {/* Music Controls - Top Right */}
            <div className="absolute top-4 right-4 z-20">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (!musicEnabled) {
                      musicManager.start();
                      setMusicEnabled(true);
                    } else {
                      musicManager.toggleMute();
                      setMusicMuted(musicManager.isMuted());
                    }
                  }}
                  className="bg-black bg-opacity-50 backdrop-blur-sm p-3 rounded-lg text-white hover:bg-opacity-75 transition-all flex items-center gap-2"
                >
                  {!musicEnabled ? '🔇' : musicMuted ? '🔇' : '🎵'}
                  <span className="text-sm">Lo-Fi</span>
                </button>
                
                {/* Volume Control */}
                {musicEnabled && !musicMuted && (
                  <div className="bg-black bg-opacity-50 backdrop-blur-sm p-2 rounded-lg">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={musicManager.getVolume()}
                      onChange={(e) => musicManager.setVolume(parseFloat(e.target.value))}
                      className="w-16 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
              <h1 className="text-3xl font-bold text-white mb-6">Error</h1>
              <div className="text-white">Player not found in game state</div>
            </div>
          </div>
        );
      }
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative overflow-hidden">
          {/* Game Info Panel - Top Left */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs z-10">
            <h1 className="text-xl font-bold mb-2">Shithead (Multiplayer)</h1>
            <div className="text-sm space-y-1">
              <div>Phase: {
                currentRoom.game_state.gamePhase === 'setup' ? 'Choose Face-Up Cards' : 
                currentRoom.game_state.gamePhase === 'playing' ? 'Playing' :
                'Game Over'
              }</div>
              <div>Current: {currentRoom.game_state.players[currentRoom.game_state.currentPlayerIndex]?.name}</div>
              <div>Pile: {currentRoom.game_state.pile.length} cards</div>
            </div>
          </div>

          {/* Other Players - positioned around the table like single player */}
          {currentRoom.game_state.players.filter(p => p.id !== playerId).map((player, index) => {
            const totalOthers = currentRoom.game_state.players.length - 1;
            let position = '';
            
            if (totalOthers === 1) {
              // 2 players total - other player at top center
              position = 'absolute top-8 left-1/2 transform -translate-x-1/2';
            } else if (totalOthers === 2) {
              // 3 players total - one at top, one at left
              if (index === 0) position = 'absolute top-8 left-1/2 transform -translate-x-1/2';
              if (index === 1) position = 'absolute left-12 top-1/2 transform -translate-y-1/2';
            } else if (totalOthers === 3) {
              // 4 players total - top, left, right
              if (index === 0) position = 'absolute left-12 top-1/2 transform -translate-y-1/2';
              if (index === 1) position = 'absolute top-8 left-1/2 transform -translate-x-1/2';
              if (index === 2) position = 'absolute right-12 top-1/2 transform -translate-y-1/2';
            }
            
            return (
              <div key={player.id} className={position}>
                <div className="text-center mb-2">
                  <div className={`text-sm font-bold ${currentRoom.game_state.currentPlayerIndex === currentRoom.game_state.players.findIndex(p => p.id === player.id) ? 'text-yellow-300' : 'text-white'}`}>
                    {player.name}
                  </div>
                </div>
                
                {/* Player's cards - horizontal rows */}
                <div className="flex flex-col items-center gap-2">
                  {/* Face-down cards */}
                  <div className="flex gap-2">
                    {player.faceDownCards.map((_, cardIndex) => (
                      <Card
                        key={`${player.id}-down-${cardIndex}`}
                        card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                        faceDown={true}
                        playerColor="black"
                        className="w-14 h-20"
                      />
                    ))}
                  </div>
                  
                  {/* Face-up cards */}
                  <div className="flex gap-2">
                    {player.faceUpCards.map((card, cardIndex) => (
                      <Card
                        key={`${player.id}-up-${cardIndex}`}
                        card={card}
                        className="w-14 h-20"
                      />
                    ))}
                  </div>
                  
                  {/* Hand (face-down for other players) */}
                  <div className="flex gap-2">
                    {player.hand.slice(0, Math.min(6, player.hand.length)).map((_, cardIndex) => (
                      <Card
                        key={`${player.id}-hand-${cardIndex}`}
                        card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                        faceDown={true}
                        playerColor="black"
                        className="w-12 h-16"
                      />
                    ))}
                    {player.hand.length > 6 && (
                      <div className="w-12 h-16 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                        +{player.hand.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

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
            
            {/* Pile and Deck - Fixed position */}
            <div className="flex items-center justify-center gap-8 mb-8">
              {/* Pile */}
              <div className="text-center">
                <h3 className="text-white font-bold mb-2">Pile ({currentRoom.game_state.pile.length})</h3>
                <div className="w-20 h-28">
                  {currentRoom.game_state.pile.length === 0 ? (
                    <div className="w-full h-full border-2 border-dashed border-white rounded-lg flex items-center justify-center text-white text-xs">
                      Empty
                    </div>
                  ) : (
                    <div className="relative w-20 h-28 overflow-visible">
                      {/* Show last 3 cards with specific positioning */}
                      {currentRoom.game_state.pile.slice(-3).map((card, index) => (
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
                <h3 className="text-white font-bold mb-2">Deck ({currentRoom.game_state.deck.length})</h3>
                <div className="w-20 h-28">
                  {currentRoom.game_state.deck.length > 0 ? (
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
                {/* Setup Phase - Confirm Face-Up Cards */}
                {currentRoom.game_state.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
                  <>
                    {(!currentRoom.game_state.playersReady || !currentRoom.game_state.playersReady.includes(playerId)) ? (
                      <button
                        onClick={async () => {
                          const newGameState = { ...currentRoom.game_state };
                          
                          // Add a "ready" flag to track which players have confirmed
                          if (!newGameState.playersReady) {
                            newGameState.playersReady = [];
                          }
                          if (!newGameState.playersReady.includes(playerId)) {
                            newGameState.playersReady.push(playerId);
                          }
                          
                          // Check if all players are ready
                          if (newGameState.playersReady.length === newGameState.players.length) {
                            // Move directly to playing phase
                            newGameState.gamePhase = 'playing';
                            newGameState.currentPlayerIndex = 0;
                          }
                          
                          try {
                            const { error } = await supabase
                              .from('game_rooms')
                              .update({ game_state: newGameState })
                              .eq('id', currentRoom.id);

                            if (error) {
                              console.error('Error updating game state:', error);
                            }
                          } catch (error) {
                            console.error('Error updating game state:', error);
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                      >
                        Confirm Face-Up Cards
                      </button>
                    ) : (
                      <div className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold text-center">
                        Waiting for other players...
                      </div>
                    )}
                  </>
                )}
                
                {/* Playing Phase - Game started message */}
                {currentRoom.game_state.gamePhase === 'playing' && (
                  <>
                    {/* Play Cards button */}
                    {currentRoom.game_state.currentPlayerIndex === currentRoom.game_state.players.findIndex(p => p.id === playerId) && selectedCards.length > 0 && (
                      <button
                        onClick={async () => {
                          const topCard = getEffectiveTopCard(currentRoom.game_state.pile);
                          const canPlay = canPlayCard(selectedCards[0], topCard);
                          
                          if (!canPlay) {
                            alert("Can't play those cards!");
                            return;
                          }
                          
                          // Play the cards
                          const newGameState = { ...currentRoom.game_state };
                          const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
                          const player = { ...newGameState.players[playerIndex] };
                          let newDeck = [...newGameState.deck];
                          
                          // Remove played cards from player's hand/faceUp cards
                          selectedCards.forEach(card => {
                            const handIndex = player.hand.findIndex(c => c.id === card.id);
                            const faceUpIndex = player.faceUpCards.findIndex(c => c.id === card.id);
                            
                            if (handIndex !== -1) {
                              player.hand.splice(handIndex, 1);
                            } else if (faceUpIndex !== -1) {
                              player.faceUpCards.splice(faceUpIndex, 1);
                            }
                          });
                          
                          // Draw cards to maintain 3 in hand (if deck has cards)
                          const cardsToDraw = Math.min(3 - player.hand.length, newDeck.length);
                          for (let i = 0; i < cardsToDraw; i++) {
                            const drawnCard = newDeck.shift();
                            if (drawnCard) {
                              player.hand.push(drawnCard);
                            }
                          }
                          
                          // Add cards to pile
                          const newPile = [...newGameState.pile, ...selectedCards];
                          
                          // Check for special effects
                          let burnPile = false;
                          if (shouldBurn(newPile)) {
                            burnPile = true;
                          }
                          
                          // Check for 10 (clears pile)
                          const hasTen = selectedCards.some(card => card.rank === 10);
                          
                          // Update player in game state
                          newGameState.players[playerIndex] = player;
                          newGameState.deck = newDeck;
                          
                          if (hasTen || burnPile) {
                            // Clear pile and same player goes again
                            newGameState.pile = [];
                            
                            // Show fire effect
                            setShowFireEffect(true);
                            setTimeout(() => setShowFireEffect(false), 1500);
                            
                            // Don't change currentPlayerIndex - same player continues
                          } else {
                            // Normal play - add to pile and next player
                            newGameState.pile = newPile;
                            newGameState.currentPlayerIndex = (newGameState.currentPlayerIndex + 1) % newGameState.players.length;
                          }
                          
                          // Check win condition
                          const hasWon = player.hand.length === 0 && 
                                         player.faceUpCards.length === 0 && 
                                         player.faceDownCards.length === 0;
                          
                          if (hasWon) {
                            newGameState.gamePhase = 'finished';
                            newGameState.winner = playerId;
                          }
                          
                          try {
                            const { error } = await supabase
                              .from('game_rooms')
                              .update({ game_state: newGameState })
                              .eq('id', currentRoom.id);

                            if (error) {
                              console.error('Error playing cards:', error);
                            } else {
                              setSelectedCards([]);
                            }
                          } catch (error) {
                            console.error('Error playing cards:', error);
                          }
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                      >
                        Play Cards ({selectedCards.length})
                      </button>
                    )}
                    
                    {/* Pick up cards button */}
                    {(() => {
                      // Only show if it's player's turn and no cards selected
                      if (currentRoom.game_state.currentPlayerIndex !== currentRoom.game_state.players.findIndex(p => p.id === playerId) || 
                          selectedCards.length > 0 || 
                          currentRoom.game_state.pile.length === 0) {
                        return null;
                      }
                      
                      // Check if player can play any cards
                      const topCard = getEffectiveTopCard(currentRoom.game_state.pile);
                      const canPlayFromHand = humanPlayer.hand.some(card => canPlayCard(card, topCard));
                      const canPlayFromFaceUp = humanPlayer.hand.length === 0 && 
                                                humanPlayer.faceUpCards.some(card => canPlayCard(card, topCard));
                      
                      if (canPlayFromHand || canPlayFromFaceUp) {
                        return null; // Don't show pickup if player can play cards
                      }
                      
                      return (
                        <button
                          onClick={async () => {
                            // Player must pick up pile
                            const newGameState = { ...currentRoom.game_state };
                            const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
                            const player = { ...newGameState.players[playerIndex] };
                            
                            // Show pickup effect
                            setShowPickupEffect(true);
                            setTimeout(() => setShowPickupEffect(false), 1500);
                            
                            // Add all pile cards to hand
                            player.hand = [...player.hand, ...newGameState.pile];
                            
                            // Update game state
                            newGameState.players[playerIndex] = player;
                            newGameState.pile = [];
                            newGameState.currentPlayerIndex = (newGameState.currentPlayerIndex + 1) % newGameState.players.length;
                            
                            try {
                              const { error } = await supabase
                                .from('game_rooms')
                                .update({ game_state: newGameState })
                                .eq('id', currentRoom.id);

                              if (error) {
                                console.error('Error picking up cards:', error);
                              }
                            } catch (error) {
                              console.error('Error picking up cards:', error);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                        >
                          Your turn! Pick up Cards ({currentRoom.game_state.pile.length})
                        </button>
                      );
                    })()}
                    
                    {/* Turn indicator - only show if not player's turn or if player can play cards */}
                    {(() => {
                      const isPlayerTurn = currentRoom.game_state.currentPlayerIndex === currentRoom.game_state.players.findIndex(p => p.id === playerId);
                      
                      if (!isPlayerTurn) {
                        return (
                          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-center">
                            {currentRoom.game_state.players[currentRoom.game_state.currentPlayerIndex]?.name}'s turn
                          </div>
                        );
                      }
                      
                      if (selectedCards.length > 0) {
                        return null; // Don't show turn indicator if cards are selected
                      }
                      
                     // Check if player is on face-down cards (last 3 cards)
                     if (humanPlayer.hand.length === 0 && humanPlayer.faceUpCards.length === 0 && humanPlayer.faceDownCards.length > 0) {
                       return (
                         <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-center">
                           Your turn! Choose a random card! Good Luck!
                         </div>
                       );
                     }
                     
                      // Check if player can play any cards
                      const topCard = getEffectiveTopCard(currentRoom.game_state.pile);
                      const canPlayFromHand = humanPlayer.hand.some(card => canPlayCard(card, topCard));
                      const canPlayFromFaceUp = humanPlayer.hand.length === 0 && 
                                                humanPlayer.faceUpCards.some(card => canPlayCard(card, topCard));
                      
                      if (canPlayFromHand || canPlayFromFaceUp) {
                        return (
                          <div className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-center">
                            Your turn! Select cards to play
                          </div>
                        );
                      }
                      
                      return null; // Don't show anything if player must pick up (pickup button handles this)
                    })()}
                  </>
                )}
                
                {/* Game Over */}
                {currentRoom.game_state.gamePhase === 'finished' && (
                  <div className="text-center">
                    <div className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold mb-4">
                      {currentRoom.game_state.winner === playerId ? 'You Won! 🏆' : 
                       `${currentRoom.game_state.players.find(p => p.id === currentRoom.game_state.winner)?.name} Won!`}
                    </div>
                    <button
                      onClick={() => {
                        leaveRoom();
                        onBackToMenu();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                    >
                      Back to Menu
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Human Player - Bottom */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="text-center mb-4">
              <div className={`text-lg font-bold ${currentRoom.game_state.currentPlayerIndex === currentRoom.game_state.players.findIndex(p => p.id === playerId) ? 'text-yellow-300' : 'text-white'}`}>
                You
              </div>
              {currentRoom.game_state.gamePhase === 'setup' && humanPlayer.faceUpCards.length < 3 && (
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
                        currentRoom.game_state.currentPlayerIndex === currentRoom.game_state.players.findIndex(p => p.id === playerId) && 
                        currentRoom.game_state.gamePhase === 'playing'
                          ? async () => {
                              // Play face-down card
                              const newGameState = { ...currentRoom.game_state };
                              const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
                              const player = { ...newGameState.players[playerIndex] };
                              
                              // Remove the face-down card
                              const revealedCard = player.faceDownCards.splice(index, 1)[0];
                              
                              const topCard = getEffectiveTopCard(newGameState.pile);
                              
                              if (canPlayCard(revealedCard, topCard)) {
                                // Can play the card
                                newGameState.pile = [...newGameState.pile, revealedCard];
                                
                                // Check for special effects
                                const hasTen = revealedCard.rank === 10;
                                if (hasTen) {
                                  newGameState.pile = [];
                                  // Show fire effect for 10
                                  setShowFireEffect(true);
                                  setTimeout(() => setShowFireEffect(false), 1500);
                                  // Same player continues
                                } else {
                                  // Next player's turn
                                  newGameState.currentPlayerIndex = (newGameState.currentPlayerIndex + 1) % newGameState.players.length;
                                }
                                
                                // Check win condition
                                const hasWon = player.hand.length === 0 && 
                                               player.faceUpCards.length === 0 && 
                                               player.faceDownCards.length === 0;
                                
                                if (hasWon) {
                                  newGameState.gamePhase = 'finished';
                                  newGameState.winner = playerId;
                                }
                              } else {
                                // Can't play - pick up pile + revealed card
                                // Show pickup effect
                                setShowPickupEffect(true);
                                setTimeout(() => setShowPickupEffect(false), 1500);
                                
                                player.hand = [...player.hand, ...newGameState.pile, revealedCard];
                                newGameState.pile = [];
                                newGameState.currentPlayerIndex = (newGameState.currentPlayerIndex + 1) % newGameState.players.length;
                              }
                              
                              // Update player in game state
                              newGameState.players[playerIndex] = player;
                              
                              try {
                                const { error } = await supabase
                                  .from('game_rooms')
                                  .update({ game_state: newGameState })
                                  .eq('id', currentRoom.id);

                                if (error) {
                                  console.error('Error playing face-down card:', error);
                                }
                              } catch (error) {
                                console.error('Error playing face-down card:', error);
                              }
                            }
                          : undefined
                      }
                      className="w-16 h-24"
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
                    disabled={humanPlayer.hand.length > 0 && currentRoom.game_state.gamePhase === 'playing'}
                    className="w-16 h-24"
                  />
                ))}
                {/* Empty slots during setup */}
                {currentRoom.game_state.gamePhase === 'setup' && Array.from({ length: 3 - humanPlayer.faceUpCards.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="w-16 h-24 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    Empty
                  </div>
                ))}
              </div>

              {/* Hand */}
              {humanPlayer.hand.length > 0 && (
                <div className="flex gap-2 justify-center mb-2">
                  {humanPlayer.hand.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      onClick={() => handleCardClick(card, 'hand')}
                      selected={selectedCards.some(c => c.id === card.id)}
                      className="w-16 h-24"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leave button - top right */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => {
                leaveRoom();
                onBackToMenu();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all mt-20"
            >
              Leave
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
          <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4 text-center">
            <h1 className="text-3xl font-bold text-white mb-6">Loading Game...</h1>
            <div className="text-white">Game is starting, please wait...</div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
      {/* Music Controls - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => {
            if (!musicEnabled) {
              musicManager.start();
              setMusicEnabled(true);
            } else {
              musicManager.toggleMute();
              setMusicMuted(musicManager.isMuted());
            }
          }}
          className="bg-black bg-opacity-50 backdrop-blur-sm p-3 rounded-lg text-white hover:bg-opacity-75 transition-all flex items-center gap-2"
        >
          {!musicEnabled ? '🔇' : musicMuted ? '🔇' : '🎵'}
          <span className="text-sm">Lo-Fi</span>
        </button>
      </div>
      
      <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full mx-4">
        <h1 className="text-3xl font-bold text-white mb-6">Multiplayer Lobby</h1>
        
        {!currentRoom ? (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white text-sm font-bold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-bold mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter room name"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleCreateRoom}
                disabled={!playerName.trim() || !roomName.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all flex-1"
              >
                Create New Room
              </button>
              <button
                onClick={fetchAvailableRooms}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Refresh
              </button>
              <button
                onClick={closeAllRooms}
                disabled={isClosingRooms}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                {isClosingRooms ? 'Closing...' : 'Close All'}
              </button>
            </div>

            {/* Available Rooms */}
            {availableRooms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white text-lg font-bold mb-3">Available Rooms</h3>
                <div className="space-y-2">
                  {availableRooms.map((room) => (
                    <div key={room.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold">{room.name}</div>
                        <div className="text-gray-400 text-sm">
                          {room.current_players}/{room.max_players} players
                        </div>
                      </div>
                      <button
                        onClick={() => joinRoom(room.id)}
                        disabled={!playerName.trim() || room.current_players >= room.max_players}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold transition-all"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 bg-green-800 rounded-lg">
            <p className="text-white">Room "{currentRoom.name}" created successfully!</p>
            <p className="text-white text-sm">Room ID: {currentRoom.id}</p>
            
            <div className="mt-3">
              <p className="text-white font-bold mb-2">Players ({roomPlayers.length}/{currentRoom.max_players}):</p>
              <div className="space-y-1">
                {roomPlayers.map((player) => (
                  <div key={player.player_id} className="text-white text-sm">
                    {player.player_name} {player.is_host && '(Host)'}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Start Game button for host */}
            {isHost && roomPlayers.length >= 2 && (
              <div className="mt-4">
                <button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all w-full"
                >
                  Start Game
                </button>
              </div>
            )}
            
            {/* Leave Room button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  leaveRoom();
                  onBackToMenu();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all w-full"
              >
                Leave Room
              </button>
            </div>
            
            {/* Waiting for more players message */}
            {isHost && roomPlayers.length < 2 && (
              <div className="mt-4 p-3 bg-yellow-800 bg-opacity-50 rounded-lg">
                <p className="text-yellow-200 text-sm text-center">
                  Waiting for more players to join (minimum 2 players needed)
                </p>
              </div>
            )}
          </div>
        )}
        
        <button
          onClick={onBackToMenu}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all mt-4"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};