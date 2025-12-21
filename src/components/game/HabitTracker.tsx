import { useState } from 'react';
import { PositiveHabit, NegativeHabit, XP_CAP, XP_LOSS_CAP } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check, X, Plus, Zap, AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitTrackerProps {
  positiveHabits: PositiveHabit[];
  negativeHabits: NegativeHabit[];
  dayXpGained: number;
  dayXpLost: number;
  dayStatus: 'open' | 'closed';
  isForgiveness: boolean;
  onAddPositiveHabit: (name: string, xpValue: number) => void;
  onAddNegativeHabit: (name: string, xpPenalty: number) => void;
  onRemovePositiveHabit: (id: string) => void;
  onRemoveNegativeHabit: (id: string) => void;
  onRecordPositive: (habit: PositiveHabit) => void;
  onRecordNegative: (habit: NegativeHabit) => void;
}

export const HabitTracker = ({
  positiveHabits,
  negativeHabits,
  dayXpGained,
  dayXpLost,
  dayStatus,
  isForgiveness,
  onAddPositiveHabit,
  onAddNegativeHabit,
  onRemovePositiveHabit,
  onRemoveNegativeHabit,
  onRecordPositive,
  onRecordNegative,
}: HabitTrackerProps) => {
  const [showAddPositive, setShowAddPositive] = useState(false);
  const [showAddNegative, setShowAddNegative] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitValue, setNewHabitValue] = useState('');

  const currentPositiveTotal = positiveHabits.reduce((sum, h) => sum + h.xpValue, 0);
  const currentNegativeTotal = negativeHabits.reduce((sum, h) => sum + h.xpPenalty, 0);
  const remainingPositiveXp = XP_CAP - currentPositiveTotal;
  const remainingNegativeXp = XP_LOSS_CAP - currentNegativeTotal;

  const isOpen = dayStatus === 'open' && !isForgiveness;

  const handleAddPositive = () => {
    const value = parseInt(newHabitValue);
    if (newHabitName.trim() && value > 0 && value <= remainingPositiveXp) {
      onAddPositiveHabit(newHabitName.trim(), value);
      setNewHabitName('');
      setNewHabitValue('');
      setShowAddPositive(false);
    }
  };

  const handleAddNegative = () => {
    const value = parseInt(newHabitValue);
    if (newHabitName.trim() && value > 0 && value <= remainingNegativeXp) {
      onAddNegativeHabit(newHabitName.trim(), value);
      setNewHabitName('');
      setNewHabitValue('');
      setShowAddNegative(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Positive Habits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-success" />
            <h3 className="font-display text-lg font-semibold">Hábitos Positivos</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentPositiveTotal}/{XP_CAP} XP alocado
          </span>
        </div>

        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-success transition-all duration-300"
            style={{ width: `${(dayXpGained / XP_CAP) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          XP ganho hoje: {dayXpGained}/{XP_CAP}
        </p>

        <div className="space-y-2">
          {positiveHabits.map(habit => (
            <Card key={habit.id} className={cn(
              "p-3 card-dark flex items-center justify-between",
              habit.completedToday && "border-success/30 bg-success/5"
            )}>
              <div className="flex-1">
                <p className="font-medium">{habit.name}</p>
                <p className="text-sm text-success">+{habit.xpValue} XP</p>
              </div>
              <div className="flex gap-2">
                {isOpen && !habit.completedToday && (
                  <Button
                    size="sm"
                    onClick={() => onRecordPositive(habit)}
                    className="bg-success hover:bg-success/90"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                {habit.completedToday && (
                  <span className="text-success text-sm">✓ Feito</span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemovePositiveHabit(habit.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {showAddPositive ? (
          <Card className="p-3 card-dark border-success/30 space-y-2">
            <Input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Nome do hábito..."
              className="bg-secondary/50"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                value={newHabitValue}
                onChange={(e) => setNewHabitValue(e.target.value)}
                placeholder={`XP (max ${remainingPositiveXp})`}
                className="bg-secondary/50 w-32"
                min={1}
                max={remainingPositiveXp}
              />
              <Button onClick={handleAddPositive} size="sm" className="bg-success">
                <Plus className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowAddPositive(false)} size="sm" variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowAddPositive(true)}
            disabled={remainingPositiveXp <= 0}
            className="w-full border-success/30 text-success hover:bg-success/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Hábito Positivo
          </Button>
        )}
      </div>

      {/* Negative Habits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-display text-lg font-semibold">Hábitos a Eliminar</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentNegativeTotal}/{XP_LOSS_CAP} XP alocado
          </span>
        </div>

        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-destructive transition-all duration-300"
            style={{ width: `${(dayXpLost / XP_LOSS_CAP) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          XP perdido hoje: {dayXpLost}/{XP_LOSS_CAP}
        </p>

        <div className="space-y-2">
          {negativeHabits.map(habit => (
            <Card key={habit.id} className={cn(
              "p-3 card-dark flex items-center justify-between",
              habit.triggeredToday && "border-destructive/30 bg-destructive/5"
            )}>
              <div className="flex-1">
                <p className="font-medium">{habit.name}</p>
                <p className="text-sm text-destructive">-{habit.xpPenalty} XP</p>
              </div>
              <div className="flex gap-2">
                {isOpen && !habit.triggeredToday && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRecordNegative(habit)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {habit.triggeredToday && (
                  <span className="text-destructive text-sm">✗ Ocorreu</span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveNegativeHabit(habit.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {showAddNegative ? (
          <Card className="p-3 card-dark border-destructive/30 space-y-2">
            <Input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Comportamento a evitar..."
              className="bg-secondary/50"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                value={newHabitValue}
                onChange={(e) => setNewHabitValue(e.target.value)}
                placeholder={`Penalidade (max ${remainingNegativeXp})`}
                className="bg-secondary/50 w-40"
                min={1}
                max={remainingNegativeXp}
              />
              <Button onClick={handleAddNegative} size="sm" variant="destructive">
                <Plus className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowAddNegative(false)} size="sm" variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowAddNegative(true)}
            disabled={remainingNegativeXp <= 0}
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Hábito Negativo
          </Button>
        )}
      </div>
    </div>
  );
};