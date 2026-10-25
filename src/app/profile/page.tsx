"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CameraIcon,
  DollarSignIcon,
  GlobeIcon,
  MapPinIcon,
  PencilIcon,
  PlaneIcon,
  TrendingUpIcon,
  UserIcon,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormState {
  name: string;
  location: string;
  memberSince: string;
  nationality: string;
  avatar: string;
}

export default function ProfilePage() {
  const { user, updateProfile, bookings, isLoaded } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<FormState>({
    name: user?.name || "Sarah Mitchell",
    location: user?.location || "San Francisco, CA",
    memberSince: user?.memberSince || "Mar 2024",
    nationality: user?.nationality || "United States",
    avatar: user?.avatar || "/images/person1.png",
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isLoaded) {
    return (
      <main className="min-h-[calc(100svh-3.5rem)] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100svh-3.5rem)] flex flex-col items-center justify-center px-4 text-center">
        <div className="size-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4">
          <UserIcon className="size-8" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-neutral-900">
          Sign In to View Profile
        </h1>
        <p className="mt-2 text-neutral-500 max-w-md">
          Please log in to manage your account settings, travel preferences, and view your
          itineraries.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            className="bg-brand text-white hover:bg-brand/90 font-semibold px-6"
          >
            Sign In
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="outline"
          >
            Return Home
          </Button>
        </div>
      </main>
    );
  }

  function handleOpenEdit() {
    setFormData({
      name: user?.name || "Sarah Mitchell",
      location: user?.location || "San Francisco, CA",
      memberSince: user?.memberSince || "Mar 2024",
      nationality: user?.nationality || "United States",
      avatar: user?.avatar || "/images/person1.png",
    });
    setIsEditDialogOpen(true);
  }

  function handleFormChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile({
      name: formData.name,
      location: formData.location,
      memberSince: formData.memberSince,
      nationality: formData.nationality,
      avatar: formData.avatar,
    });
    setIsEditDialogOpen(false);
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: imageUrl }));
      updateProfile({ avatar: imageUrl });
    }
  }

  // Dynamic travel statistics based on bookings
  const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const confirmedCount = bookings.filter((b) => b.status === "Confirmed").length;

  const stats = [
    {
      label: "Total Bookings",
      value: String(bookings.length),
      icon: PlaneIcon,
      iconColor: "text-[#15a1bf]",
      bgColor: "bg-[#edfcff]",
    },
    {
      label: "Countries Visited",
      value: String(bookings.length > 0 ? bookings.length + 3 : 0),
      icon: GlobeIcon,
      iconColor: "text-[#1e9e35]",
      bgColor: "bg-[#e8f9ee]",
    },
    {
      label: "Upcoming Trips",
      value: String(confirmedCount),
      icon: TrendingUpIcon,
      iconColor: "text-[#ff8a0d]",
      bgColor: "bg-[#fff1e2]",
    },
    {
      label: "Total Spent",
      value: `$${totalSpent.toLocaleString()}`,
      icon: DollarSignIcon,
      iconColor: "text-[#dc24e5]",
      bgColor: "bg-[#feeaff]",
    },
  ];

  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-background px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-medium tracking-tight text-neutral-900">
            My Profile
          </h1>
          <p className="mt-2.5 text-base text-neutral-500">
            Manage your account settings and travel preferences
          </p>
        </div>

        {/* Content Grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
          {/* Left: User Card */}
          <div className="flex flex-col items-center rounded-2xl border border-neutral-200/80 bg-white p-7 shadow-sm">
            {/* Avatar with Camera badge */}
            <div className="relative">
              <div className="relative size-36 overflow-hidden rounded-full border-4 border-neutral-100 shadow-sm sm:size-40">
                <Image
                  src={user.avatar || "/images/person1.png"}
                  alt={user.name}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                aria-label="Upload profile photo"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change profile photo"
                className="absolute right-1 bottom-1 flex size-10 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-md transition-transform hover:scale-105 hover:bg-brand/90 active:scale-95 cursor-pointer"
              >
                <CameraIcon className="size-5" />
              </button>
            </div>

            {/* Name & Location */}
            <div className="flex items-center gap-2 mt-5">
              <h2 className="font-heading text-2xl font-bold text-neutral-900">
                {user.name}
              </h2>
              {user.role === "admin" && (
                <span className="rounded-full bg-brand/10 text-brand px-2 py-0.5 text-xs font-semibold">
                  Admin
                </span>
              )}
            </div>

            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-500">
              <MapPinIcon className="size-4 text-neutral-400" />
              <span>{user.location || "San Francisco, CA"}</span>
            </div>

            {/* Divider */}
            <div className="my-6 w-full border-t border-neutral-200/80" />

            {/* Info rows */}
            <div className="flex w-full flex-col gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Email</span>
                <span className="font-semibold text-neutral-900 truncate max-w-50">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Member since</span>
                <span className="font-semibold text-neutral-900">
                  {user.memberSince || "Mar 2024"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Nationality</span>
                <span className="font-semibold text-neutral-900">
                  {user.nationality || "United States"}
                </span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <Button
              type="button"
              onClick={handleOpenEdit}
              className="mt-8 h-12 w-full rounded-lg bg-brand text-base font-semibold text-white shadow-xs transition-all hover:bg-brand/90 active:scale-[0.99] cursor-pointer"
            >
              <PencilIcon className="size-4" />
              Edit Profile
            </Button>
          </div>

          {/* Right: Travel Statistics */}
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
              Travel Statistics
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {stats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-500">
                        {stat.label}
                      </p>
                      <p className="mt-2 font-heading text-3xl font-bold text-neutral-900">
                        {stat.value}
                      </p>
                    </div>

                    <div
                      className={`flex size-14 items-center justify-center rounded-full ${stat.bgColor}`}
                    >
                      <IconComponent className={`size-7 ${stat.iconColor}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your account details and travel preferences.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-name" className="text-sm font-semibold text-neutral-800">
                Full Name
              </label>
              <input
                id="edit-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleFormChange}
                className="h-11 rounded-lg border border-neutral-200 bg-[#f8fafc] px-3.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-location" className="text-sm font-semibold text-neutral-800">
                Location
              </label>
              <input
                id="edit-location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleFormChange}
                className="h-11 rounded-lg border border-neutral-200 bg-[#f8fafc] px-3.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-nationality" className="text-sm font-semibold text-neutral-800">
                Nationality
              </label>
              <input
                id="edit-nationality"
                name="nationality"
                type="text"
                required
                value={formData.nationality}
                onChange={handleFormChange}
                className="h-11 rounded-lg border border-neutral-200 bg-[#f8fafc] px-3.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-membersince" className="text-sm font-semibold text-neutral-800">
                Member Since
              </label>
              <input
                id="edit-membersince"
                name="memberSince"
                type="text"
                required
                value={formData.memberSince}
                onChange={handleFormChange}
                className="h-11 rounded-lg border border-neutral-200 bg-[#f8fafc] px-3.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <DialogFooter className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand text-white hover:bg-brand/90 cursor-pointer"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
