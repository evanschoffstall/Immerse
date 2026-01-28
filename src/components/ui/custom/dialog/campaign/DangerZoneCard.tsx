"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DangerZoneCardProps {
  onDeleteClick: () => void;
}

export function DangerZoneCard({ onDeleteClick }: DangerZoneCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions that will affect your campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-destructive">
                Delete Campaign
              </h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this campaign and all its data. This action
                cannot be undone.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={onDeleteClick}>
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
