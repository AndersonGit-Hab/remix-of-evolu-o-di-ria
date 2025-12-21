import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { CharacterCreate } from '@/components/game/CharacterCreate';
import { Dashboard } from '@/components/game/Dashboard';

const Index = () => {
  const { user, loading, createUser } = useUser();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-display text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <CharacterCreate onCreateCharacter={createUser} />;
  }

  return <Dashboard />;
};

export default Index;