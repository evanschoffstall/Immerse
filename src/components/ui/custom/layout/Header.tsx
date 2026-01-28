"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/custom/theme/ThemeToggle";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Menu, Search, Settings, Swords } from "lucide-react";
import type { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVIGATION_ITEMS = [{ href: "/campaigns", label: "Campaigns" }];

function getCampaignIdFromPath(pathname: string | null): string | null {
  const match = pathname?.match(/^\/campaigns\/([^\/]+)/);
  return match?.[1] || null;
}

function getCampaignHeaderStyles(isOnCampaignPage: boolean) {
  const className = `fixed top-0 z-50 w-full ${isOnCampaignPage
    ? "bg-transparent border-transparent"
    : "border-b border-border/20"
    }`;

  const style = isOnCampaignPage
    ? {
      backdropFilter: "blur(var(--campaign-header-blur, 4px))",
      WebkitBackdropFilter: "blur(var(--campaign-header-blur, 4px))",
    }
    : {
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    };

  return { className, style };
}

function getCampaignBackgroundClassName(isOnCampaignPage: boolean) {
  return `absolute inset-0 -z-10 ${isOnCampaignPage
    ? "bg-background/(--campaign-header-bg-opacity,0.95)"
    : "bg-linear-to-b from-background/60 via-background/40 to-transparent"
    }`;
}

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

function UserAvatar({ name, image, className }: UserAvatarProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar className={className}>
      <AvatarImage src={image || undefined} alt={name || "User"} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}

function CampaignSearchBar() {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
      <Input
        type="search"
        placeholder="Search campaign content..."
        className="h-9 w-full pl-9 pr-4 text-sm text-center bg-background/60 backdrop-blur-sm border-border/40 focus-visible:border-border focus-visible:bg-background/80 transition-all placeholder:text-center focus:placeholder:opacity-0"
      />
    </div>
  );
}

function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/register">Sign Up</Link>
      </Button>
    </div>
  );
}

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

function UserMenu({ name, email, image }: UserMenuProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <HoverCard openDelay={0} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          className="group relative h-8 w-8 rounded-full transition-all hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <UserAvatar
            name={name}
            image={image}
            className="h-8 w-8 transition-transform group-hover:scale-110 group-data-[state=open]:scale-110"
          />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-56 p-2" align="end" sideOffset={4}>
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium leading-none">{name}</p>
          <p className="text-xs leading-none text-muted-foreground mt-1">
            {email}
          </p>
        </div>
        <Separator className="my-1" />
        <Link href="/settings">
          <Button
            variant="ghost"
            className="w-full justify-start h-8 px-2 text-sm"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Separator className="my-1" />
        <Button
          variant="ghost"
          className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </HoverCardContent>
    </HoverCard>
  );
}

interface DesktopNavProps {
  navigationItems: Array<{ href: string; label: string }>;
}

function DesktopNav({ navigationItems }: DesktopNavProps) {
  return (
    <div className="mr-4 hidden md:flex">
      <Link
        href="/"
        className="mr-6 flex items-center space-x-2 transition-opacity hover:opacity-80"
      >
        <Swords className="h-5 w-5 text-primary" />
        <span className="hidden text-lg font-bold sm:inline-block">
          Immerse
        </span>
      </Link>
      <nav className="flex items-center gap-6 text-sm font-medium">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-foreground/70 transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

interface MobileNavProps {
  session: Session | null;
  navigationItems: Array<{ href: string; label: string }>;
}

function MobileNav({ session, navigationItems }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link href="/" className="flex items-center space-x-2">
          <Swords className="h-5 w-5 text-primary" />
          <span className="font-bold">Immerse</span>
        </Link>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {session?.user && (
              <div className="flex items-center gap-2 rounded-md pb-4 pt-2">
                <UserAvatar
                  name={session.user.name}
                  image={session.user.image}
                  className="h-8 w-8"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.user.email}
                  </span>
                </div>
              </div>
            )}
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const campaignId = getCampaignIdFromPath(pathname);
  const isOnCampaignPage = !!campaignId && !!session?.user;
  const navigationItems = session?.user ? NAVIGATION_ITEMS : [];

  const { className, style } = getCampaignHeaderStyles(isOnCampaignPage);
  const backgroundClassName = getCampaignBackgroundClassName(isOnCampaignPage);

  return (
    <header className={className} style={style}>
      <div className={backgroundClassName} />

      <div className="relative flex h-13 items-center px-4 sm:px-6 lg:px-8 gap-4">
        <div className="flex items-center shrink-0">
          <DesktopNav navigationItems={navigationItems} />
          <MobileNav session={session} navigationItems={navigationItems} />
        </div>

        {isOnCampaignPage ? (
          <div className="flex-1 flex items-center min-w-0 px-4">
            <CampaignSearchBar />
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        <div className="flex items-center justify-end shrink-0">
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            {status === "loading" ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : session?.user ? (
              <UserMenu
                name={session.user.name}
                email={session.user.email}
                image={session.user.image}
              />
            ) : (
              <AuthButtons />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
