"use client";

import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/custom/rich-text/RichTextEditor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { acts } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const actSchema = createInsertSchema(acts, {
  name: z.string().min(1, "Name is required"),
}).pick({ name: true, content: true });

export type ActFormData = z.infer<typeof actSchema>;

interface ActFormProps {
  initialData?: {
    name?: string;
    content?: string;
  };
  onSubmit: (data: ActFormData) => void | Promise<void>;
  isLoading?: boolean;
  submitText?: string;
}

export function ActForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitText = "Save Act",
}: ActFormProps) {
  const form = useForm<ActFormData>({
    resolver: zodResolver(actSchema),
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
              <FormLabel>Act Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value as string}
                  placeholder="Enter act name (e.g., Act I - The Beginning)"
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
                  placeholder="Describe the themes, open questions, and narrative elements for this act..."
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
