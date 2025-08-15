import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const useMultiplayer = () => {
  const [playerId] = useState(() => uuidv4());
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  // Real-time subscription for room updates
  React.useEffect(() => {
    if (!currentRoom) return;

    console.log('Setting up real-time subscription for room:', currentRoom.id);

    // Subscribe to room players changes
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
          // Refetch room players when changes occur
          fetchRoomPlayers();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(playersSubscription);
    };
  }, [currentRoom?.id]);

  // Function to fetch current room players
  const fetchRoomPlayers = useCallback(async () => {
    if (!currentRoom) return;

    try {
      const { data: players, error } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', currentRoom.id)
        .order('player_index');

      if (error) {
        console.error('Error fetching room players:', error);
      } else {
        console.log('Fetched room players:', players);
        setRoomPlayers(players || []);
      }
    } catch (error) {
      console.error('Error fetching room players:', error);
    }
  }, [currentRoom?.id]);

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
    roomPlayers
  };
};