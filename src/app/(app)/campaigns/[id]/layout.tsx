import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
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

  // Fetch campaign and style data server-side
  const [campaign, campaignStyle] = await Promise.all([
    prisma.campaigns.findUnique({
      where: { id },
    }),
    prisma.campaign_styles.findUnique({
      where: { campaignId: id },
    }),
  ]);

  if (!campaign) {
    redirect('/campaigns');
  }

  // Check if user owns the campaign
  if (campaign.ownerId !== session.user.id) {
    redirect('/campaigns');
  }

  return (
    <CampaignLayoutClient campaign={campaign} campaignStyle={campaignStyle}>
      {children}
    </CampaignLayoutClient>
  );
}
