'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Map as MapIcon,
  MapPin,
  Mountain,
  Notebook,
  Package,
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

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', href: `/campaigns/${campaign.id}` },
    { icon: Bookmark, label: 'Bookmarks', href: `/campaigns/${campaign.id}/bookmarks` },

    // World Section
    { icon: Mountain, label: 'World', href: `/campaigns/${campaign.id}/world`, isSection: true },
    { icon: Users, label: 'Characters', href: `/campaigns/${campaign.id}/characters`, indent: true },
    { icon: MapPin, label: 'Locations', href: `/campaigns/${campaign.id}/locations`, indent: true },
    { icon: MapIcon, label: 'Maps', href: `/campaigns/${campaign.id}/maps`, indent: true },
    { icon: Shield, label: 'Organizations', href: `/campaigns/${campaign.id}/organizations`, indent: true },
    { icon: Users2, label: 'Families', href: `/campaigns/${campaign.id}/families`, indent: true },
    { icon: Swords, label: 'Creatures', href: `/campaigns/${campaign.id}/creatures`, indent: true },

    // Time Section
    { icon: Clock, label: 'Time', href: `/campaigns/${campaign.id}/time`, isSection: true },
    { icon: Calendar, label: 'Calendars', href: `/campaigns/${campaign.id}/calendars`, indent: true },
    { icon: Scroll, label: 'Events', href: `/campaigns/${campaign.id}/events`, indent: true },

    { icon: Notebook, label: 'Journals', href: `/campaigns/${campaign.id}/journals` },

    // Game Section
    { icon: BookOpen, label: 'Game', href: `/campaigns/${campaign.id}/game`, isSection: true },
    { icon: Scroll, label: 'Quests', href: `/campaigns/${campaign.id}/quests`, indent: true },
    { icon: Package, label: 'Objects', href: `/campaigns/${campaign.id}/objects`, indent: true },
    { icon: Sparkles, label: 'Abilities', href: `/campaigns/${campaign.id}/abilities`, indent: true },

    { icon: FileText, label: 'Notes', href: `/campaigns/${campaign.id}/notes` },

    // Other Section
    { icon: Gem, label: 'Other', href: `/campaigns/${campaign.id}/other`, isSection: true },
    { icon: Tags, label: 'Tags', href: `/campaigns/${campaign.id}/tags`, indent: true },
    { icon: LinkIcon, label: 'Connections', href: `/campaigns/${campaign.id}/connections`, indent: true },
    { icon: Tag, label: 'Attribute Templates', href: `/campaigns/${campaign.id}/attribute-templates`, indent: true },

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
    <div className="flex h-screen relative" data-campaign-page>
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
            left: `calc(var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'}) * 0px + (1 - var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'})) * 13rem)`,
            right: '0',
            bottom: '0',
          }}
        />
      )}

      {/* Fixed background overlay with opacity and blur - also covers header */}
      {campaign.backgroundImage && (
        <div
          className="fixed pointer-events-none"
          style={{
            backgroundColor: `hsl(var(--background) / var(--campaign-bg-opacity, ${campaignStyle?.bgOpacity ?? 0.8}))`,
            backdropFilter: `blur(var(--campaign-bg-blur, ${campaignStyle?.bgBlur ?? 4}px))`,
            WebkitBackdropFilter: `blur(var(--campaign-bg-blur, ${campaignStyle?.bgBlur ?? 4}px))`,
            zIndex: 1,
            top: `calc(var(--campaign-bg-expand-to-header, ${campaignStyle?.bgExpandToHeader ? '1' : '0'}) * 0px + (1 - var(--campaign-bg-expand-to-header, ${campaignStyle?.bgExpandToHeader ? '1' : '0'})) * 4rem)`,
            left: `calc(var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'}) * 0px + (1 - var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'})) * 13rem)`,
            right: '0',
            bottom: '0',
          }}
        />
      )}

      {/* Sidebar Navigation - Fixed height with independent scroll */}
      <div
        className="w-52 flex flex-col shrink-0 overflow-hidden relative z-10 pt-16"
        style={{
          backdropFilter: `blur(var(--campaign-sidebar-blur, ${campaignStyle?.sidebarBlur ?? 0}px))`,
          WebkitBackdropFilter: `blur(var(--campaign-sidebar-blur, ${campaignStyle?.sidebarBlur ?? 0}px))`,
          borderRight: `calc(1px * (1 - var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'}))) solid hsl(var(--border))`,
        }}
      >
        {/* Background gradient layer with opacity control */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(to right, hsl(var(--card)), hsl(var(--card) / 0.7), transparent)',
            opacity: `var(--campaign-sidebar-bg-opacity, ${campaignStyle?.sidebarBgOpacity ?? 1.0})`,
          }}
        />
        {/* Campaign Header - Fixed */}
        <div
          className="p-3 shrink-0"
          style={{
            borderBottom: `calc(1px * (1 - var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'}))) solid hsl(var(--border))`,
          }}
        >
          <div className="flex items-center gap-3">
            {campaign.image && (
              <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
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
        </div>

        {/* Scrollable Navigation Items */}
        <ScrollArea className="flex-1 px-3">
          <nav className="py-2 space-y-0.5">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const isSection = (item as any).isSection;
              const indent = (item as any).indent;

              if (isSection) {
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-default select-none"
                  >
                    <Icon className="w-3.5 h-3.5 opacity-60" />
                    <span>{item.label}</span>
                  </div>
                );
              }

              return (
                <Link key={index} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors ${indent ? 'pl-7' : ''
                      } ${active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Settings at bottom - Fixed */}
        <div
          className="p-2 shrink-0"
          style={{
            borderTop: `calc(1px * (1 - var(--campaign-bg-expand-to-sidebar, ${campaignStyle?.bgExpandToSidebar ? '1' : '0'}))) solid hsl(var(--border))`,
          }}
        >
          <Link href={`/campaigns/${campaign.id}/edit`}>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="pt-16">{children}</div>
      </div>
    </div>
  );
}
