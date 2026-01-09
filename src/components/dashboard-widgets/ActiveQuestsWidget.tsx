'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Quest {
  id: string;
  name: string;
  updatedAt: string;
  status: string;
}

interface ActiveQuestsWidgetProps {
  campaignId: string;
}

export function ActiveQuestsWidget({ campaignId }: ActiveQuestsWidgetProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/quests?status=active`
        );
        const data = await response.json();
        setQuests(data.quests || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, [campaignId]);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const days = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Quests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Quests</CardTitle>
      </CardHeader>
      <CardContent>
        {quests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No active quests</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first quest to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quests.map((quest) => (
              <Link
                key={quest.id}
                href={`/quests/${quest.id}`}
                className="block border-b border-border pb-2 last:border-0 hover:bg-accent rounded-md p-2 -mx-2 -mb-2 last:mb-0 transition-colors"
              >
                <p className="font-medium text-sm">{quest.name}</p>
                <p className="text-xs text-muted-foreground">{formatTimeAgo(quest.updatedAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
