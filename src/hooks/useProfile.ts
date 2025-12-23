import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getLevelFromXp, getXpProgressInLevel } from '@/types/game';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  total_xp: number;
  level: number;
  coins: number;
  secondary_slots: number;
  bonus_slots: number;
  has_forgiveness: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    }
    
    setProfile(data);
    setLoading(false);
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!profile) return null;

    const { data, error } = await supabase
      .from('users_profile')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    setProfile(data);
    return data;
  }, [profile]);

  const addXp = useCallback(async (amount: number) => {
    if (!profile) return null;
    
    const newTotalXp = profile.total_xp + amount;
    const newLevel = getLevelFromXp(newTotalXp);
    
    // Check forgiveness unlock (every 5 levels)
    const previousLevel = profile.level;
    let hasForgiveness = profile.has_forgiveness;
    
    for (let lvl = previousLevel + 1; lvl <= newLevel; lvl++) {
      if (lvl % 5 === 0) {
        hasForgiveness = true;
      }
    }

    return updateProfile({ 
      total_xp: newTotalXp, 
      level: newLevel,
      has_forgiveness: hasForgiveness,
    });
  }, [profile, updateProfile]);

  const removeXp = useCallback(async (amount: number) => {
    if (!profile) return null;
    
    const newTotalXp = Math.max(0, profile.total_xp - amount);
    const newLevel = getLevelFromXp(newTotalXp);
    
    return updateProfile({ 
      total_xp: newTotalXp, 
      level: newLevel 
    });
  }, [profile, updateProfile]);

  const addCoins = useCallback(async (amount: number) => {
    if (!profile) return null;
    return updateProfile({ coins: profile.coins + amount });
  }, [profile, updateProfile]);

  const spendCoins = useCallback(async (amount: number): Promise<boolean> => {
    if (!profile || profile.coins < amount) return false;
    
    const result = await updateProfile({ coins: profile.coins - amount });
    return !!result;
  }, [profile, updateProfile]);

  const useForgiveness = useCallback(async () => {
    if (!profile || !profile.has_forgiveness) return false;
    
    const result = await updateProfile({ has_forgiveness: false });
    return !!result;
  }, [profile, updateProfile]);

  const unlockSlot = useCallback(async (choice: 'secondary' | 'bonus') => {
    if (!profile) return null;

    if (choice === 'secondary') {
      return updateProfile({ secondary_slots: profile.secondary_slots + 1 });
    } else {
      return updateProfile({ bonus_slots: profile.bonus_slots + 2 });
    }
  }, [profile, updateProfile]);

  const xpProgress = profile ? getXpProgressInLevel(profile.total_xp) : { current: 0, needed: 100 };

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    addXp,
    removeXp,
    addCoins,
    spendCoins,
    useForgiveness,
    unlockSlot,
    xpProgress,
  };
};
