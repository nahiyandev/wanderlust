"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LoaderCircleIcon,
  SaveIcon,
  ShieldAlertIcon,
  Trash2Icon,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Beach",
  "Mountain",
  "Cultural",
  "Adventure",
  "Wildlife",
  "City Break",
  "Relaxation",
] as const;

const INITIAL_VALUES = {
  name: "",
  country: "",
  price: "",
  duration: "",
  departureDate: "",
  imageUrl: "",
  description: "",
};

const inputClass =
  "h-11 rounded-md border-0 bg-[#edf2f7] px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-2";
const labelClass = "block text-sm font-semibold text-foreground";
const rowClass = "grid gap-6 sm:grid-cols-2";

export default function AddDestinationPage() {
  const router = useRouter();
  const { user, isLoaded } = useAuth();
  const isAdmin = user?.role === "admin";

  const [values, setValues] = React.useState(INITIAL_VALUES);
  const [category, setCategory] = React.useState<string>("Beach");
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Admin only — non-admins get bounced away once auth settles.
  React.useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.replace(user ? "/destinations" : "/login");
    }
  }, [isLoaded, isAdmin, user, router]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Real save — backend POST inserts into MongoDB (sibling server).
      // Through the Next admin-only proxy (same-origin cookie + backend guard).
      const res = await fetch("/api/destinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, category }),
      });

      if (!res.ok) {
        throw new Error(
          res.status === 401 || res.status === 403
            ? "Admin access required"
            : `Backend responded with ${res.status}`,
        );
      }

      setSubmitted(true);
      setValues(INITIAL_VALUES);
      setCategory("Beach");
    } catch {
      setError(
        "Could not save the package — is the backend running on http://localhost:5000?",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoaded || !isAdmin) {
    return (
      <main className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Checking access...</p>
      </main>
    );
  }



  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-4xl sm:text-5xl">
        Add New Travel Package
      </h1>

      <div className="mx-auto mt-12 max-w-2xl rounded-md border border-border/60 bg-card p-6 shadow-sm sm:p-10">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
          aria-label="Add new travel package"
        >
          {/* Destination Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Destination Name
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Bali Paradise"
              required
              value={values.name}
              onChange={handleChange}
              className={`mt-2 ${inputClass}`}
            />
          </div>

          {/* Country + Category */}
          <div className={rowClass}>
            <div>
              <label htmlFor="country" className={labelClass}>
                Country
              </label>
              <Input
                id="country"
                name="country"
                placeholder="Indonesia"
                required
                value={values.country}
                onChange={handleChange}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as string)}
              >
                <SelectTrigger
                  id="category"
                  className={`mt-2 w-full ${inputClass} justify-between data-placeholder:text-muted-foreground`}
                >
                  <SelectValue placeholder="Select category" />
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

          {/* Price + Duration */}
          <div className={rowClass}>
            <div>
              <label htmlFor="price" className={labelClass}>
                Price (USD)
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                placeholder="e.g., 1299"
                required
                value={values.price}
                onChange={handleChange}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="duration" className={labelClass}>
                Duration
              </label>
              <Input
                id="duration"
                name="duration"
                placeholder="e.g., 7 Days/6 Nights"
                required
                value={values.duration}
                onChange={handleChange}
                className={`mt-2 ${inputClass}`}
              />
            </div>
          </div>

          {/* Departure Date */}
          <div>
            <label htmlFor="departureDate" className={labelClass}>
              Departure Date
            </label>
            <Input
              id="departureDate"
              name="departureDate"
              type="date"
              required
              value={values.departureDate}
              onChange={handleChange}
              className={`mt-2 ${inputClass}`}
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className={labelClass}>
              Image URL
            </label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={values.imageUrl}
              onChange={handleChange}
              className={`mt-2 ${inputClass}`}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the travel experience..."
              rows={4}
              value={values.description}
              onChange={handleChange}
              className="mt-2 rounded-md border-0 bg-[#edf2f7] px-4 pt-3 text-foreground placeholder:text-muted-foreground focus-visible:ring-2"
            />
          </div>

          {submitted && (
            <p
              role="status"
              className="rounded-md bg-brand-soft px-4 py-3 text-sm text-foreground"
            >
              Travel package added successfully — it is live on{" "}
              <Link
                href="/destinations"
                className="font-semibold text-brand underline"
              >
                Destinations
              </Link>
              .
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 rounded-md border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => router.back()}
            >
              <Trash2Icon />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 gap-2 rounded-md bg-brand text-white hover:bg-brand/90"
            >
              {submitting ? (
                <LoaderCircleIcon className="animate-spin" aria-hidden />
              ) : (
                <SaveIcon aria-hidden />
              )}
              {submitting ? "Saving…" : "Add Travel Package"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
