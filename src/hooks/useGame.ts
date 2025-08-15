import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Card } from '../types/game';
import { createDeck, canPlayCard, shouldBurn, getEffectiveTopCard } from '../utils/cardUtils';

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
  const [jumpInWindow, setJumpInWindow] = useState<{ rank: number; timeoutId: NodeJS.Timeout } | null>(null);
  const [lastAction, setLastAction] = useState<'burn' | 'pickup' | null>(null);

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
      } else if (event.key === 'Control' && gameState.gamePhase === 'playing') {
        // Add an ace to human player's hand for testing
        setGameState(prev => {
          const newPlayers = prev.players.map((player, index) => {
            if (index === 0) { // Human player only
              const aceCard = {
                suit: 'spades' as const,
                rank: 14, // Ace
                id: `debug-ace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              };
              return {
                ...player,
                hand: [...player.hand, aceCard]
              };
            }
            return player;
          });
          
          return {
            ...prev,
            players: newPlayers
          };
        });
      } else if (event.key === 'Alt' && gameState.gamePhase === 'playing') {
        // Add 10 cards to Carol's hand for testing
        setGameState(prev => {
          const newPlayers = prev.players.map((player, index) => {
            if (index === 1) { // Carol (index 1 in the reordered array)
              const newCards = [];
              for (let i = 0; i < 10; i++) {
                const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
                const randomSuit = suits[Math.floor(Math.random() * suits.length)];
                const randomRank = Math.floor(Math.random() * 13) + 2; // 2-14
                newCards.push({
                  suit: randomSuit,
                  rank: randomRank,
                  id: `debug-carol-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`
                });
              }
              return {
                ...player,
                hand: [...player.hand, ...newCards]
              };
            }
            return player;
          });
          
          return {
            ...prev,
            players: newPlayers
          };
        });
      } else if (event.key === 'f' && gameState.gamePhase === 'playing') {
        // Give Bob three Aces and human player one Ace for burn testing
        setGameState(prev => {
          const newPlayers = prev.players.map((player, index) => {
            if (index === 3) { // Bob (index 3)
              const suits = ['hearts', 'diamonds', 'clubs'] as const;
              const newCards = suits.map((suit, i) => ({
                suit,
                rank: 14, // Ace
                id: `debug-bob-ace-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`
              }));
              return {
                ...player,
                hand: [...player.hand, ...newCards]
              };
            } else if (index === 0) { // Human player
              const aceCard = {
                suit: 'spades' as const,
                rank: 14, // Ace
                id: `debug-human-ace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              };
              return {
                ...player,
                hand: [...player.hand, aceCard]
              };
            }
            return player;
          });
          
          return {
            ...prev,
            players: newPlayers
          };
        });
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
      
      const topCard = getEffectiveTopCard(prev.pile);
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
          
          setLastAction('burn');
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
        
        setLastAction('pickup');
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

  const canJumpIn = useCallback((playerIndex: number, rank: number): boolean => {
    if (!jumpInWindow || jumpInWindow.rank !== rank) return false;
    
    const player = gameState.players[playerIndex];
    const matchingCards = player.hand.filter(card => card.rank === rank);
    
    // Need at least 1 card to jump in, and total must make 4 in a row
    return matchingCards.length >= 1;
  }, [jumpInWindow, gameState.players]);

  const performJumpIn = useCallback((playerIndex: number, rank: number) => {
    if (!canJumpIn(playerIndex, rank)) return;
    
    // Clear the jump-in window
    if (jumpInWindow?.timeoutId) {
      clearTimeout(jumpInWindow.timeoutId);
    }
    setJumpInWindow(null);
    
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const jumpingPlayer = newPlayers[playerIndex];
      
      // Get all matching cards from hand
      const matchingCards = jumpingPlayer.hand.filter(card => card.rank === rank);
      
      // Remove matching cards from hand
      jumpingPlayer.hand = jumpingPlayer.hand.filter(card => card.rank !== rank);
      
      // Add cards to pile
      const newPile = [...prev.pile, ...matchingCards];
      let newDeck = [...prev.deck];
      
      // Draw cards to maintain 3 in hand (if deck has cards)
      const { updatedPlayer, updatedDeck } = drawToThreeCards(jumpingPlayer, newDeck);
      newPlayers[playerIndex] = updatedPlayer;
      newDeck = updatedDeck;
      
      // Jump-in always burns the pile (4 of same rank)
      // Check win condition before clearing pile
      const hasWon = updatedPlayer.hand.length === 0 && 
                     updatedPlayer.faceUpCards.length === 0 && 
                     updatedPlayer.faceDownCards.length === 0;
      
      return {
        ...prev,
        players: newPlayers,
        pile: [], // Burn the pile
        deck: newDeck,
        currentPlayerIndex: playerIndex, // Jumping player gets the turn
        gamePhase: hasWon ? 'finished' : prev.gamePhase,
        winner: hasWon ? updatedPlayer.id : prev.winner
      };
    });
    
    setSelectedCards([]);
  }, [canJumpIn, jumpInWindow]);

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
    // Check for jump-in first (available to all players during any turn)
    if (gameState.gamePhase === 'playing' && jumpInWindow) {
      const humanPlayerIndex = 0;
      if (canJumpIn(humanPlayerIndex, card.rank) && card.rank === jumpInWindow.rank) {
        performJumpIn(humanPlayerIndex, card.rank);
        return;
      }
    }
    
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
    const topCard = getEffectiveTopCard(gameState.pile);
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
      
      // Open jump-in window if pile has 3 of same rank
      if (newPile.length >= 3) {
        const lastThree = newPile.slice(-3);
        if (lastThree.every(c => c.rank === lastThree[0].rank)) {
          // Clear any existing jump-in window
          if (jumpInWindow?.timeoutId) {
            clearTimeout(jumpInWindow.timeoutId);
          }
          
          // Open new jump-in window for 2 seconds
          const timeoutId = setTimeout(() => {
            setJumpInWindow(null);
          }, 2000);
          
          setJumpInWindow({ rank: lastThree[0].rank, timeoutId });
        }
      }
      
      if (hasTen || burnPile) {
        // Check win condition before clearing pile
        const hasWon = updatedPlayer.hand.length === 0 && 
                       updatedPlayer.faceUpCards.length === 0 && 
                       updatedPlayer.faceDownCards.length === 0;
        
        setLastAction('burn');
        setLastAction('burn');
        return {
          ...prev,
          players: newPlayers,
          pile: [],
          deck: newDeck,
          gamePhase: hasWon ? 'finished' : prev.gamePhase,
          winner: hasWon ? updatedPlayer.id : prev.winner
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
    setLastAction('pickup');
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
    const topCard = getEffectiveTopCard(gameState.pile);
    
    // Check if any card in hand can be played
    const canPlayFromHand = humanPlayer.hand.some(card => canPlayCard(card, topCard));
    
    // Check if any face-up card can be played (when hand is empty)
    const canPlayFromFaceUp = humanPlayer.hand.length === 0 && 
                              humanPlayer.faceUpCards.some(card => canPlayCard(card, topCard));
    
    return canPlayFromHand || canPlayFromFaceUp;
  }, [gameState.gamePhase, gameState.currentPlayerIndex, gameState.players, gameState.pile]);
  // AI turn logic
  useEffect(() => {
    // AI Jump-in logic - check if any AI can jump in
    if (gameState.gamePhase === 'playing' && jumpInWindow) {
      // Check each AI player (skip human player at index 0)
      for (let i = 1; i < gameState.players.length; i++) {
        if (canJumpIn(i, jumpInWindow.rank)) {
          // 70% chance AI will jump in
          if (Math.random() < 0.7) {
            setTimeout(() => {
              performJumpIn(i, jumpInWindow.rank);
            }, 500 + Math.random() * 1000); // Random delay 0.5-1.5s
            return;
          }
        }
      }
    }
    
    if (gameState.gamePhase === 'playing' && 
        gameState.currentPlayerIndex !== 0 && 
        !gameState.winner) {
      
      const timer = setTimeout(() => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        const topCard = getEffectiveTopCard(gameState.pile);
        
        // Simple AI: play lowest valid card
        let cardToPlay = null;
        let cardsToPlay: Card[] = [];
        
        // Try hand cards first
        if (currentPlayer.hand.length > 0) {
          cardToPlay = currentPlayer.hand.find(card => canPlayCard(card, topCard));
          
          if (cardToPlay) {
            // 90% of the time, try to play all cards of the same rank
            if (Math.random() < 0.9) {
              cardsToPlay = currentPlayer.hand.filter(card => 
                card.rank === cardToPlay.rank && canPlayCard(card, topCard)
              );
            } else {
              cardsToPlay = [cardToPlay];
            }
          }
        } else if (currentPlayer.faceUpCards.length > 0) {
          // Only try face-up cards if hand is empty
          cardToPlay = currentPlayer.faceUpCards.find(card => canPlayCard(card, topCard));
          
          if (cardToPlay) {
            // 90% of the time, try to play all cards of the same rank
            if (Math.random() < 0.9) {
              cardsToPlay = currentPlayer.faceUpCards.filter(card => 
                card.rank === cardToPlay.rank && canPlayCard(card, topCard)
              );
            } else {
              cardsToPlay = [cardToPlay];
            }
          }
        }
        
        if (cardsToPlay.length > 0) {
          setGameState(prev => {
            const newPlayers = [...prev.players];
            const aiPlayer = newPlayers[prev.currentPlayerIndex];
            const newPile = [...prev.pile, ...cardsToPlay];
            let newDeck = [...prev.deck];
            
            // Remove played cards from AI player
            cardsToPlay.forEach(card => {
              const handIndex = aiPlayer.hand.findIndex(c => c.id === card.id);
              const faceUpIndex = aiPlayer.faceUpCards.findIndex(c => c.id === card.id);
              
              if (handIndex !== -1) {
                aiPlayer.hand.splice(handIndex, 1);
              } else if (faceUpIndex !== -1) {
                aiPlayer.faceUpCards.splice(faceUpIndex, 1);
              }
            });
            
            // Draw cards to maintain 3 in hand (if deck has cards)
            const { updatedPlayer, updatedDeck } = drawToThreeCards(aiPlayer, newDeck);
            newPlayers[prev.currentPlayerIndex] = updatedPlayer;
            newDeck = updatedDeck;
            
            // Check for special effects
            let burnPile = false;
            if (shouldBurn(newPile)) {
              burnPile = true;
            }
            
            const hasTen = cardsToPlay.some(card => card.rank === 10);
            if (hasTen || burnPile) {
              setLastAction('burn');
              return {
                ...prev,
                players: newPlayers,
                pile: [],
                deck: newDeck,
                // Same player continues
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
            
            // Next player
            const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
            
            // Open jump-in window if pile has 3 of same rank
            if (newPile.length >= 3) {
              const lastThree = newPile.slice(-3);
              if (lastThree.every(c => c.rank === lastThree[0].rank)) {
                // Clear any existing jump-in window
                if (jumpInWindow?.timeoutId) {
                  clearTimeout(jumpInWindow.timeoutId);
                }
                
                // Open new jump-in window for 2 seconds
                const timeoutId = setTimeout(() => {
                  setJumpInWindow(null);
                }, 2000);
                
                setJumpInWindow({ rank: lastThree[0].rank, timeoutId });
              }
            }
            
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
          setLastAction('pickup');
          setGameState(prev => {
            return {
              ...prev,
              players: prev.players.map((player, index) => {
                if (index === prev.currentPlayerIndex) {
                  return {
                    ...player,
                    hand: [...player.hand, ...prev.pile]
                  };
                }
                return player;
              }),
              pile: [],
              currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
            };
          });
        }
      }, 1500); // AI delay for realism
      
      return () => clearTimeout(timer);
    }
  }, [gameState.gamePhase, gameState.currentPlayerIndex, gameState.pile, gameState.players, gameState.winner, jumpInWindow, canJumpIn, performJumpIn]);

  // Cleanup jump-in window on unmount
  useEffect(() => {
    return () => {
      if (jumpInWindow?.timeoutId) {
        clearTimeout(jumpInWindow.timeoutId);
      }
    };
  }, [jumpInWindow]);

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
    playFaceDownCard,
    jumpInWindow,
    lastAction,
    clearLastAction: () => setLastAction(null)
  };
};