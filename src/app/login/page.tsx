
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

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] p-5">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"
      >
        <Link href="/" className="text-2xl font-bold">
          Local<span className="text-green-700">Lift.</span>
        </Link>

        <h1 className="mt-8 text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-500">
          Login to manage your business.
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-3"
          placeholder="Your password"
        />

        {message && (
          <p className="mt-4 text-sm text-red-600">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-green-800 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          New to LocalLift?{" "}
          <Link href="/signup" className="font-semibold text-green-800">
            Create account
          </Link>
        </p>
      </form>
    </main>
  );
}
