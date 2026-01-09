import { campaignService } from '@/features/campaigns/campaigns';
import { campaignSettingsService } from '@/features/campaigns/settings';
import { authConfig } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import CampaignLayoutClient from './CampaignLayoutClient';

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch campaign and settings data server-side via services
  const [campaignResult, settingsResult] = await Promise.all([
    campaignService.get(id, session.user.id).catch(() => null),
    campaignSettingsService.get(id).catch(() => ({ settings: null })),
  ]);

  if (!campaignResult) {
    redirect('/campaigns');
  }

  return (
    <CampaignLayoutClient
      campaign={campaignResult.campaign}
      campaignSettings={settingsResult.settings}
    >
      {children}
    </CampaignLayoutClient>
  );
}
