import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppTopbar({ user }: { user?: any }) {
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="w-full bg-card shadow flex items-center justify-between px-6 py-3">
      <nav className="flex items-center gap-6">
        <Link href="/dashboard" className="font-bold text-lg text-primary">Dashboard</Link>
        <Link href="/profile" className="text-muted-foreground hover:text-primary transition">Profile</Link>
        {/* Add more links as needed */}
      </nav>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground">{userName}</span>
      </div>
    </header>
  );
}
