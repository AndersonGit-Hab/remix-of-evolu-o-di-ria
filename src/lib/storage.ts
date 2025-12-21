import { User, GameDay, GameEvent } from '@/types/game';

const STORAGE_KEYS = {
  USER: 'evolution_user',
  DAYS: 'evolution_days',
  EVENTS: 'evolution_events',
} as const;

// User storage
export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const deleteUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.DAYS);
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
};

// Days storage
export const getDays = (): GameDay[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DAYS);
  return data ? JSON.parse(data) : [];
};

export const saveDay = (day: GameDay): void => {
  const days = getDays();
  const existingIndex = days.findIndex(d => d.id === day.id);
  if (existingIndex >= 0) {
    days[existingIndex] = day;
  } else {
    days.push(day);
  }
  localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(days));
};

export const getDayByDate = (date: string): GameDay | null => {
  const days = getDays();
  return days.find(d => d.date === date) || null;
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Events storage (immutable log)
export const getEvents = (): GameEvent[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  return data ? JSON.parse(data) : [];
};

export const addEvent = (event: Omit<GameEvent, 'id' | 'timestamp'>): GameEvent => {
  const events = getEvents();
  const newEvent: GameEvent = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  events.push(newEvent);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  return newEvent;
};

// Generate unique ID
export const generateId = (): string => crypto.randomUUID();