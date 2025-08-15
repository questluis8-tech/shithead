/*
  # Close old rooms and add automatic cleanup

  1. Changes
    - Close all currently open rooms (set status to 'finished')
    - Clean up room_players for closed rooms
    - Add automatic cleanup for rooms older than 1 hour

  2. Cleanup Logic
    - Rooms older than 1 hour are automatically set to 'finished'
    - Associated room_players are cleaned up
    - This prevents abandoned rooms from cluttering the lobby
*/

-- Close all currently open rooms
UPDATE game_rooms 
SET status = 'finished' 
WHERE status IN ('waiting', 'playing');

-- Clean up room_players for finished rooms
DELETE FROM room_players 
WHERE room_id IN (
  SELECT id FROM game_rooms WHERE status = 'finished'
);

-- Create a function to clean up old rooms
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Close rooms older than 1 hour
  UPDATE game_rooms 
  SET status = 'finished'
  WHERE status IN ('waiting', 'playing') 
    AND created_at < NOW() - INTERVAL '1 hour';
  
  -- Clean up room_players for finished rooms
  DELETE FROM room_players 
  WHERE room_id IN (
    SELECT id FROM game_rooms WHERE status = 'finished'
  );
END;
$$;

-- Create a trigger to automatically run cleanup when rooms are queried
-- This ensures cleanup happens regularly without needing a cron job
CREATE OR REPLACE FUNCTION trigger_cleanup_old_rooms()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Run cleanup when someone queries for waiting rooms
  PERFORM cleanup_old_rooms();
  RETURN NULL;
END;
$$;

-- Create trigger that runs cleanup when game_rooms table is accessed
-- This is a simple way to ensure regular cleanup without external scheduling
DROP TRIGGER IF EXISTS auto_cleanup_rooms ON game_rooms;
CREATE TRIGGER auto_cleanup_rooms
  AFTER SELECT ON game_rooms
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_old_rooms();