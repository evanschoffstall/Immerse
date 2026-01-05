'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { extractTextFromLexical, truncateText } from '@/lib/db/lexical-utils';
import type { characters as Character } from '@prisma/client';
import { Plus, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type CharacterWithRelations = Character & {
  users: {
    id: string;
    name: string | null;
  };
};

export default function CharactersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  const [characters, setCharacters] = useState<CharacterWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/characters`);

        if (!response.ok) {
          throw new Error('Failed to fetch characters');
        }

        const data = await response.json();
        setCharacters(data.characters);
      } catch (error) {
        console.error('Error fetching characters:', error);
        toast.error('Failed to load characters');
      } finally {
        setIsLoading(false);
      }
    };

    if (session && campaignId) {
      fetchCharacters();
    }
  }, [session, campaignId]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Characters
          </h1>
          {characters.length > 0 && (
            <Button asChild>
              <Link href={`/campaigns/${campaignId}/characters/new`}>
                <Plus className="mr-2 h-4 w-4" />
                New Character
              </Link>
            </Button>
          )}
        </div>
        <Separator />
      </div>

      <div className="mt-8">

        {characters.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No characters yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first character to get started
              </p>
              <Button asChild>
                <Link href={`/campaigns/${campaignId}/characters/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Character
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <Link
                key={character.id}
                href={`/campaigns/${campaignId}/characters/${character.id}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      {character.imageId ? (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                          <Image
                            src={character.imageId}
                            alt={character.name}
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
                        <CardTitle className="truncate">{character.name}</CardTitle>
                        {character.title && (
                          <CardDescription className="truncate">
                            {character.title}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {character.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {typeof character.description === 'string'
                          ? truncateText(
                            extractTextFromLexical(character.description),
                            150
                          )
                          : ''}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2 flex-wrap text-xs text-muted-foreground">
                      {character.type && (
                        <span className="px-2 py-1 bg-muted rounded">
                          {character.type}
                        </span>
                      )}
                      {character.location && (
                        <span className="px-2 py-1 bg-muted rounded">
                          {character.location}
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
