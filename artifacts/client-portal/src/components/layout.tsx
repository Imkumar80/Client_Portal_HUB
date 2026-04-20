import * as React from "react";
import { Link, useLocation } from "wouter";
import { 
  Briefcase, 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Bell, 
  Search,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: Briefcase },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center px-6 border-b">
          <div className="flex items-center gap-2 text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight font-display">Studio</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location === item.href || (item.href !== "/" && location.startsWith(item.href))
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/projects/new" className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            )}>
              <Plus className="h-4 w-4" />
              New Request
            </Link>
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
            <Settings className="h-4 w-4" />
            Settings
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center px-6 border-b">
                <div className="flex items-center gap-2 text-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold tracking-tight font-display">Studio</span>
                </div>
              </div>
              <div className="py-6 px-4 space-y-1">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    location === item.href || (item.href !== "/" && location.startsWith(item.href))
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t">
                  <Link href="/projects/new" className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                  )}>
                    <Plus className="h-4 w-4" />
                    New Request
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            <form>
              <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search projects..."
                  className="w-full bg-background border-none rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </form>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Avatar className="h-8 w-8 border">
            <AvatarImage src="" alt="Designer" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">AD</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}