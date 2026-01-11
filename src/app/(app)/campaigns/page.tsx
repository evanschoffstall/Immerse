import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { authConfig } from '@/lib/auth';
import { extractTextFromLexical, truncateText } from '@/lib/utils/lexical';
import { desc, eq } from 'drizzle-orm';
import { Mountain } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CampaignsPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect('/login');
  }

  console.log('Session user:', session.user);
  console.log('Session user ID:', session.user.id);

  const campaignsList = await db.query.campaigns.findMany({
    where: eq(campaigns.ownerId, session.user.id!),
    orderBy: [desc(campaigns.updatedAt)],
  });

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Campaigns</h1>
        {campaignsList.length > 0 && (
          <Link href="/campaigns/new">
            <Button>Create New Campaign</Button>
          </Link>
        )}
      </div>

      {campaignsList.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
            <Mountain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <CardTitle>No campaigns yet</CardTitle>
            <CardDescription>
              Create your first campaign to start your worldbuilding journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/campaigns/new">Create Your First Campaign</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="campaigns-list">
          {campaignsList.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`} data-testid="campaign-card">
              <Card className="group overflow-hidden border bg-card transition-all hover:shadow-lg h-full">
                {campaign.image && (
                  <div className="relative h-40 w-full overflow-hidden bg-muted">
                    <Image
                      src={campaign.image}
                      alt={campaign.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-1 text-lg">{campaign.name}</CardTitle>
                  {campaign.description && (
                    <CardDescription className="line-clamp-2 mt-1">
                      {truncateText(extractTextFromLexical(campaign.description))}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(campaign.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

