import RichTextViewer from "@/components/editor/RichTextViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { acts, beats, campaigns, scenes } from "@/db/schema";
import { hasLexicalContent } from "@/lib/utils/lexical";
import { and, desc, eq, isNull } from "drizzle-orm";
import { BookOpen, Clock, ScrollText, Theater } from "lucide-react";
import {
  CreateActCard,
  CreateBeatCard,
  CreateSceneCard,
  EditActButton,
  EditSceneButton,
  EmptyState,
} from "./client";
import { EditCampaignDescription } from "./EditCampaignDescription";
import { EditCampaignName } from "./EditCampaignName";

type ActWithScenesAndBeats = typeof acts.$inferSelect & {
  scenes: (typeof scenes.$inferSelect & {
    beats: (typeof beats.$inferSelect)[];
  })[];
};

export function PageHeader({
  campaignName,
  campaignId,
  campaignDescription,
  campaignImage,
  campaignBackgroundImage,
}: {
  campaignName: string;
  campaignId: string;
  campaignDescription: string | null;
  campaignImage: string | null;
  campaignBackgroundImage: string | null;
}) {
  return (
    <div className="group flex items-center gap-2">
      <h1 className="text-4xl font-bold tracking-tight">{campaignName}</h1>
      <EditCampaignName
        campaignId={campaignId}
        currentName={campaignName}
        currentDescription={campaignDescription}
        currentImage={campaignImage}
        currentBackgroundImage={campaignBackgroundImage}
      />
    </div>
  );
}

export function CampaignDescriptionCard({
  description,
  campaignId,
  campaignName,
  campaignImage,
  campaignBackgroundImage,
  campaignSettings,
}: {
  description: string | null;
  campaignId: string;
  campaignName: string;
  campaignImage: string | null;
  campaignBackgroundImage: string | null;
  campaignSettings: any;
}) {
  const hasContent = hasLexicalContent(description);

  return (
    <Card className="group/overview">
      <CardHeader className={hasContent ? "pb-4" : ""}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ScrollText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl leading-tight">Overview</CardTitle>
          </div>
          <EditCampaignDescription
            campaignId={campaignId}
            currentName={campaignName}
            currentDescription={description}
            currentImage={campaignImage}
            currentBackgroundImage={campaignBackgroundImage}
          />
        </div>
      </CardHeader>
      {hasContent && description && (
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <RichTextViewer content={description} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function formatTimestamp(timestamp: Date): string {
  return timestamp.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function BeatItem({ beat }: { beat: typeof beats.$inferSelect }) {
  return (
    <div className="group/beat flex gap-3 rounded-md bg-muted/50 p-3 transition-colors hover:bg-muted">
      <div className="flex-shrink-0">
        <div className="flex h-6 w-6 items-center justify-center">
          <Clock className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <span className="text-xs font-mono text-muted-foreground">
          {formatTimestamp(beat.timestamp)}
        </span>
        <p className="text-sm">{beat.text}</p>
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
  const hasContent = hasLexicalContent(scene.content);
  const hasBeats = sortedBeats.length > 0;

  return (
    <Card className="group/scene ml-8 transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">
                {scene.name}
              </CardTitle>
            </div>
          </div>
          <div className="opacity-0 group-hover/scene:opacity-100 transition-opacity">
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasContent && scene.content && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <RichTextViewer content={scene.content} />
          </div>
        )}
        {hasBeats && (
          <div className="space-y-2">
            {sortedBeats.map((beat) => (
              <BeatItem key={beat.id} beat={beat} />
            ))}
          </div>
        )}
        <CreateBeatCard sceneId={scene.id} campaignId={campaignId} />
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
  const hasContent = hasLexicalContent(act.content);
  const hasScenes = sortedScenes.length > 0;

  return (
    <Card className="group/act overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Theater className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl leading-tight">
                {act.name}
              </CardTitle>
            </div>
          </div>
          <div className="opacity-0 group-hover/act:opacity-100 transition-opacity">
            <EditActButton
              actId={act.id}
              campaignId={campaignId}
              initialData={{
                name: act.name,
                content: act.content,
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasContent && act.content && (
          <div className="prose dark:prose-invert max-w-none">
            <RichTextViewer content={act.content} />
          </div>
        )}
        {hasScenes && (
          <div className="space-y-3">
            {sortedScenes.map((scene) => (
              <SceneCard key={scene.id} scene={scene} campaignId={campaignId} />
            ))}
            <div className="ml-8">
              <CreateSceneCard actId={act.id} campaignId={campaignId} />
            </div>
          </div>
        )}
        {!hasScenes && (
          <div className="ml-8">
            <CreateSceneCard actId={act.id} campaignId={campaignId} />
          </div>
        )}
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
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Theater className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl leading-tight">Acts</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {acts.map((act) => (
          <ActCard key={act.id} act={act} campaignId={campaignId} />
        ))}
        <CreateActCard campaignId={campaignId} />
      </CardContent>
    </Card>
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
      name: true,
      description: true,
      image: true,
      backgroundImage: true,
    },
    with: {
      settings: true,
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
      <PageHeader
        campaignName={campaign?.name ?? "Campaign"}
        campaignId={campaignId}
        campaignDescription={campaign?.description ?? null}
        campaignImage={campaign?.image ?? null}
        campaignBackgroundImage={campaign?.backgroundImage ?? null}
      />
      <Separator />
      {actsList.length > 0 && (
        <CampaignDescriptionCard
          description={campaign?.description ?? null}
          campaignId={campaignId}
          campaignName={campaign?.name ?? "Campaign"}
          campaignImage={campaign?.image ?? null}
          campaignBackgroundImage={campaign?.backgroundImage ?? null}
          campaignSettings={campaign?.settings ?? null}
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
