
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Unable to log in. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] p-5 text-gray-900">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg"
      >
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Local<span className="text-green-700">Lift.</span>
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-gray-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Login to manage your business.
        </p>

        <label className="mt-7 block text-sm font-semibold text-gray-800">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          placeholder="you@example.com"
        />

        <label className="mt-5 block text-sm font-semibold text-gray-800">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          placeholder="Your password"
        />

        {message && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-green-800 py-3 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to LocalLift?{" "}
          <Link href="/signup" className="font-semibold text-green-800 hover:underline">
            Create account
          </Link>
        </p>

        <Link
          href="/shop"
          className="mt-5 block text-center text-sm text-gray-500 hover:text-green-800"
        >
          ← Back to marketplace
        </Link>
      </form>
    </main>
  );
}
