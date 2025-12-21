import { GameEvent } from '@/types/game';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Check, 
  X, 
  AlertTriangle, 
  Zap, 
  Gift, 
  TrendingUp, 
  Unlock, 
  Package,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventLogProps {
  events: GameEvent[];
  maxItems?: number;
}

const eventConfig: Record<GameEvent['type'], { icon: React.ElementType; color: string }> = {
  day_started: { icon: Calendar, color: 'text-primary' },
  mission_completed: { icon: Check, color: 'text-success' },
  mission_failed: { icon: X, color: 'text-destructive' },
  negative_habit_triggered: { icon: AlertTriangle, color: 'text-destructive' },
  positive_habit_completed: { icon: Zap, color: 'text-success' },
  day_closed: { icon: Calendar, color: 'text-muted-foreground' },
  reward_redeemed: { icon: Gift, color: 'text-coin' },
  level_up: { icon: TrendingUp, color: 'text-xp' },
  slot_unlocked: { icon: Unlock, color: 'text-primary' },
  loot_box_opened: { icon: Package, color: 'text-coin' },
  forgiveness_used: { icon: Shield, color: 'text-success' },
};

export const EventLog = ({ events, maxItems = 20 }: EventLogProps) => {
  const displayEvents = events.slice(0, maxItems);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="card-dark p-4">
      <h3 className="font-display text-lg font-semibold mb-4">Registro de Eventos</h3>
      
      <ScrollArea className="h-[300px] pr-4">
        {displayEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum evento registrado ainda
          </p>
        ) : (
          <div className="space-y-2">
            {displayEvents.map(event => {
              const config = eventConfig[event.type];
              const Icon = config.icon;
              
              return (
                <div 
                  key={event.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <div className={cn("mt-0.5", config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {event.details}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(event.timestamp)}
                      </span>
                      {event.xpChange !== undefined && event.xpChange !== 0 && (
                        <span className={cn(
                          "text-xs font-medium",
                          event.xpChange > 0 ? "text-success" : "text-destructive"
                        )}>
                          {event.xpChange > 0 ? '+' : ''}{event.xpChange} XP
                        </span>
                      )}
                      {event.coinChange !== undefined && event.coinChange > 0 && (
                        <span className="text-xs font-medium text-coin">
                          +{event.coinChange} moedas
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};