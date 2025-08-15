import { Card, Player, GameState } from './game';

export interface GameRoom {
  id: string;
  name: string;
  host_id: string;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
  game_state?: GameState;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_name: string;
  player_index: number;
  is_host: boolean;
  is_connected: boolean;
  joined_at: string;
}

export interface GameAction {
  id: string;
  room_id: string;
  player_id: string;
  action_type: 'deal_cards' | 'play_cards' | 'pickup_cards' | 'face_down_card' | 'confirm_face_up' | 'start_game';
  action_data: any;
  created_at: string;
}

export interface MultiplayerGameState extends GameState {
  room_id: string;
  host_id: string;
  connected_players: string[];
}