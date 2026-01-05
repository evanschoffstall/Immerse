'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cachedFetch } from '@/lib/db/api-cache';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Task {
  id: string;
  label: string;
  completed: boolean;
  link?: string;
}

interface GettingStartedWidgetProps {
  campaignId: string;
}

export function GettingStartedWidget({ campaignId }: GettingStartedWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const stats = await cachedFetch<{ hasCharacters: boolean; hasLocations: boolean }>(
          `/api/campaigns/${campaignId}/stats`
        );

        const hasCharacters = stats.hasCharacters || false;
        const hasLocations = stats.hasLocations || false;

        setTasks([
          {
            id: '1',
            label: 'Your first world is ready.',
            completed: true,
          },
          {
            id: '2',
            label: 'Name your campaign.',
            completed: true,
          },
          {
            id: '3',
            label: 'Create your first character.',
            completed: hasCharacters,
            link: hasCharacters ? undefined : `/characters/new?campaignId=${campaignId}`,
          },
          {
            id: '4',
            label: 'Create your first location.',
            completed: hasLocations,
            link: hasLocations ? undefined : `/locations/new?campaignId=${campaignId}`,
          },
          {
            id: '5',
            label: 'Invite a friend or co-author.',
            completed: false,
          },
          {
            id: '6',
            label: 'Customise your dashboard.',
            completed: true,
          },
        ]);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [campaignId]);

  const completedCount = tasks.filter((t) => t.completed).length;

  if (loading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = (completedCount / tasks.length) * 100;

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Getting Started</CardTitle>
        <span className="text-sm text-muted-foreground">
          {completedCount} / {tasks.length}
        </span>
      </CardHeader>
      <div className="px-6">
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <CardContent className="space-y-3 pt-6">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 text-sm">
            <Checkbox checked={task.completed} disabled className="cursor-default" />
            {task.completed ? (
              <span className="line-through text-muted-foreground/70">{task.label}</span>
            ) : task.link ? (
              <Link href={task.link} className="hover:underline font-medium">
                {task.label}
              </Link>
            ) : (
              <span className="font-medium">{task.label}</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
