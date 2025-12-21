import { GameDay } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Coins, Check, X, Lock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DaySummaryProps {
  day: GameDay;
  onCloseDay: () => void;
}

export const DaySummary = ({ day, onCloseDay }: DaySummaryProps) => {
  const netXp = day.xpGained - day.xpLost;
  const completedMissions = day.missions.filter(m => m.status === 'completed').length;
  const failedMissions = day.missions.filter(m => m.status === 'failed').length;
  const pendingMissions = day.missions.filter(m => m.status === 'pending').length;
  const isOpen = day.status === 'open';

  return (
    <Card className={cn(
      "p-6 card-dark",
      day.isForgiveness && "border-success/30 bg-success/5"
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {day.isForgiveness && <Shield className="w-6 h-6 text-success" />}
          <div>
            <h3 className="font-display text-xl font-semibold">
              {day.isForgiveness ? 'Dia de Perdão' : 'Resumo do Dia'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {new Date(day.date).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          isOpen ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        )}>
          {isOpen ? 'Em andamento' : 'Encerrado'}
        </div>
      </div>

      {!day.isForgiveness && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">Ganho</span>
              </div>
              <p className="font-display text-xl font-bold text-success">+{day.xpGained}</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Perdido</span>
              </div>
              <p className="font-display text-xl font-bold text-destructive">-{day.xpLost}</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-xp" />
                <span className="text-sm text-muted-foreground">Líquido</span>
              </div>
              <p className={cn(
                "font-display text-xl font-bold",
                netXp >= 0 ? "text-xp" : "text-destructive"
              )}>
                {netXp >= 0 ? '+' : ''}{netXp}
              </p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Coins className="w-4 h-4 text-coin" />
                <span className="text-sm text-muted-foreground">Moedas</span>
              </div>
              <p className="font-display text-xl font-bold text-coin">+{day.coinsEarned}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span className="text-sm">{completedMissions} completadas</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              <span className="text-sm">{failedMissions} falharam</span>
            </div>
            {pendingMissions > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                  {pendingMissions}
                </span>
                <span className="text-sm">pendentes</span>
              </div>
            )}
          </div>
        </>
      )}

      {isOpen && (
        <Button
          onClick={onCloseDay}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display"
        >
          <Lock className="w-4 h-4 mr-2" />
          Encerrar Dia
        </Button>
      )}
    </Card>
  );
};