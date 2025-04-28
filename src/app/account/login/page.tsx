'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams?.get("error") === "CredentialsSignin"
      ? "Invalid credentials"
      : null
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log('Attempting login with:', { email }); // Debug log

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard"
      });

      console.log('Sign in response:', res); // Debug log

      if (res?.error) {
        setError(res.error);
        return;
      }

      if (res?.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in to your account</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email or Username
            </label>
            <input
              id="email"
              name="email"
              type="text"
              required
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
