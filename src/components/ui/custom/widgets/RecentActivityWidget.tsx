import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { beings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

interface RecentEntity {
  id: string;
  name: string;
  type: string;
  updatedAt: Date;
  image?: string | null;
}

interface RecentActivityWidgetProps {
  campaignId: string;
}

export async function RecentActivityWidget({
  campaignId,
}: RecentActivityWidgetProps) {
  // Fetch recent beings for this campaign
  const recentBeings = await db.query.beings.findMany({
    where: eq(beings.campaignId, campaignId),
    orderBy: [desc(beings.updatedAt)],
    limit: 5,
    columns: {
      id: true,
      name: true,
      updatedAt: true,
      imageId: true,
    },
  });

  const entities: RecentEntity[] = recentBeings.map((being) => ({
    id: being.id,
    name: being.name,
    type: "being",
    updatedAt: being.updatedAt,
    image: being.imageId,
  }));

  // Sort by most recent
  entities.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

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

  const getEntityLink = (entity: RecentEntity) => {
    const typeMap: Record<string, string> = {
      being: "beings",
      location: "locations",
      item: "items",
      quest: "quests",
      event: "events",
      journal: "journals",
      note: "notes",
    };
    const path =
      typeMap[entity.type.toLowerCase()] || entity.type.toLowerCase() + "s";
    return `/campaigns/${campaignId}/${path}/${entity.id}`;
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent changes</CardTitle>
      </CardHeader>
      <CardContent>
        {entities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start creating to see your recent work here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entities.map((entity) => (
              <Link
                key={entity.id}
                href={getEntityLink(entity)}
                className="flex items-center gap-3 hover:bg-accent rounded-md p-2 -mx-2 transition-colors"
              >
                {entity.image && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={entity.image}
                      alt={entity.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{entity.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {entity.type}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(entity.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
