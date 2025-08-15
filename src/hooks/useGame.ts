import { useState, useCallback } from 'react';
import { GameState, Card, Player, GamePhase } from '../types/game';
import { createDeck, shuffleDeck } from '../utils/cardUtils';

export function useGame(playerCount: number) {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    deck: [],
    pile: [],
    currentPlayerIndex: 0,
    gamePhase: 'setup' as GamePhase,
    winner: null
  });

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [jumpInWindow, setJumpInWindow] = useState<{ rank: number } | null>(null);

  const clearLastAction = useCallback(() => {
    setLastAction(null);
  }, []);

  const dealCards = useCallback(() => {
    const deck = shuffleDeck(createDeck());
    const players: Player[] = [];
    
    // Create players based on count
    const playerNames = ['You', 'Bob', 'Alice', 'Carol'];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: `player-${i}`,
        name: playerNames[i],
        hand: [],
        faceUpCards: [],
        faceDownCards: []
      });
    }

    // Deal 6 cards to each player's hand
    let cardIndex = 0;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < playerCount; j++) {
        players[j].hand.push(deck[cardIndex++]);
      }
    }

    // Deal 3 face-down cards to each player
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < playerCount; j++) {
        players[j].faceDownCards.push(deck[cardIndex++]);
      }
    }

    setGameState({
      players,
      deck: deck.slice(cardIndex),
      pile: [],
      currentPlayerIndex: 0,
      gamePhase: 'setup',
      winner: null
    });
    setSelectedCards([]);
  }, [playerCount]);

  const handleCardClick = useCallback((card: Card, source: 'hand' | 'faceUp') => {
    if (gameState.gamePhase === 'setup' && source === 'hand') {
      // Setup phase: selecting face-up cards
      const humanPlayer = gameState.players[0];
      if (humanPlayer.faceUpCards.length < 3) {
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((player, index) => {
            if (index === 0) {
              return {
                ...player,
                hand: player.hand.filter(c => c.id !== card.id),
                faceUpCards: [...player.faceUpCards, card]
              };
            }
            return player;
          })
        }));
      }
    } else if (gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0) {
      // Playing phase: selecting cards to play
      setSelectedCards(prev => {
        const isSelected = prev.some(c => c.id === card.id);
        if (isSelected) {
          return prev.filter(c => c.id !== card.id);
        } else {
          return [...prev, card];
        }
      });
    }
  }, [gameState.gamePhase, gameState.currentPlayerIndex]);

  const confirmFaceUpCards = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'swapping'
    }));
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing'
    }));
  }, []);

  const playCards = useCallback(() => {
    if (selectedCards.length === 0) return;

    setGameState(prev => {
      const newPile = [...prev.pile, ...selectedCards];
      const newPlayers = prev.players.map((player, index) => {
        if (index === 0) {
          return {
            ...player,
            hand: player.hand.filter(c => !selectedCards.some(sc => sc.id === c.id)),
            faceUpCards: player.faceUpCards.filter(c => !selectedCards.some(sc => sc.id === c.id))
          };
        }
        return player;
      });

      return {
        ...prev,
        players: newPlayers,
        pile: newPile,
        currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
      };
    });

    setSelectedCards([]);
  }, [selectedCards]);

  const canPlaySelected = selectedCards.length > 0;

  const pickupCards = useCallback(() => {
    setGameState(prev => {
      const newPlayers = prev.players.map((player, index) => {
        if (index === 0) {
          return {
            ...player,
            hand: [...player.hand, ...prev.pile]
          };
        }
        return player;
      });

      return {
        ...prev,
        players: newPlayers,
        pile: [],
        currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
      };
    });

    setLastAction('pickup');
  }, []);

  const canPlayAnyCard = true; // Simplified for now

  const playFaceDownCard = useCallback((cardIndex: number) => {
    // Implementation for playing face-down cards
    console.log('Playing face-down card at index:', cardIndex);
  }, []);

  return {
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
    playFaceDownCard,
    jumpInWindow,
    lastAction,
    clearLastAction
  };
}