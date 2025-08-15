/*
  # Create cleanup function for old rooms

  1. New Functions
    - `cleanup_old_rooms()` - Removes rooms older than 1 hour and orphaned players
  
  2. Security
    - Grant execute permissions to authenticated and anonymous users
  
  3. Functionality
    - Deletes waiting rooms older than 1 hour
    - Removes orphaned room_players entries
*/

CREATE OR REPLACE FUNCTION public.cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete old waiting rooms (older than 1 hour)
  DELETE FROM game_rooms
  WHERE status = 'waiting'
  AND created_at < NOW() - INTERVAL '1 hour';

  -- Clean up orphaned room_players entries
  DELETE FROM room_players
  WHERE room_id NOT IN (SELECT id FROM game_rooms);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.cleanup_old_rooms() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_rooms() TO anon;