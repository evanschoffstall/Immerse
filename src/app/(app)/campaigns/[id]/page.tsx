'use client';

import { ActiveQuestsWidget } from '@/components/dashboard-widgets/ActiveQuestsWidget';
import { GettingStartedWidget } from '@/components/dashboard-widgets/GettingStartedWidget';
import { RecentActivityWidget } from '@/components/dashboard-widgets/RecentActivityWidget';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CampaignDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const campaignId = params.id as string;

  return (
    <>
      {/* Dashboard Content */}
      <div className="p-8">
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-base text-foreground/70">
              Welcome back! Here's what's happening with your campaign.
            </p>
          </div>
          <Separator />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Recent Activity */}
          <RecentActivityWidget campaignId={campaignId} />

          {/* Active Quests */}
          <ActiveQuestsWidget campaignId={campaignId} />

          {/* Getting Started */}
          <GettingStartedWidget campaignId={campaignId} />
        </div>
      </div>
    </>
  );
}
