import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { useAuth } from './useAuth';

export interface StoreReward {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  available: boolean;
  created_at: string;
}

export interface RedeemedReward {
  id: string;
  profile_id: string;
  reward_id: string | null;
  reward_name: string;
  reward_cost: number;
  redeemed_at: string;
}

export const useStore = () => {
  const { isAuthenticated } = useAuth();
  const { profile, spendCoins } = useProfile();
  const [rewards, setRewards] = useState<StoreReward[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRewards = useCallback(async () => {
    if (!isAuthenticated) {
      setRewards([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('store_rewards')
      .select('*')
      .eq('available', true)
      .order('cost', { ascending: true });

    if (error) {
      console.error('Error fetching rewards:', error);
    }

    setRewards(data || []);
    setLoading(false);
  }, [isAuthenticated]);

  const fetchRedeemedRewards = useCallback(async () => {
    if (!profile) {
      setRedeemedRewards([]);
      return;
    }

    const { data, error } = await supabase
      .from('redeemed_rewards')
      .select('*')
      .eq('profile_id', profile.id)
      .order('redeemed_at', { ascending: false });

    if (error) {
      console.error('Error fetching redeemed rewards:', error);
    }

    setRedeemedRewards(data || []);
  }, [profile]);

  useEffect(() => {
    fetchRewards();
    fetchRedeemedRewards();
  }, [fetchRewards, fetchRedeemedRewards]);

  const redeemReward = useCallback(async (reward: StoreReward): Promise<boolean> => {
    if (!profile) return false;

    // Check if user has enough coins
    const success = await spendCoins(reward.cost);
    if (!success) return false;

    // Record the redemption
    const { error } = await supabase
      .from('redeemed_rewards')
      .insert({
        profile_id: profile.id,
        reward_id: reward.id,
        reward_name: reward.name,
        reward_cost: reward.cost,
      });

    if (error) {
      console.error('Error redeeming reward:', error);
      return false;
    }

    // Log event
    await supabase.from('events').insert({
      profile_id: profile.id,
      type: 'reward_redeemed',
      details: `Recompensa "${reward.name}" resgatada por ${reward.cost} moedas`,
      coin_change: -reward.cost,
    });

    await fetchRedeemedRewards();
    return true;
  }, [profile, spendCoins, fetchRedeemedRewards]);

  const addReward = useCallback(async (name: string, description: string, cost: number): Promise<boolean> => {
    if (!isAuthenticated) return false;

    const { error } = await supabase
      .from('store_rewards')
      .insert({
        name,
        description: description || null,
        cost,
        available: true,
      });

    if (error) {
      console.error('Error adding reward:', error);
      return false;
    }

    await fetchRewards();
    return true;
  }, [isAuthenticated, fetchRewards]);

  const deleteReward = useCallback(async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    const { error } = await supabase
      .from('store_rewards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reward:', error);
      return false;
    }

    await fetchRewards();
    return true;
  }, [isAuthenticated, fetchRewards]);

  return {
    rewards,
    redeemedRewards,
    loading,
    fetchRewards,
    fetchRedeemedRewards,
    redeemReward,
    addReward,
    deleteReward,
  };
};
