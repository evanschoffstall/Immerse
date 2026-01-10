import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/db';
import { extractTextFromLexical, truncateText } from '@/lib/utils/lexical';
import { Plus, User } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CharactersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  const { id: campaignId } = await params;

  const beings = await db.beings.findMany({
    where: {
      campaignId,
      type: 'character'
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Characters
          </h1>
          {beings.length > 0 && (
            <Button asChild>
              <Link href={`/campaigns/${campaignId}/beings/new`}>
                <Plus className="mr-2 h-4 w-4" />
                New Character
              </Link>
            </Button>
          )}
        </div>
        <Separator />
      </div>

      <div className="mt-8">
        {beings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No characters yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first character to get started
              </p>
              <Button asChild>
                <Link href={`/campaigns/${campaignId}/beings/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Character
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {beings.map((being) => (
              <Link
                key={being.id}
                href={`/campaigns/${campaignId}/beings/${being.id}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      {being.imageId ? (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                          <Image
                            src={being.imageId}
                            alt={being.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">{being.name}</CardTitle>
                        {being.title && (
                          <CardDescription className="truncate">
                            {being.title}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {being.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {typeof being.description === 'string'
                          ? truncateText(
                            extractTextFromLexical(being.description),
                            150
                          )
                          : ''}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2 flex-wrap text-xs text-muted-foreground">
                      {being.type && (
                        <span className="px-2 py-1 bg-muted rounded">
                          {being.type}
                        </span>
                      )}
                      {being.location && (
                        <span className="px-2 py-1 bg-muted rounded">
                          {being.location}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
