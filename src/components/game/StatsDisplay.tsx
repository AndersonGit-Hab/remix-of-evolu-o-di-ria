import { Coins, Zap, Calendar, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsDisplayProps {
  totalXp: number;
  coins: number;
  level: number;
  daysPlayed: number;
  forgivenessAvailable: boolean;
  className?: string;
}

export const StatsDisplay = ({ 
  totalXp, 
  coins, 
  level, 
  daysPlayed,
  forgivenessAvailable,
  className 
}: StatsDisplayProps) => {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
      <StatCard
        icon={Zap}
        label="XP Total"
        value={totalXp.toLocaleString()}
        iconColor="text-xp"
        glowClass="glow-xp"
      />
      <StatCard
        icon={Coins}
        label="Moedas"
        value={coins.toString()}
        iconColor="text-coin"
        glowClass="glow-gold"
      />
      <StatCard
        icon={Calendar}
        label="Dias Jogados"
        value={daysPlayed.toString()}
        iconColor="text-primary"
      />
      <StatCard
        icon={Shield}
        label="Perdão"
        value={forgivenessAvailable ? "Disponível" : "Indisponível"}
        iconColor={forgivenessAvailable ? "text-success" : "text-muted-foreground"}
        valueClass={forgivenessAvailable ? "text-success" : "text-muted-foreground"}
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
  glowClass?: string;
  valueClass?: string;
}

const StatCard = ({ icon: Icon, label, value, iconColor, glowClass, valueClass }: StatCardProps) => (
  <div className={cn(
    "p-4 rounded-lg bg-card border border-border/50 card-dark",
    glowClass && "hover:" + glowClass,
    "transition-all duration-300"
  )}>
    <div className="flex items-center gap-2 mb-1">
      <Icon className={cn("w-4 h-4", iconColor)} />
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className={cn("font-display text-xl font-bold", valueClass || "text-foreground")}>
      {value}
    </p>
  </div>
);