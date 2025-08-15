/*
  # Fix Multiplayer Game Schema

  This migration creates the necessary tables and functions for multiplayer Shithead game functionality.

  1. New Tables
    - `game_rooms` - Stores game room information
    - `room_players` - Tracks players in each room
    - `game_actions` - Logs game actions for synchronization

  2. Security
    - Enable RLS on all tables
    - Add policies for anonymous access (required for multiplayer)

  3. Functions
    - `cleanup_old_rooms` - Removes inactive rooms older than 1 hour
*/

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS game_actions CASCADE;
DROP TABLE IF EXISTS room_players CASCADE;
DROP TABLE IF EXISTS game_rooms CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS cleanup_old_rooms();

-- Create game_rooms table
CREATE TABLE game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  host_id text NOT NULL,
  max_players integer NOT NULL DEFAULT 4,
  current_players integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'waiting',
  game_state jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT game_rooms_status_check CHECK (status IN ('waiting', 'playing', 'finished'))
);

-- Create room_players table
CREATE TABLE room_players (
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
CREATE TABLE game_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_id text NOT NULL,
  action_type text NOT NULL,
  action_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_game_rooms_status ON game_rooms(status);
CREATE INDEX idx_room_players_room_id ON room_players(room_id);
CREATE INDEX idx_game_actions_room_id ON game_actions(room_id);
CREATE INDEX idx_game_actions_created_at ON game_actions(created_at);

-- Enable Row Level Security
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for game_rooms
CREATE POLICY "Allow anonymous to view rooms"
  ON game_rooms
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous to create rooms"
  ON game_rooms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to update rooms"
  ON game_rooms
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for room_players
CREATE POLICY "Allow anonymous to view room players"
  ON room_players
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous to join rooms"
  ON room_players
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to update room players"
  ON room_players
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to leave rooms"
  ON room_players
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create policies for game_actions
CREATE POLICY "Allow anonymous to view game actions"
  ON game_actions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous to create game actions"
  ON game_actions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create cleanup function for old rooms
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete rooms older than 1 hour that are still waiting or finished
  DELETE FROM game_rooms 
  WHERE created_at < NOW() - INTERVAL '1 hour'
    AND status IN ('waiting', 'finished');
    
  -- Update disconnected players in active games
  UPDATE room_players 
  SET is_connected = false 
  WHERE joined_at < NOW() - INTERVAL '5 minutes'
    AND is_connected = true;
END;
$$;