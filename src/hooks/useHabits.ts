import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface Habit {
  id: string;
  profile_id: string;
  name: string;
  type: 'positive' | 'negative';
  xp_value: number;
  created_at: string;
}

export const useHabits = () => {
  const { profile } = useProfile();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!profile) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching habits:', error);
    }

    setHabits((data || []) as Habit[]);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = useCallback(async (
    name: string, 
    type: 'positive' | 'negative', 
    xpValue: number
  ): Promise<Habit | null> => {
    if (!profile) return null;

    const { data, error } = await supabase
      .from('habits')
      .insert({
        profile_id: profile.id,
        name,
        type,
        xp_value: xpValue,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding habit:', error);
      return null;
    }

    const habit = data as Habit;
    setHabits(prev => [...prev, habit]);
    return habit;
  }, [profile]);

  const updateHabit = useCallback(async (
    id: string, 
    updates: Partial<Pick<Habit, 'name' | 'xp_value'>>
  ): Promise<Habit | null> => {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating habit:', error);
      return null;
    }

    const habit = data as Habit;
    setHabits(prev => prev.map(h => h.id === id ? habit : h));
    return habit;
  }, []);

  const deleteHabit = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting habit:', error);
      return false;
    }

    setHabits(prev => prev.filter(h => h.id !== id));
    return true;
  }, []);

  const positiveHabits = habits.filter(h => h.type === 'positive');
  const negativeHabits = habits.filter(h => h.type === 'negative');

  return {
    habits,
    positiveHabits,
    negativeHabits,
    loading,
    fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
  };
};
