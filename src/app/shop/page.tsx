
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Business = {
  id: number;
  name: string;
  category: string;
  area: string;
  tagline: string | null;
  description: string | null;
  phone: string | null;
};

type Product = {
  id: number;
  business_id: number;
  name: string;
  category: string | null;
  price: number;
  image: string | null;
  emoji: string | null;
  description: string | null;
};

type Promotion = {
  id: number;
  business_id: number;
  title: string;
  description: string | null;
  discount: number | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
};

const categories = [
  "All", "Cafe", "Fashion", "Bakery", "Grocery",
  "Restaurant", "Lifestyle", "Other",
];

const categoryStyles: Record<string, { emoji: string; color: string }> = {
  Cafe: { emoji: "☕", color: "bg-orange-100" },
  Fashion: { emoji: "👗", color: "bg-pink-100" },
  Bakery: { emoji: "🥐", color: "bg-yellow-100" },
  Grocery: { emoji: "🥑", color: "bg-green-100" },
  Restaurant: { emoji: "🍛", color: "bg-red-100" },
  Lifestyle: { emoji: "🌷", color: "bg-purple-100" },
  Other: { emoji: "🏪", color: "bg-blue-100" },
};

export default function ShopPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function recordInteraction(
    businessId: number,
    interactionType: string
  ) {
    const { error } = await (supabase.from("customer_interactions") as any)
      .insert({
        business_id: businessId,
        interaction_type: interactionType,
      });

    if (error) {
      console.error("Interaction tracking error:", error.message);
    }
  }

  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true);

      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, category, area, tagline, description, phone")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Unable to load businesses: " + error.message);
      } else {
        setBusinesses((data || []) as Business[]);
      }

      setLoading(false);
    }

    fetchBusinesses();
  }, []);

  useEffect(() => {
    const businessId = selectedBusiness;

    if (businessId === null) {
      setProducts([]);
      setPromotions([]);
      return;
    }

    let cancelled = false;

    async function fetchBusinessDetails() {
      setDetailsLoading(true);
      setProducts([]);
      setPromotions([]);

      const [productResult, promotionResult] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false }),

        supabase
          .from("promotions")
          .select("*")
          .eq("business_id", businessId)
          .eq("active", true)
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;

      if (productResult.error) {
        setError("Unable to load products: " + productResult.error.message);
      } else {
        setProducts((productResult.data || []) as Product[]);
      }

      if (promotionResult.error) {
        setError("Unable to load promotions: " + promotionResult.error.message);
      } else {
        const today = new Date().toISOString().slice(0, 10);

        const validPromotions = (promotionResult.data || []).filter(
          (promotion: Promotion) =>
            (!promotion.start_date || promotion.start_date <= today) &&
            (!promotion.end_date || promotion.end_date >= today)
        );

        setPromotions(validPromotions);
      }

      setDetailsLoading(false);
    }

    fetchBusinessDetails();

    return () => {
      cancelled = true;
    };
  }, [selectedBusiness]);

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(search.toLowerCase()) ||
      business.area.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || business.category === category;

    return matchesSearch && matchesCategory;
  });

  const activeBusiness = businesses.find(
    (business) => business.id === selectedBusiness
  );

  const businessProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  function getCategoryStyle(value: string) {
    return categoryStyles[value] || categoryStyles.Other;
  }

  async function submitEnquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!activeBusiness || !selectedProduct) return;

    setSubmitting(true);
    setEnquiryError("");

    const { error } = await (supabase.from("enquiries") as any).insert({
      business_id: activeBusiness.id,
      product_id: selectedProduct.id,
      customer_name: customerName.trim(),
      contact: customerContact.trim(),
      message: customerMessage.trim(),
    });

    if (error) {
      console.error("Enquiry submission error:", error);
      setEnquiryError("Could not submit enquiry. Please try again.");
      setSubmitting(false);
      return;
    }

    await recordInteraction(activeBusiness.id, "enquiry_submit");

    setSubmitting(false);
    setSelectedProduct(null);
    setCustomerName("");
    setCustomerContact("");
    setCustomerMessage("");
    setSuccessMessage("Your enquiry has been submitted successfully!");

    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#24211f]">
      <header className="bg-[#25231f] px-6 py-5 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            onClick={() => {
              setSelectedBusiness(null);
              setError("");
            }}
            className="text-2xl font-bold tracking-tight"
          >
            LocalLift<span className="text-orange-400">.</span>
          </button>

          <div className="flex items-center gap-4">
            <a
              href="/register-business"
              className="rounded-full bg-orange-400 px-4 py-2 text-xs font-bold text-[#25231f] hover:bg-orange-300"
            >
              + Register Business
            </a>

            <span className="hidden rounded-full bg-white/10 px-4 py-2 text-xs sm:inline">
              LOCAL MARKETPLACE
            </span>
          </div>
        </div>
      </header>

      {!activeBusiness ? (
        <>
          <section className="bg-[#25231f] px-6 pb-16 pt-12 text-white">
            <div className="mx-auto max-w-6xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
                Discover something local
              </p>

              <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
                Your neighbourhood,{" "}
                <span className="text-orange-300">one good find</span> at a time.
              </h1>

              <p className="mt-5 max-w-xl text-white/65">
                Explore independent businesses, discover unique products
                and find exciting offers around your neighbourhood.
              </p>

              <a
                href="#businesses"
                className="mt-8 inline-block rounded-full bg-orange-400 px-6 py-3 font-semibold text-[#25231f] hover:bg-orange-300"
              >
                Explore local businesses →
              </a>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-6 py-12">
            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
                Explore your neighbourhood
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Find your next favourite.
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Discover registered local stores and their offerings.
              </p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops or neighbourhoods..."
              className="mb-5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-orange-400 md:max-w-lg"
            />

            <div className="mb-8 flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    category === item
                      ? "bg-[#25231f] text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-orange-400"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div id="businesses" className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Local businesses</h3>

              <span className="text-sm text-gray-500">
                {loading ? "Loading..." : `${filteredBusinesses.length} businesses`}
              </span>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {loading ? (
              <div className="rounded-2xl bg-white p-12 text-center text-gray-500">
                Loading local businesses...
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredBusinesses.map((business) => {
                    const style = getCategoryStyle(business.category);

                    return (
                      <article
                        key={business.id}
                        onClick={() => {
                          setSelectedBusiness(business.id);
                          setProductSearch("");
                          setError("");
                          recordInteraction(business.id, "store_view");
                        }}
                        className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className={`flex h-44 items-center justify-center ${style.color}`}>
                          <span className="text-7xl transition group-hover:scale-110">
                            {style.emoji}
                          </span>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                              {business.category}
                            </span>

                            <span className="text-xs text-gray-500">
                              📍 {business.area}
                            </span>
                          </div>

                          <h3 className="mt-4 text-xl font-bold">
                            {business.name}
                          </h3>

                          <p className="mt-2 text-sm text-gray-500">
                            {business.tagline || "Discover this local business."}
                          </p>

                          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                            <span className="text-sm font-semibold">
                              Explore store
                            </span>
                            <span className="text-lg text-orange-600">→</span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {filteredBusinesses.length === 0 && (
                  <div className="rounded-xl bg-white p-10 text-center">
                    <h3 className="text-lg font-semibold">
                      No businesses found
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Try another search or category.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      ) : (
        <>
          <section className="bg-[#25231f] px-6 pb-14 pt-10 text-white">
            <div className="mx-auto max-w-6xl">
              <button
                onClick={() => {
                  setSelectedBusiness(null);
                  setProductSearch("");
                  setError("");
                }}
                className="mb-8 text-sm text-orange-300 hover:text-white"
              >
                ← Back to all businesses
              </button>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div
                  className={`flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl ${getCategoryStyle(activeBusiness.category).color}`}
                >
                  <span className="text-6xl">
                    {getCategoryStyle(activeBusiness.category).emoji}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-orange-300">
                    {activeBusiness.category} · {activeBusiness.area}
                  </p>

                  <h1 className="mt-2 text-4xl font-bold md:text-5xl">
                    {activeBusiness.name}
                  </h1>

                  <p className="mt-3 max-w-xl text-white/65">
                    {activeBusiness.description ||
                      "Explore products and offers from this local business."}
                  </p>

                  <span className="mt-4 inline-block rounded-full bg-green-500/20 px-4 py-2 text-xs text-green-300">
                    ● LocalLift store
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-6 py-12">
            {successMessage && (
              <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800">
                ✓ {successMessage}
              </div>
            )}

            {error && (
              <p className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {detailsLoading ? (
              <div className="rounded-2xl bg-white p-12 text-center text-gray-500">
                Loading store products and offers...
              </div>
            ) : (
              <>
                {promotions.length > 0 && (
                  <div className="mb-12">
                    <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
                      Special deals
                    </p>

                    <h2 className="mb-6 mt-2 text-3xl font-bold">
                      Offers you'll love.
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2">
                      {promotions.map((offer) => (
                        <div key={offer.id} className="rounded-2xl bg-orange-100 p-6">
                          {offer.discount !== null && (
                            <span className="text-3xl font-black text-orange-700">
                              {offer.discount}% OFF
                            </span>
                          )}

                          <h3 className="mt-3 text-xl font-bold">
                            {offer.title}
                          </h3>

                          <p className="mt-2 text-sm text-gray-600">
                            {offer.description}
                          </p>

                          {offer.start_date && offer.end_date && (
                            <p className="mt-4 text-xs text-gray-500">
                              Valid: {offer.start_date} – {offer.end_date}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
                    Explore the collection
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {activeBusiness.name}'s products
                  </h2>
                </div>

                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="mb-7 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-orange-400 md:max-w-sm"
                />

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {businessProducts.map((product) => (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-36 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center rounded-xl bg-[#faf3e9] text-6xl">
                          {product.emoji || "🛍️"}
                        </div>
                      )}

                      <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-orange-600">
                        {product.category || "Product"}
                      </p>

                      <h3 className="mt-2 text-lg font-bold">
                        {product.name}
                      </h3>

                      <p className="mt-2 min-h-10 text-sm text-gray-500">
                        {product.description || "Contact the business for more details."}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <span className="text-xl font-bold">
                          ₹{Number(product.price).toFixed(2)}
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {activeBusiness.phone && (
                            <a
                              href={`tel:${activeBusiness.phone}`}
                              onClick={() =>
                                recordInteraction(activeBusiness.id, "phone_click")
                              }
                              className="rounded-full bg-[#25231f] px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700"
                            >
                              ☎ Call
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setCustomerName("");
                              setCustomerContact("");
                              setCustomerMessage(
                                `I'm interested in ${product.name}.`
                              );
                              setEnquiryError("");
                            }}
                            className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                          >
                            Enquire
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {businessProducts.length === 0 && (
                  <div className="rounded-xl bg-white p-10 text-center">
                    <h3 className="text-lg font-semibold">
                      No products available
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      This business hasn't listed matching products yet.
                    </p>
                  </div>
                )}

                {promotions.length === 0 && (
                  <p className="mt-10 text-center text-sm text-gray-500">
                    No active promotions at the moment.
                  </p>
                )}
              </>
            )}
          </section>
        </>
      )}

      {selectedProduct && activeBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
                  Product enquiry
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  Contact business
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setEnquiryError("");
                }}
                className="text-2xl text-gray-400 hover:text-black"
                aria-label="Close enquiry form"
              >
                ×
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-orange-50 p-4">
              <p className="text-sm text-gray-500">Enquiring about</p>
              <p className="mt-1 font-bold">{selectedProduct.name}</p>
              <p className="text-sm text-gray-600">{activeBusiness.name}</p>
            </div>

            <form onSubmit={submitEnquiry} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Your name *
                </label>
                <input
                  required
                  maxLength={100}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Phone number or email *
                </label>
                <input
                  required
                  maxLength={150}
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="How can the business contact you?"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Your message
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  placeholder="Write your enquiry..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
                />
              </div>

              {enquiryError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {enquiryError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Enquiry"}
              </button>

              <p className="text-center text-xs text-gray-400">
                Your contact details will be shared with this business
                so they can respond to your enquiry.
              </p>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-16 bg-[#25231f] px-6 py-10 text-center text-white">
        <h2 className="text-2xl font-bold">
          LocalLift<span className="text-orange-400">.</span>
        </h2>

        <p className="mt-3 text-sm text-white/60">
          Discover local. Support local. Grow together.
        </p>

        <p className="mt-6 text-xs text-white/40">
          LocalLift · Local Business Marketplace
        </p>
      </footer>
    </main>
  );
}
