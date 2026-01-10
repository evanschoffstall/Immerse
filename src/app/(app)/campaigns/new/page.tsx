import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { createCampaign } from '../actions';

export default async function NewCampaignPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  async function handleCreate(formData: FormData) {
    'use server'
    await createCampaign(formData);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Campaign</CardTitle>
          <CardDescription>
            Start your worldbuilding journey by creating a new campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreate}>
            <input type="text" name="name" placeholder="Campaign Name" required />
            <input type="text" name="slug" placeholder="campaign-slug" required />
            <textarea name="description" placeholder="Description" />
            <button type="submit">Create Campaign</button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
