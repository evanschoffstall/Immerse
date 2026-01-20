import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { authConfig } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import EditCampaignClient from './client';

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect('/login');
  }

  const { id: campaignId } = await params;

  // Fetch campaign and verify ownership
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
    with: {
      settings: true,
    },
  });

  if (!campaign) {
    redirect('/campaigns');
  }

  if (campaign.ownerId !== session.user.id) {
    redirect('/campaigns');
  }

  const initialData = {
    name: campaign.name,
    description: campaign.description || '',
    image: campaign.image || '',
    backgroundImage: campaign.backgroundImage || '',
  };

  return (
    <EditCampaignClient
      campaignId={campaignId}
      initialData={initialData}
      initialSettings={campaign.settings}
    />
  );
}
