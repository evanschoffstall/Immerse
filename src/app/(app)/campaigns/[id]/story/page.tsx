import RichTextViewer from "@/components/editor/RichTextViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { acts, beats, campaigns, scenes } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { BookOpen, Clock, Edit2, ScrollText, Theater } from "lucide-react";
import Link from "next/link";
import {
  CreateActCard,
  CreateBeatCard,
  CreateSceneCard,
  EditActButton,
  EditSceneButton,
  EmptyState,
} from "./client";

type ActWithScenesAndBeats = typeof acts.$inferSelect & {
  scenes: (typeof scenes.$inferSelect & {
    beats: (typeof beats.$inferSelect)[];
  })[];
};

export function CampaignDescriptionCard({
  description,
  campaignId,
}: {
  description: string | null;
  campaignId: string;
}) {
  if (!description) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ScrollText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Campaign Overview</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href={`/campaigns/${campaignId}/edit`}>
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit campaign</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          <RichTextViewer content={description} />
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimestamp(timestamp: Date): string {
  return timestamp.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BeatItem({ beat }: { beat: typeof beats.$inferSelect }) {
  return (
    <div className="group relative flex gap-3 rounded-lg border-l-2 border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50">
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {formatTimestamp(beat.timestamp)}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{beat.text}</p>
      </div>
    </div>
  );
}

export function SceneCard({
  scene,
  campaignId,
}: {
  scene: typeof scenes.$inferSelect & {
    beats: (typeof beats.$inferSelect)[];
  };
  campaignId: string;
}) {
  const sortedBeats = [...scene.beats].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  return (
    <Card className="border-l-4 border-l-primary/20 transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base leading-tight">
                {scene.name}
              </CardTitle>
              {sortedBeats.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {sortedBeats.length}{" "}
                    {sortedBeats.length === 1 ? "beat" : "beats"}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <EditSceneButton
            sceneId={scene.id}
            actId={scene.actId}
            campaignId={campaignId}
            initialData={{
              name: scene.name,
              content: scene.content,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {scene.content && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <RichTextViewer content={scene.content} />
          </div>
        )}
        <div className="space-y-2">
          {sortedBeats.length > 0 && (
            <>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Timeline
              </h4>
              <div className="space-y-2">
                {sortedBeats.map((beat) => (
                  <BeatItem key={beat.id} beat={beat} />
                ))}
              </div>
            </>
          )}
          <CreateBeatCard sceneId={scene.id} campaignId={campaignId} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ActCard({
  act,
  campaignId,
}: {
  act: ActWithScenesAndBeats;
  campaignId: string;
}) {
  const sortedScenes = [...act.scenes].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Theater className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl leading-tight">
                  {act.name}
                </CardTitle>
                {sortedScenes.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {sortedScenes.length}{" "}
                    {sortedScenes.length === 1 ? "scene" : "scenes"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <EditActButton
            actId={act.id}
            campaignId={campaignId}
            initialData={{
              name: act.name,
              content: act.content,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {act.content && (
          <div className="prose dark:prose-invert max-w-none">
            <RichTextViewer content={act.content} />
          </div>
        )}
        <div className="space-y-4">
          {sortedScenes.length > 0 && (
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Scenes
              </h3>
            </div>
          )}
          <div className="space-y-3">
            {sortedScenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                campaignId={campaignId}
              />
            ))}
            <CreateSceneCard actId={act.id} campaignId={campaignId} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActsList({
  acts,
  campaignId,
}: {
  acts: ActWithScenesAndBeats[];
  campaignId: string;
}) {
  return (
    <div className="space-y-8">
      {acts.map((act) => (
        <ActCard key={act.id} act={act} campaignId={campaignId} />
      ))}
      <CreateActCard campaignId={campaignId} />
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: campaignId } = await params;

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
    columns: {
      description: true,
    },
  });

  const actsList = await db.query.acts.findMany({
    where: and(eq(acts.campaignId, campaignId), isNull(acts.deletedAt)),
    orderBy: [desc(acts.createdAt)],
    with: {
      scenes: {
        where: isNull(scenes.deletedAt),
        orderBy: [desc(scenes.createdAt)],
        with: {
          beats: {
            where: isNull(beats.deletedAt),
            orderBy: [desc(beats.timestamp)],
          },
        },
      },
    },
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      {actsList.length > 0 && (
        <CampaignDescriptionCard
          description={campaign?.description ?? null}
          campaignId={campaignId}
        />
      )}
      {actsList.length === 0 ? (
        <Card>
          <EmptyState campaignId={campaignId} />
        </Card>
      ) : (
        <ActsList acts={actsList} campaignId={campaignId} />
      )}
    </div>
  );
}
