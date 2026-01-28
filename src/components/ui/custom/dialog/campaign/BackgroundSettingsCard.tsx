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
import { BACKGROUND_SETTINGS } from "@/lib/constants/validation";
import {
  CampaignSettings,
  DEFAULT_CAMPAIGN_SETTINGS,
} from "@/lib/types/campaign-settings";
import { SliderControl } from "./SliderControl";

// Re-export for backward compatibility
export type { CampaignSettings };
export { DEFAULT_CAMPAIGN_SETTINGS as DEFAULT_SETTINGS };

interface BackgroundSettingsCardProps {
  settings: CampaignSettings;
  onSettingsChange: (settings: CampaignSettings) => void;
  onSave: () => void;
  isPending: boolean;
}

/**
 * Helper component for a section of background settings controls
 */
interface SettingsSectionProps {
  title: string;
  section: "header" | "sidebar" | "bg" | "card";
  settings: CampaignSettings;
  onSettingsChange: (settings: CampaignSettings) => void;
  showExpandCheckbox?: {
    id: string;
    label: string;
    checked: boolean;
    field: "expandToHeader" | "expandToSidebar";
  };
  opacityLabel?: string;
  className?: string;
}

function SettingsSection({
  title,
  section,
  settings,
  onSettingsChange,
  showExpandCheckbox,
  opacityLabel = "Background Opacity",
  className = "",
}: SettingsSectionProps) {
  const updateSetting = (key: string, value: number | boolean) => {
    onSettingsChange({
      ...settings,
      [section]: { ...settings[section], [key]: value },
    });
  };

  const currentSettings = settings[section];
  const opacityValue =
    "opacity" in currentSettings
      ? currentSettings.opacity
      : "bgOpacity" in currentSettings
        ? currentSettings.bgOpacity
        : 0;
  const blurValue = currentSettings.blur;

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-semibold text-lg mb-4">{title}</h3>

      <SliderControl
        label={opacityLabel}
        value={opacityValue}
        onChange={(v) =>
          updateSetting("opacity" in currentSettings ? "opacity" : "bgOpacity", v)
        }
        {...BACKGROUND_SETTINGS.OPACITY}
      />

      <SliderControl
        label="Blur"
        value={blurValue}
        onChange={(v) => updateSetting("blur", v)}
        {...BACKGROUND_SETTINGS.BLUR}
        formatValue={(v) => `${Math.round(v)}${BACKGROUND_SETTINGS.BLUR.UNIT}`}
      />

      {showExpandCheckbox && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={showExpandCheckbox.id}
            checked={showExpandCheckbox.checked}
            onCheckedChange={(checked) =>
              onSettingsChange({
                ...settings,
                bg: {
                  ...settings.bg,
                  [showExpandCheckbox.field]: checked as boolean,
                },
              })
            }
          />
          <Label htmlFor={showExpandCheckbox.id} className="cursor-pointer">
            {showExpandCheckbox.label}
          </Label>
        </div>
      )}
    </div>
  );
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
          <SettingsSection
            title="Header"
            section="header"
            settings={settings}
            onSettingsChange={onSettingsChange}
            showExpandCheckbox={{
              id: "bg-header",
              label: "Expand background to header",
              checked: settings.bg.expandToHeader,
              field: "expandToHeader",
            }}
          />

          <SettingsSection
            title="Sidebar"
            section="sidebar"
            settings={settings}
            onSettingsChange={onSettingsChange}
            showExpandCheckbox={{
              id: "bg-sidebar",
              label: "Expand background to sidebar",
              checked: settings.bg.expandToSidebar,
              field: "expandToSidebar",
            }}
          />

          <SettingsSection
            title="Main Background"
            section="bg"
            settings={settings}
            onSettingsChange={onSettingsChange}
            opacityLabel="Overlay Opacity"
            className="md:pt-6 md:border-t xl:pt-0 xl:border-t-0"
          />

          <SettingsSection
            title="Cards & UI Elements"
            section="card"
            settings={settings}
            onSettingsChange={onSettingsChange}
            className="md:pt-6 md:border-t xl:pt-0 xl:border-t-0"
          />
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
