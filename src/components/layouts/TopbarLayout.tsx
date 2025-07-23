import { AppTopbar } from "@/components/AppTopbar";
import type { User } from "@/app/dashboard/components/UserDetailsCard";

export function TopbarLayout({ children, user }: { children: React.ReactNode; user?: User }) {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-full">
      <header>
        <AppTopbar user={user} />
      </header>
      <main className="flex-1 w-full h-full">
        {children}
      </main>
    </div>
  );
}