import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { XP_CAP, XP_LOSS_CAP } from '@/types/game';

export interface Mission {
  id: string;
  day_id: string;
  type: 'main' | 'secondary' | 'bonus';
  title: string;
  description: string | null;
  status: 'pending' | 'completed' | 'failed';
  coin_reward: number;
  created_at: string;
}

export interface GameDay {
  id: string;
  profile_id: string;
  date: string;
  status: 'open' | 'closed';
  xp_gained: number;
  xp_lost: number;
  coins_earned: number;
  is_forgiveness: boolean;
  created_at: string;
  closed_at: string | null;
  // Stats for charts
  positiveHabitsCount?: number;
  negativeHabitsCount?: number;
  missionsTotal?: number;
  missionsCompleted?: number;
}

export interface HabitLog {
  id: string;
  day_id: string;
  habit_id: string | null;
  habit_name: string;
  habit_type: 'positive' | 'negative';
  xp_value: number;
  created_at: string;
}

const getTodayDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useGameDay = () => {
  const { profile, addXp, addCoins } = useProfile();
  const [currentDay, setCurrentDay] = useState<GameDay | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [allDays, setAllDays] = useState<GameDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCurrentDay = useCallback(async () => {
    if (!profile) {
      setCurrentDay(null);
      setMissions([]);
      setHabitLogs([]);
      setLoading(false);
      return;
    }

    const today = getTodayDate();
    
    const { data: dayData, error: dayError } = await supabase
      .from('days')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('date', today)
      .maybeSingle();

    if (dayError) {
      console.error('Error fetching day:', dayError);
    }

    setCurrentDay(dayData as GameDay | null);

    if (dayData) {
      // Fetch missions for this day
      const { data: missionsData } = await supabase
        .from('missions')
        .select('*')
        .eq('day_id', dayData.id)
        .order('created_at', { ascending: true });

      setMissions((missionsData || []) as Mission[]);

      // Fetch habit logs for this day
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('day_id', dayData.id)
        .order('created_at', { ascending: true });

      setHabitLogs((logsData || []) as HabitLog[]);
    } else {
      setMissions([]);
      setHabitLogs([]);
    }

    setLoading(false);
  }, [profile]);

  const fetchAllDays = useCallback(async () => {
    if (!profile) {
      setAllDays([]);
      return;
    }

    const { data: daysData } = await supabase
      .from('days')
      .select('*')
      .eq('profile_id', profile.id)
      .order('date', { ascending: false });

    if (!daysData || daysData.length === 0) {
      setAllDays([]);
      return;
    }

    // Fetch stats for each day in parallel
    const daysWithStats = await Promise.all(
      daysData.map(async (day) => {
        const [habitsResult, missionsResult] = await Promise.all([
          supabase
            .from('habit_logs')
            .select('habit_type')
            .eq('day_id', day.id),
          supabase
            .from('missions')
            .select('status')
            .eq('day_id', day.id),
        ]);

        const positiveHabitsCount = habitsResult.data?.filter(h => h.habit_type === 'positive').length || 0;
        const negativeHabitsCount = habitsResult.data?.filter(h => h.habit_type === 'negative').length || 0;
        const missionsTotal = missionsResult.data?.length || 0;
        const missionsCompleted = missionsResult.data?.filter(m => m.status === 'completed').length || 0;

        return {
          ...day,
          positiveHabitsCount,
          negativeHabitsCount,
          missionsTotal,
          missionsCompleted,
        };
      })
    );

    setAllDays(daysWithStats as GameDay[]);
  }, [profile]);

  useEffect(() => {
    fetchCurrentDay();
    fetchAllDays();
  }, [fetchCurrentDay, fetchAllDays]);

  const startDay = useCallback(async (isForgiveness: boolean = false): Promise<GameDay | null> => {
    if (!profile) return null;

    const today = getTodayDate();
    
    // Check if day already exists
    if (currentDay) return currentDay;

    const { data, error } = await supabase
      .from('days')
      .insert({
        profile_id: profile.id,
        date: today,
        is_forgiveness: isForgiveness,
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting day:', error);
      return null;
    }

    // Log event
    await supabase.from('events').insert({
      profile_id: profile.id,
      type: 'day_started',
      details: isForgiveness ? 'Dia de perdão iniciado' : 'Novo dia iniciado',
    });

    const newDay = data as GameDay;
    setCurrentDay(newDay);
    setAllDays(prev => [newDay, ...prev]);
    return newDay;
  }, [profile, currentDay]);

  const addMission = useCallback(async (
    type: Mission['type'], 
    title: string, 
    description?: string
  ): Promise<Mission | null> => {
    if (!currentDay || currentDay.status === 'closed') return null;

    const coinReward = type === 'main' ? 15 : type === 'secondary' ? 10 : 5;

    const { data, error } = await supabase
      .from('missions')
      .insert({
        day_id: currentDay.id,
        type,
        title,
        description: description || null,
        coin_reward: coinReward,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding mission:', error);
      return null;
    }

    const mission = data as Mission;
    setMissions(prev => [...prev, mission]);
    return mission;
  }, [currentDay]);

  const updateMissionStatus = useCallback(async (
    missionId: string, 
    status: 'completed' | 'failed'
  ): Promise<{ coinChange: number } | null> => {
    if (!currentDay || currentDay.status === 'closed' || !profile) return null;

    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.status !== 'pending') return null;

    const { error: missionError } = await supabase
      .from('missions')
      .update({ status })
      .eq('id', missionId);

    if (missionError) {
      console.error('Error updating mission:', missionError);
      return null;
    }

    let coinChange = 0;

    if (status === 'completed' && !currentDay.is_forgiveness) {
      coinChange = mission.coin_reward;
      
      // Update day coins
      await supabase
        .from('days')
        .update({ coins_earned: currentDay.coins_earned + coinChange })
        .eq('id', currentDay.id);

      setCurrentDay(prev => prev ? { ...prev, coins_earned: prev.coins_earned + coinChange } : null);
    }

    // Log event
    await supabase.from('events').insert({
      profile_id: profile.id,
      type: status === 'completed' ? 'mission_completed' : 'mission_failed',
      details: `Missão "${mission.title}" ${status === 'completed' ? 'completada' : 'falhou'}`,
      coin_change: coinChange || null,
    });

    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, status } : m));
    
    return { coinChange };
  }, [currentDay, missions, profile]);

  const deleteMission = useCallback(async (missionId: string): Promise<boolean> => {
    if (!currentDay || currentDay.status === 'closed') return false;

    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', missionId);

    if (error) {
      console.error('Error deleting mission:', error);
      return false;
    }

    setMissions(prev => prev.filter(m => m.id !== missionId));
    return true;
  }, [currentDay]);

  const recordHabit = useCallback(async (
    habitId: string | null,
    habitName: string,
    habitType: 'positive' | 'negative',
    xpValue: number
  ): Promise<number> => {
    if (!currentDay || currentDay.status === 'closed' || currentDay.is_forgiveness || !profile) return 0;

    let actualXp = xpValue;

    if (habitType === 'positive') {
      const remainingXpCap = XP_CAP - currentDay.xp_gained;
      actualXp = Math.min(xpValue, remainingXpCap);
    } else {
      const remainingLossCap = XP_LOSS_CAP - currentDay.xp_lost;
      actualXp = Math.min(xpValue, remainingLossCap);
    }

    if (actualXp <= 0) return 0;

    // Insert habit log
    const { data: logData, error: logError } = await supabase
      .from('habit_logs')
      .insert({
        day_id: currentDay.id,
        habit_id: habitId,
        habit_name: habitName,
        habit_type: habitType,
        xp_value: actualXp,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error recording habit:', logError);
      return 0;
    }

    // Update day XP
    const updates = habitType === 'positive'
      ? { xp_gained: currentDay.xp_gained + actualXp }
      : { xp_lost: currentDay.xp_lost + actualXp };

    await supabase
      .from('days')
      .update(updates)
      .eq('id', currentDay.id);

    setCurrentDay(prev => prev ? { ...prev, ...updates } : null);
    setHabitLogs(prev => [...prev, logData as HabitLog]);

    // Log event
    await supabase.from('events').insert({
      profile_id: profile.id,
      type: habitType === 'positive' ? 'positive_habit_completed' : 'negative_habit_triggered',
      details: `Hábito ${habitType === 'positive' ? 'positivo' : 'negativo'} "${habitName}" registrado`,
      xp_change: habitType === 'positive' ? actualXp : -actualXp,
    });

    return actualXp;
  }, [currentDay, profile]);

  const closeDay = useCallback(async (): Promise<{ netXp: number; coins: number } | null> => {
    if (!currentDay || currentDay.status === 'closed' || !profile) return null;

    const netXp = currentDay.xp_gained - currentDay.xp_lost;
    const coins = currentDay.coins_earned;

    // Close the day
    const { error } = await supabase
      .from('days')
      .update({ 
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', currentDay.id);

    if (error) {
      console.error('Error closing day:', error);
      return null;
    }

    // Update profile XP and coins
    if (netXp !== 0) {
      if (netXp > 0) {
        await addXp(netXp);
      }
      // Note: XP never goes below 0, tracked separately
    }
    
    if (coins > 0) {
      await addCoins(coins);
    }

    // Log event
    await supabase.from('events').insert({
      profile_id: profile.id,
      type: 'day_closed',
      details: `Dia encerrado | XP líquido: ${netXp >= 0 ? '+' : ''}${netXp} | Moedas: +${coins}`,
      xp_change: netXp,
      coin_change: coins,
    });

    setCurrentDay(prev => prev ? { ...prev, status: 'closed' as const, closed_at: new Date().toISOString() } : null);

    return { netXp, coins };
  }, [currentDay, profile, addXp, addCoins]);

  const getMissionCounts = useCallback(() => {
    return {
      main: missions.filter(m => m.type === 'main').length,
      secondary: missions.filter(m => m.type === 'secondary').length,
      bonus: missions.filter(m => m.type === 'bonus').length,
    };
  }, [missions]);

  return {
    currentDay,
    missions,
    habitLogs,
    allDays,
    loading,
    fetchCurrentDay,
    fetchAllDays,
    startDay,
    addMission,
    updateMissionStatus,
    deleteMission,
    recordHabit,
    closeDay,
    getMissionCounts,
  };
};
