"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteDestinationButton({
  id,
  onDeleted,
}: {
  id: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirm() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/destinations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`DELETE failed (${res.status})`);

      setOpen(false);
      setDeleting(false);
      if (onDeleted) {
        // Admin table usage — stay on the page, caller refreshes the list.
        onDeleted();
      } else {
        // Detail page usage — the deleted destination is gone; go back.
        router.push("/destinations");
        router.refresh();
      }
    } catch {
      setError(
        "Delete failed — make sure you are signed in as an admin and the app server is running.",
      );
      setDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setError(null);
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            disabled={deleting || !id}
            className="h-9 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        }
      >
        <Trash2Icon aria-hidden />
        Delete
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this travel package?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove it from the backend database. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting || !id}
            onClick={handleConfirm}
          >
            {deleting ? (
              <LoaderCircleIcon className="animate-spin" aria-hidden />
            ) : (
              <Trash2Icon aria-hidden />
            )}
            {deleting ? "Deleting…" : "Delete Permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
