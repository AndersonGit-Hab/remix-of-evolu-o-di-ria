import { useState, useEffect, useCallback } from 'react';
import { GameDay, Mission, MissionStatus, XP_CAP, XP_LOSS_CAP } from '@/types/game';
import { getDayByDate, saveDay, getTodayDate, generateId, addEvent, getDays } from '@/lib/storage';

export const useDay = () => {
  const [currentDay, setCurrentDay] = useState<GameDay | null>(null);
  const [allDays, setAllDays] = useState<GameDay[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDay = useCallback((date?: string) => {
    const targetDate = date || getTodayDate();
    const day = getDayByDate(targetDate);
    setCurrentDay(day);
    setAllDays(getDays());
    setLoading(false);
    return day;
  }, []);

  useEffect(() => {
    loadDay();
  }, [loadDay]);

  const startDay = useCallback((isForgiveness: boolean = false) => {
    const today = getTodayDate();
    const existingDay = getDayByDate(today);
    
    if (existingDay) {
      setCurrentDay(existingDay);
      return existingDay;
    }

    const newDay: GameDay = {
      id: generateId(),
      date: today,
      status: 'open',
      missions: [],
      xpGained: 0,
      xpLost: 0,
      coinsEarned: 0,
      isForgiveness,
    };

    saveDay(newDay);
    setCurrentDay(newDay);
    setAllDays(prev => [...prev, newDay]);
    addEvent({ 
      type: 'day_started', 
      details: isForgiveness ? 'Dia de perdão iniciado' : 'Novo dia iniciado',
    });
    
    return newDay;
  }, []);

  const addMission = useCallback((type: Mission['type'], title: string, description?: string) => {
    if (!currentDay || currentDay.status === 'closed') return null;

    const xpReward = type === 'main' ? 30 : type === 'secondary' ? 20 : 10;
    const coinReward = type === 'main' ? 15 : type === 'secondary' ? 10 : 5;

    const newMission: Mission = {
      id: generateId(),
      type,
      title,
      description,
      status: 'pending',
      xpReward,
      coinReward,
    };

    const updatedDay = {
      ...currentDay,
      missions: [...currentDay.missions, newMission],
    };

    saveDay(updatedDay);
    setCurrentDay(updatedDay);
    return newMission;
  }, [currentDay]);

  const updateMissionStatus = useCallback((missionId: string, status: MissionStatus): { xpChange: number; coinChange: number } | null => {
    if (!currentDay || currentDay.status === 'closed') return null;

    const mission = currentDay.missions.find(m => m.id === missionId);
    if (!mission || mission.status !== 'pending') return null;

    const updatedMissions = currentDay.missions.map(m => 
      m.id === missionId ? { ...m, status } : m
    );

    let xpChange = 0;
    let coinChange = 0;

    if (status === 'completed' && !currentDay.isForgiveness) {
      xpChange = mission.xpReward;
      coinChange = mission.coinReward;
    }

    const updatedDay = {
      ...currentDay,
      missions: updatedMissions,
      xpGained: currentDay.xpGained + (status === 'completed' ? xpChange : 0),
      coinsEarned: currentDay.coinsEarned + (status === 'completed' ? coinChange : 0),
    };

    saveDay(updatedDay);
    setCurrentDay(updatedDay);
    
    addEvent({
      type: status === 'completed' ? 'mission_completed' : 'mission_failed',
      details: `Missão "${mission.title}" ${status === 'completed' ? 'completada' : 'falhou'}`,
      xpChange: status === 'completed' ? xpChange : 0,
      coinChange: status === 'completed' ? coinChange : 0,
    });

    return { xpChange, coinChange };
  }, [currentDay]);

  const recordPositiveHabit = useCallback((habitName: string, xpValue: number): number => {
    if (!currentDay || currentDay.status === 'closed' || currentDay.isForgiveness) return 0;

    // Cap total XP gain at XP_CAP
    const remainingXpCap = XP_CAP - currentDay.xpGained;
    const actualXp = Math.min(xpValue, remainingXpCap);

    if (actualXp <= 0) return 0;

    const updatedDay = {
      ...currentDay,
      xpGained: currentDay.xpGained + actualXp,
    };

    saveDay(updatedDay);
    setCurrentDay(updatedDay);
    
    addEvent({
      type: 'positive_habit_completed',
      details: `Hábito positivo "${habitName}" registrado`,
      xpChange: actualXp,
    });

    return actualXp;
  }, [currentDay]);

  const recordNegativeHabit = useCallback((habitName: string, xpPenalty: number): number => {
    if (!currentDay || currentDay.status === 'closed' || currentDay.isForgiveness) return 0;

    // Cap total XP loss at XP_LOSS_CAP
    const remainingLossCap = XP_LOSS_CAP - currentDay.xpLost;
    const actualPenalty = Math.min(xpPenalty, remainingLossCap);

    if (actualPenalty <= 0) return 0;

    const updatedDay = {
      ...currentDay,
      xpLost: currentDay.xpLost + actualPenalty,
    };

    saveDay(updatedDay);
    setCurrentDay(updatedDay);
    
    addEvent({
      type: 'negative_habit_triggered',
      details: `Hábito negativo "${habitName}" registrado`,
      xpChange: -actualPenalty,
    });

    return actualPenalty;
  }, [currentDay]);

  const closeDay = useCallback((): { netXp: number; coins: number } | null => {
    if (!currentDay || currentDay.status === 'closed') return null;

    const updatedDay = {
      ...currentDay,
      status: 'closed' as const,
    };

    saveDay(updatedDay);
    setCurrentDay(updatedDay);
    
    const netXp = currentDay.xpGained - currentDay.xpLost;
    
    addEvent({
      type: 'day_closed',
      details: `Dia encerrado | XP líquido: ${netXp >= 0 ? '+' : ''}${netXp} | Moedas: +${currentDay.coinsEarned}`,
      xpChange: netXp,
      coinChange: currentDay.coinsEarned,
    });

    return { netXp, coins: currentDay.coinsEarned };
  }, [currentDay]);

  const getMissionCounts = useCallback(() => {
    if (!currentDay) return { main: 0, secondary: 0, bonus: 0 };
    return {
      main: currentDay.missions.filter(m => m.type === 'main').length,
      secondary: currentDay.missions.filter(m => m.type === 'secondary').length,
      bonus: currentDay.missions.filter(m => m.type === 'bonus').length,
    };
  }, [currentDay]);

  return {
    currentDay,
    allDays,
    loading,
    loadDay,
    startDay,
    addMission,
    updateMissionStatus,
    recordPositiveHabit,
    recordNegativeHabit,
    closeDay,
    getMissionCounts,
  };
};