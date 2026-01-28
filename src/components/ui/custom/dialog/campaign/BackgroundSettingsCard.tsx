"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SliderControl } from "./SliderControl";

export interface CampaignSettings {
  bg: {
    opacity: number;
    blur: number;
    expandToSidebar: boolean;
    expandToHeader: boolean;
  };
  header: { bgOpacity: number; blur: number };
  sidebar: { bgOpacity: number; blur: number };
  card: { bgOpacity: number; blur: number };
}

export const DEFAULT_SETTINGS: CampaignSettings = {
  bg: { opacity: 0.6, blur: 4, expandToSidebar: true, expandToHeader: true },
  header: { bgOpacity: 0.0, blur: 4 },
  sidebar: { bgOpacity: 0.0, blur: 0 },
  card: { bgOpacity: 0.6, blur: 8 },
};

interface BackgroundSettingsCardProps {
  settings: CampaignSettings;
  onSettingsChange: (settings: CampaignSettings) => void;
  onSave: () => void;
  isPending: boolean;
}

export function BackgroundSettingsCard({
  settings,
  onSettingsChange,
  onSave,
  isPending,
}: BackgroundSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Background Settings</CardTitle>
        <CardDescription>
          Customize how your background image is displayed (live preview)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Header Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Header</h3>

            <SliderControl
              label="Background Opacity"
              value={settings.header.bgOpacity}
              onChange={(v) =>
                onSettingsChange({
                  ...settings,
                  header: { ...settings.header, bgOpacity: v },
                })
              }
            />

            <SliderControl
              label="Blur"
              value={settings.header.blur}
              onChange={(v) =>
                onSettingsChange({
                  ...settings,
                  header: { ...settings.header, blur: v },
                })
              }
              min={0}
              max={50}
              step={1}
              formatValue={(v) => `${Math.round(v)}px`}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bg-header"
                checked={settings.bg.expandToHeader}
                onCheckedChange={(checked) =>
                  onSettingsChange({
                    ...settings,
                    bg: {
                      ...settings.bg,
                      expandToHeader: checked as boolean,
                    },
                  })
                }
              />
              <Label htmlFor="bg-header" className="cursor-pointer">
                Expand background to header
              </Label>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Sidebar</h3>

            <SliderControl
              label="Background Opacity"
              value={settings.sidebar.bgOpacity}
              onChange={(v) =>
                onSettingsChange({
                  ...settings,
                  sidebar: { ...settings.sidebar, bgOpacity: v },
                })
              }
            />

            <SliderControl
              label="Blur"
              value={settings.sidebar.blur}
              onChange={(v) =>
                onSettingsChange({
                  ...settings,
                  sidebar: { ...settings.sidebar, blur: v },
                })
              }
              min={0}
              max={50}
              step={1}
              formatValue={(v) => `${Math.round(v)}px`}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bg-sidebar"
                checked={settings.bg.expandToSidebar}
                onCheckedChange={(checked) =>
                  onSettingsChange({
                    ...settings,
                    bg: {
                      ...settings.bg,
                      expandToSidebar: checked as boolean,
                    },
                  })
                }
              />
              <Label htmlFor="bg-sidebar" className="cursor-pointer">
                Expand background to sidebar
              </Label>
            </div>
          </div>

          {/* Main background settings */}
          <div className="space-y-4 md:pt-6 md:border-t xl:pt-0 xl:border-t-0">
            <h3 className="font-semibold text-lg mb-4">Main Background</h3>

            <SliderControl
              label="Overlay Opacity"
              value={settings.bg.opacity}
              onChange={(v) =>
                onSettingsChange({
                  ...settings,
                  bg: { ...settings.bg, opacity: v },
                })
              }
            />

            <SliderControl
              label="Blur"
              value={settings.bg.blur}
              onChange={(v) =>
                onSettingsChange({
                  ...settings,
                  bg: { ...settings.bg, blur: v },
                })
              }
              min={0}
              max={50}
              step={1}
              formatValue={(v) => `${Math.round(v)}px`}
            />
          </div>

          {/* Card/UI settings */}
          <div className="space-y-4 md:pt-6 md:border-t xl:pt-0 xl:border-t-0">
            <h3 className="font-semibold text-lg mb-4">Cards &amp; UI Elements</h3>

            <SliderControl
              label="Background Opacity"
              value={settings.card.bgOpacity}
              onChange={(v) =>
                onSettingsChange({
                  ...settings,
                  card: { ...settings.card, bgOpacity: v },
                })
              }
            />

            <SliderControl
              label="Blur"
              value={settings.card.blur}
              onChange={(v) =>
                onSettingsChange({
                  ...settings,
                  card: { ...settings.card, blur: v },
                })
              }
              min={0}
              max={50}
              step={1}
              formatValue={(v) => `${Math.round(v)}px`}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Background Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
