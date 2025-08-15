@@ .. @@
 /*
   # Create cleanup function for old rooms
 
   1. New Functions
     - `cleanup_old_rooms()` - Removes rooms older than 1 hour and orphaned players
   
   2. Security
     - Function can be called by authenticated and anonymous users
   
   3. Immediate Actions
     - Closes all existing open rooms
     - Removes all players from closed rooms
 */
 
+-- Close all existing rooms immediately
+UPDATE game_rooms SET status = 'finished' WHERE status IN ('waiting', 'playing');
+DELETE FROM room_players;
+
 -- Create the cleanup function
 CREATE OR REPLACE FUNCTION cleanup_old_rooms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 AS $$
 BEGIN
   -- Delete rooms older than 1 hour that are still waiting
   DELETE FROM game_rooms 
   WHERE status = 'waiting' 
   AND created_at < NOW() - INTERVAL '1 hour';
   
   -- Clean up any orphaned room_players (players in rooms that no longer exist)
   DELETE FROM room_players 
   WHERE room_id NOT IN (SELECT id FROM game_rooms);
 END;
 $$;
 
 -- Grant execute permissions
 GRANT EXECUTE ON FUNCTION cleanup_old_rooms() TO authenticated;
 GRANT EXECUTE ON FUNCTION cleanup_old_rooms() TO anon;
-
--- Close all existing rooms immediately
-UPDATE game_rooms SET status = 'finished' WHERE status IN ('waiting', 'playing');
-DELETE FROM room_players;