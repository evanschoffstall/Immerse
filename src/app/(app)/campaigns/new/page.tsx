import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authConfig } from "@/lib/auth/config";
import { getServerSession } from "next-auth";
import NewCampaignClient from "./client";

export default async function NewCampaignPage() {
  const session = await getServerSession(authConfig);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Campaign</CardTitle>
          <CardDescription>
            Start your worldbuilding journey by creating a new campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewCampaignClient />
        </CardContent>
      </Card>
    </div>
  );
}
