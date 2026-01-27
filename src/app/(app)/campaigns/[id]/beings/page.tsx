import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db/db";
import { beings } from "@/db/schema";
import { extractTextFromLexical, truncateText } from "@/lib/utils/lexical";
import { desc, eq } from "drizzle-orm";
import { Plus, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PAGE_TITLE = "Beings";
const PAGE_DESCRIPTION =
  "Manage the characters, NPCs, and creatures in your campaign";
const CREATE_BUTTON_TEXT = "Create Being";
const EMPTY_STATE_TITLE = "No beings yet";
const EMPTY_STATE_DESCRIPTION = "Create your first being to get started";
const DESCRIPTION_TRUNCATE_LENGTH = 150;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: campaignId } = await params;

  const beingsList = await db.query.beings.findMany({
    where: eq(beings.campaignId, campaignId),
    orderBy: [desc(beings.createdAt)],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">{PAGE_TITLE}</h1>
            <p className="text-base text-muted-foreground">
              {PAGE_DESCRIPTION}
            </p>
          </div>
          {beingsList.length > 0 && (
            <Button asChild>
              <Link href={`/campaigns/${campaignId}/beings/new`}>
                <Plus className="mr-2 h-4 w-4" />
                {CREATE_BUTTON_TEXT}
              </Link>
            </Button>
          )}
        </div>

        <Separator />

        {beingsList.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {EMPTY_STATE_TITLE}
              </h3>
              <p className="text-muted-foreground mb-6">
                {EMPTY_STATE_DESCRIPTION}
              </p>
              <Button asChild>
                <Link href={`/campaigns/${campaignId}/beings/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  {CREATE_BUTTON_TEXT}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {beingsList.map((being) => (
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
                        {typeof being.description === "string"
                          ? truncateText(
                            extractTextFromLexical(being.description),
                            DESCRIPTION_TRUNCATE_LENGTH,
                          )
                          : ""}
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
