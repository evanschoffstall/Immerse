'use client'

import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { LogOut, Menu, Search, Settings, Swords } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Check if we're on a campaign page
  const campaignMatch = pathname?.match(/^\/campaigns\/([^\/]+)/)
  const campaignId = campaignMatch?.[1]
  const isOnCampaignPage = !!campaignId && session?.user

  const navigationItems = session?.user ? [
    { href: '/campaigns', label: 'Campaigns' },
  ] : []

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full ${isOnCampaignPage ? 'bg-transparent border-transparent' : 'border-b border-border/20'}`}
      style={isOnCampaignPage ? {
        backdropFilter: `blur(var(--campaign-header-blur, 4px))`,
        WebkitBackdropFilter: `blur(var(--campaign-header-blur, 4px))`,
      } : {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Render internal background layer for both campaign and non-campaign pages */}
      <div
        className={`absolute inset-0 -z-10 ${isOnCampaignPage
          ? 'bg-background/(--campaign-header-bg-opacity,0.95)'
          : 'bg-linear-to-b from-background/60 via-background/40 to-transparent'
          }`}
      />
      <div className="relative flex h-13 items-center px-4 sm:px-6 lg:px-8">
        {isOnCampaignPage && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4 pointer-events-none">
            <div className="relative pointer-events-auto">
              <Search className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-[calc(50%+6.5rem)] -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search campaign content..."
                className="h-9 w-full px-4 text-center bg-background/60 backdrop-blur-sm border-border/40 focus-visible:border-border focus-visible:bg-background/80 transition-all placeholder:text-center"
              />
            </div>
          </div>
        )}

        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 transition-opacity hover:opacity-80">
            <Swords className="h-5 w-5 text-primary" />
            <span className="hidden text-lg font-bold sm:inline-block">Immerse</span>
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
            <Link href="/" className="flex items-center">
              <span className="font-bold">Immerse</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {session?.user && (
                  <div className="flex items-center gap-2 rounded-md pb-4 pt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
                      <AvatarFallback>{getUserInitials(session.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{session.user.name}</span>
                      <span className="text-xs text-muted-foreground">{session.user.email}</span>
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

        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            {status === 'loading' ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : session?.user ? (
              <HoverCard openDelay={0} closeDelay={200}>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group relative h-8 w-8 rounded-full transition-all hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <Avatar className="h-8 w-8 transition-transform group-hover:scale-110 group-data-[state=open]:scale-110">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
                      <AvatarFallback>{getUserInitials(session.user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent
                  className="w-56 p-2"
                  align="end"
                  sideOffset={4}
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {session.user.email}
                    </p>
                  </div>
                  <Separator className="my-1" />
                  <Link href="/settings">
                    <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm">
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
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
