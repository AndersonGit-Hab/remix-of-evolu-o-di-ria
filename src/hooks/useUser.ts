import { useState, useEffect, useCallback } from 'react';
import { User, getLevelFromXp, getXpProgressInLevel, getAvailableSlots, LEVELS_PER_FORGIVENESS } from '@/types/game';
import { getUser, saveUser, deleteUser, generateId, addEvent } from '@/lib/storage';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const createUser = useCallback((name: string) => {
    const newUser: User = {
      id: generateId(),
      name,
      totalXp: 0,
      currentCoins: 0,
      createdAt: new Date().toISOString(),
      positiveHabits: [],
      negativeHabits: [],
      slotUnlocks: [],
      forgivenessAvailable: false,
      lootBoxes: [],
      storeRewards: [
        { id: generateId(), name: 'Dia de Descanso', description: 'Um dia sem obrigações', cost: 50, available: true },
        { id: generateId(), name: 'Refeição Especial', description: 'Coma algo que você adora', cost: 30, available: true },
        { id: generateId(), name: 'Entretenimento', description: '2 horas de lazer livre', cost: 40, available: true },
        { id: generateId(), name: 'Compra Pequena', description: 'Algo até R$50', cost: 100, available: true },
      ],
    };
    saveUser(newUser);
    setUser(newUser);
    addEvent({ type: 'day_started', details: `Personagem "${name}" criado` });
    return newUser;
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    saveUser(updatedUser);
    setUser(updatedUser);
  }, [user]);

  const addXp = useCallback((amount: number) => {
    if (!user) return;
    const previousLevel = getLevelFromXp(user.totalXp);
    const newTotalXp = user.totalXp + amount;
    const newLevel = getLevelFromXp(newTotalXp);
    
    const updatedUser = { ...user, totalXp: newTotalXp };
    
    // Check for level up rewards
    if (newLevel > previousLevel) {
      for (let lvl = previousLevel + 1; lvl <= newLevel; lvl++) {
        // Add loot box for each level gained
        const isRare = lvl % 10 === 0;
        updatedUser.lootBoxes = [
          ...updatedUser.lootBoxes,
          {
            id: generateId(),
            type: isRare ? 'rare' : 'normal',
            opened: false,
            earnedAtLevel: lvl,
          },
        ];
        
        // Check forgiveness unlock (every 5 levels)
        if (lvl % LEVELS_PER_FORGIVENESS === 0) {
          updatedUser.forgivenessAvailable = true;
        }
        
        addEvent({ 
          type: 'level_up', 
          details: `Subiu para o nível ${lvl}!`,
          xpChange: amount,
        });
      }
    }
    
    saveUser(updatedUser);
    setUser(updatedUser);
  }, [user]);

  const removeXp = useCallback((amount: number) => {
    if (!user) return;
    // XP never goes below 0, but we still track the loss
    const newTotalXp = Math.max(0, user.totalXp - amount);
    const updatedUser = { ...user, totalXp: newTotalXp };
    saveUser(updatedUser);
    setUser(updatedUser);
  }, [user]);

  const addCoins = useCallback((amount: number) => {
    if (!user) return;
    const updatedUser = { ...user, currentCoins: user.currentCoins + amount };
    saveUser(updatedUser);
    setUser(updatedUser);
  }, [user]);

  const spendCoins = useCallback((amount: number): boolean => {
    if (!user || user.currentCoins < amount) return false;
    const updatedUser = { ...user, currentCoins: user.currentCoins - amount };
    saveUser(updatedUser);
    setUser(updatedUser);
    return true;
  }, [user]);

  const useForgiveness = useCallback(() => {
    if (!user || !user.forgivenessAvailable) return false;
    const updatedUser = { ...user, forgivenessAvailable: false };
    saveUser(updatedUser);
    setUser(updatedUser);
    addEvent({ type: 'forgiveness_used', details: 'Perdão usado - dia livre sem penalidades' });
    return true;
  }, [user]);

  const unlockSlot = useCallback((choice: 'secondary' | 'bonus') => {
    if (!user) return;
    const level = getLevelFromXp(user.totalXp);
    const newUnlock = {
      level,
      choice,
      timestamp: new Date().toISOString(),
    };
    const updatedUser = {
      ...user,
      slotUnlocks: [...user.slotUnlocks, newUnlock],
    };
    saveUser(updatedUser);
    setUser(updatedUser);
    addEvent({ 
      type: 'slot_unlocked', 
      details: choice === 'secondary' 
        ? '+1 slot de missão secundária desbloqueado' 
        : '+2 slots de missão bônus desbloqueados',
    });
  }, [user]);

  const resetUser = useCallback(() => {
    deleteUser();
    setUser(null);
  }, []);

  const level = user ? getLevelFromXp(user.totalXp) : 1;
  const xpProgress = user ? getXpProgressInLevel(user.totalXp) : { current: 0, needed: 100 };
  const slots = user ? getAvailableSlots(user.slotUnlocks) : { secondary: 1, bonus: 1 };

  return {
    user,
    loading,
    level,
    xpProgress,
    slots,
    createUser,
    updateUser,
    addXp,
    removeXp,
    addCoins,
    spendCoins,
    useForgiveness,
    unlockSlot,
    resetUser,
  };
};