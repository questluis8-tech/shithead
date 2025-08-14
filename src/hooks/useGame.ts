import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Card } from '../types/game';
import { createDeck, canPlayCard, shouldBurn } from '../utils/cardUtils';

const createInitialPlayers = (): Player[] => [
  { id: 'human', name: 'You', hand: [], faceDownCards: [], faceUpCards: [], isAI: false },
  { id: 'ai1', name: 'Carol', hand: [], faceDownCards: [], faceUpCards: [], isAI: true },
  { id: 'ai2', name: 'Alice', hand: [], faceDownCards: [], faceUpCards: [], isAI: true },
  { id: 'ai3', name: 'Bob', hand: [], faceDownCards: [], faceUpCards: [], isAI: true }
];

const drawToThreeCards = (player: Player, deck: Card[]): { updatedPlayer: Player, updatedDeck: Card[] } => {
  const newPlayer = { ...player, hand: [...player.hand] };
  const newDeck = [...deck];
  
  const cardsToDraw = Math.min(3 - newPlayer.hand.length, newDeck.length);
  
  for (let i = 0; i < cardsToDraw; i++) {
    const drawnCard = newDeck.shift();
    if (drawnCard) {
      newPlayer.hand.push(drawnCard);
    }
  }
  
  return { updatedPlayer: newPlayer, updatedDeck: newDeck };
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: createInitialPlayers(),
    currentPlayerIndex: 0,
    pile: [],
    deck: [],
    gamePhase: 'setup',
    winner: null,
    loser: null
  });
  
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  // Debug keybind to clear hand and face-up cards
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '`' && gameState.gamePhase === 'playing') {
        setGameState(prev => {
          const newPlayers = prev.players.map((player, index) => {
            if (index === 0) { // Human player only
              return {
                ...player,
                hand: [],
                faceUpCards: []
              };
            }
            return player;
          });
          
          return {
            ...prev,
            players: newPlayers
          };
        });
        setSelectedCards([]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gamePhase]);

  const playFaceDownCard = useCallback((cardIndex: number) => {
    console.log('=== playFaceDownCard START ===');
    console.log('Called with cardIndex:', cardIndex);
    console.log('Current gameState.players[0].faceDownCards.length:', gameState.players[0].faceDownCards.length);
    
    setGameState(prev => {
      console.log('=== INSIDE setGameState ===');
      console.log('prev.players[0].faceDownCards.length:', prev.players[0].faceDownCards.length);
      console.log('Attempting to remove card at index:', cardIndex);
      
      // Create completely new state objects to avoid mutations
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      
      if (cardIndex >= currentPlayer.faceDownCards.length) {
        console.error('Invalid cardIndex:', cardIndex, 'faceDownCards.length:', currentPlayer.faceDownCards.length);
        return prev; // Return unchanged state
      }
      
      // Create new arrays without mutating the original
      const revealedCard = currentPlayer.faceDownCards[cardIndex];
      const newFaceDownCards = currentPlayer.faceDownCards.filter((_, index) => index !== cardIndex);
      
      console.log('Revealed card:', revealedCard);
      console.log('Remaining faceDownCards after filter:', newFaceDownCards.length);
      
      const topCard = prev.pile.length > 0 ? prev.pile[prev.pile.length - 1] : null;
      console.log('Top card on pile:', topCard);
      
      // Create new player object
      const newCurrentPlayer = {
        ...currentPlayer,
        faceDownCards: newFaceDownCards
      };
      
      const newPlayers = prev.players.map((player, index) => 
        index === prev.currentPlayerIndex ? newCurrentPlayer : player
      );
      
      if (canPlayCard(revealedCard, topCard)) {
        console.log('Card CAN be played');
        // Can play the card
        const newPile = [...prev.pile, revealedCard];
        
        // Check for special effects
        let burnPile = false;
        if (shouldBurn(newPile)) {
          burnPile = true;
        }
        
        const hasTen = revealedCard.rank === 10;
        console.log('Has ten or burn pile:', hasTen || burnPile);
        if (hasTen || burnPile) {
          // Check win condition
          const hasWon = newCurrentPlayer.hand.length === 0 && 
                         newCurrentPlayer.faceUpCards.length === 0 && 
                         newCurrentPlayer.faceDownCards.length === 0;
          
          return {
            ...prev,
            players: newPlayers,
            pile: [],
            gamePhase: hasWon ? 'finished' : prev.gamePhase,
            winner: hasWon ? newCurrentPlayer.id : prev.winner
            // Same player continues
          };
        }
        
        // Check win condition
        const hasWon = newCurrentPlayer.hand.length === 0 && 
                       newCurrentPlayer.faceUpCards.length === 0 && 
                       newCurrentPlayer.faceDownCards.length === 0;
        
        if (hasWon) {
          console.log('Player has won!');
          return {
            ...prev,
            players: newPlayers,
            pile: newPile,
            gamePhase: 'finished',
            winner: newCurrentPlayer.id
          };
        }
        
        // Next player's turn
        console.log('Moving to next player');
        return {
          ...prev,
          players: newPlayers,
          pile: newPile,
          currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
        };
      } else {
        console.log('Card CANNOT be played - picking up pile');
        // Can't play the card - must pick up pile + revealed card
        const newCurrentPlayerWithCards = {
          ...newCurrentPlayer,
          hand: [...newCurrentPlayer.hand, ...prev.pile, revealedCard]
        };
        
        const newPlayersWithCards = prev.players.map((player, index) => 
          index === prev.currentPlayerIndex ? newCurrentPlayerWithCards : player
        );
        
        return {
          ...prev,
          players: newPlayersWithCards,
          pile: [],
          currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
        };
      }
    });
    
    console.log('=== playFaceDownCard END ===');
  }, []);
  const dealCards = useCallback(() => {
    const deck = createDeck();
    const players = createInitialPlayers();
    
    // Deal 6 cards to each player's hand
    let deckIndex = 0;
    for (let round = 0; round < 6; round++) {
      for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
        players[playerIndex].hand.push(deck[deckIndex++]);
      }
    }
    
    // Deal 3 face-down cards to each player
    for (let round = 0; round < 3; round++) {
      for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
        players[playerIndex].faceDownCards.push(deck[deckIndex++]);
      }
    }
    
    // AI players automatically choose their 3 worst cards as face-up
    for (let playerIndex = 1; playerIndex < players.length; playerIndex++) {
      const aiPlayer = players[playerIndex];
      // Sort hand by rank (ascending) and take 3 lowest cards
      const sortedHand = [...aiPlayer.hand].sort((a, b) => a.rank - b.rank);
      const faceUpCards = sortedHand.slice(0, 3);
      
      // Remove chosen cards from hand and add to face-up
      faceUpCards.forEach(card => {
        const handIndex = aiPlayer.hand.findIndex(c => c.id === card.id);
        if (handIndex !== -1) {
          aiPlayer.hand.splice(handIndex, 1);
          aiPlayer.faceUpCards.push(card);
        }
      });
    }
    
    const remainingDeck = deck.slice(deckIndex);
    
    setGameState({
      players,
      currentPlayerIndex: 0,
      pile: [],
      deck: remainingDeck,
      gamePhase: 'setup', // Human player needs to choose face-up cards
      winner: null,
      loser: null
    });
    
    setSelectedCards([]);
  }, []);

  const confirmFaceUpCards = useCallback(() => {
    const humanPlayer = gameState.players[0];
    if (humanPlayer.faceUpCards.length === 3) {
      setGameState(prev => ({
        ...prev,
        gamePhase: 'swapping'
      }));
    }
  }, [gameState.players]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing'
    }));
  }, []);

  const handleCardClick = useCallback((card: Card, source: 'hand' | 'faceUp') => {
    if (gameState.gamePhase === 'setup' && gameState.currentPlayerIndex === 0) {
      // Handle choosing face-up cards from hand
      if (source === 'hand') {
        setGameState(prev => {
          const newPlayers = [...prev.players];
          const humanPlayer = newPlayers[0];
          
          // If we already have 3 face-up cards, can't add more
          if (humanPlayer.faceUpCards.length >= 3) {
            return prev;
          }
          
          // Move card from hand to face-up
          const handIndex = humanPlayer.hand.findIndex(c => c.id === card.id);
          if (handIndex !== -1) {
            const cardToMove = humanPlayer.hand.splice(handIndex, 1)[0];
            humanPlayer.faceUpCards.push(cardToMove);
          }
          
          return { ...prev, players: newPlayers };
        });
      } else if (source === 'faceUp') {
        // Move card back from face-up to hand
        setGameState(prev => {
          const newPlayers = [...prev.players];
          const humanPlayer = newPlayers[0];
          
          const faceUpIndex = humanPlayer.faceUpCards.findIndex(c => c.id === card.id);
          if (faceUpIndex !== -1) {
            const cardToMove = humanPlayer.faceUpCards.splice(faceUpIndex, 1)[0];
            humanPlayer.hand.push(cardToMove);
          }
          
          return { ...prev, players: newPlayers };
        });
      }
    } else if (gameState.gamePhase === 'swapping' && gameState.currentPlayerIndex === 0) {
      // Handle card swapping during swapping phase
      if (source === 'hand' || source === 'faceUp') {
        // Simple swap: click hand card then face-up card to swap them
        setSelectedCards(prev => {
          const isSelected = prev.some(c => c.id === card.id);
          if (isSelected) {
            return prev.filter(c => c.id !== card.id);
          } else {
            const newSelection = [...prev, card];
            
            // If we have one hand card and one face-up card selected, perform swap
            const handCards = newSelection.filter(c => gameState.players[0].hand.some(hc => hc.id === c.id));
            const faceUpCards = newSelection.filter(c => gameState.players[0].faceUpCards.some(fc => fc.id === c.id));
            
            if (handCards.length === 1 && faceUpCards.length === 1) {
              // Perform the swap
              setGameState(prev => {
                const newPlayers = [...prev.players];
                const humanPlayer = newPlayers[0];
                
                const handIndex = humanPlayer.hand.findIndex(c => c.id === handCards[0].id);
                const faceUpIndex = humanPlayer.faceUpCards.findIndex(c => c.id === faceUpCards[0].id);
                
                if (handIndex !== -1 && faceUpIndex !== -1) {
                  [humanPlayer.hand[handIndex], humanPlayer.faceUpCards[faceUpIndex]] = 
                  [humanPlayer.faceUpCards[faceUpIndex], humanPlayer.hand[handIndex]];
                }
                
                return { ...prev, players: newPlayers };
              });
              
              return []; // Clear selection after swap
            }
            
            return newSelection;
          }
        });
      }
    } else if (gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0) {
      // Handle card selection for playing
      const humanPlayer = gameState.players[0];
      
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
  }, [gameState.gamePhase, gameState.currentPlayerIndex, gameState.players]);

  const canPlaySelected = useCallback(() => {
    if (selectedCards.length === 0) return false;
    const topCard = gameState.pile.length > 0 ? gameState.pile[gameState.pile.length - 1] : null;
    return canPlayCard(selectedCards[0], topCard);
  }, [selectedCards, gameState.pile]);

  const playCards = useCallback(() => {
    if (!canPlaySelected()) return;
    
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const currentPlayer = newPlayers[prev.currentPlayerIndex];
      const newPile = [...prev.pile, ...selectedCards];
      let newDeck = [...prev.deck];
      
      // Remove played cards from player's hand/faceUp cards
      selectedCards.forEach(card => {
        const handIndex = currentPlayer.hand.findIndex(c => c.id === card.id);
        const faceUpIndex = currentPlayer.faceUpCards.findIndex(c => c.id === card.id);
        
        if (handIndex !== -1) {
          currentPlayer.hand.splice(handIndex, 1);
        } else if (faceUpIndex !== -1) {
          currentPlayer.faceUpCards.splice(faceUpIndex, 1);
        }
      });
      
      // Draw cards to maintain 3 in hand (if deck has cards)
      const { updatedPlayer, updatedDeck } = drawToThreeCards(currentPlayer, newDeck);
      newPlayers[prev.currentPlayerIndex] = updatedPlayer;
      newDeck = updatedDeck;
      
      // Check for burn (4 of same rank)
      let burnPile = false;
      if (shouldBurn(newPile)) {
        burnPile = true;
      }
      
      // Check for 10 (clears pile)
      const hasTen = selectedCards.some(card => card.rank === 10);
      if (hasTen || burnPile) {
        return {
          ...prev,
          players: newPlayers,
          pile: [],
          deck: newDeck,
          // Same player goes again
        };
      }
      
      // Check win condition
      const hasWon = updatedPlayer.hand.length === 0 && 
                   updatedPlayer.faceUpCards.length === 0 && 
                   updatedPlayer.faceDownCards.length === 0;
      
      if (hasWon) {
        return {
          ...prev,
          players: newPlayers,
          pile: newPile,
          deck: newDeck,
          gamePhase: 'finished',
          winner: updatedPlayer.id
        };
      }
      
      // Next player's turn
      let nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      
      return {
        ...prev,
        players: newPlayers,
        pile: newPile,
        deck: newDeck,
        currentPlayerIndex: nextPlayerIndex
      };
    });
    
    setSelectedCards([]);
  }, [selectedCards, canPlaySelected]);

  const pickupCards = useCallback(() => {
    setGameState(prev => {
      // Create completely new state to avoid any reference issues
      const newState = {
        ...prev,
        players: prev.players.map((player, index) => {
          if (index === prev.currentPlayerIndex) {
            // Current player picks up all pile cards
            return {
              ...player,
              hand: [...player.hand, ...prev.pile]
            };
          }
          return { ...player };
        }),
        pile: [], // Clear the pile
        currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
      };
      
      return newState;
    });
    
    setSelectedCards([]);
  }, [gameState.pile, gameState.players]);

  const canPlayAnyCard = useCallback(() => {
    if (gameState.gamePhase !== 'playing' || gameState.currentPlayerIndex !== 0) {
      return true; // Not player's turn, so don't show pickup
    }
    
    const humanPlayer = gameState.players[0];
    const topCard = gameState.pile.length > 0 ? gameState.pile[gameState.pile.length - 1] : null;
    
    // Check if any card in hand can be played
    const canPlayFromHand = humanPlayer.hand.some(card => canPlayCard(card, topCard));
    
    // Check if any face-up card can be played (when hand is empty)
    const canPlayFromFaceUp = humanPlayer.hand.length === 0 && 
                              humanPlayer.faceUpCards.some(card => canPlayCard(card, topCard));
    
    return canPlayFromHand || canPlayFromFaceUp;
  }, [gameState.gamePhase, gameState.currentPlayerIndex, gameState.players, gameState.pile]);
  // AI turn logic
  useEffect(() => {
    if (gameState.gamePhase === 'playing' && 
        gameState.currentPlayerIndex !== 0 && 
        !gameState.winner) {
      
      const timer = setTimeout(() => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        const topCard = gameState.pile.length > 0 ? gameState.pile[gameState.pile.length - 1] : null;
        
        // Simple AI: play lowest valid card
        let cardToPlay = null;
        
        // Try hand cards first
        if (currentPlayer.hand.length > 0) {
          cardToPlay = currentPlayer.hand.find(card => canPlayCard(card, topCard));
        }
        
        // Then face-up cards (only if hand is empty)
        if (!cardToPlay && currentPlayer.hand.length === 0 && currentPlayer.faceUpCards.length > 0) {
          cardToPlay = currentPlayer.faceUpCards.find(card => canPlayCard(card, topCard));
        }
        
        if (cardToPlay) {
          setGameState(prev => {
            const newPlayers = [...prev.players];
            const aiPlayer = newPlayers[prev.currentPlayerIndex];
            const newPile = [...prev.pile, cardToPlay];
            let newDeck = [...prev.deck];
            
            // Remove card from AI player
            const handIndex = aiPlayer.hand.findIndex(c => c.id === cardToPlay.id);
            const faceUpIndex = aiPlayer.faceUpCards.findIndex(c => c.id === cardToPlay.id);
            
            let playerStateForWinCheck = aiPlayer;
            
            if (handIndex !== -1) {
              aiPlayer.hand.splice(handIndex, 1);
              // Only draw cards to maintain 3 in hand if we played from hand and deck has cards
              const { updatedPlayer, updatedDeck } = drawToThreeCards(aiPlayer, newDeck);
              newPlayers[prev.currentPlayerIndex] = updatedPlayer;
              newDeck = updatedDeck;
              playerStateForWinCheck = updatedPlayer;
            } else if (faceUpIndex !== -1) {
              aiPlayer.faceUpCards.splice(faceUpIndex, 1);
              // Don't draw cards when playing from face-up cards
            }
            
            
            // Check for special effects
            let burnPile = false;
            if (shouldBurn(newPile)) {
              burnPile = true;
            }
            
            const hasTen = cardToPlay.rank === 10;
            if (hasTen || burnPile) {
              return {
                ...prev,
                players: newPlayers,
                pile: [],
                deck: newDeck
                // Same player continues
              };
            }
            
            // Check win condition
            const hasWon = playerStateForWinCheck.hand.length === 0 && 
                           playerStateForWinCheck.faceUpCards.length === 0 && 
                           playerStateForWinCheck.faceDownCards.length === 0;
            
            if (hasWon) {
              return {
                ...prev,
                players: newPlayers,
                pile: newPile,
                deck: newDeck,
                gamePhase: 'finished',
                winner: playerStateForWinCheck.id
              };
            }
            
            // Next player
            const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
            
            return {
              ...prev,
              players: newPlayers,
              pile: newPile,
              deck: newDeck,
              currentPlayerIndex: nextPlayerIndex
            };
          });
        } else {
          // AI must pick up pile
          setGameState(prev => {
            const newPlayers = [...prev.players];
            const aiPlayer = newPlayers[prev.currentPlayerIndex];
            
            // Add pile to hand
            aiPlayer.hand.push(...prev.pile);
            
            return {
              ...prev,
              players: newPlayers,
              pile: [],
              currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
            };
          });
        }
      }, 1500); // AI delay for realism
      
      return () => clearTimeout(timer);
    }
  }, [gameState.gamePhase, gameState.currentPlayerIndex, gameState.pile, gameState.players, gameState.winner]);

  return {
    gameState,
    selectedCards,
    dealCards,
    confirmFaceUpCards,
    startGame,
    handleCardClick,
    playCards,
    canPlaySelected: canPlaySelected(),
    pickupCards,
    canPlayAnyCard: canPlayAnyCard(),
    playFaceDownCard
  };
};