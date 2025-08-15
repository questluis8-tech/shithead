export interface GameRoom {
  id: string;
  name: string;
  host_id: string;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'playing' | 'finished';
  created_at?: string;
  game_state?: MultiplayerGameState;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  player_index: number;
  is_host: boolean;
  is_connected: boolean;
  joined_at?: string;
}

export interface GameAction {
  id: string;
  room_id: string;
  player_id: string;
  action_type: string;
  action_data: any;
  created_at?: string;
}

export interface MultiplayerGameState {
  room_id: string;
  host_id: string;
  connected_players: string[];
  players: import('../types/game').Player[];
  currentPlayerIndex: number;
  pile: import('../types/game').Card[];
  deck: import('../types/game').Card[];
  gamePhase: 'setup' | 'swapping' | 'playing' | 'finished';
  winner: string | null;
  loser: string | null;
}