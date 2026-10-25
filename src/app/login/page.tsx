"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleIcon } from "@/components/google-icon";

const initialForm = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = React.useState(initialForm);
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    const { error } = await authClient.signIn.email({
      email: form.email.trim(),
      password: form.password,
      rememberMe: remember,
    });

    if (error) {
      setIsLoading(false);
      setError(
        error.message ??
          "Could not sign in. Check your email and password and try again.",
      );
      return;
    }

    setSuccess("Signed in successfully! Redirecting...");
    router.push("/");
    router.refresh();
  }

  function handleGoogleSignIn() {
    setError(null);
    setSuccess(null);
    setIsGoogleLoading(true);
    // Real Google OAuth via better-auth — redirects to Google and back.
    authClient.signIn
      .social({ provider: "google", callbackURL: "/" })
      .then((response) => {
        if (response.error) {
          setIsGoogleLoading(false);
          setError(
            response.error.message ??
              "Google sign-in is not configured yet. Use email and password instead.",
          );
        }
        // On success the browser redirects to Google; nothing more to do.
      });
  }

  function handleForgotPassword() {
    if (!form.email.trim()) {
      setError("Please enter your email address to reset password.");
      return;
    }
    setError(null);
    setSuccess(`Password reset instructions sent to ${form.email} (simulated).`);
  }

  return (
    <main className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center bg-[#f9fafc] px-4 py-12 sm:py-16">
      <div className="w-full max-w-[540px]">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-neutral-500 sm:text-base">
            Resume your adventure with Wanderlust
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-10">
          {/* Quick demo logins were removed — accounts are now real (better-auth). */}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-label="Sign in">
            {success && (
              <div
                role="status"
                className="rounded-lg border border-teal-200 bg-brand-soft/70 px-4 py-3 text-sm font-medium text-teal-900"
              >
                {success}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-sm font-semibold text-neutral-800">
                Email Address
              </label>
              <div className="relative">
                <MailIcon
                  className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="h-12 w-full rounded-lg border border-neutral-200 bg-[#f8fafc] pl-11 pr-4 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-semibold text-neutral-800">
                Password
              </label>
              <div className="relative">
                <LockIcon
                  className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="h-12 w-full rounded-lg border border-neutral-200 bg-[#f8fafc] pl-11 pr-11 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600 hover:text-neutral-900">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked === true)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-brand hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="h-12 w-full rounded-lg bg-brand text-base font-semibold text-white shadow-sm hover:bg-brand/90 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="flex items-center gap-4 my-1">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs sm:text-sm text-neutral-400 uppercase tracking-wider font-medium">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleSignIn}
              className="h-12 w-full gap-3 rounded-lg border border-neutral-200 bg-white text-sm sm:text-base font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs cursor-pointer active:scale-[0.99] transition-all"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <GoogleIcon className="size-5" />
                  <span>Sign In With Google</span>
                </>
              )}
            </Button>

            <p className="text-center text-sm text-neutral-500 pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-brand hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
