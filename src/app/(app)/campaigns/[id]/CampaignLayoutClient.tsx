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
import type { Campaign, CampaignSettings } from '@/lib/data/types';
import {
  Bookmark,
  BookOpen,
  Clock,
  FileText,
  Flame,
  Gem,
  History,
  Home,
  Image,
  Layers,
  Layout,
  Link as LinkIcon,
  LucideIcon,
  Map as MapIcon,
  Mountain,
  Notebook,
  Scroll,
  Settings,
  Shield,
  Sparkles,
  Tags,
  Target,
  User,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';

interface CampaignLayoutClientProps {
  campaign: Campaign;
  campaignSettings: CampaignSettings | null;
  children: React.ReactNode;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export default function CampaignLayoutClient({
  campaign,
  campaignSettings,
  children,
}: CampaignLayoutClientProps) {
  const pathname = usePathname();
  const campaignId = campaign.id;

  // Helper function to construct campaign routes
  const campaignRoute = (path: string = '') => `/campaigns/${campaignId}${path}`;

  // Helper function to generate card styles CSS
  const generateCardStyles = () => {
    const cardOpacity =
      document.documentElement.style.getPropertyValue('--campaign-card-bg-opacity') ||
      (campaignSettings as any)?.cardBgOpacity?.toString() ||
      '0.9';
    const cardBlur =
      document.documentElement.style.getPropertyValue('--campaign-card-blur') ||
      ((campaignSettings as any)?.cardBlur ? `${(campaignSettings as any).cardBlur}px` : '8px');

    return `
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

  // Apply and update card backdrop styles dynamically
  useEffect(() => {
    const styleId = 'campaign-card-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    // Initial style application
    styleEl.textContent = generateCardStyles();

    // Live preview updates
    const interval = setInterval(() => {
      styleEl.textContent = generateCardStyles();
    }, 100);

    return () => {
      clearInterval(interval);
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [campaignSettings]);

  // Consolidated navigation structure
  const navigation = useMemo(() => {
    const mainNav: NavItem[] = [
      { icon: Home, label: 'Dashboard', href: campaignRoute() },
      { icon: Bookmark, label: 'Bookmarks', href: campaignRoute('/bookmarks') },
    ];

    const groupedNav: NavGroup[] = [
      {
        label: 'Atlas',
        icon: Mountain,
        items: [
          { icon: User, label: 'Beings', href: campaignRoute('/beings') },
          { icon: Users, label: 'Groups', href: campaignRoute('/groups') },
          { icon: MapIcon, label: 'Places', href: campaignRoute('/places') },
        ],
      },
      {
        label: 'Story',
        icon: BookOpen,
        items: [
          { icon: Clock, label: 'Events', href: campaignRoute('/events') },
          { icon: Scroll, label: 'Quests', href: campaignRoute('/quests') },
          { icon: Notebook, label: 'Journals', href: campaignRoute('/journals') },
          { icon: FileText, label: 'Notes', href: campaignRoute('/notes') },
        ],
      },
      {
        label: 'Rules',
        icon: Sparkles,
        items: [
          { icon: Zap, label: 'Abilities', href: campaignRoute('/abilities') },
          { icon: Flame, label: 'Spells', href: campaignRoute('/spells') },
          { icon: Gem, label: 'Items', href: campaignRoute('/items') },
          { icon: Target, label: 'Conditions', href: campaignRoute('/conditions') },
          { icon: Shield, label: 'Classes', href: campaignRoute('/classes') },
          { icon: User, label: 'Races', href: campaignRoute('/races') },
        ],
      },
      {
        label: 'Other',
        icon: Layers,
        items: [
          { icon: Tags, label: 'Tags', href: campaignRoute('/tags') },
          { icon: LinkIcon, label: 'Connections', href: campaignRoute('/connections') },
          { icon: Layout, label: 'Attribute Templates', href: campaignRoute('/attribute-templates') },
        ],
      },
    ];

    const standaloneNav: NavItem[] = [
      { icon: Image, label: 'Gallery', href: campaignRoute('/gallery') },
      { icon: History, label: 'Recent changes', href: campaignRoute('/recent-changes') },
    ];

    const settingsNav: NavItem[] = [
      { icon: Settings, label: 'Settings', href: campaignRoute('/edit') },
    ];

    return { mainNav, groupedNav, standaloneNav, settingsNav };
  }, [campaignId]);

  const isActive = (href: string) => {
    if (href === campaignRoute()) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Helper to calculate background positioning
  const getBackgroundStyle = (position: 'image' | 'overlay') => {
    const top = `calc(var(--campaign-bg-expand-to-header, ${campaignSettings?.bgExpandToHeader ? '1' : '0'}) * 0px + (1 - var(--campaign-bg-expand-to-header, ${campaignSettings?.bgExpandToHeader ? '1' : '0'})) * 4rem - 10px)`;
    const left = `calc(var(--campaign-bg-expand-to-sidebar, ${campaignSettings?.bgExpandToSidebar ? '1' : '0'}) * 0px + (1 - var(--campaign-bg-expand-to-sidebar, ${campaignSettings?.bgExpandToSidebar ? '1' : '0'})) * 16rem - 95px)`;

    if (position === 'image') {
      return {
        backgroundImage: `var(--campaign-preview-bg-image, url(${campaign.backgroundImage}))`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: 0,
        top,
        left,
        right: '0',
        bottom: '0',
      };
    }

    return {
      backgroundColor: `hsl(var(--background) / var(--campaign-bg-opacity, ${campaignSettings?.bgOpacity ?? 0.8}))`,
      backdropFilter: `blur(var(--campaign-bg-blur, ${campaignSettings?.bgBlur ?? 4}px))`,
      WebkitBackdropFilter: `blur(var(--campaign-bg-blur, ${campaignSettings?.bgBlur ?? 4}px))`,
      zIndex: 1,
      top,
      left,
      right: '0',
      bottom: '0',
    };
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full relative overflow-hidden" data-campaign-page>
        {/* Fixed background image layer - covers entire viewport including header */}
        {campaign.backgroundImage && (
          <div className="fixed pointer-events-none" style={getBackgroundStyle('image')} />
        )}

        {/* Fixed background overlay with opacity and blur */}
        {campaign.backgroundImage && (
          <div className="fixed pointer-events-none" style={getBackgroundStyle('overlay')} />
        )}

        {/* Shadcn Sidebar */}
        <Sidebar
          className="pt-14 z-10"
          collapsible="none"
          style={{
            '--sidebar-background': 'transparent',
            backdropFilter: `blur(var(--campaign-sidebar-blur, ${campaignSettings?.sidebarBlur ?? 0}px))`,
            WebkitBackdropFilter: `blur(var(--campaign-sidebar-blur, ${campaignSettings?.sidebarBlur ?? 0}px))`,
            borderRight: `calc(1px * (1 - var(--campaign-bg-expand-to-sidebar, ${campaignSettings?.bgExpandToSidebar ? '1' : '0'}))) solid hsl(var(--border))`,
          } as React.CSSProperties}
        >
          {/* Background gradient layer */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: 'linear-gradient(to right, hsl(var(--card)), hsl(var(--card) / 0.7), transparent)',
              opacity: `var(--campaign-sidebar-bg-opacity, ${campaignSettings?.sidebarBgOpacity ?? 1.0})`,
            }}
          />

          {/* Campaign Header */}
          <SidebarHeader
            className="border-b-0"
            style={{
              borderBottom: `calc(1px * (1 - var(--campaign-bg-expand-to-sidebar, ${campaignSettings?.bgExpandToSidebar ? '1' : '0'}))) solid hsl(var(--border))`,
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
              {navigation.mainNav.map((item) => (
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
              {/* Dynamic grouped navigation sections */}
              {navigation.groupedNav.map((group) => (
                <SidebarGroup key={group.label}>
                  <SidebarGroupLabel>
                    <group.icon className="w-3.5 h-3.5 mr-2 opacity-60" />
                    {group.label}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
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
              ))}

              {/* Standalone items (Gallery & Recent Changes) */}
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigation.standaloneNav.map((item) => (
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
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Settings */}
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigation.settingsNav.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild>
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
            </SidebarContent>
          </ScrollArea>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="relative z-10 bg-transparent">
          <ScrollArea className="h-screen">
            <div className="pt-14">{children}</div>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
