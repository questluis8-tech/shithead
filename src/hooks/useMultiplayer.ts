import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { createDeck, canPlayCard, shouldBurn, getEffectiveTopCard } from '../utils/cardUtils';
import { Card, Player } from '../types/game';
import { MultiplayerGameState } from '../types/multiplayer';

export const useMultiplayer = () => {
  const [playerId] = useState(() => uuidv4());
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);

  // Function to fetch current room players and room info
  const fetchRoomData = useCallback(async () => {
    if (!currentRoom) return;

    try {
      console.log('Fetching room data for room:', currentRoom.id);
      
      // Fetch both room info and players
      const [roomResult, playersResult] = await Promise.all([
        supabase
          .from('game_rooms')
          .select('*')
          .eq('id', currentRoom.id)
          .single(),
        supabase
          .from('room_players')
          .select('*')
          .eq('room_id', currentRoom.id)
          .order('player_index')
      ]);

      if (roomResult.error) {
        console.error('Error fetching room:', roomResult.error);
      } else {
        console.log('Updated room info:', roomResult.data);
        setCurrentRoom(roomResult.data);
      }

      if (playersResult.error) {
        console.error('Error fetching room players:', playersResult.error);
      } else {
        console.log('Fetched room players:', playersResult.data);
        setRoomPlayers(playersResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  }, [currentRoom?.id]);

  // Add polling as fallback for real-time updates
  useEffect(() => {
    if (!currentRoom) return;

    // Poll every 2 seconds as fallback
    const pollInterval = setInterval(() => {
      console.log('Polling for room updates...');
      fetchRoomData();
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [currentRoom?.id, fetchRoomData]);

  // Real-time subscription for room updates
  useEffect(() => {
    if (!currentRoom) return;

    console.log('Setting up real-time subscription for room:', currentRoom.id);

    // Subscribe to both room and room players changes
    const roomSubscription = supabase
      .channel(`room-${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${currentRoom.id}`
        },
        (payload) => {
          console.log('Room changed:', payload);
          fetchRoomData();
        }
      )
      .subscribe();

    const playersSubscription = supabase
      .channel(`room-players-${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${currentRoom.id}`
        },
        (payload) => {
          console.log('Room players changed:', payload);
          fetchRoomData();
        }
      )
      .subscribe();

    // Fetch room data immediately when setting up subscription
    fetchRoomData();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(playersSubscription);
    };
  }, [currentRoom?.id, fetchRoomData]);

  // Simple create room function for now
  const createRoom = useCallback(async (roomName: string, maxPlayers: number) => {
    if (!playerName.trim()) {
      alert('Please enter your name first');
      return;
    }

    try {
      console.log('Creating room:', roomName);
      
      // Create the room
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          name: roomName,
          host_id: playerId,
          max_players: maxPlayers,
          current_players: 1,
          status: 'waiting'
        })
        .select()
        .single();

      if (roomError) {
        console.error('Room creation error:', roomError);
        throw roomError;
      }

      console.log('Room created:', room);
      
      // Add the host as the first player
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          player_id: playerId,
          player_name: playerName,
          player_index: 0,
          is_host: true
        });

      if (playerError) {
        console.error('Player creation error:', playerError);
        throw playerError;
      }

      // Fetch the room players
      const { data: players, error: playersError } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', room.id);

      if (playersError) {
        console.error('Players fetch error:', playersError);
      } else {
        setRoomPlayers(players || []);
      }

      setCurrentRoom(room);
      setIsConnected(true);
      
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room: ' + error.message);
    }
  }, [playerId, playerName]);

  // Fetch available rooms
  const fetchAvailableRooms = useCallback(async () => {
    try {
      const { data: rooms, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rooms:', error);
      } else {
        setAvailableRooms(rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  }, []);

  // Join existing room
  const joinRoom = useCallback(async (roomId: string) => {
    if (!playerName.trim()) {
      alert('Please enter your name first');
      return;
    }

    try {
      console.log('Joining room:', roomId);
      
      // First, get the room details
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) {
        console.error('Room fetch error:', roomError);
        throw roomError;
      }

      // Check if room is still available
      if (room.status !== 'waiting') {
        alert('Room is no longer available');
        return;
      }

      if (room.current_players >= room.max_players) {
        alert('Room is full');
        return;
      }

      // Get current players to determine next player index
      const { data: existingPlayers, error: playersError } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomId);

      if (playersError) {
        console.error('Players fetch error:', playersError);
        throw playersError;
      }

      const nextPlayerIndex = existingPlayers.length;

      // Add player to room
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: roomId,
          player_id: playerId,
          player_name: playerName,
          player_index: nextPlayerIndex,
          is_host: false
        });

      if (playerError) {
        console.error('Player join error:', playerError);
        throw playerError;
      }

      // Update room player count
      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({ current_players: room.current_players + 1 })
        .eq('id', roomId);

      if (updateError) {
        console.error('Room update error:', updateError);
        throw updateError;
      }

      // Fetch updated room and players
      const { data: updatedRoom, error: updatedRoomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (updatedRoomError) {
        console.error('Updated room fetch error:', updatedRoomError);
        throw updatedRoomError;
      }

      const { data: allPlayers, error: allPlayersError } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomId);

      if (allPlayersError) {
        console.error('All players fetch error:', allPlayersError);
      } else {
        setRoomPlayers(allPlayers || []);
      }

      setCurrentRoom(updatedRoom);
      setIsConnected(true);
      
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room: ' + error.message);
    }
  }, [playerId, playerName]);

  // Start the game (host only)
  const startGame = useCallback(async () => {
    if (!currentRoom || !playerName.trim()) {
      return;
    }

    try {
      console.log('Starting game for room:', currentRoom.id);
      
      // Create initial game state
      const deck = createDeck();
      const players = roomPlayers.map((roomPlayer, index) => ({
        id: roomPlayer.player_id,
        name: roomPlayer.player_name,
        hand: [],
        faceDownCards: [],
        faceUpCards: [],
        isAI: false // All players are human in multiplayer
      }));

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

      const initialGameState = {
        room_id: currentRoom.id,
        host_id: currentRoom.host_id,
        connected_players: roomPlayers.map(p => p.player_id),
        players,
        currentPlayerIndex: 0,
        pile: [],
        deck: remainingDeck,
        gamePhase: 'setup' as const,
        winner: null,
        loser: null
      };

      // Update room status to 'playing'
      const { error: roomError } = await supabase
        .from('game_rooms')
        .update({ 
          status: 'playing',
          game_state: initialGameState
        })
        .eq('id', currentRoom.id);

      if (roomError) {
        console.error('Room update error:', roomError);
        throw roomError;
      }

      // Set local game state
      setGameState(initialGameState);
      
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game: ' + error.message);
    }
  }, [currentRoom, playerName, roomPlayers]);

  // Multiplayer game actions
  const handleCardClick = useCallback((card: Card, source: 'hand' | 'faceUp') => {
    if (!gameState || gameState.gamePhase !== 'setup' && gameState.gamePhase !== 'swapping' && gameState.gamePhase !== 'playing') return;
    
    const currentPlayer = gameState.players.find(p => p.id === playerId);
    if (!currentPlayer) return;

    if (gameState.gamePhase === 'setup') {
      // Handle choosing face-up cards from hand
      if (source === 'hand') {
        if (currentPlayer.faceUpCards.length >= 3) return;
        
        const newGameState = { ...gameState };
        const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
        const player = newGameState.players[playerIndex];
        
        const handIndex = player.hand.findIndex(c => c.id === card.id);
        if (handIndex !== -1) {
          const cardToMove = player.hand.splice(handIndex, 1)[0];
          player.faceUpCards.push(cardToMove);
        }
        
        setGameState(newGameState);
      } else if (source === 'faceUp') {
        // Move card back from face-up to hand
        const newGameState = { ...gameState };
        const playerIndex = newGameState.players.findIndex(p => p.id === playerId);
        const player = newGameState.players[playerIndex];
        
        const faceUpIndex = player.faceUpCards.findIndex(c => c.id === card.id);
        if (faceUpIndex !== -1) {
          const cardToMove = player.faceUpCards.splice(faceUpIndex, 1)[0];
          player.hand.push(cardToMove);
        }
        
        setGameState(newGameState);
      }
    } else if (gameState.gamePhase === 'playing') {
      // Handle card selection for playing
      const isMyTurn = gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === playerId);
      if (!isMyTurn) return;
      
      // Can't play face-up cards if hand is not empty
      if (source === 'faceUp' && currentPlayer.hand.length > 0) return;
      
      setSelectedCards(prev => {
        const isSelected = prev.some(c => c.id === card.id);
        if (isSelected) {
          return prev.filter(c => c.id !== card.id);
        } else {
          // Handle room updates
          if (payload.new) {
            if (payload.new.game_state) {
              console.log('Game state updated:', payload.new.game_state);
              setGameState(payload.new.game_state);
            }
            // Update current room info
            setCurrentRoom(payload.new);
          }
          return [card]; // Start new selection
        }
      });
    }
  }, [gameState, playerId]);

  const confirmFaceUpCards = useCallback(async () => {
    if (!gameState || !currentRoom) return;
    
    const currentPlayer = gameState.players.find(p => p.id === playerId);
    if (!currentPlayer || currentPlayer.faceUpCards.length !== 3) return;

    try {
      // Update game state in database
      const { error } = await supabase
        .from('game_rooms')
        .update({ game_state: gameState })
        .eq('id', currentRoom.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error confirming face-up cards:', error);
    }
  }, [gameState, currentRoom, playerId]);

  const startGamePhase = useCallback(async () => {
    if (!gameState || !currentRoom) return;
    
    const newGameState = {
      ...gameState,
      gamePhase: 'playing' as const
    };

    try {
      // Update game state in database
      const { error } = await supabase
        .from('game_rooms')
        .update({ game_state: newGameState })
        .eq('id', currentRoom.id);

      if (error) throw error;
      
      setGameState(newGameState);
    } catch (error) {
      console.error('Error starting game phase:', error);
    }
  }, [gameState, currentRoom]);

  const canPlaySelected = useCallback(() => {
    if (!gameState || selectedCards.length === 0) return false;
    const topCard = getEffectiveTopCard(gameState.pile);
    return canPlayCard(selectedCards[0], topCard);
  }, [selectedCards, gameState]);

  const playCards = useCallback(async () => {
    if (!gameState || !currentRoom || !canPlaySelected()) return;
    
    const newGameState = { ...gameState };
    const currentPlayerIndex = newGameState.currentPlayerIndex;
    const currentPlayer = newGameState.players[currentPlayerIndex];
    
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
    
    // Add cards to pile
    newGameState.pile.push(...selectedCards);
    
    // Check for special effects
    const hasTen = selectedCards.some(card => card.rank === 10);
    const burnPile = shouldBurn(newGameState.pile);
    
    if (hasTen || burnPile) {
      newGameState.pile = [];
      // Same player continues
    } else {
      // Next player's turn
      newGameState.currentPlayerIndex = (currentPlayerIndex + 1) % newGameState.players.length;
    }
    
    // Check win condition
    const hasWon = currentPlayer.hand.length === 0 && 
                   currentPlayer.faceUpCards.length === 0 && 
                   currentPlayer.faceDownCards.length === 0;
    
    if (hasWon) {
      newGameState.gamePhase = 'finished';
      newGameState.winner = currentPlayer.id;
    }

    try {
      // Update game state in database
      const { error } = await supabase
        .from('game_rooms')
        .update({ game_state: newGameState })
        .eq('id', currentRoom.id);

      if (error) throw error;
      
      setGameState(newGameState);
      setSelectedCards([]);
    } catch (error) {
      console.error('Error playing cards:', error);
    }
  }, [gameState, currentRoom, selectedCards, canPlaySelected]);

  const pickupCards = useCallback(async () => {
    if (!gameState || !currentRoom) return;
    
    const newGameState = { ...gameState };
    const currentPlayerIndex = newGameState.currentPlayerIndex;
    const currentPlayer = newGameState.players[currentPlayerIndex];
    
    // Add pile cards to player's hand
    currentPlayer.hand.push(...newGameState.pile);
    newGameState.pile = [];
    
    // Next player's turn
    newGameState.currentPlayerIndex = (currentPlayerIndex + 1) % newGameState.players.length;

    try {
      // Update game state in database
      const { error } = await supabase
        .from('game_rooms')
        .update({ game_state: newGameState })
        .eq('id', currentRoom.id);

      if (error) throw error;
      
      setGameState(newGameState);
      setSelectedCards([]);
    } catch (error) {
      console.error('Error picking up cards:', error);
    }
  }, [gameState, currentRoom]);

  const playFaceDownCard = useCallback(async (cardIndex: number) => {
    if (!gameState || !currentRoom) return;
    
    const newGameState = { ...gameState };
    const currentPlayerIndex = newGameState.currentPlayerIndex;
    const currentPlayer = newGameState.players[currentPlayerIndex];
    
    if (cardIndex >= currentPlayer.faceDownCards.length) return;
    
    const revealedCard = currentPlayer.faceDownCards[cardIndex];
    currentPlayer.faceDownCards.splice(cardIndex, 1);
    
    const topCard = getEffectiveTopCard(newGameState.pile);
    
    if (canPlayCard(revealedCard, topCard)) {
      // Can play the card
      newGameState.pile.push(revealedCard);
      
      const hasTen = revealedCard.rank === 10;
      const burnPile = shouldBurn(newGameState.pile);
      
      if (hasTen || burnPile) {
        newGameState.pile = [];
        // Same player continues
      } else {
        // Next player's turn
        newGameState.currentPlayerIndex = (currentPlayerIndex + 1) % newGameState.players.length;
      }
      
      // Check win condition
      const hasWon = currentPlayer.hand.length === 0 && 
                     currentPlayer.faceUpCards.length === 0 && 
                     currentPlayer.faceDownCards.length === 0;
      
      if (hasWon) {
        newGameState.gamePhase = 'finished';
        newGameState.winner = currentPlayer.id;
      }
    } else {
      // Can't play the card - must pick up pile + revealed card
      currentPlayer.hand.push(...newGameState.pile, revealedCard);
      newGameState.pile = [];
      newGameState.currentPlayerIndex = (currentPlayerIndex + 1) % newGameState.players.length;
    }

    try {
      // Update game state in database
      const { error } = await supabase
        .from('game_rooms')
        .update({ game_state: newGameState })
        .eq('id', currentRoom.id);

      if (error) throw error;
      
      setGameState(newGameState);
    } catch (error) {
      console.error('Error playing face-down card:', error);
    }
  }, [gameState, currentRoom]);

  const canPlayAnyCard = useCallback(() => {
    if (!gameState || gameState.gamePhase !== 'playing') return true;
    
    const currentPlayer = gameState.players.find(p => p.id === playerId);
    if (!currentPlayer) return true;
    
    const isMyTurn = gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === playerId);
    if (!isMyTurn) return true;
    
    const topCard = getEffectiveTopCard(gameState.pile);
    
    // Check if any card in hand can be played
    const canPlayFromHand = currentPlayer.hand.some(card => canPlayCard(card, topCard));
    
    // Check if any face-up card can be played (when hand is empty)
    const canPlayFromFaceUp = currentPlayer.hand.length === 0 && 
                              currentPlayer.faceUpCards.some(card => canPlayCard(card, topCard));
    
    return canPlayFromHand || canPlayFromFaceUp;
  }, [gameState, playerId]);

  const leaveRoom = useCallback(async () => {
    if (!currentRoom) return;

    try {
      // Remove player from room
      await supabase
        .from('room_players')
        .delete()
        .eq('room_id', currentRoom.id)
        .eq('player_id', playerId);

      // Update room player count
      await supabase
        .from('game_rooms')
        .update({ current_players: currentRoom.current_players - 1 })
        .eq('id', currentRoom.id);

      // Reset local state
      setCurrentRoom(null);
      setIsConnected(false);
      setRoomPlayers([]);
      setGameState(null);
      setSelectedCards([]);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [currentRoom, playerId]);

  return {
    playerId,
    playerName,
    setPlayerName,
    createRoom,
    joinRoom,
    fetchAvailableRooms,
    availableRooms,
    currentRoom,
    isConnected,
    roomPlayers,
    gameState,
    startGame,
    selectedCards,
    handleCardClick,
    confirmFaceUpCards,
    startGamePhase,
    playCards,
    canPlaySelected: canPlaySelected(),
    pickupCards,
    playFaceDownCard,
    canPlayAnyCard: canPlayAnyCard(),
    leaveRoom
  };
};