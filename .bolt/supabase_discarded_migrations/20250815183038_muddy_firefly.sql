@@ .. @@
 CREATE OR REPLACE FUNCTION cleanup_old_rooms()
 RETURNS void AS $$
 BEGIN
+  -- Close all existing open rooms immediately
+  UPDATE game_rooms 
+  SET status = 'finished' 
+  WHERE status IN ('waiting', 'playing');
+  
+  -- Remove all players from closed rooms
+  DELETE FROM room_players 
+  WHERE room_id IN (
+    SELECT id FROM game_rooms 
+    WHERE status = 'finished'
+  );
+  
   -- Delete waiting rooms older than 1 hour
   DELETE FROM game_rooms 
   WHERE status = 'waiting' 
   AND created_at < NOW() - INTERVAL '1 hour';
   
   -- Clean up any orphaned room_players
   DELETE FROM room_players 
   WHERE room_id NOT IN (SELECT id FROM game_rooms);
 END;
 $$ LANGUAGE plpgsql;