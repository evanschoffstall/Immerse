"use client";

import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/ui/custom/RichTextEditor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const sceneSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().optional(),
});

export type SceneFormData = z.infer<typeof sceneSchema>;

interface SceneFormProps {
  initialData?: {
    name?: string;
    content?: string;
  };
  onSubmit: (data: SceneFormData) => void | Promise<void>;
  isLoading?: boolean;
  submitText?: string;
}

export default function SceneForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitText = "Save Scene",
}: SceneFormProps) {
  const form = useForm<SceneFormData>({
    resolver: zodResolver(sceneSchema),
    defaultValues: {
      name: initialData?.name || "",
      content: initialData?.content || undefined,
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
              <FormLabel>Scene Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value as string}
                  placeholder="Enter scene name (e.g., Scene - Caravan Ambush)"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={(field.value as string | undefined) || ""}
                  onChange={field.onChange}
                  placeholder="Describe the setup, NPCs, possible outcomes, and other details for this scene..."
                  disabled={isLoading}
                  className="min-h-[300px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
