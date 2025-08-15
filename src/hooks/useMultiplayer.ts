import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const useMultiplayer = () => {
  const [playerId] = useState(() => uuidv4());
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [gameState, setGameState] = useState(null);

  // Function to leave room
  const leaveRoom = useCallback(async () => {
    if (!currentRoom) return;

    try {
      console.log('Leaving room:', currentRoom.id);
      
      // Remove player from room_players
      const { error: deleteError } = await supabase
        .from('room_players')
        .delete()
        .eq('room_id', currentRoom.id)
        .eq('player_id', playerId);

      if (deleteError) {
        console.error('Error leaving room:', deleteError);
        throw deleteError;
      }

      // Update room player count
      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({ current_players: currentRoom.current_players - 1 })
        .eq('id', currentRoom.id);

      if (updateError) {
        console.error('Error updating room count:', updateError);
      }

      // Reset local state
      setCurrentRoom(null);
      setIsConnected(false);
      setRoomPlayers([]);
      setGameState(null);
      
    } catch (error) {
      console.error('Error leaving room:', error);
      alert('Failed to leave room: ' + error.message);
    }
  }, [currentRoom, playerId]);

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
      // First run cleanup to close old rooms
      const { error: cleanupError } = await supabase.rpc('cleanup_old_rooms');
      if (cleanupError) {
        console.warn('Cleanup error (non-critical):', cleanupError);
      }
      
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
    if (!currentRoom || !roomPlayers.length) {
      return;
    }

    try {
      console.log('Starting game for room:', currentRoom.id);
      
      // Initialize the actual multiplayer game
      const { initializeGame } = await import('./useMultiplayerGame');
      
      // Create a temporary instance to initialize the game
      const gameHook = {
        initializeGame: async (players: any[]) => {
          console.log('Initializing multiplayer game with players:', players);
          
          // Import game utilities
          const { createDeck } = await import('../utils/cardUtils');
          
          // Create deck and deal cards
          const deck = createDeck();
          const gamePlayers: any[] = [];

          // Create players from room players
          roomPlayers.forEach((roomPlayer) => {
            gamePlayers.push({
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
            for (let playerIndex = 0; playerIndex < gamePlayers.length; playerIndex++) {
              gamePlayers[playerIndex].hand.push(deck[deckIndex++]);
            }
          }

          // Deal 3 face-down cards to each player
          for (let round = 0; round < 3; round++) {
            for (let playerIndex = 0; playerIndex < gamePlayers.length; playerIndex++) {
              gamePlayers[playerIndex].faceDownCards.push(deck[deckIndex++]);
            }
          }

          const remainingDeck = deck.slice(deckIndex);

          const initialGameState = {
            room_id: currentRoom.id,
            host_id: roomPlayers.find(p => p.is_host)?.player_id || '',
            connected_players: roomPlayers.map(p => p.player_id),
            players: gamePlayers,
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
            .eq('id', currentRoom.id);

          if (error) {
            console.error('Error saving game state:', error);
            throw error;
          }

          console.log('Game initialized successfully');
          return initialGameState;
        }
      };
      
      await gameHook.initializeGame(roomPlayers);
      
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game: ' + error.message);
    }
  }, [currentRoom, roomPlayers]);

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
    leaveRoom
  };
};