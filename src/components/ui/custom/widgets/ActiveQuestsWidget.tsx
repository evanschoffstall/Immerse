import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { quests } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import Link from "next/link";

interface Quest {
  id: string;
  name: string;
  updatedAt: Date;
  status: string | null;
}

interface ActiveQuestsWidgetProps {
  campaignId: string;
}

export async function ActiveQuestsWidget({
  campaignId,
}: ActiveQuestsWidgetProps) {
  // Fetch active quests for this campaign
  const questsList = await db.query.quests.findMany({
    where: and(
      eq(quests.campaignId, campaignId),
      eq(quests.status, "active"),
      isNull(quests.deletedAt),
    ),
    orderBy: [desc(quests.updatedAt)],
    limit: 5,
    columns: {
      id: true,
      name: true,
      updatedAt: true,
      status: true,
    },
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const days = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Quests</CardTitle>
      </CardHeader>
      <CardContent>
        {questsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No active quests</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first quest to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questsList.map((quest) => (
              <Link
                key={quest.id}
                href={`/campaigns/${campaignId}/quests/${quest.id}`}
                className="block border-b border-border pb-2 last:border-0 hover:bg-accent rounded-md p-2 -mx-2 -mb-2 last:mb-0 transition-colors"
              >
                <p className="font-medium text-sm">{quest.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(quest.updatedAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
