import { db } from '@/db';
import { authConfig } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import CampaignLayoutClient from './client';

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

  const campaign = await db.campaigns.findUnique({
    where: { id },
    include: {
      settings: true,
    }
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    redirect('/campaigns');
  }

  return (
    <CampaignLayoutClient
      campaign={campaign}
      campaignSettings={campaign.settings}
    >
      {children}
    </CampaignLayoutClient>
  );
}
