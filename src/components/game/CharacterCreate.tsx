import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sword, Shield, Sparkles } from 'lucide-react';

interface CharacterCreateProps {
  onCreateCharacter: (name: string) => void;
}

export const CharacterCreate = ({ onCreateCharacter }: CharacterCreateProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateCharacter(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      <Card className="relative z-10 w-full max-w-md p-8 card-dark border-primary/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Sword className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-2">
            Evolução Pessoal
          </h1>
          <p className="text-muted-foreground text-lg">
            Sua jornada começa aqui
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-display text-sm text-foreground/80">
              Nome do Personagem
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome..."
              className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              required
              minLength={2}
              maxLength={30}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg py-6 glow-gold"
            disabled={!name.trim()}
          >
            <Shield className="w-5 h-5 mr-2" />
            Criar Personagem
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/30">
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Progresso salvo localmente no navegador</span>
          </div>
        </div>
      </Card>
    </div>
  );
};