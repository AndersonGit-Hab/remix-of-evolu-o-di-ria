import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useDay } from '@/hooks/useDay';
import { useEvents } from '@/hooks/useEvents';
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
import { Play, Shield, LogOut, BarChart3, ShoppingCart } from 'lucide-react';
import { generateId, addEvent } from '@/lib/storage';
import { StoreReward } from '@/types/game';
import { toast } from 'sonner';

interface RedeemedReward {
  id: string;
  reward: StoreReward;
  redeemedAt: string;
}

export const Dashboard = () => {
  const { user, level, xpProgress, slots, addXp, removeXp, addCoins, spendCoins, updateUser, useForgiveness, resetUser } = useUser();
  const { currentDay, allDays, startDay, addMission, updateMissionStatus, recordPositiveHabit, recordNegativeHabit, closeDay, loadDay } = useDay();
  const { events, refresh: refreshEvents } = useEvents();
  const [redeemedHistory, setRedeemedHistory] = useState<RedeemedReward[]>([]);

  useEffect(() => {
    loadDay();
  }, [loadDay]);

  if (!user) return null;

  const handleStartDay = (asForgiveness: boolean = false) => {
    if (asForgiveness && user.forgivenessAvailable) {
      useForgiveness();
    }
    startDay(asForgiveness);
    refreshEvents();
    toast.success(asForgiveness ? 'Dia de perdão iniciado!' : 'Novo dia iniciado!');
  };

  const handleCompleteMission = (id: string) => {
    const result = updateMissionStatus(id, 'completed');
    if (result) {
      addXp(result.xpChange);
      addCoins(result.coinChange);
      refreshEvents();
      toast.success(`+${result.xpChange} XP, +${result.coinChange} moedas`);
    }
  };

  const handleFailMission = (id: string) => {
    updateMissionStatus(id, 'failed');
    refreshEvents();
    toast.error('Missão falhou');
  };

  const handleRecordPositive = (habit: typeof user.positiveHabits[0]) => {
    const xpGained = recordPositiveHabit(habit.name, habit.xpValue);
    if (xpGained > 0) {
      addXp(xpGained);
      updateUser({
        positiveHabits: user.positiveHabits.map(h => 
          h.id === habit.id ? { ...h, completedToday: true } : h
        ),
      });
      refreshEvents();
      toast.success(`+${xpGained} XP por ${habit.name}`);
    }
  };

  const handleRecordNegative = (habit: typeof user.negativeHabits[0]) => {
    const xpLost = recordNegativeHabit(habit.name, habit.xpPenalty);
    if (xpLost > 0) {
      removeXp(xpLost);
      updateUser({
        negativeHabits: user.negativeHabits.map(h => 
          h.id === habit.id ? { ...h, triggeredToday: true } : h
        ),
      });
      refreshEvents();
      toast.error(`-${xpLost} XP`);
    }
  };

  const handleCloseDay = () => {
    const result = closeDay();
    if (result) {
      refreshEvents();
      toast.success(`Dia encerrado! XP líquido: ${result.netXp >= 0 ? '+' : ''}${result.netXp}`);
    }
  };

  const handleAddPositiveHabit = (name: string, xpValue: number) => {
    updateUser({
      positiveHabits: [...user.positiveHabits, { id: generateId(), name, xpValue, completedToday: false }],
    });
  };

  const handleAddNegativeHabit = (name: string, xpPenalty: number) => {
    updateUser({
      negativeHabits: [...user.negativeHabits, { id: generateId(), name, xpPenalty, triggeredToday: false }],
    });
  };

  const handleRedeemReward = (reward: StoreReward) => {
    if (spendCoins(reward.cost)) {
      const redeemed: RedeemedReward = {
        id: generateId(),
        reward,
        redeemedAt: new Date().toISOString(),
      };
      setRedeemedHistory(prev => [redeemed, ...prev]);
      addEvent({ type: 'reward_redeemed', details: `Resgatou: ${reward.name}`, coinChange: -reward.cost });
      refreshEvents();
      toast.success(`🎁 ${reward.name} resgatado!`);
    }
  };

  const handleAddReward = (name: string, description: string, cost: number) => {
    const newReward: StoreReward = {
      id: generateId(),
      name,
      description,
      cost,
      available: true,
    };
    updateUser({ storeRewards: [...user.storeRewards, newReward] });
    toast.success('Recompensa adicionada!');
  };

  const handleDeleteReward = (id: string) => {
    updateUser({ storeRewards: user.storeRewards.filter(r => r.id !== id) });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-gradient-gold">{user.name}</h1>
              <p className="text-sm text-muted-foreground">Nível {level} • {user.totalXp.toLocaleString()} XP total</p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetUser} className="text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          <XpBar current={xpProgress.current} needed={xpProgress.needed} level={level} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatsDisplay
          totalXp={user.totalXp}
          coins={user.currentCoins}
          level={level}
          daysPlayed={allDays.length}
          forgivenessAvailable={user.forgivenessAvailable}
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
              {user.forgivenessAvailable && (
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
              <TabsTrigger value="store" className="gap-1">
                <ShoppingCart className="w-3 h-3" />
                Loja
              </TabsTrigger>
              <TabsTrigger value="log">Log</TabsTrigger>
            </TabsList>

            <TabsContent value="missions">
              <MissionList
                missions={currentDay.missions}
                slots={slots}
                dayStatus={currentDay.status}
                isForgiveness={currentDay.isForgiveness}
                onAddMission={(type, title) => addMission(type, title)}
                onCompleteMission={handleCompleteMission}
                onFailMission={handleFailMission}
              />
            </TabsContent>

            <TabsContent value="habits">
              <HabitTracker
                positiveHabits={user.positiveHabits}
                negativeHabits={user.negativeHabits}
                dayXpGained={currentDay.xpGained}
                dayXpLost={currentDay.xpLost}
                dayStatus={currentDay.status}
                isForgiveness={currentDay.isForgiveness}
                onAddPositiveHabit={handleAddPositiveHabit}
                onAddNegativeHabit={handleAddNegativeHabit}
                onRemovePositiveHabit={(id) => updateUser({ positiveHabits: user.positiveHabits.filter(h => h.id !== id) })}
                onRemoveNegativeHabit={(id) => updateUser({ negativeHabits: user.negativeHabits.filter(h => h.id !== id) })}
                onRecordPositive={handleRecordPositive}
                onRecordNegative={handleRecordNegative}
              />
            </TabsContent>

            <TabsContent value="summary">
              <DaySummary day={currentDay} onCloseDay={handleCloseDay} />
            </TabsContent>

            <TabsContent value="stats">
              <XpChart days={allDays} />
            </TabsContent>

            <TabsContent value="store">
              <Store
                coins={user.currentCoins}
                rewards={user.storeRewards}
                redeemedHistory={redeemedHistory}
                onRedeemReward={handleRedeemReward}
                onAddReward={handleAddReward}
                onDeleteReward={handleDeleteReward}
              />
            </TabsContent>

            <TabsContent value="log">
              <EventLog events={events} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};