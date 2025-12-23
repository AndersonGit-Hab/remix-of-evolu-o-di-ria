import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useHabits, Habit } from '@/hooks/useHabits';
import { useGameDay, Mission } from '@/hooks/useGameDay';
import { useSupabaseEvents } from '@/hooks/useSupabaseEvents';
import { useStore, StoreReward, RedeemedReward } from '@/hooks/useStore';
import { XpBar } from './XpBar';
import { StatsDisplay } from './StatsDisplay';
import { MissionList } from './MissionList';
import { HabitTracker } from './HabitTracker';
import { DaySummary } from './DaySummary';
import { EventLog } from './EventLog';
import { XpChart } from './XpChart';
import { Store } from './Store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Shield, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard = () => {
  const { signOut } = useAuth();
  const { profile, xpProgress, useForgiveness } = useProfile();
  const { positiveHabits, negativeHabits, addHabit, deleteHabit } = useHabits();
  const { currentDay, missions, allDays, startDay, addMission, updateMissionStatus, recordHabit, closeDay } = useGameDay();
  const { events, fetchEvents } = useSupabaseEvents();
  const { rewards, redeemedRewards, redeemReward } = useStore();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!profile) return null;

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
  };

  const handleStartDay = async (asForgiveness: boolean = false) => {
    if (asForgiveness && profile.has_forgiveness) {
      await useForgiveness();
    }
    await startDay(asForgiveness);
    await fetchEvents();
    toast.success(asForgiveness ? 'Dia de perdão iniciado!' : 'Novo dia iniciado!');
  };

  const handleCompleteMission = async (id: string) => {
    const result = await updateMissionStatus(id, 'completed');
    if (result) {
      await fetchEvents();
      toast.success(`+${result.coinChange} moedas`);
    }
  };

  const handleFailMission = async (id: string) => {
    await updateMissionStatus(id, 'failed');
    await fetchEvents();
    toast.error('Missão falhou');
  };

  const handleRecordPositive = async (habit: Habit) => {
    const xpGained = await recordHabit(habit.id, habit.name, 'positive', habit.xp_value);
    if (xpGained > 0) {
      await fetchEvents();
      toast.success(`+${xpGained} XP por ${habit.name}`);
    }
  };

  const handleRecordNegative = async (habit: Habit) => {
    const xpLost = await recordHabit(habit.id, habit.name, 'negative', habit.xp_value);
    if (xpLost > 0) {
      await fetchEvents();
      toast.error(`-${xpLost} XP`);
    }
  };

  const handleCloseDay = async () => {
    const result = await closeDay();
    if (result) {
      await fetchEvents();
      toast.success(`Dia encerrado! XP líquido: ${result.netXp >= 0 ? '+' : ''}${result.netXp}`);
    }
  };

  const handleAddPositiveHabit = async (name: string, xpValue: number) => {
    await addHabit(name, 'positive', xpValue);
  };

  const handleAddNegativeHabit = async (name: string, xpPenalty: number) => {
    await addHabit(name, 'negative', xpPenalty);
  };

  const handleRedeemReward = async (reward: StoreReward) => {
    const success = await redeemReward(reward);
    if (success) {
      await fetchEvents();
      toast.success(`🎁 ${reward.name} resgatado!`);
    } else {
      toast.error('Moedas insuficientes');
    }
  };

  // Convert missions to format expected by MissionList
  const formattedMissions = missions.map(m => ({
    id: m.id,
    type: m.type,
    title: m.title,
    description: m.description || undefined,
    status: m.status,
    xpReward: 0,
    coinReward: m.coin_reward,
  }));

  // Convert habits to format expected by HabitTracker
  const formattedPositiveHabits = positiveHabits.map(h => ({
    id: h.id,
    name: h.name,
    xpValue: h.xp_value,
    completedToday: false,
  }));

  const formattedNegativeHabits = negativeHabits.map(h => ({
    id: h.id,
    name: h.name,
    xpPenalty: h.xp_value,
    triggeredToday: false,
  }));

  // Convert day to format expected by DaySummary
  const formattedDay = currentDay ? {
    id: currentDay.id,
    date: currentDay.date,
    status: currentDay.status,
    missions: formattedMissions,
    xpGained: currentDay.xp_gained,
    xpLost: currentDay.xp_lost,
    coinsEarned: currentDay.coins_earned,
    isForgiveness: currentDay.is_forgiveness,
  } : null;

  // Convert events to format expected by EventLog
  const formattedEvents = events.map(e => ({
    id: e.id,
    timestamp: e.created_at,
    type: e.type as any,
    details: e.details,
    xpChange: e.xp_change ?? undefined,
    coinChange: e.coin_change ?? undefined,
  }));

  // Convert allDays for XpChart
  const formattedAllDays = allDays.map(d => ({
    id: d.id,
    date: d.date,
    status: d.status,
    missions: [],
    xpGained: d.xp_gained,
    xpLost: d.xp_lost,
    coinsEarned: d.coins_earned,
    isForgiveness: d.is_forgiveness,
  }));

  // Convert for Store
  const formattedRewards = rewards.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description || '',
    cost: r.cost,
    available: r.available,
  }));

  const formattedRedeemedHistory = redeemedRewards.map(r => ({
    id: r.id,
    reward: {
      id: r.reward_id || '',
      name: r.reward_name,
      description: '',
      cost: r.reward_cost,
      available: true,
    },
    redeemedAt: r.redeemed_at,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-gradient-gold">{profile.username}</h1>
              <p className="text-sm text-muted-foreground">Nível {profile.level} • {profile.total_xp.toLocaleString()} XP total</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={loggingOut} className="text-muted-foreground">
              {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            </Button>
          </div>
          <XpBar current={xpProgress.current} needed={xpProgress.needed} level={profile.level} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatsDisplay
          totalXp={profile.total_xp}
          coins={profile.coins}
          level={profile.level}
          daysPlayed={allDays.length}
          forgivenessAvailable={profile.has_forgiveness}
        />

        {!currentDay ? (
          <Card className="p-8 card-dark text-center">
            <h2 className="font-display text-2xl font-bold mb-4">Iniciar Novo Dia</h2>
            <p className="text-muted-foreground mb-6">Comece sua jornada diária de evolução</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => handleStartDay(false)} className="glow-gold">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Dia Normal
              </Button>
              {profile.has_forgiveness && (
                <Button variant="outline" onClick={() => handleStartDay(true)} className="border-success/30 text-success">
                  <Shield className="w-4 h-4 mr-2" />
                  Usar Perdão
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="missions" className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full max-w-2xl mx-auto">
              <TabsTrigger value="missions">Missões</TabsTrigger>
              <TabsTrigger value="habits">Hábitos</TabsTrigger>
              <TabsTrigger value="summary">Resumo</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              <TabsTrigger value="store">Loja</TabsTrigger>
              <TabsTrigger value="log">Log</TabsTrigger>
            </TabsList>

            <TabsContent value="missions">
              <MissionList
                missions={formattedMissions}
                slots={{ secondary: profile.secondary_slots, bonus: profile.bonus_slots }}
                dayStatus={currentDay.status}
                isForgiveness={currentDay.is_forgiveness}
                onAddMission={(type, title) => addMission(type, title)}
                onCompleteMission={handleCompleteMission}
                onFailMission={handleFailMission}
              />
            </TabsContent>

            <TabsContent value="habits">
              <HabitTracker
                positiveHabits={formattedPositiveHabits}
                negativeHabits={formattedNegativeHabits}
                dayXpGained={currentDay.xp_gained}
                dayXpLost={currentDay.xp_lost}
                dayStatus={currentDay.status}
                isForgiveness={currentDay.is_forgiveness}
                onAddPositiveHabit={handleAddPositiveHabit}
                onAddNegativeHabit={handleAddNegativeHabit}
                onRemovePositiveHabit={(id) => deleteHabit(id)}
                onRemoveNegativeHabit={(id) => deleteHabit(id)}
                onRecordPositive={(h) => handleRecordPositive(positiveHabits.find(ph => ph.id === h.id)!)}
                onRecordNegative={(h) => handleRecordNegative(negativeHabits.find(nh => nh.id === h.id)!)}
              />
            </TabsContent>

            <TabsContent value="summary">
              {formattedDay && <DaySummary day={formattedDay} onCloseDay={handleCloseDay} />}
            </TabsContent>

            <TabsContent value="stats">
              <XpChart days={formattedAllDays} />
            </TabsContent>

            <TabsContent value="store">
              <Store
                coins={profile.coins}
                rewards={formattedRewards}
                redeemedHistory={formattedRedeemedHistory}
                onRedeemReward={(r) => handleRedeemReward(rewards.find(rw => rw.id === r.id)!)}
                onAddReward={() => {}}
                onDeleteReward={() => {}}
              />
            </TabsContent>

            <TabsContent value="log">
              <EventLog events={formattedEvents} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};
