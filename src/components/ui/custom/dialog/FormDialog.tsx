"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

const DIALOG_SIZE = {
  lg: "max-w-2xl max-h-[90vh] overflow-y-auto",
  md: "max-w-lg",
  sm: "max-w-md",
} as const;

type DialogSize = keyof typeof DIALOG_SIZE;

function FormDialogHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      {description && <DialogDescription>{description}</DialogDescription>}
    </DialogHeader>
  );
}

export type FormDialogProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  title: string;
  description: string;
  size?: DialogSize;
  children: ReactNode;
};

export function FormDialog({
  open,
  onOpenChangeAction,
  title,
  description,
  size = "lg",
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className={DIALOG_SIZE[size]}>
        <FormDialogHeader title={title} description={description} />
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function useFormDialog() {
  const [open, setOpen] = useState(false);
  return { open, setOpen, onOpenChangeAction: setOpen };
}

export function useFormDialogSubmit(onClose: (open: boolean) => void) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return {
    isPending,
    done: () =>
      startTransition(() => {
        router.refresh();
        onClose(false);
      }),
  };
}

type FormDialogWithTriggerProps = {
  trigger: ReactNode;
  title: string;
  description: string;
  size?: DialogSize;
  children: (props: {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
  }) => ReactNode;
};

function FormDialogWithTrigger({
  trigger,
  title,
  description,
  size = "lg",
  children,
}: FormDialogWithTriggerProps) {
  const { open, setOpen } = useFormDialog();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={DIALOG_SIZE[size]}>
        <FormDialogHeader title={title} description={description} />
        {children({ open, onOpenChangeAction: setOpen })}
      </DialogContent>
    </Dialog>
  );
}
