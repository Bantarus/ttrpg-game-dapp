import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sword, Users, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Welcome to TTRPG Game</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <Sword className="h-12 w-12" />
            <h2 className="text-2xl font-semibold">Play Now</h2>
            <p className="text-muted-foreground">Jump into an exciting game session with other players.</p>
            <Link href="/game">
              <Button className="w-full">Start Game</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <Users className="h-12 w-12" />
            <h2 className="text-2xl font-semibold">Characters</h2>
            <p className="text-muted-foreground">Create and manage your character roster.</p>
            <Link href="/characters">
              <Button variant="outline" className="w-full">View Characters</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <Trophy className="h-12 w-12" />
            <h2 className="text-2xl font-semibold">Leaderboard</h2>
            <p className="text-muted-foreground">Check the top players and rankings.</p>
            <Link href="/leaderboard">
              <Button variant="outline" className="w-full">View Rankings</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
