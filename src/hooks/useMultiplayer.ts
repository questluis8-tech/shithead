import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export const useMultiplayer = () => {
  const [playerId] = useState(() => uuidv4());
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

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
      setCurrentRoom(room);
      setIsConnected(true);
      
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room: ' + error.message);
    }
  }, [playerId, playerName]);

  return {
    playerId,
    playerName,
    setPlayerName,
    createRoom,
    currentRoom,
    isConnected
    currentRoom,
    isConnected
  };
};