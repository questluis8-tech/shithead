import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, Player } from '../types/game';
import { MultiplayerGameState } from '../types/multiplayer';
import { createDeck, canPlayCard, shouldBurn, getEffectiveTopCard } from '../utils/cardUtils';

export const useMultiplayerGame = (roomId: string, playerId: string, playerName: string) => {
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get current player
  const currentPlayer = gameState?.players.find(p => p.id === playerId);
  const isMyTurn = gameState?.currentPlayerIndex !== undefined && 
                   gameState?.players[gameState.currentPlayerIndex]?.id === playerId;

  // Initialize game when host starts it
  const initializeGame = useCallback(async (roomPlayers: any[]) => {
    if (!roomId) return;

    try {
      console.log('Initializing multiplayer game...');
      setIsLoading(true);

      // Create deck and deal cards
      const deck = createDeck();
      const players: Player[] = [];

      // Create players from room players
      roomPlayers.forEach((roomPlayer, index) => {
        players.push({
          id: roomPlayer.player_id,
          name: roomPlayer.player_name,
          hand: [],
          faceDownCards: [],
          faceUpCards: [],
          isAI: false // All players are human in multiplayer
        });
      });

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

      const remainingDeck = deck.slice(deckIndex);

      const initialGameState: MultiplayerGameState = {
        room_id: roomId,
        host_id: roomPlayers.find(p => p.is_host)?.player_id || '',
        connected_players: roomPlayers.map(p => p.player_id),
        players,
        currentPlayerIndex: 0,
        pile: [],
        deck: remainingDeck,
        gamePhase: 'setup',
        winner: null,
        loser: null
      };

      // Save game state to database
      const { error } = await supabase
        .from('game_rooms')
        .update({ 
          game_state: initialGameState,
          status: 'playing'
        })
        .eq('id', roomId);

      if (error) {
        console.error('Error saving game state:', error);
        throw error;
      }

      setGameState(initialGameState);
      console.log('Game initialized successfully');

    } catch (error) {
      console.error('Error initializing game:', error);
      alert('Failed to initialize game: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // Load game state from database
  const loadGameState = useCallback(async () => {
    if (!roomId) return;

    try {
      const { data: room, error } = await supabase
        .from('game_rooms')
        .select('game_state')
        .eq('id', roomId)
        .single();

      if (error) {
        console.error('Error loading game state:', error);
        return;
      }

      if (room?.game_state) {
        console.log('Loaded game state:', room.game_state);
        setGameState(room.game_state);
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    }
  }, [roomId]);

  // Subscribe to game state changes
  useEffect(() => {
    if (!roomId) return;

    console.log('Setting up game state subscription for room:', roomId);

    const subscription = supabase
      .channel(`game-state-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          console.log('Game state changed:', payload);
          if (payload.new?.game_state) {
            setGameState(payload.new.game_state);
          }
        }
      )
      .subscribe();

    // Load initial game state
    loadGameState();

    return () => {
      console.log('Cleaning up game state subscription');
      supabase.removeChannel(subscription);
    };
  }, [roomId, loadGameState]);

  // Handle card selection
  const handleCardClick = useCallback((card: Card, source: 'hand' | 'faceUp') => {
    if (!gameState || gameState.players[gameState.currentPlayerIndex]?.id !== playerId) {
      return; // Not player's turn
    }

    if (gameState.gamePhase === 'setup') {
      // Handle choosing face-up cards from hand
      if (source === 'hand') {
        const currentPlayer = gameState.players.find(p => p.id === playerId);
        if (!currentPlayer || currentPlayer.faceUpCards.length >= 3) {
          return;
        }

        // Move card from hand to face-up
        const newGameState = { ...gameState };
        const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
        const player = newGameState.players[playerIndex];
        
        const handIndex = player.hand.findIndex(c => c.id === card.id);
        if (handIndex !== -1) {
          const cardToMove = player.hand.splice(handIndex, 1)[0];
          player.faceUpCards.push(cardToMove);
          setGameState(newGameState);
        }
      } else if (source === 'faceUp') {
        // Move card back from face-up to hand
        const newGameState = { ...gameState };
        const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
        const player = newGameState.players[playerIndex];
        
        const faceUpIndex = player.faceUpCards.findIndex(c => c.id === card.id);
        if (faceUpIndex !== -1) {
          const cardToMove = player.faceUpCards.splice(faceUpIndex, 1)[0];
          player.hand.push(cardToMove);
          setGameState(newGameState);
        }
      }
    } else if (gameState.gamePhase === 'playing') {
      // Handle card selection for playing
      const currentPlayer = gameState.players.find(p => p.id === playerId);
      if (!currentPlayer) return;

      // Can't play face-up cards if hand is not empty
      if (source === 'faceUp' && currentPlayer.hand.length > 0) {
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
  }, [gameState, playerId]);

  // Check if selected cards can be played
  const canPlaySelected = useCallback(() => {
    if (!gameState || selectedCards.length === 0) return false;
    const topCard = getEffectiveTopCard(gameState.pile);
    return canPlayCard(selectedCards[0], topCard);
  }, [gameState, selectedCards]);

  return {
    gameState,
    selectedCards,
    isLoading,
    initializeGame,
    handleCardClick,
    canPlaySelected: canPlaySelected(),
    setSelectedCards
  };
};