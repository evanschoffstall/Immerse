import { ActiveQuestsWidget } from '@/components/dashboard-widgets/ActiveQuestsWidget';
import { GettingStartedWidget } from '@/components/dashboard-widgets/GettingStartedWidget';
import { RecentActivityWidget } from '@/components/dashboard-widgets/RecentActivityWidget';
import { Separator } from '@/components/ui/separator';
import { authConfig } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function CampaignDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect('/login');
  }

  const { id: campaignId } = await params;

  return (
    <>
      {/* Dashboard Content */}
      <div className="p-8">
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
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
