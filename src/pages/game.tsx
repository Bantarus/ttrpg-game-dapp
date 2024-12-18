import { GameComponent } from '@/components/GameComponent';
import { Card } from '@/components/ui/card';

export default function GamePage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Game</h1>
      <Card className="p-0 overflow-hidden">
        <div className="aspect-video w-full">
          <GameComponent />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h3 className="font-semibold">Players Online</h3>
          <p className="text-2xl font-bold">24</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Current Turn</h3>
          <p className="text-2xl font-bold">Player 1</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Game Phase</h3>
          <p className="text-2xl font-bold">Movement</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Time Left</h3>
          <p className="text-2xl font-bold">2:30</p>
        </Card>
      </div>
    </div>
  );
} 