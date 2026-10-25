"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, SaveIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type UpdateablePackage = {
  id: string;
  name: string;
  location: string;
  category?: string;
  price: number;
  duration?: string;
  imageUrl?: string;
  departureDate?: string;
  overview?: string;
};

// Kept in sync with the Add Destination page's category list.
const CATEGORIES = [
  "Beach",
  "Mountain",
  "Cultural",
  "Adventure",
  "Wildlife",
  "City Break",
  "Relaxation",
] as const;

const inputClass =
  "h-11 rounded-md border-0 bg-[#edf2f7] px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-2";
const labelClass = "block text-sm font-semibold text-foreground";
const rowClass = "grid gap-6 sm:grid-cols-2";

export function UpdatePackageDialog({
  destination,
  onSaved,
}: {
  destination: UpdateablePackage;
  onSaved?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState(() => ({
    name: destination.name,
    location: destination.location,
    category: destination.category ?? "",
    price: String(destination.price),
    duration: destination.duration ?? "",
    departureDate: destination.departureDate ?? "",
    imageUrl: destination.imageUrl ?? "",
    description: destination.overview ?? "",
  }));
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!destination.id) {
      setError("Cannot update: this record has no backend id.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Backend PATCH /destinations/:id does a raw $set. Records in the wild
      // have two shapes (name/imageUrl vs destinationName/image) — send both
      // so whichever shape the record uses gets the new value.
      // Through the Next admin-only proxy — the backend's requireAdmin
      // guard needs the session cookie, which browsers don't attach to
      // cross-port requests.
      const res = await fetch(`/api/destinations/${destination.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            destinationName: values.name,
            country: values.location,
            category: values.category,
            price: Number(values.price),
            duration: values.duration,
            departureDate: values.departureDate,
            imageUrl: values.imageUrl,
            image: values.imageUrl,
            description: values.description,
          }),
        },
      );
      if (!res.ok) throw new Error(`PATCH failed (${res.status})`);

      setSaved(true);
      setSaving(false);
      setOpen(false);
      onSaved?.();
      router.refresh(); // re-run the server fetch so the page reflects changes
    } catch {
      setError(
        "Update failed — make sure you are signed in as an admin and the app server is running.",
      );
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => { setOpen(newOpen); if (!newOpen) setSaved(false); }}>
      <DialogTrigger
        render={
          <Button variant="outline" className="h-9 gap-2 rounded-md" />
        }
      >
        <PencilIcon />
        Edit
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto p-8 sm:p-10">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            Update Travel Package
          </DialogTitle>
          <DialogDescription>
            Make changes to the travel package details below
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="mt-2 flex flex-col gap-5"
          aria-label="Update travel package"
        >
          <Input
            aria-label="Destination Name"
            name="name"
            placeholder="Destination Name"
            required
            value={values.name}
            onChange={handleChange}
            className={inputClass}
          />

          <div className={rowClass}>
            <div>
              <label htmlFor="update-country" className={labelClass}>
                Country
              </label>
              <Input
                id="update-country"
                name="location"
                required
                value={values.location}
                onChange={handleChange}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="update-category" className={labelClass}>
                Category
              </label>
              <Select
                value={values.category || null}
                onValueChange={(value) =>
                  setValues((previous) => ({
                    ...previous,
                    category: (value as string) ?? "",
                  }))
                }
              >
                <SelectTrigger
                  id="update-category"
                  className={`mt-2 w-full ${inputClass} justify-between`}
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={rowClass}>
            <div>
              <label htmlFor="update-price" className={labelClass}>
                Price (USD)
              </label>
              <Input
                id="update-price"
                name="price"
                type="number"
                min="0"
                required
                value={values.price}
                onChange={handleChange}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="update-duration" className={labelClass}>
                Duration
              </label>
              <Input
                id="update-duration"
                name="duration"
                placeholder="e.g., 7 Days/6 Nights"
                value={values.duration}
                onChange={handleChange}
                className={`mt-2 ${inputClass}`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="update-departureDate" className={labelClass}>
              Departure Date
            </label>
            <Input
              id="update-departureDate"
              name="departureDate"
              type="date"
              value={values.departureDate}
              onChange={handleChange}
              className={`mt-2 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="update-imageUrl" className={labelClass}>
              Image URL
            </label>
            <Input
              id="update-imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={values.imageUrl}
              onChange={handleChange}
              className={`mt-2 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="update-description" className={labelClass}>
              Description
            </label>
            <Textarea
              id="update-description"
              name="description"
              placeholder="Describe the travel experience..."
              rows={4}
              value={values.description}
              onChange={handleChange}
              className="mt-2 rounded-md border-0 bg-[#edf2f7] px-4 pt-3 text-foreground placeholder:text-muted-foreground focus-visible:ring-2"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {saved && (
            <p role="status" className="rounded-md bg-brand-soft px-4 py-3 text-sm text-foreground">
              Travel package updated successfully.
            </p>
          )}

          <div className="flex justify-end gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              className="h-11 gap-2 rounded-md border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setOpen(false)}
            >
              <Trash2Icon />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-11 gap-2 rounded-md bg-brand text-white hover:bg-brand/90"
            >
              <SaveIcon />
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
