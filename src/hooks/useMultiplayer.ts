import { useState, useCallback } from 'react';

export const useMultiplayer = () => {
  const [playerName, setPlayerName] = useState('');

  // Simple create room function for now
  const createRoom = useCallback(async (roomName: string, maxPlayers: number) => {
    console.log('Creating room:', roomName, 'for', maxPlayers, 'players');
    alert(`Would create room: ${roomName}`);
  }, []);

  return {
    playerName,
    setPlayerName,
    createRoom
  };
};