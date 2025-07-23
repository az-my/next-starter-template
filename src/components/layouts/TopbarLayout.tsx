import { AppTopbar } from "@/components/AppTopbar";

export function TopbarLayout({ children, user }: { children: React.ReactNode; user?: any }) {
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