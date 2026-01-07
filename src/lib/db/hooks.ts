"use client";

import { useTheme } from "next-themes";
import * as React from "react";
import { useEffect, useState } from "react";

// ============================================================================
// useIsMobile
// ============================================================================

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// ============================================================================
// useCampaignDashboard
// ============================================================================

interface DashboardStats {
  hasBeings: boolean;
  hasLocations: boolean;
}

interface RecentEntity {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  imageId?: string | null;
}

interface Quest {
  id: string;
  name: string;
  updatedAt: string;
  status: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentEntities: RecentEntity[];
  activeQuests: Quest[];
}

export function useCampaignDashboard(campaignId: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}/dashboard`);
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
        }
        const result = (await response.json()) as DashboardData;
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

  return { data, loading, error };
}

// ============================================================================
// useCampaignTheme
// ============================================================================

/**
 * Campaign-Specific Theme Hook
 * Allows campaigns to have custom color schemes and styling
 *
 * This hook will be expanded in Phase 29 to support:
 * - Campaign-specific color palettes
 * - Custom CSS variables per campaign
 * - Theme inheritance (campaign theme + user preference)
 *
 * Current implementation:
 * - Placeholder for future campaign theme system
 * - Returns current global theme
 *
 * Future usage (Phase 29):
 * ```tsx
 * const { campaignTheme, setCampaignTheme } = useCampaignTheme(campaignId)
 *
 * // Apply campaign-specific colors
 * setCampaignTheme({
 *   primary: '#8B5CF6',
 *   secondary: '#EC4899',
 *   accent: '#F59E0B'
 * })
 * ```
 *
 * @param campaignId - Optional campaign ID to load custom theme
 * @returns Theme utilities including campaign-specific overrides
 */
export function useCampaignTheme(campaignId?: string) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Future: Load campaign-specific theme from API
    if (campaignId) {
      // Placeholder for Phase 29
      // const campaignTheme = await fetch(`/api/campaigns/${campaignId}/theme`)
      // Apply campaign CSS variables to :root
      // document.documentElement.style.setProperty('--campaign-primary', theme.primary)
    }
  }, [campaignId]);

  return {
    theme,
    setTheme,
    // Future: Campaign-specific theme data
    campaignColors: null,
    setCampaignColors: (colors: Record<string, string>) => {
      // Placeholder for Phase 29
      console.log("Campaign theme support coming in Phase 29", colors);
    },
  };
}
