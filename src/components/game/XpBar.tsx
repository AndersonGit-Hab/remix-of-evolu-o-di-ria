import { cn } from '@/lib/utils';

interface XpBarProps {
  current: number;
  needed: number;
  level: number;
  className?: string;
}

export const XpBar = ({ current, needed, level, className }: XpBarProps) => {
  const percentage = Math.min((current / needed) * 100, 100);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-primary">
            Nível {level}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {current} / {needed} XP
        </span>
      </div>
      
      <div className="h-3 bg-secondary rounded-full overflow-hidden border border-border/50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-violet-400 to-purple-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full w-full bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
};