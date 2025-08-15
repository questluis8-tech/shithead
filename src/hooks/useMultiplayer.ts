import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useMultiplayer = () => {
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Simple create room function for now
  const createRoom = useCallback(async (roomName: string, maxPlayers: number) => {
    console.log('Creating room:', roomName, 'for', maxPlayers, 'players');
    alert(`Would create room: ${roomName}`);
  }, []);

  return {
    playerName,
    setPlayerName,
    createRoom,
    currentRoom,
    isConnected
  };
};