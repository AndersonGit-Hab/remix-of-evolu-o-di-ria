import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StoreReward } from '@/types/game';
import { Coins, Gift, Plus, ShoppingBag, Trash2, Check, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RedeemedReward {
  id: string;
  reward: StoreReward;
  redeemedAt: string;
}

interface StoreProps {
  coins: number;
  rewards: StoreReward[];
  redeemedHistory: RedeemedReward[];
  onRedeemReward: (reward: StoreReward) => void;
  onAddReward: (name: string, description: string, cost: number) => void;
  onDeleteReward: (id: string) => void;
}

export const Store = ({
  coins,
  rewards,
  redeemedHistory,
  onRedeemReward,
  onAddReward,
  onDeleteReward,
}: StoreProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCost, setNewCost] = useState('');

  const handleAddReward = () => {
    if (newName.trim() && newCost) {
      onAddReward(newName.trim(), newDescription.trim(), parseInt(newCost));
      setNewName('');
      setNewDescription('');
      setNewCost('');
      setShowAddForm(false);
    }
  };

  const availableRewards = rewards.filter(r => r.available);

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="card-dark border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                <p className="text-3xl font-bold text-primary">{coins}</p>
              </div>
            </div>
            <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="available" className="gap-2">
            <Gift className="w-4 h-4" />
            Disponíveis
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRewards.map((reward) => (
              <Card key={reward.id} className="card-dark hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteReward(reward.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="gap-1">
                        <Coins className="w-3 h-3" />
                        {reward.cost}
                      </Badge>
                      <Button
                        size="sm"
                        disabled={coins < reward.cost}
                        onClick={() => onRedeemReward(reward)}
                        className={coins >= reward.cost ? 'glow-gold' : ''}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Resgatar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Reward Form */}
          {showAddForm ? (
            <Card className="card-dark border-dashed border-primary/30">
              <CardContent className="p-4 space-y-4">
                <Input
                  placeholder="Nome da recompensa"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-background/50"
                />
                <Input
                  placeholder="Descrição (opcional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-background/50"
                />
                <Input
                  type="number"
                  placeholder="Custo em moedas"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  className="bg-background/50"
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddReward} className="flex-1">
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed border-primary/30 text-muted-foreground hover:text-foreground"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Recompensa Personalizada
            </Button>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {redeemedHistory.length === 0 ? (
            <Card className="card-dark">
              <CardContent className="p-8 text-center">
                <History className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Nenhuma recompensa resgatada ainda</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Complete missões para ganhar moedas!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {redeemedHistory.map((item) => (
                <Card key={item.id} className="card-dark">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{item.reward.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.reward.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="gap-1 text-primary border-primary/30">
                          <Coins className="w-3 h-3" />
                          -{item.reward.cost}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.redeemedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
