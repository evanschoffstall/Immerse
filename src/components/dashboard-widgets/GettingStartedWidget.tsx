import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { db } from '@/db';
import { beings } from '@/db/schema';
import { count, eq } from 'drizzle-orm';
import Link from 'next/link';

interface Task {
  id: string;
  label: string;
  completed: boolean;
  link?: string;
}

interface GettingStartedWidgetProps {
  campaignId: string;
}

export async function GettingStartedWidget({ campaignId }: GettingStartedWidgetProps) {
  // Fetch stats for this campaign
  const [beingsCountResult] = await Promise.all([
    db.select({ count: count() }).from(beings).where(eq(beings.campaignId, campaignId)),
  ]);

  const beingsCount = beingsCountResult[0]?.count ?? 0;
  const locationsCount = 0; // Placeholder until locations table exists

  const hasBeings = beingsCount > 0;
  const hasLocations = locationsCount > 0;

  const tasks: Task[] = [
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
      label: 'Create your first being.',
      completed: hasBeings,
      link: hasBeings ? undefined : `/campaigns/${campaignId}/beings/new`,
    },
    {
      id: '4',
      label: 'Create your first location.',
      completed: hasLocations,
      link: hasLocations ? undefined : `/campaigns/${campaignId}/locations/new`,
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
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
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
