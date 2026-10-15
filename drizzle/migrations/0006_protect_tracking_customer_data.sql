REVOKE ALL ON public.rastreios FROM anon, authenticated;
DROP POLICY IF EXISTS "Anyone can read rastreios" ON public.rastreios;
DROP POLICY IF EXISTS "Authenticated can manage rastreios" ON public.rastreios;
GRANT ALL ON public.rastreios TO service_role;
COMMENT ON TABLE public.rastreios IS 'Private delivery records accessed through validated server functions, not public customer lists.';