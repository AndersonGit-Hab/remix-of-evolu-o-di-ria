-- Add RLS policies for INSERT and DELETE on store_rewards
CREATE POLICY "insert_store_rewards" 
ON public.store_rewards 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "delete_store_rewards" 
ON public.store_rewards 
FOR DELETE 
USING (auth.uid() IS NOT NULL);