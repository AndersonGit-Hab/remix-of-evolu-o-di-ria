import { useState } from 'react';
import { Mission, MissionType } from '@/types/game';
import { MissionCard } from './MissionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Sword, Target, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissionListProps {
  missions: Mission[];
  slots: { secondary: number; bonus: number };
  dayStatus: 'open' | 'closed';
  isForgiveness: boolean;
  onAddMission: (type: MissionType, title: string) => void;
  onCompleteMission: (id: string) => void;
  onFailMission: (id: string) => void;
}

export const MissionList = ({
  missions,
  slots,
  dayStatus,
  isForgiveness,
  onAddMission,
  onCompleteMission,
  onFailMission,
}: MissionListProps) => {
  const [newMissionType, setNewMissionType] = useState<MissionType | null>(null);
  const [newMissionTitle, setNewMissionTitle] = useState('');

  const mainMissions = missions.filter(m => m.type === 'main');
  const secondaryMissions = missions.filter(m => m.type === 'secondary');
  const bonusMissions = missions.filter(m => m.type === 'bonus');

  const canAddMain = mainMissions.length < 1;
  const canAddSecondary = secondaryMissions.length < slots.secondary;
  const canAddBonus = bonusMissions.length < slots.bonus;
  const isOpen = dayStatus === 'open' && !isForgiveness;

  const handleAddMission = () => {
    if (newMissionType && newMissionTitle.trim()) {
      onAddMission(newMissionType, newMissionTitle.trim());
      setNewMissionTitle('');
      setNewMissionType(null);
    }
  };

  const missionTypes: { type: MissionType; icon: React.ElementType; label: string; canAdd: boolean; count: number; max: number }[] = [
    { type: 'main', icon: Sword, label: 'Principal', canAdd: canAddMain, count: mainMissions.length, max: 1 },
    { type: 'secondary', icon: Target, label: 'Secundária', canAdd: canAddSecondary, count: secondaryMissions.length, max: slots.secondary },
    { type: 'bonus', icon: Star, label: 'Bônus', canAdd: canAddBonus, count: bonusMissions.length, max: slots.bonus },
  ];

  return (
    <div className="space-y-6">
      {/* Mission Slots Overview */}
      {isOpen && (
        <div className="flex flex-wrap gap-2">
          {missionTypes.map(({ type, icon: Icon, label, canAdd, count, max }) => (
            <Button
              key={type}
              variant={newMissionType === type ? "default" : "outline"}
              size="sm"
              onClick={() => canAdd && setNewMissionType(newMissionType === type ? null : type)}
              disabled={!canAdd}
              className={cn(
                "transition-all",
                newMissionType === type && "glow-gold"
              )}
            >
              <Icon className="w-4 h-4 mr-1" />
              {label} ({count}/{max})
            </Button>
          ))}
        </div>
      )}

      {/* Add Mission Form */}
      {newMissionType && isOpen && (
        <Card className="p-4 card-dark border-primary/30">
          <div className="flex gap-2">
            <Input
              value={newMissionTitle}
              onChange={(e) => setNewMissionTitle(e.target.value)}
              placeholder={`Título da missão ${newMissionType === 'main' ? 'principal' : newMissionType === 'secondary' ? 'secundária' : 'bônus'}...`}
              className="flex-1 bg-secondary/50"
              onKeyDown={(e) => e.key === 'Enter' && handleAddMission()}
            />
            <Button onClick={handleAddMission} disabled={!newMissionTitle.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Mission Cards */}
      {missions.length === 0 ? (
        <Card className="p-8 card-dark text-center">
          <p className="text-muted-foreground">
            {isForgiveness 
              ? "Dia de perdão - sem missões necessárias" 
              : "Nenhuma missão adicionada ainda"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {missions.map(mission => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onComplete={() => onCompleteMission(mission.id)}
              onFail={() => onFailMission(mission.id)}
              disabled={dayStatus === 'closed' || isForgiveness}
            />
          ))}
        </div>
      )}
    </div>
  );
};