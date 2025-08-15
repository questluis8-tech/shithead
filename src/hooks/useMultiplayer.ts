import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { GameRoom, RoomPlayer, GameAction, MultiplayerGameState } from '../types/multiplayer';
import { Card, Player } from '../types/game';
import { createDeck, canPlayCard, shouldBurn, getEffectiveTopCard } from '../utils/cardUtils';
import { v4 as uuidv4 } from 'uuid';

export const useMultiplayer = () => {
  const [playerId] = useState(() => uuidv4());
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null);
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  // Subscribe to room updates
  useEffect(() => {
    if (!currentRoom) return;

    const roomSubscription = supabase
      .channel(`room:${currentRoom.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_rooms',
        filter: `id=eq.${currentRoom.id}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setCurrentRoom(payload.new as GameRoom);
          if (payload.new.game_state) {
            setGameState(payload.new.game_state as MultiplayerGameState);
          }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_players',
        filter: `room_id=eq.${currentRoom.id}`
      }, () => {
        // Refresh room players when changes occur
        fetchRoomPlayers(currentRoom.id);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_actions',
        filter: `room_id=eq.${currentRoom.id}`
      }, (payload) => {
        handleGameAction(payload.new as GameAction);
      })
      .subscribe();

    return () => {
      roomSubscription.unsubscribe();
    };
  }, [currentRoom]);

  // Fetch available rooms
  const fetchAvailableRooms = useCallback(async () => {
    const { data, error } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rooms:', error);
      return;
    }

    setAvailableRooms(data || []);
  }, []);

  // Fetch room players
  const fetchRoomPlayers = useCallback(async (roomId: string) => {
    const { data, error } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('player_index');

    if (error) {
      console.error('Error fetching room players:', error);
      return;
    }

    setRoomPlayers(data || []);
  }, []);

  // Create a new room
  const createRoom = useCallback(async (roomName: string, maxPlayers: number) => {
    if (!playerName.trim()) {
      throw new Error('Please enter your name first');
    }

    const roomId = uuidv4();
    
    // Create room
    const { error: roomError } = await supabase
      .from('game_rooms')
      .insert({
        id: roomId,
        name: roomName,
        host_id: playerId,
        max_players: maxPlayers,
        current_players: 1,
        status: 'waiting'
      });

    if (roomError) {
      console.error('Error creating room:', roomError);
      throw new Error('Failed to create room');
    }

    // Add host as first player
    const { error: playerError } = await supabase
      .from('room_players')
      .insert({
        id: uuidv4(),
        room_id: roomId,
        player_id: playerId,
        player_name: playerName,
        player_index: 0,
        is_host: true,
        is_connected: true
      });

    if (playerError) {
      console.error('Error adding host to room:', playerError);
      throw new Error('Failed to join room as host');
    }

    // Fetch the created room
    const { data: roomData } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomData) {
      setCurrentRoom(roomData);
      setIsConnected(true);
      await fetchRoomPlayers(roomId);
    }
  }, [playerId, playerName, fetchRoomPlayers]);

  // Join an existing room
  const joinRoom = useCallback(async (roomId: string) => {
    if (!playerName.trim()) {
      throw new Error('Please enter your name first');
    }

    // Check if room exists and has space
    const { data: roomData, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !roomData) {
      throw new Error('Room not found');
    }

    if (roomData.current_players >= roomData.max_players) {
      throw new Error('Room is full');
    }

    if (roomData.status !== 'waiting') {
      throw new Error('Game already in progress');
    }

    // Add player to room
    const { error: playerError } = await supabase
      .from('room_players')
      .insert({
        id: uuidv4(),
        room_id: roomId,
        player_id: playerId,
        player_name: playerName,
        player_index: roomData.current_players,
        is_host: false,
        is_connected: true
      });

    if (playerError) {
      console.error('Error joining room:', playerError);
      throw new Error('Failed to join room');
    }

    // Update room player count
    const { error: updateError } = await supabase
      .from('game_rooms')
      .update({ current_players: roomData.current_players + 1 })
      .eq('id', roomId);

    if (updateError) {
      console.error('Error updating room:', updateError);
    }

    setCurrentRoom(roomData);
    setIsConnected(true);
    await fetchRoomPlayers(roomId);
  }, [playerId, playerName, fetchRoomPlayers]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!currentRoom) return;

    // Remove player from room
    const { error: removeError } = await supabase
      .from('room_players')
      .delete()
      .eq('room_id', currentRoom.id)
      .eq('player_id', playerId);

    if (removeError) {
      console.error('Error leaving room:', removeError);
    }

    // Update room player count
    const { error: updateError } = await supabase
      .from('game_rooms')
      .update({ current_players: Math.max(0, currentRoom.current_players - 1) })
      .eq('id', currentRoom.id);

    if (updateError) {
      console.error('Error updating room:', updateError);
    }

    setCurrentRoom(null);
    setRoomPlayers([]);
    setGameState(null);
    setIsConnected(false);
    setSelectedCards([]);
  }, [currentRoom, playerId]);

  // Send game action
  const sendGameAction = useCallback(async (actionType: string, actionData: any) => {
    if (!currentRoom) return;

    const { error } = await supabase
      .from('game_actions')
      .insert({
        id: uuidv4(),
        room_id: currentRoom.id,
        player_id: playerId,
        action_type: actionType,
        action_data: actionData
      });

    if (error) {
      console.error('Error sending game action:', error);
    }
  }, [currentRoom, playerId]);

  // Handle incoming game actions
  const handleGameAction = useCallback(async (action: GameAction) => {
    if (!currentRoom || !gameState) return;

    // Only the host processes game actions to avoid conflicts
    const isHost = roomPlayers.find(p => p.player_id === playerId)?.is_host;
    if (!isHost) return;

    let newGameState = { ...gameState };
    let shouldUpdateDatabase = false;

    switch (action.action_type) {
      case 'deal_cards':
        newGameState = dealCardsMultiplayer();
        shouldUpdateDatabase = true;
        break;
      
      case 'play_cards':
        const playResult = playCardsMultiplayer(action.action_data.cards, action.player_id);
        if (playResult) {
          newGameState = playResult;
          shouldUpdateDatabase = true;
        }
        break;
      
      case 'pickup_cards':
        newGameState = pickupCardsMultiplayer(action.player_id);
        shouldUpdateDatabase = true;
        break;
      
      case 'face_down_card':
        const faceDownResult = playFaceDownCardMultiplayer(action.action_data.cardIndex, action.player_id);
        if (faceDownResult) {
          newGameState = faceDownResult;
          shouldUpdateDatabase = true;
        }
        break;
      
      case 'confirm_face_up':
        newGameState = { ...gameState, gamePhase: 'swapping' };
        shouldUpdateDatabase = true;
        break;
      
      case 'start_game':
        newGameState = { ...gameState, gamePhase: 'playing' };
        shouldUpdateDatabase = true;
        break;
    }

    if (shouldUpdateDatabase) {
      // Update game state in database
      const { error } = await supabase
        .from('game_rooms')
        .update({ 
          game_state: newGameState,
          status: newGameState.gamePhase === 'finished' ? 'finished' : 'playing'
        })
        .eq('id', currentRoom.id);

      if (error) {
        console.error('Error updating game state:', error);
      }
    }
  }, [currentRoom, gameState, roomPlayers, playerId]);

  // Game logic functions adapted for multiplayer
  const dealCardsMultiplayer = useCallback((): MultiplayerGameState => {
    const deck = createDeck();
    const players: Player[] = roomPlayers.map((roomPlayer, index) => ({
      id: roomPlayer.player_id,
      name: roomPlayer.player_name,
      hand: [],
      faceDownCards: [],
      faceUpCards: [],
      isAI: false
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

    return {
      room_id: currentRoom!.id,
      host_id: currentRoom!.host_id,
      connected_players: roomPlayers.map(p => p.player_id),
      players,
      currentPlayerIndex: 0,
      pile: [],
      deck: remainingDeck,
      gamePhase: 'setup',
      winner: null,
      loser: null
    };
  }, [roomPlayers, currentRoom]);

  const playCardsMultiplayer = useCallback((cards: Card[], playerId: string): MultiplayerGameState | null => {
    if (!gameState) return null;

    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex !== gameState.currentPlayerIndex) return null;

    const topCard = getEffectiveTopCard(gameState.pile);
    if (!canPlayCard(cards[0], topCard)) return null;

    const newGameState = { ...gameState };
    const newPlayers = [...newGameState.players];
    const currentPlayer = { ...newPlayers[playerIndex] };
    const newPile = [...newGameState.pile, ...cards];

    // Remove played cards
    cards.forEach(card => {
      const handIndex = currentPlayer.hand.findIndex(c => c.id === card.id);
      const faceUpIndex = currentPlayer.faceUpCards.findIndex(c => c.id === card.id);
      
      if (handIndex !== -1) {
        currentPlayer.hand.splice(handIndex, 1);
      } else if (faceUpIndex !== -1) {
        currentPlayer.faceUpCards.splice(faceUpIndex, 1);
      }
    });

    newPlayers[playerIndex] = currentPlayer;
    newGameState.players = newPlayers;
    newGameState.pile = newPile;

    // Check for special effects
    const hasTen = cards.some(card => card.rank === 10);
    const burnPile = shouldBurn(newPile);

    if (hasTen || burnPile) {
      newGameState.pile = [];
      // Same player continues
    } else {
      // Next player's turn
      newGameState.currentPlayerIndex = (playerIndex + 1) % newGameState.players.length;
    }

    // Check win condition
    const hasWon = currentPlayer.hand.length === 0 && 
                   currentPlayer.faceUpCards.length === 0 && 
                   currentPlayer.faceDownCards.length === 0;

    if (hasWon) {
      newGameState.gamePhase = 'finished';
      newGameState.winner = currentPlayer.id;
    }

    return newGameState;
  }, [gameState]);

  const pickupCardsMultiplayer = useCallback((playerId: string): MultiplayerGameState => {
    if (!gameState) return gameState!;

    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return gameState;

    const newGameState = { ...gameState };
    const newPlayers = [...newGameState.players];
    const currentPlayer = { ...newPlayers[playerIndex] };

    currentPlayer.hand = [...currentPlayer.hand, ...newGameState.pile];
    newPlayers[playerIndex] = currentPlayer;

    newGameState.players = newPlayers;
    newGameState.pile = [];
    newGameState.currentPlayerIndex = (playerIndex + 1) % newGameState.players.length;

    return newGameState;
  }, [gameState]);

  const playFaceDownCardMultiplayer = useCallback((cardIndex: number, playerId: string): MultiplayerGameState | null => {
    if (!gameState) return null;

    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex !== gameState.currentPlayerIndex) return null;

    const currentPlayer = gameState.players[playerIndex];
    if (cardIndex >= currentPlayer.faceDownCards.length) return null;

    const revealedCard = currentPlayer.faceDownCards[cardIndex];
    const topCard = getEffectiveTopCard(gameState.pile);

    const newGameState = { ...gameState };
    const newPlayers = [...newGameState.players];
    const newCurrentPlayer = { ...newPlayers[playerIndex] };

    newCurrentPlayer.faceDownCards = newCurrentPlayer.faceDownCards.filter((_, index) => index !== cardIndex);
    newPlayers[playerIndex] = newCurrentPlayer;
    newGameState.players = newPlayers;

    if (canPlayCard(revealedCard, topCard)) {
      // Can play the card
      const newPile = [...newGameState.pile, revealedCard];
      newGameState.pile = newPile;

      const hasTen = revealedCard.rank === 10;
      const burnPile = shouldBurn(newPile);

      if (hasTen || burnPile) {
        newGameState.pile = [];
        // Same player continues
      } else {
        // Next player's turn
        newGameState.currentPlayerIndex = (playerIndex + 1) % newGameState.players.length;
      }

      // Check win condition
      const hasWon = newCurrentPlayer.hand.length === 0 && 
                     newCurrentPlayer.faceUpCards.length === 0 && 
                     newCurrentPlayer.faceDownCards.length === 0;

      if (hasWon) {
        newGameState.gamePhase = 'finished';
        newGameState.winner = newCurrentPlayer.id;
      }
    } else {
      // Can't play - pick up pile + revealed card
      newCurrentPlayer.hand = [...newCurrentPlayer.hand, ...newGameState.pile, revealedCard];
      newPlayers[playerIndex] = newCurrentPlayer;
      newGameState.players = newPlayers;
      newGameState.pile = [];
      newGameState.currentPlayerIndex = (playerIndex + 1) % newGameState.players.length;
    }

    return newGameState;
  }, [gameState]);

  // Initialize multiplayer system
  useEffect(() => {
    fetchAvailableRooms();
    
    // Set up periodic room refresh
    const interval = setInterval(fetchAvailableRooms, 5000);
    return () => clearInterval(interval);
  }, [fetchAvailableRooms]);

  return {
    // State
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

    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    sendGameAction,
    fetchAvailableRooms,

    // Game actions
    dealCards: () => sendGameAction('deal_cards', {}),
    playCards: (cards: Card[]) => sendGameAction('play_cards', { cards }),
    pickupCards: () => sendGameAction('pickup_cards', {}),
    playFaceDownCard: (cardIndex: number) => sendGameAction('face_down_card', { cardIndex }),
    confirmFaceUpCards: () => sendGameAction('confirm_face_up', {}),
    startGame: () => sendGameAction('start_game', {})
  };
};