import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface GameEvent {
  id: string;
  profile_id: string;
  type: string;
  details: string;
  xp_change: number | null;
  coin_change: number | null;
  created_at: string;
}

export const useSupabaseEvents = () => {
  const { profile } = useProfile();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!profile) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching events:', error);
    }

    setEvents(data || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = useCallback(async (
    type: string,
    details: string,
    xpChange?: number,
    coinChange?: number
  ): Promise<GameEvent | null> => {
    if (!profile) return null;

    const { data, error } = await supabase
      .from('events')
      .insert({
        profile_id: profile.id,
        type,
        details,
        xp_change: xpChange ?? null,
        coin_change: coinChange ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding event:', error);
      return null;
    }

    setEvents(prev => [data, ...prev]);
    return data;
  }, [profile]);

  return {
    events,
    loading,
    fetchEvents,
    addEvent,
  };
};
