'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar';
import type { campaigns as Campaign, campaign_styles as CampaignStyle } from '@prisma/client';
import {
  Bookmark,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Gem,
  History,
  Home,
  Image,
  Link as LinkIcon,
  ListOrdered,
  Map as MapIcon,
  MapPin,
  Mountain,
  Notebook,
  Package,
  PenLine,
  Scroll,
  Settings,
  Shield,
  Sparkles,
  Swords,
  Tag,
  Tags,
  Users,
  Users2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface CampaignLayoutClientProps {
  campaign: Campaign;
  campaignStyle: CampaignStyle | null;
  children: React.ReactNode;
}

export default function CampaignLayoutClient({
  campaign,
  campaignStyle,
  children,
}: CampaignLayoutClientProps) {
  const pathname = usePathname();

  // Apply card backdrop styles dynamically
  useEffect(() => {
    const styleId = 'campaign-card-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    // Get values from CSS variables first (for live preview), fallback to campaignStyle
    const cardOpacity =
      document.documentElement.style.getPropertyValue('--campaign-card-bg-opacity') ||
      (campaignStyle as any)?.cardBgOpacity?.toString() ||
      '0.9';
    const cardBlur =
      document.documentElement.style.getPropertyValue('--campaign-card-blur') ||
      ((campaignStyle as any)?.cardBlur ? `${(campaignStyle as any).cardBlur}px` : '8px');

    styleEl.textContent = `
      [data-campaign-page] .bg-card,
      [data-campaign-page] [class*="bg-card"] {
        background-color: hsl(var(--card) / ${cardOpacity}) !important;
        backdrop-filter: blur(${cardBlur});
        -webkit-backdrop-filter: blur(${cardBlur});
      }
      
      /* Dropdown menu and HoverCard styling */
      [data-radix-popper-content-wrapper] [role="menu"],
      [data-radix-popper-content-wrapper] [data-state] {
        background-color: hsl(var(--card) / ${cardOpacity}) !important;
        backdrop-filter: blur(${cardBlur}) !important;
        -webkit-backdrop-filter: blur(${cardBlur}) !important;
        border-color: hsl(var(--border) / 0.1) !important;
      }
    `;

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [campaignStyle]);

  // Watch for CSS variable changes for live preview
  useEffect(() => {
    const styleId = 'campaign-card-styles';

    const updateStyles = () => {
      const styleEl = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleEl) return;

      const cardOpacity =
        document.documentElement.style.getPropertyValue('--campaign-card-bg-opacity') ||
        (campaignStyle as any)?.cardBgOpacity?.toString() ||
        '0.9';
      const cardBlur =
        document.documentElement.style.getPropertyValue('--campaign-card-blur') ||
        ((campaignStyle as any)?.cardBlur ? `${(campaignStyle as any).cardBlur}px` : '8px');

      styleEl.textContent = `
        [data-campaign-page] .bg-card,
        [data-campaign-page] [class*="bg-card"] {
          background-color: hsl(var(--card) / ${cardOpacity}) !important;
          backdrop-filter: blur(${cardBlur});
          -webkit-backdrop-filter: blur(${cardBlur});
        }
        
        /* Dropdown menu and HoverCard styling */
        [data-radix-popper-content-wrapper] [role="menu"],
        [data-radix-popper-content-wrapper] [data-state] {
          background-color: hsl(var(--card) / ${cardOpacity}) !important;
          backdrop-filter: blur(${cardBlur}) !important;
          -webkit-backdrop-filter: blur(${cardBlur}) !important;
          border-color: hsl(var(--border) / 0.1) !important;
        }
      `;
    };

    const interval = setInterval(updateStyles, 100);
    return () => clearInterval(interval);
  }, [campaignStyle]);

  // Organized navigation structure for shadcn sidebar
  const navMain = [
    { icon: Home, label: 'Dashboard', href: `/campaigns/${campaign.id}` },
    { icon: Bookmark, label: 'Bookmarks', href: `/campaigns/${campaign.id}/bookmarks` },
  ];

  const navWorld = {
    label: 'World',
    icon: Mountain,
    items: [
      { icon: Users, label: 'Characters', href: `/campaigns/${campaign.id}/characters` },
      { icon: MapPin, label: 'Locations', href: `/campaigns/${campaign.id}/locations` },
      { icon: MapIcon, label: 'Maps', href: `/campaigns/${campaign.id}/maps` },
      { icon: Shield, label: 'Organizations', href: `/campaigns/${campaign.id}/organizations` },
      { icon: Users2, label: 'Families', href: `/campaigns/${campaign.id}/families` },
      { icon: Swords, label: 'Creatures', href: `/campaigns/${campaign.id}/creatures` },
    ],
  };

  const navTime = {
    label: 'Time',
    icon: Clock,
    items: [
      { icon: ListOrdered, label: 'Timelines', href: `/campaigns/${campaign.id}/timelines` },
      { icon: Calendar, label: 'Calendars', href: `/campaigns/${campaign.id}/calendars` },
      { icon: Scroll, label: 'Events', href: `/campaigns/${campaign.id}/events` },
    ],
  };

  const navWriting = {
    label: 'Writing',
    icon: PenLine,
    items: [
      { icon: Notebook, label: 'Journals', href: `/campaigns/${campaign.id}/journals` },
      { icon: FileText, label: 'Notes', href: `/campaigns/${campaign.id}/notes` },
    ],
  };

  const navGame = {
    label: 'Game',
    icon: BookOpen,
    items: [
      { icon: Scroll, label: 'Quests', href: `/campaigns/${campaign.id}/quests` },
      { icon: Package, label: 'Objects', href: `/campaigns/${campaign.id}/objects` },
      { icon: Sparkles, label: 'Abilities', href: `/campaigns/${campaign.id}/abilities` },
    ],
  };

  const navOther = {
    label: 'Other',
    icon: Gem,
    items: [
      { icon: Tags, label: 'Tags', href: `/campaigns/${campaign.id}/tags` },
      { icon: LinkIcon, label: 'Connections', href: `/campaigns/${campaign.id}/connections` },
      { icon: Tag, label: 'Attribute Templates', href: `/campaigns/${campaign.id}/attribute-templates` },
    ],
  };

  const navStandalone = [
    { icon: Image, label: 'Gallery', href: `/campaigns/${campaign.id}/gallery` },
    { icon: History, label: 'Recent changes', href: `/campaigns/${campaign.id}/recent-changes` },
  ];

  const isActive = (href: string) => {
    if (href === `/campaigns/${campaign.id}`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full relative overflow-hidden" data-campaign-page>
        {/* Fixed background image layer - covers entire viewport including header */}
        {campaign.backgroundImage && (
          <div
            className="fixed pointer-events-none"
            style={{
              backgroundImage: `var(--campaign-preview-bg-image, url(${campaign.backgroundImage}))`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              zIndex: 0,
              top: `calc(var(--campaign-bg-expand-to-header, ${campaignStyle?.bgExpandToHeader ? '1' : '0'}) * 0px + (1 - var(--campaign-bg-expand-to-header, ${campaignStyle?.bgExpandToHeader ? '1' : '0'})) * 4rem)`,
              left: `calc(var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'}) * 0px + (1 - var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'})) * 16rem)`,
              right: '0',
              bottom: '0',
            }}
          />
        )}

        {/* Fixed background overlay with opacity and blur */}
        {campaign.backgroundImage && (
          <div
            className="fixed pointer-events-none"
            style={{
              backgroundColor: `hsl(var(--background) / var(--campaign-bg-opacity, ${campaignStyle?.bgOpacity ?? 0.8}))`,
              backdropFilter: `blur(var(--campaign-bg-blur, ${campaignStyle?.bgBlur ?? 4}px))`,
              WebkitBackdropFilter: `blur(var(--campaign-bg-blur, ${campaignStyle?.bgBlur ?? 4}px))`,
              zIndex: 1,
              top: `calc(var(--campaign-bg-expand-to-header, ${campaignStyle?.bgExpandToHeader ? '1' : '0'}) * 0px + (1 - var(--campaign-bg-expand-to-header, ${campaignStyle?.bgExpandToHeader ? '1' : '0'})) * 4rem)`,
              left: `calc(var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'}) * 0px + (1 - var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'})) * 16rem)`,
              right: '0',
              bottom: '0',
            }}
          />
        )}

        {/* Shadcn Sidebar */}
        <Sidebar
          className="pt-16 z-10"
          collapsible="none"
          style={{
            '--sidebar-background': 'transparent',
            backdropFilter: `blur(var(--campaign-sidebar-blur, ${campaignStyle?.sidebarBlur ?? 0}px))`,
            WebkitBackdropFilter: `blur(var(--campaign-sidebar-blur, ${campaignStyle?.sidebarBlur ?? 0}px))`,
            borderRight: `calc(1px * (1 - var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'}))) solid hsl(var(--border))`,
          } as React.CSSProperties}
        >
          {/* Background gradient layer */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: 'linear-gradient(to right, hsl(var(--card)), hsl(var(--card) / 0.7), transparent)',
              opacity: `var(--campaign-sidebar-bg-opacity, ${campaignStyle?.sidebarBgOpacity ?? 1.0})`,
            }}
          />

          {/* Campaign Header */}
          <SidebarHeader
            className="border-b-0"
            style={{
              borderBottom: `calc(1px * (1 - var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'}))) solid hsl(var(--border))`,
            }}
          >
            <div className="flex items-center gap-3 px-1 mb-2">
              {campaign.image && (
                <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `var(--campaign-preview-image, url(${campaign.image}))`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm truncate">{campaign.name}</h2>
              </div>
            </div>

            {/* Fixed Dashboard & Bookmarks */}
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarHeader>

          <ScrollArea className="flex-1">
            <SidebarContent>
              {/* World Section */}
              <SidebarGroup>
                <SidebarGroupLabel>
                  <navWorld.icon className="w-3.5 h-3.5 mr-2 opacity-60" />
                  {navWorld.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navWorld.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} size="sm">
                          <Link href={item.href}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Time Section */}
              <SidebarGroup>
                <SidebarGroupLabel>
                  <navTime.icon className="w-3.5 h-3.5 mr-2 opacity-60" />
                  {navTime.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navTime.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} size="sm">
                          <Link href={item.href}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Writing Section */}
              <SidebarGroup>
                <SidebarGroupLabel>
                  <navWriting.icon className="w-3.5 h-3.5 mr-2 opacity-60" />
                  {navWriting.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navWriting.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} size="sm">
                          <Link href={item.href}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Game Section */}
              <SidebarGroup>
                <SidebarGroupLabel>
                  <navGame.icon className="w-3.5 h-3.5 mr-2 opacity-60" />
                  {navGame.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navGame.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} size="sm">
                          <Link href={item.href}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Other Section */}
              <SidebarGroup>
                <SidebarGroupLabel>
                  <navOther.icon className="w-3.5 h-3.5 mr-2 opacity-60" />
                  {navOther.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navOther.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} size="sm">
                          <Link href={item.href}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Gallery & Recent Changes */}
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive(`/campaigns/${campaign.id}/gallery`)}>
                        <Link href={`/campaigns/${campaign.id}/gallery`}>
                          <Image className="w-4 h-4" />
                          <span>Gallery</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive(`/campaigns/${campaign.id}/recent-changes`)}>
                        <Link href={`/campaigns/${campaign.id}/recent-changes`}>
                          <History className="w-4 h-4" />
                          <span>Recent changes</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Settings - at bottom of scrollable content */}
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href={`/campaigns/${campaign.id}/edit`}>
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </ScrollArea>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="relative z-10 bg-transparent overflow-y-auto">
          <div className="pt-16">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
