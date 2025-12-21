import { useState, useEffect, useCallback } from 'react';
import { GameEvent } from '@/types/game';
import { getEvents } from '@/lib/storage';

export const useEvents = () => {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(() => {
    const storedEvents = getEvents();
    // Sort by timestamp descending (newest first)
    setEvents(storedEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const refresh = useCallback(() => {
    loadEvents();
  }, [loadEvents]);

  const getRecentEvents = useCallback((count: number = 10) => {
    return events.slice(0, count);
  }, [events]);

  const getEventsByType = useCallback((type: GameEvent['type']) => {
    return events.filter(e => e.type === type);
  }, [events]);

  const getEventsByDateRange = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return events.filter(e => {
      const eventTime = new Date(e.timestamp).getTime();
      return eventTime >= start && eventTime <= end;
    });
  }, [events]);

  return {
    events,
    loading,
    refresh,
    getRecentEvents,
    getEventsByType,
    getEventsByDateRange,
  };
};