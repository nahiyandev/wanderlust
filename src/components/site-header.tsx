"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon, MenuIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import { cn } from "cn";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function navLinkClassName(active?: boolean) {
  return [
    "text-sm font-medium transition-colors hover:text-foreground",
    active
      ? "text-brand underline decoration-2 underline-offset-[6px]"
      : "text-foreground/80",
  ].join(" ");
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout, isLoaded } = useAuth();

  // Dynamic Navigation Links based on authentication & admin role
  const navLinks = React.useMemo(() => {
    const links: { label: string; href: string }[] = [
      { label: "Home", href: "/" },
      { label: "Destinations", href: "/destinations" },
    ];

    if (user) {
      links.push({ label: "My Bookings", href: "/my-bookings" });

      if (user.role === "admin") {
        links.push({ label: "Add Destination", href: "/add-destination" });
        links.push({ label: "Admin", href: "/admin" });
      }
    }

    return links;
  }, [user]);

  function isLinkActive(href: string) {
    if (href === "#") return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background shadow-sm">
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center justify-start">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="md:hidden" />}
            >
              <MenuIcon />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="inline-block">
                    <Image
                      src="/images/Wanderlast.png"
                      alt="Wanderlast"
                      width={134}
                      height={30}
                      className="h-6 w-auto"
                    />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4 mt-2">
                {navLinks.map((link) => (
                  <SheetClose
                    key={link.label}
                    render={
                      <Link
                        href={link.href}
                        className={navLinkClassName(isLinkActive(link.href))}
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>

              <SheetFooter className="flex-col items-stretch gap-3 border-t pt-4">
                {isLoaded && user ? (
                  <div className="flex flex-col gap-3">
                    <SheetClose
                      render={
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 text-sm font-semibold text-neutral-800"
                        />
                      }
                    >
                      <UserIcon className="size-4 text-brand" />
                      {user.name} ({user.role === "admin" ? "Admin" : "Profile"})
                    </SheetClose>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors text-left cursor-pointer"
                    >
                      <LogOutIcon className="size-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <SheetClose
                      render={
                        <Link
                          href="/login"
                          className={navLinkClassName(pathname === "/login")}
                        />
                      }
                    >
                      Login
                    </SheetClose>
                    <SheetClose
                      render={
                        <Link
                          href="/signup"
                          className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand/90"
                        />
                      }
                    >
                      Sign Up
                    </SheetClose>
                  </div>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={navLinkClassName(isLinkActive(link.href))}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center Logo */}
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/images/Wanderlast.png"
            alt="Wanderlast"
            width={134}
            height={30}
            priority
            className="h-7 w-auto"
          />
        </Link>

        {/* Desktop Right Side */}
        <div className="hidden items-center justify-end gap-6 md:flex">
          {isLoaded && user ? (
            <>
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                  <ShieldCheckIcon className="size-3" />
                  Admin
                </span>
              )}
              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground",
                  pathname === "/profile" || pathname === "/my-profile"
                    ? "text-brand underline decoration-2 underline-offset-[6px]"
                    : "text-foreground/80",
                )}
              >
                <UserIcon className="size-4" />
                Profile
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LogOutIcon className="size-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={navLinkClassName(pathname === "/login" || pathname === "/signin")}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={navLinkClassName(pathname === "/signup")}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
