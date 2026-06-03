DROP POLICY IF EXISTS "Anyone can insert players" ON public.players;
DROP POLICY IF EXISTS "Anyone can update players" ON public.players;

CREATE OR REPLACE FUNCTION public.upsert_player_stats(
  p_client_id text,
  p_name text,
  p_wins integer,
  p_losses integer,
  p_matches integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
BEGIN
  IF p_client_id IS NULL OR length(p_client_id) < 8 OR length(p_client_id) > 64 THEN
    RAISE EXCEPTION 'invalid client_id';
  END IF;

  v_name := coalesce(nullif(btrim(p_name), ''), 'Player');
  v_name := substr(v_name, 1, 20);

  IF p_wins < 0 OR p_losses < 0 OR p_matches < 0
     OR p_wins > 100000 OR p_losses > 100000 OR p_matches > 100000 THEN
    RAISE EXCEPTION 'invalid stats';
  END IF;

  INSERT INTO public.players (client_id, name, wins, losses, matches, updated_at)
  VALUES (p_client_id, v_name, p_wins, p_losses, p_matches, now())
  ON CONFLICT (client_id) DO UPDATE
  SET name = EXCLUDED.name,
      wins = EXCLUDED.wins,
      losses = EXCLUDED.losses,
      matches = EXCLUDED.matches,
      updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_player_stats(text, text, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_player_stats(text, text, integer, integer, integer) TO anon, authenticated;