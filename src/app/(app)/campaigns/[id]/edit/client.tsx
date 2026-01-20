'use client';

import CampaignForm, { type CampaignFormData } from '@/components/forms/CampaignForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { deleteCampaign, updateCampaign, updateCampaignSettings } from './actions';

// Reusable slider control component
function SliderControl({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  formatValue = (v) => `${Math.round(v * 100)}%`,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">{formatValue(value)}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
      />
    </div>
  );
}

interface CampaignSettings {
  bg: { opacity: number; blur: number; expandToSidebar: boolean; expandToHeader: boolean };
  header: { bgOpacity: number; blur: number };
  sidebar: { bgOpacity: number; blur: number };
  card: { bgOpacity: number; blur: number };
}

const DEFAULT_SETTINGS: CampaignSettings = {
  bg: { opacity: 0.6, blur: 4, expandToSidebar: true, expandToHeader: true },
  header: { bgOpacity: 0.0, blur: 4 },
  sidebar: { bgOpacity: 0.0, blur: 0 },
  card: { bgOpacity: 0.6, blur: 8 },
};

interface EditCampaignClientProps {
  campaignId: string;
  initialData: CampaignFormData;
  initialSettings: any;
}

export default function EditCampaignClient({
  campaignId,
  initialData,
  initialSettings,
}: EditCampaignClientProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [settings, setSettings] = useState<CampaignSettings>(() => {
    if (!initialSettings) return DEFAULT_SETTINGS;

    return {
      bg: {
        opacity: initialSettings.bgOpacity ?? DEFAULT_SETTINGS.bg.opacity,
        blur: initialSettings.bgBlur ?? DEFAULT_SETTINGS.bg.blur,
        expandToSidebar: initialSettings.bgExpandToSidebar ?? DEFAULT_SETTINGS.bg.expandToSidebar,
        expandToHeader: initialSettings.bgExpandToHeader ?? DEFAULT_SETTINGS.bg.expandToHeader,
      },
      header: {
        bgOpacity: initialSettings.headerBgOpacity ?? DEFAULT_SETTINGS.header.bgOpacity,
        blur: initialSettings.headerBlur ?? DEFAULT_SETTINGS.header.blur,
      },
      sidebar: {
        bgOpacity: initialSettings.sidebarBgOpacity ?? DEFAULT_SETTINGS.sidebar.bgOpacity,
        blur: initialSettings.sidebarBlur ?? DEFAULT_SETTINGS.sidebar.blur,
      },
      card: {
        bgOpacity: initialSettings.cardBgOpacity ?? DEFAULT_SETTINGS.card.bgOpacity,
        blur: initialSettings.cardBlur ?? DEFAULT_SETTINGS.card.blur,
      },
    };
  });

  // Apply settings live for preview
  useEffect(() => {
    document.documentElement.style.setProperty('--campaign-bg-opacity', settings.bg.opacity.toString());
    document.documentElement.style.setProperty('--campaign-bg-blur', `${settings.bg.blur}px`);
    document.documentElement.style.setProperty('--campaign-header-bg-opacity', settings.header.bgOpacity.toString());
    document.documentElement.style.setProperty('--campaign-header-blur', `${settings.header.blur}px`);
    document.documentElement.style.setProperty('--campaign-sidebar-bg-opacity', settings.sidebar.bgOpacity.toString());
    document.documentElement.style.setProperty('--campaign-sidebar-blur', `${settings.sidebar.blur}px`);
    document.documentElement.style.setProperty('--campaign-bg-expand-to-sidebar', settings.bg.expandToSidebar ? '1' : '0');
    document.documentElement.style.setProperty('--campaign-bg-expand-to-header', settings.bg.expandToHeader ? '1' : '0');
    document.documentElement.style.setProperty('--campaign-card-bg-opacity', settings.card.bgOpacity.toString());
    document.documentElement.style.setProperty('--campaign-card-blur', `${settings.card.blur}px`);
  }, [settings]);

  const handleUpdateCampaign = async (data: CampaignFormData) => {
    setIsUpdating(true);
    try {
      await updateCampaign(campaignId, {
        name: data.name,
        description: data.description || '',
        image: data.image || '',
        backgroundImage: data.backgroundImage || '',
      });
      toast.success('Campaign updated successfully!');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      toast.error(error.message || 'Failed to update campaign');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateCampaignSettings(campaignId, {
        bgOpacity: settings.bg.opacity,
        bgBlur: settings.bg.blur,
        bgExpandToSidebar: settings.bg.expandToSidebar,
        bgExpandToHeader: settings.bg.expandToHeader,
        headerBgOpacity: settings.header.bgOpacity,
        headerBlur: settings.header.blur,
        sidebarBgOpacity: settings.sidebar.bgOpacity,
        sidebarBlur: settings.sidebar.blur,
        cardBgOpacity: settings.card.bgOpacity,
        cardBlur: settings.card.blur,
      });
      toast.success('Background settings saved');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteCampaign = async () => {
    setIsDeleting(true);
    try {
      await deleteCampaign(campaignId);
      toast.success('Campaign deleted successfully');
      router.push('/campaigns');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast.error(error.message || 'Failed to delete campaign');
      setShowDeleteDialog(false);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Edit Campaign</CardTitle>
            <CardDescription>
              Update your campaign details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignForm
              initialData={initialData}
              onSubmit={handleUpdateCampaign}
              isLoading={isUpdating}
              submitText="Update Campaign"
              onImageChange={(url) => {
                document.documentElement.style.setProperty('--campaign-preview-image', `url(${url})`);
              }}
              onBackgroundImageChange={(url) => {
                document.documentElement.style.setProperty('--campaign-preview-bg-image', `url(${url})`);
              }}
            />
          </CardContent>
        </Card>

        {/* Background Settings */}
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
                  onChange={(v) => setSettings({ ...settings, header: { ...settings.header, bgOpacity: v } })}
                />

                <SliderControl
                  label="Blur"
                  value={settings.header.blur}
                  onChange={(v) => setSettings({ ...settings, header: { ...settings.header, blur: v } })}
                  min={0}
                  max={50}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}px`}
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bg-header"
                    checked={settings.bg.expandToHeader}
                    onCheckedChange={(checked) => setSettings({ ...settings, bg: { ...settings.bg, expandToHeader: checked as boolean } })}
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
                  onChange={(v) => setSettings({ ...settings, sidebar: { ...settings.sidebar, bgOpacity: v } })}
                />

                <SliderControl
                  label="Blur"
                  value={settings.sidebar.blur}
                  onChange={(v) => setSettings({ ...settings, sidebar: { ...settings.sidebar, blur: v } })}
                  min={0}
                  max={50}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}px`}
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bg-sidebar"
                    checked={settings.bg.expandToSidebar}
                    onCheckedChange={(checked) => setSettings({ ...settings, bg: { ...settings.bg, expandToSidebar: checked as boolean } })}
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
                  onChange={(v) => setSettings({ ...settings, bg: { ...settings.bg, opacity: v } })}
                />

                <SliderControl
                  label="Blur"
                  value={settings.bg.blur}
                  onChange={(v) => setSettings({ ...settings, bg: { ...settings.bg, blur: v } })}
                  min={0}
                  max={50}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}px`}
                />
              </div>

              {/* Card/UI settings */}
              <div className="space-y-4 md:pt-6">
                <h3 className="font-semibold text-lg mb-4">Cards &amp; UI Elements</h3>

                <SliderControl
                  label="Background Opacity"
                  value={settings.card.bgOpacity}
                  onChange={(v) => setSettings({ ...settings, card: { ...settings.card, bgOpacity: v } })}
                />

                <SliderControl
                  label="Blur"
                  value={settings.card.blur}
                  onChange={(v) => setSettings({ ...settings, card: { ...settings.card, blur: v } })}
                  min={0}
                  max={50}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}px`}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? 'Saving...' : 'Save Background Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
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
                  <h4 className="text-sm font-semibold text-destructive">Delete Campaign</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this campaign and all its data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone and will delete all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
