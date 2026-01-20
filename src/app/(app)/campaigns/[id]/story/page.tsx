import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditCampaignField } from "@/components/ui/custom/EditCampaignField";
import RichTextViewer from "@/components/ui/custom/RichTextViewer";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { acts, beats, campaigns, scenes } from "@/db/schema";
import { hasLexicalContent } from "@/lib/utils/lexical";
import { and, desc, eq, isNull } from "drizzle-orm";
import { BookOpen, Clock, ScrollText, Theater } from "lucide-react";
import { updateCampaign } from "../edit/actions";
import {
  CreateActInlineButton,
  CreateBeatInlineButton,
  CreateSceneInlineButton,
  EditActButton,
  EditBeatButton,
  EditSceneButton,
  EmptyState,
  InteractiveContainer,
} from "./client";

// #region Types & Constants
type ActWithScenesAndBeats = typeof acts.$inferSelect & {
  scenes: (typeof scenes.$inferSelect & {
    beats: (typeof beats.$inferSelect)[];
  })[];
};

type CampaignData = {
  name: string;
  description: string | null;
  image: string | null;
  backgroundImage: string | null;
};

const HIDDEN_ACTIONS =
  "opacity-0 pointer-events-none transition-opacity flex items-center gap-2";
const formatTimestamp = (ts: Date) =>
  ts.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
// #endregion

// #region Shared Components
const LexicalContent = ({
  content,
  size = "sm",
}: {
  content: string;
  size?: "sm" | "base";
}) => (
  <div className="flex min-h-10 items-center py-1">
    <div
      className={`prose dark:prose-invert max-w-none ${size === "sm" ? "prose-sm" : ""}`}
    >
      <RichTextViewer content={content} />
    </div>
  </div>
);

const SectionIcon = ({
  icon: Icon,
  size = "lg",
}: {
  icon: typeof Theater;
  size?: "sm" | "lg";
}) =>
  size === "lg" ? (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
      <Icon className="h-6 w-6 text-primary" />
    </div>
  ) : (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
      <Icon className="h-4 w-4 text-primary" />
    </div>
  );

const HeaderActions = ({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) => <div className={`${className} ${HIDDEN_ACTIONS}`}>{children}</div>;
// #endregion

// #region Page Header
const PageHeader = ({
  campaign,
  campaignId,
}: {
  campaign: CampaignData;
  campaignId: string;
}) => (
  <div className="group flex items-center gap-2">
    <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
    <EditCampaignField
      campaignId={campaignId}
      currentData={campaign}
      field="name"
      onUpdate={updateCampaign}
      buttonClassName="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
    />
  </div>
);
// #endregion

// #region Overview Card
const CampaignDescriptionCard = ({
  campaign,
  campaignId,
}: {
  campaign: CampaignData;
  campaignId: string;
}) => {
  const hasContent = hasLexicalContent(campaign.description);
  return (
    <Card className="group/overview">
      <CardHeader className={hasContent ? "pb-4" : ""}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <SectionIcon icon={ScrollText} />
            <CardTitle className="text-xl leading-tight">Overview</CardTitle>
          </div>
          <EditCampaignField
            campaignId={campaignId}
            currentData={campaign}
            field="description"
            onUpdate={updateCampaign}
            buttonClassName="h-8 w-8 opacity-0 group-hover/overview:opacity-100 transition-opacity"
          />
        </div>
      </CardHeader>
      {hasContent && campaign.description && (
        <CardContent>
          <LexicalContent content={campaign.description} />
        </CardContent>
      )}
    </Card>
  );
};
// #endregion

// #region Beat
const BeatItem = ({ beat }: { beat: typeof beats.$inferSelect }) => (
  <InteractiveContainer stopPropagation>
    <div className="group/beat flex items-start gap-3 rounded-md bg-muted/50 p-3 transition-colors hover:bg-muted">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        <Clock className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <span className="text-xs font-mono text-muted-foreground">
          {formatTimestamp(beat.timestamp)}
        </span>
        <p className="text-sm">{beat.text}</p>
      </div>
      <HeaderActions className="beat-actions group-hover/beat:opacity-100 group-hover/beat:pointer-events-auto">
        <EditBeatButton
          beatId={beat.id}
          initialData={{ text: beat.text, timestamp: beat.timestamp }}
        />
      </HeaderActions>
    </div>
  </InteractiveContainer>
);
// #endregion

// #region Scene
const SceneCard = ({
  scene,
  campaignId,
}: {
  scene: typeof scenes.$inferSelect & { beats: (typeof beats.$inferSelect)[] };
  campaignId: string;
}) => {
  const sortedBeats = [...scene.beats].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );
  const hasContent = hasLexicalContent(scene.content);
  return (
    <Card className="group/scene scene-card ml-8 transition-shadow hover:shadow-md">
      <CardHeader className="pb-3 group/scene-header">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SectionIcon icon={BookOpen} size="sm" />
            <CardTitle className="text-base leading-tight flex-1 min-w-0">
              {scene.name}
            </CardTitle>
          </div>
          <HeaderActions className="scene-header-actions group-hover/scene-header:opacity-100 group-hover/scene-header:pointer-events-auto">
            <EditSceneButton
              sceneId={scene.id}
              actId={scene.actId}
              campaignId={campaignId}
              initialData={{ name: scene.name, content: scene.content }}
            />
            <CreateBeatInlineButton
              sceneId={scene.id}
              campaignId={campaignId}
            />
          </HeaderActions>
        </div>
      </CardHeader>
      <InteractiveContainer stopPropagation>
        <CardContent className="space-y-3">
          {hasContent && scene.content && (
            <LexicalContent content={scene.content} />
          )}
          {sortedBeats.length > 0 && (
            <div className="space-y-3">
              {sortedBeats.map((beat) => (
                <BeatItem key={beat.id} beat={beat} />
              ))}
            </div>
          )}
        </CardContent>
      </InteractiveContainer>
    </Card>
  );
};
// #endregion

// #region Act
const ActCard = ({
  act,
  campaignId,
}: {
  act: ActWithScenesAndBeats;
  campaignId: string;
}) => {
  const sortedScenes = [...act.scenes].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const hasContent = hasLexicalContent(act.content);
  return (
    <Card className="group/act act-card overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="pb-4 group/act-header">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <SectionIcon icon={Theater} />
            <CardTitle className="text-lg leading-tight flex-1 min-w-0">
              {act.name}
            </CardTitle>
          </div>
          <HeaderActions className="act-header-actions group-hover/act-header:opacity-100 group-hover/act-header:pointer-events-auto">
            <EditActButton
              actId={act.id}
              campaignId={campaignId}
              initialData={{ name: act.name, content: act.content }}
            />
            <CreateSceneInlineButton actId={act.id} campaignId={campaignId} />
          </HeaderActions>
        </div>
      </CardHeader>
      <InteractiveContainer stopPropagation>
        <CardContent className="space-y-3">
          {hasContent && act.content && (
            <LexicalContent content={act.content} />
          )}
          {sortedScenes.length > 0 && (
            <div className="space-y-3">
              {sortedScenes.map((scene) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  campaignId={campaignId}
                />
              ))}
            </div>
          )}
        </CardContent>
      </InteractiveContainer>
    </Card>
  );
};
// #endregion

// #region Acts List
const ActsList = ({
  acts,
  campaignId,
}: {
  acts: ActWithScenesAndBeats[];
  campaignId: string;
}) => (
  <Card className="group/acts-list acts-list-card">
    <CardHeader className="pb-4 group/acts-list-header">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SectionIcon icon={Theater} />
          <CardTitle className="text-xl leading-tight">Acts</CardTitle>
        </div>
        <HeaderActions className="acts-list-header-actions group-hover/acts-list-header:opacity-100 group-hover/acts-list-header:pointer-events-auto">
          <CreateActInlineButton campaignId={campaignId} />
        </HeaderActions>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <InteractiveContainer stopPropagation>
        <div className="space-y-3">
          {acts.map((act) => (
            <ActCard key={act.id} act={act} campaignId={campaignId} />
          ))}
        </div>
      </InteractiveContainer>
    </CardContent>
  </Card>
);

// #region Page
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: campaignId } = await params;

  const [campaign, actsList] = await Promise.all([
    db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
      columns: {
        name: true,
        description: true,
        image: true,
        backgroundImage: true,
      },
    }),
    db.query.acts.findMany({
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
    }),
  ]);

  const campaignData: CampaignData = {
    name: campaign?.name ?? "Campaign",
    description: campaign?.description ?? null,
    image: campaign?.image ?? null,
    backgroundImage: campaign?.backgroundImage ?? null,
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <PageHeader campaign={campaignData} campaignId={campaignId} />
      <Separator />
      {actsList.length > 0 && (
        <CampaignDescriptionCard
          campaign={campaignData}
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
// #endregion
