"use client";

import { Button } from "@/components/ui/button";
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

const beatSchema = z.object({
  text: z.string().min(1, "Text is required"),
  timestamp: z.string().min(1, "Timestamp is required"),
});

export type BeatFormData = z.infer<typeof beatSchema>;

interface BeatFormProps {
  initialData?: {
    text?: string;
    timestamp?: string; // ISO string format
  };
  onSubmit: (data: BeatFormData) => void | Promise<void>;
  isLoading?: boolean;
  submitText?: string;
}

export default function BeatForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitText = "Save Beat",
}: BeatFormProps) {
  // Default to current date/time if not provided
  const defaultTimestamp = initialData?.timestamp || new Date().toISOString().slice(0, 16);

  const form = useForm<BeatFormData>({
    resolver: zodResolver(beatSchema),
    defaultValues: {
      text: initialData?.text || "",
      timestamp: defaultTimestamp,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="timestamp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timestamp *</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={field.value}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value as string}
                  placeholder="Enter beat text..."
                  disabled={isLoading}
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
