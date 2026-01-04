// Core game types for the Personal Evolution System

export type MissionType = 'main' | 'secondary' | 'bonus';
export type MissionStatus = 'pending' | 'completed' | 'failed';
export type DayStatus = 'open' | 'closed';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description?: string;
  status: MissionStatus;
  xpReward: number;
  coinReward: number;
}

export interface PositiveHabit {
  id: string;
  name: string;
  xpValue: number; // Must sum to XP_CAP (100) across all habits
  completedToday: boolean;
}

export interface NegativeHabit {
  id: string;
  name: string;
  xpPenalty: number; // Individual penalties, total loss capped at XP_LOSS_CAP (70)
  triggeredToday: boolean;
}

export interface GameDay {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  status: DayStatus;
  missions: Mission[];
  xpGained: number;
  xpLost: number;
  coinsEarned: number;
  isForgiveness: boolean;
  // Stats for charts
  positiveHabitsCount?: number;
  negativeHabitsCount?: number;
  missionsTotal?: number;
  missionsCompleted?: number;
}

export interface SlotUnlockChoice {
  level: number;
  choice: 'secondary' | 'bonus';
  timestamp: string;
}

export interface LootBox {
  id: string;
  type: 'normal' | 'rare';
  opened: boolean;
  reward?: LootBoxReward;
  earnedAtLevel: number;
}

export interface LootBoxReward {
  type: 'discount' | 'premium_reward' | 'free_day' | 'nothing';
  description: string;
  value?: number;
}

export interface StoreReward {
  id: string;
  name: string;
  description: string;
  cost: number;
  available: boolean;
}

export interface GameEvent {
  id: string;
  timestamp: string;
  type: 
    | 'day_started'
    | 'mission_completed'
    | 'mission_failed'
    | 'negative_habit_triggered'
    | 'positive_habit_completed'
    | 'day_closed'
    | 'reward_redeemed'
    | 'level_up'
    | 'slot_unlocked'
    | 'loot_box_opened'
    | 'forgiveness_used';
  details: string;
  xpChange?: number;
  coinChange?: number;
}

export interface User {
  id: string;
  name: string;
  totalXp: number;
  currentCoins: number;
  createdAt: string;
  positiveHabits: PositiveHabit[];
  negativeHabits: NegativeHabit[];
  slotUnlocks: SlotUnlockChoice[];
  forgivenessAvailable: boolean;
  lootBoxes: LootBox[];
  storeRewards: StoreReward[];
}

// Game constants
export const XP_CAP = 100;
export const XP_LOSS_CAP = 70;
export const BASE_SECONDARY_SLOTS = 1;
export const BASE_BONUS_SLOTS = 1;
export const MAX_SECONDARY_SLOTS = 5;
export const MAX_BONUS_SLOTS = 10;
export const LEVELS_PER_SLOT_UNLOCK = 10;
export const LEVELS_PER_FORGIVENESS = 5;

// XP required per level (simple formula: level * 100)
export const getXpForLevel = (level: number): number => level * 100;

// Calculate level from total XP
export const getLevelFromXp = (totalXp: number): number => {
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded + getXpForLevel(level) <= totalXp) {
    xpNeeded += getXpForLevel(level);
    level++;
  }
  return level;
};

// Get XP progress within current level
export const getXpProgressInLevel = (totalXp: number): { current: number; needed: number } => {
  let level = 1;
  let xpConsumed = 0;
  while (xpConsumed + getXpForLevel(level) <= totalXp) {
    xpConsumed += getXpForLevel(level);
    level++;
  }
  return {
    current: totalXp - xpConsumed,
    needed: getXpForLevel(level),
  };
};

// Calculate available slots based on level and choices
export const getAvailableSlots = (slotUnlocks: SlotUnlockChoice[]): { secondary: number; bonus: number } => {
  let secondary = BASE_SECONDARY_SLOTS;
  let bonus = BASE_BONUS_SLOTS;
  
  slotUnlocks.forEach(unlock => {
    if (unlock.choice === 'secondary') {
      secondary = Math.min(secondary + 1, MAX_SECONDARY_SLOTS);
    } else {
      bonus = Math.min(bonus + 2, MAX_BONUS_SLOTS);
    }
  });
  
  return { secondary, bonus };
};