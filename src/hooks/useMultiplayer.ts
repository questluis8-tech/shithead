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

  // Load available rooms
  const loadAvailableRooms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  }, []);

  // Create a new room
  const createRoom = useCallback(async (roomName: string, maxPlayers: number) => {
    if (!playerName.trim()) {
      alert('Please enter your name first');
      return;
    }

    try {
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

      if (roomError) throw roomError;

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

      if (playerError) throw playerError;

      setCurrentRoom(room);
      setIsConnected(true);
      
      // Load room players
      await loadRoomPlayers(room.id);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  }, [playerId, playerName]);

  // Join an existing room
  const joinRoom = useCallback(async (roomId: string) => {
    if (!playerName.trim()) {
      alert('Please enter your name first');
      return;
    }

    try {
      // Get room info
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      if (room.current_players >= room.max_players) {
        alert('Room is full');
        return;
      }

      // Add player to room
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: roomId,
          player_id: playerId,
          player_name: playerName,
          player_index: room.current_players,
          is_host: false
        });

      if (playerError) throw playerError;

      // Update room player count
      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({ current_players: room.current_players + 1 })
        .eq('id', roomId);

      if (updateError) throw updateError;

      setCurrentRoom(room);
      setIsConnected(true);
      
      // Load room players
      await loadRoomPlayers(roomId);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room');
    }
  }, [playerId, playerName]);

  // Load room players
  const loadRoomPlayers = useCallback(async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomId)
        .order('player_index');

      if (error) throw error;
      setRoomPlayers(data || []);
    } catch (error) {
      console.error('Error loading room players:', error);
    }
  }, []);

  // Leave room
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

      setCurrentRoom(null);
      setRoomPlayers([]);
      setGameState(null);
      setIsConnected(false);
      setSelectedCards([]);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [currentRoom, playerId]);

  // Send game action
  const sendGameAction = useCallback(async (actionType: string, actionData: any) => {
    if (!currentRoom) return;

    try {
      await supabase
        .from('game_actions')
        .insert({
          room_id: currentRoom.id,
          player_id: playerId,
          action_type: actionType,
          action_data: actionData
        });
    } catch (error) {
      console.error('Error sending action:', error);
    }
  }, [currentRoom, playerId]);

  // Game action handlers (placeholder for now)
  const dealCards = useCallback(() => {
    sendGameAction('deal_cards', {});
  }, [sendGameAction]);

  const playCards = useCallback((cards: Card[]) => {
    sendGameAction('play_cards', { cards });
  }, [sendGameAction]);

  const pickupCards = useCallback(() => {
    sendGameAction('pickup_cards', {});
  }, [sendGameAction]);

  const playFaceDownCard = useCallback((cardIndex: number) => {
    sendGameAction('play_face_down', { cardIndex });
  }, [sendGameAction]);

  const confirmFaceUpCards = useCallback(() => {
    sendGameAction('confirm_face_up', {});
  }, [sendGameAction]);

  const startGame = useCallback(() => {
    sendGameAction('start_game', {});
  }, [sendGameAction]);

  // Load available rooms on mount
  useEffect(() => {
    loadAvailableRooms();
  }, [loadAvailableRooms]);

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
    loadAvailableRooms,

    // Game actions
    dealCards,
    playCards,
    pickupCards,
    playFaceDownCard,
    confirmFaceUpCards,
    startGame
  };
};