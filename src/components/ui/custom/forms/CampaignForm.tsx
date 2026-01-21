"use client";

import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/ui/custom/rich-text/RichTextEditor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ImageUpload from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const campaignSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  image: z.string().optional(),
  backgroundImage: z.string().optional(),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  isLoading?: boolean;
  submitText?: string;
  onImageChange?: (url: string) => void;
  onBackgroundImageChange?: (url: string) => void;
}

export default function CampaignForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitText = "Save Campaign",
  onImageChange,
  onBackgroundImageChange,
}: CampaignFormProps) {
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || undefined,
      image: initialData?.image || undefined,
      backgroundImage: initialData?.backgroundImage || undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value as string}
                  placeholder="Enter campaign name"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={(field.value as string | undefined) || ""}
                  onChange={field.onChange}
                  placeholder="Describe your campaign..."
                  disabled={isLoading}
                  className="h-100"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    currentImage={
                      (field.value as string | undefined) ?? undefined
                    }
                    onImageUpload={(url) => {
                      field.onChange(url);
                      onImageChange?.(url);
                    }}
                    folder="campaigns"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="backgroundImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    currentImage={
                      (field.value as string | undefined) ?? undefined
                    }
                    onImageUpload={(url) => {
                      field.onChange(url);
                      onBackgroundImageChange?.(url);
                    }}
                    folder="campaigns"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
