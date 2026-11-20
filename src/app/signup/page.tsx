
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Account created! Check your email for a confirmation link."
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] p-5">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"
      >
        <Link href="/" className="text-2xl font-bold">
          Local<span className="text-green-700">Lift.</span>
        </Link>

        <h1 className="mt-8 text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-gray-500">
          Join LocalLift and manage your local business.
        </p>

        <label className="mt-7 block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-3"
          placeholder="you@example.com"
        />

        <label className="mt-5 block text-sm font-medium">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-3"
          placeholder="At least 6 characters"
        />

        {message && (
          <p className="mt-4 text-sm text-green-700">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-green-800 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-green-800">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
