
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function RegisterBusiness() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "Cafe",
    area: "",
    tagline: "",
    description: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data: { user }, error: authError } =
      await supabase.auth.getUser();

    if (authError || !user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error: insertError } = await supabase
      .from("businesses")
      .insert({
        ...form,
        owner_id: user.id,
      });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    alert("Business registered successfully!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <a href="/shop" className="text-sm text-slate-400 hover:text-white">
          ← Back to marketplace
        </a>

        <h1 className="mt-8 text-4xl font-bold">
          Bring your business online.
        </h1>

        <p className="mt-3 text-slate-400">
          Register your local business and get discovered by customers.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-7"
        >
          <div>
            <label className="mb-2 block text-sm">Business name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. The Daily Grind"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none"
            >
              <option>Cafe</option>
              <option>Restaurant</option>
              <option>Fashion</option>
              <option>Bakery</option>
              <option>Grocery</option>
              <option>Lifestyle</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">Area *</label>
            <input
              name="area"
              value={form.area}
              onChange={handleChange}
              required
              placeholder="e.g. Vijayanagar"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Tagline</label>
            <input
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              placeholder="A short line about your business"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell customers about your business..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Contact number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Business contact number"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register Business"}
          </button>
        </form>
      </div>
    </main>
  );
}
