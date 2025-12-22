import { Mission, MissionType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Sword, Target, Star, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissionCardProps {
  mission: Mission;
  onComplete: () => void;
  onFail: () => void;
  disabled?: boolean;
}

const missionTypeConfig: Record<MissionType, { icon: React.ElementType; label: string; color: string; bgColor: string }> = {
  main: { icon: Sword, label: 'Principal', color: 'text-primary', bgColor: 'bg-primary/10' },
  secondary: { icon: Target, label: 'Secundária', color: 'text-accent', bgColor: 'bg-accent/10' },
  bonus: { icon: Star, label: 'Bônus', color: 'text-coin', bgColor: 'bg-coin/10' },
};

export const MissionCard = ({ mission, onComplete, onFail, disabled }: MissionCardProps) => {
  const config = missionTypeConfig[mission.type];
  const Icon = config.icon;
  const isPending = mission.status === 'pending';
  const isCompleted = mission.status === 'completed';
  const isFailed = mission.status === 'failed';

  return (
    <Card className={cn(
      "p-4 card-dark transition-all duration-300",
      isPending && "border-border/50 hover:border-primary/30",
      isCompleted && "border-success/30 bg-success/5",
      isFailed && "border-destructive/30 bg-destructive/5 opacity-60"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", config.bgColor, config.color)}>
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                <Check className="w-3 h-3" />
                Completada
              </span>
            )}
            {isFailed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive">
                <X className="w-3 h-3" />
                Falhou
              </span>
            )}
          </div>
          
          <h4 className="font-display text-lg font-semibold text-foreground mb-1">
            {mission.title}
          </h4>
          
          {mission.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {mission.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-coin">
              <Coins className="w-4 h-4" />
              +{mission.coinReward}
            </span>
          </div>
        </div>

        {isPending && !disabled && (
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={onComplete}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onFail}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};