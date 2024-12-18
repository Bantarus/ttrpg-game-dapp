import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Sword, 
  Users, 
  Settings, 
  Trophy,
  Scroll
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const sidebarItems = [
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

export function Sidebar() {
  const router = useRouter();
  
  return (
    <div className="hidden border-r bg-background md:block w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={router.pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    router.pathname === item.href && "bg-muted"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 