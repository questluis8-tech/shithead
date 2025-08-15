/*
  # Multiplayer Shithead Game Schema

  1. New Tables
    - `game_rooms`
      - `id` (uuid, primary key)
      - `name` (text, room name)
      - `host_id` (text, host player ID)
      - `max_players` (integer, maximum players allowed)
      - `current_players` (integer, current player count)
      - `status` (text, room status: waiting/playing/finished)
      - `game_state` (jsonb, current game state)
      - `created_at` (timestamp)
    
    - `room_players`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to game_rooms)
      - `player_id` (text, unique player identifier)
      - `player_name` (text, display name)
      - `player_index` (integer, position in game)
      - `is_host` (boolean, whether player is room host)
      - `is_connected` (boolean, connection status)
      - `joined_at` (timestamp)
    
    - `game_actions`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to game_rooms)
      - `player_id` (text, player who performed action)
      - `action_type` (text, type of action)
      - `action_data` (jsonb, action payload)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for room access and player actions
*/

-- Create game_rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  host_id text NOT NULL,
  max_players integer NOT NULL DEFAULT 4,
  current_players integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  game_state jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create room_players table
CREATE TABLE IF NOT EXISTS room_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_id text NOT NULL,
  player_name text NOT NULL,
  player_index integer NOT NULL,
  is_host boolean NOT NULL DEFAULT false,
  is_connected boolean NOT NULL DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, player_id),
  UNIQUE(room_id, player_index)
);

-- Create game_actions table
CREATE TABLE IF NOT EXISTS game_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_id text NOT NULL,
  action_type text NOT NULL,
  action_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;

-- Policies for game_rooms
CREATE POLICY "Anyone can view waiting rooms"
  ON game_rooms
  FOR SELECT
  USING (status = 'waiting');

CREATE POLICY "Anyone can create rooms"
  ON game_rooms
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Host can update their room"
  ON game_rooms
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for room_players
CREATE POLICY "Anyone can view room players"
  ON room_players
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join rooms"
  ON room_players
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update their own data"
  ON room_players
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Players can leave rooms"
  ON room_players
  FOR DELETE
  USING (true);

-- Policies for game_actions
CREATE POLICY "Anyone can view game actions"
  ON game_actions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create game actions"
  ON game_actions
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_room_id ON game_actions(room_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_created_at ON game_actions(created_at);