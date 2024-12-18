import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/router";
import { 
  Home, 
  Sword, 
  Users, 
  Settings, 
  Trophy,
  Scroll
} from "lucide-react";

const items = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Game",
    href: "/game",
    icon: Sword,
  },
  {
    title: "Characters",
    href: "/characters",
    icon: Users,
  },
  {
    title: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "Quests",
    href: "/quests",
    icon: Scroll,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function MobileNav() {
  const router = useRouter();

  return (
    <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
      <div className="flex flex-col space-y-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={router.pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
} 