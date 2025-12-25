-- Remove a política atual
DROP POLICY IF EXISTS "update_own_open_days" ON public.days;

-- Cria nova política com WITH CHECK separado
CREATE POLICY "update_own_open_days" 
ON public.days 
FOR UPDATE 
USING (
  profile_id = get_user_profile_id() 
  AND status = 'open'::text
)
WITH CHECK (
  profile_id = get_user_profile_id()
);