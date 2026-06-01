
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL UNIQUE,
  name text NOT NULL,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  matches integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.players TO anon;
GRANT SELECT, INSERT, UPDATE ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read players"
  ON public.players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert players"
  ON public.players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update players"
  ON public.players FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX players_wins_idx ON public.players (wins DESC);
