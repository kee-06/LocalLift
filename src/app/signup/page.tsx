
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setIsError(true);
        setMessage(error.message);
        return;
      }

      setMessage(
        "Account created! Check your email for a confirmation link. After confirming, log in to continue."
      );
    } catch (err) {
      setIsError(true);
      setMessage(
        err instanceof Error ? err.message : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] p-5 text-gray-900">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg"
      >
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Local<span className="text-green-700">Lift.</span>
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-gray-900">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Join LocalLift and manage your local business.
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          placeholder="At least 6 characters"
        />

        {message && (
          <p
            className={`mt-4 rounded-lg p-3 text-sm ${
              isError
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-800"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-green-800 py-3 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-green-800 hover:underline"
          >
            Login
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
