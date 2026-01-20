import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authConfig } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import NewSceneClient from './client';

export default async function NewScenePage({
  params,
}: {
  params: Promise<{ id: string; actId: string }>;
}) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id: campaignId, actId } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Scene</CardTitle>
          <CardDescription>
            Create a new scene within this act.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewSceneClient actId={actId} campaignId={campaignId} />
        </CardContent>
      </Card>
    </div>
  );
}
