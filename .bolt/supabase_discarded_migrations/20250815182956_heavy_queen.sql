@@ .. @@
   RETURN 'Cleanup completed';
 END;
 $$ LANGUAGE plpgsql SECURITY DEFINER;
+
+-- Close all existing open rooms immediately
+UPDATE game_rooms 
+SET status = 'finished' 
+WHERE status IN ('waiting', 'playing');
+
+-- Clean up all room players from closed rooms
+DELETE FROM room_players 
+WHERE room_id IN (
+  SELECT id FROM game_rooms 
+  WHERE status = 'finished'
+);
 
 -- Grant execute permissions to both authenticated and anonymous users