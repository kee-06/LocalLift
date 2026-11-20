
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase";

type Business = {
  id: number;
  name: string;
  category: string;
  area: string;
};

type Product = {
  id: number;
  business_id: number;
  name: string;
  category: string;
  price: number;
  image: string | null;
};

type Promotion = {
  id: number;
  business_id: number;
  title: string;
  description: string;
  discount: number;
  start_date: string;
  end_date: string;
  active: boolean;
};

export default function Dashboard() {
  const [active, setActive] = useState("Overview");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const [businessesLoading, setBusinessesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [promotionsLoading, setPromotionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [showPromotionForm, setShowPromotionForm] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [newCategory, setNewCategory] = useState("Beverages");
  const [image, setImage] = useState("");

  const [promotionTitle, setPromotionTitle] = useState("");
  const [promotionDescription, setPromotionDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load registered businesses
  useEffect(() => {
    const loadBusinesses = async () => {
      setBusinessesLoading(true);

      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, category, area")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Business loading error:", error);
        alert("Could not load businesses: " + error.message);
        setBusinessesLoading(false);
        return;
      }

      const loadedBusinesses = (data || []) as Business[];

      setBusinesses(loadedBusinesses);

      if (loadedBusinesses.length > 0) {
        setSelectedBusinessId(loadedBusinesses[0].id);
      }

      setBusinessesLoading(false);
    };

    loadBusinesses();
  }, []);

  // Load products for selected business
  useEffect(() => {
    const loadProducts = async () => {
      const businessId = selectedBusinessId;

      if (businessId === null) {
        setProducts([]);
        return;
      }

      setProductsLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Product loading error:", error);
        alert("Could not load products: " + error.message);
        setProducts([]);
      } else {
        setProducts((data || []) as Product[]);
      }

      setProductsLoading(false);
    };

    loadProducts();
  }, [selectedBusinessId]);

  // Load promotions for selected business
  useEffect(() => {
    const loadPromotions = async () => {
      const businessId = selectedBusinessId;

      if (businessId === null) {
        setPromotions([]);
        return;
      }

      setPromotionsLoading(true);

      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Promotion loading error:", error);
        alert("Could not load promotions: " + error.message);
        setPromotions([]);
      } else {
        setPromotions((data || []) as Promotion[]);
      }

      setPromotionsLoading(false);
    };

    loadPromotions();
  }, [selectedBusinessId]);

  // Add product
  const addProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const businessId = selectedBusinessId;

    if (!name.trim() || Number(price) <= 0 || businessId === null) {
      alert("Please enter valid product details.");
      return;
    }

    setSaving(true);

    const { data, error } = await (supabase.from("products") as any)
      .insert({
        business_id: businessId,
        name: name.trim(),
        price: Number(price),
        category: newCategory,
        image: image.trim() || null,
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error("Product save error:", error);
      alert("Could not save product: " + error.message);
      return;
    }

    setProducts((previous) => [data as Product, ...previous]);

    setName("");
    setPrice("");
    setImage("");
    setNewCategory("Beverages");
    setShowForm(false);

    alert("Product saved successfully!");
  };

  // Delete product
  const deleteProduct = async (productId: number) => {
    const businessId = selectedBusinessId;

    if (businessId === null) return;

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const { error } = await (supabase.from("products") as any)
      .delete()
      .eq("id", productId)
      .eq("business_id", businessId);

    if (error) {
      console.error("Product delete error:", error);
      alert("Could not delete product: " + error.message);
      return;
    }

    setProducts((previous) =>
      previous.filter((product) => product.id !== productId)
    );
  };

  // Add promotion
  const addPromotion = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const businessId = selectedBusinessId;

    if (
      !promotionTitle.trim() ||
      !promotionDescription.trim() ||
      Number(discount) <= 0 ||
      Number(discount) > 100 ||
      !startDate ||
      !endDate ||
      endDate < startDate ||
      businessId === null
    ) {
      alert("Please enter valid promotion details.");
      return;
    }

    setSaving(true);

    const { data, error } = await (supabase.from("promotions") as any)
      .insert({
        business_id: businessId,
        title: promotionTitle.trim(),
        description: promotionDescription.trim(),
        discount: Number(discount),
        start_date: startDate,
        end_date: endDate,
        active: true,
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error("Promotion save error:", error);
      alert("Could not save promotion: " + error.message);
      return;
    }

    setPromotions((previous) => [data as Promotion, ...previous]);

    setPromotionTitle("");
    setPromotionDescription("");
    setDiscount("");
    setStartDate("");
    setEndDate("");
    setShowPromotionForm(false);

    alert("Promotion created successfully!");
  };

  // Activate or deactivate promotion
  const togglePromotion = async (promotion: Promotion) => {
    const businessId = selectedBusinessId;

    if (businessId === null) return;

    const newStatus = !promotion.active;

    const { error } = await (supabase.from("promotions") as any)
      .update({ active: newStatus })
      .eq("id", promotion.id)
      .eq("business_id", businessId);

    if (error) {
      console.error("Promotion update error:", error);
      alert("Could not update promotion: " + error.message);
      return;
    }

    setPromotions((previous) =>
      previous.map((item) =>
        item.id === promotion.id
          ? { ...item, active: newStatus }
          : item
      )
    );
  };

  // Delete promotion
  const deletePromotion = async (promotionId: number) => {
    const businessId = selectedBusinessId;

    if (businessId === null) return;

    if (!window.confirm("Are you sure you want to delete this promotion?")) {
      return;
    }

    const { error } = await (supabase.from("promotions") as any)
      .delete()
      .eq("id", promotionId)
      .eq("business_id", businessId);

    if (error) {
      console.error("Promotion delete error:", error);
      alert("Could not delete promotion: " + error.message);
      return;
    }

    setPromotions((previous) =>
      previous.filter((promotion) => promotion.id !== promotionId)
    );
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const currentBusiness = businesses.find(
    (business) => business.id === selectedBusinessId
  );

  const activePromotions = promotions.filter(
    (promotion) => promotion.active
  ).length;

  const averageDiscount = promotions.length
    ? Math.round(
        promotions.reduce(
          (sum, promotion) => sum + Number(promotion.discount),
          0
        ) / promotions.length
      )
    : 0;

  const menu = ["Overview", "Products", "Promotions", "Analytics"];

  if (businessesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f5]">
        <p className="text-gray-500">Loading your business workspace...</p>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f5] p-6">
        <div className="rounded-2xl border bg-white p-10 text-center">
          <h2 className="text-2xl font-bold">No registered businesses</h2>
          <p className="mt-3 text-gray-500">
            Register a business before managing products and promotions.
          </p>
          <a
            href="/register-business"
            className="mt-6 inline-block rounded-xl bg-green-800 px-5 py-3 text-white"
          >
            Register Business
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8f5] text-gray-800">
      <aside className="flex w-60 shrink-0 flex-col border-r bg-white p-5">
        <a href="/" className="mb-10 text-2xl font-bold">
          Local<span className="text-green-700">Lift.</span>
        </a>

        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Workspace
        </p>

        {menu.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`mb-2 rounded-xl px-4 py-3 text-left text-sm font-medium ${
              active === item
                ? "bg-green-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item}
          </button>
        ))}

        <div className="mt-auto rounded-2xl bg-green-50 p-4">
          <p className="font-semibold text-green-900">Grow locally.</p>
          <p className="mt-2 text-xs text-green-800">
            Your business deserves to be discovered.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              LocalLift Vendor Workspace
            </p>
            <h2 className="mt-2 text-3xl font-bold">{active}</h2>
            <p className="mt-2 text-sm text-gray-500">
              Manage and grow your local business.
            </p>
          </div>

          <select
            value={selectedBusinessId ?? ""}
            onChange={(e) => setSelectedBusinessId(Number(e.target.value))}
            className="max-w-full rounded-xl border bg-white px-4 py-3 text-sm"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} — {business.area}
              </option>
            ))}
          </select>
        </header>

        {/* OVERVIEW */}
        {active === "Overview" && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Listed Products", products.length, "🛍️"],
                ["Total Promotions", promotions.length, "🎁"],
                ["Active Offers", activePromotions, "🟢"],
                ["Average Discount", `${averageDiscount}%`, "📈"],
              ].map((stat) => (
                <div key={stat[0]} className="rounded-2xl border bg-white p-6">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">{stat[0]}</p>
                    <span>{stat[2]}</span>
                  </div>
                  <h3 className="mt-5 text-3xl font-bold">{stat[1]}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Based on saved business data
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-semibold">Business Snapshot</h3>
              <p className="mt-3 text-sm text-gray-500">
                {currentBusiness?.name} · {currentBusiness?.category} ·{" "}
                {currentBusiness?.area}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Your store has {products.length} products and{" "}
                {activePromotions} active promotions.
              </p>
              <button
                onClick={() => setActive("Products")}
                className="mt-5 rounded-lg bg-green-800 px-5 py-3 text-sm text-white"
              >
                Manage Products →
              </button>
            </div>
          </>
        )}

        {/* PRODUCTS */}
        {active === "Products" && (
          <>
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Your Products</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {products.length} products listed in your store.
                </p>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white hover:bg-green-900"
              >
                + Add Product
              </button>
            </div>

            <div className="mb-7 flex flex-wrap gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="min-w-0 flex-1 rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border bg-white px-4 py-3 text-sm"
              >
                <option>All</option>
                <option>Beverages</option>
                <option>Bakery</option>
                <option>Desserts</option>
                <option>Other</option>
              </select>
            </div>

            {productsLoading ? (
              <p className="py-10 text-center text-gray-500">
                Loading products...
              </p>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="overflow-hidden rounded-2xl border bg-white"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-48 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-green-50 text-4xl">
                          🛍️
                        </div>
                      )}

                      <div className="p-5">
                        <p className="text-xs font-medium uppercase tracking-wider text-green-700">
                          {product.category}
                        </p>

                        <div className="mt-2 flex items-start justify-between gap-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          <span className="font-bold">
                            ₹{Number(product.price).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="mt-5 w-full rounded-lg border border-red-200 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete Product
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
                    No products found. Add your first product.
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* PROMOTIONS */}
        {active === "Promotions" && (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Your Promotions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create offers and attract more customers.
                </p>
              </div>

              <button
                onClick={() => setShowPromotionForm(true)}
                className="rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white"
              >
                + Create Promotion
              </button>
            </div>

            {promotionsLoading ? (
              <p className="py-10 text-center text-gray-500">
                Loading promotions...
              </p>
            ) : (
              <>
                <div className="mb-7 grid gap-5 sm:grid-cols-3">
                  <div className="rounded-2xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Total Promotions</p>
                    <h3 className="mt-2 text-3xl font-bold">
                      {promotions.length}
                    </h3>
                  </div>

                  <div className="rounded-2xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Active Offers</p>
                    <h3 className="mt-2 text-3xl font-bold">
                      {activePromotions}
                    </h3>
                  </div>

                  <div className="rounded-2xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Average Discount</p>
                    <h3 className="mt-2 text-3xl font-bold">
                      {averageDiscount}%
                    </h3>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {promotions.map((promotion) => (
                    <div
                      key={promotion.id}
                      className="rounded-2xl border bg-white p-6"
                    >
                      <div className="flex items-start justify-between">
                        <span className="rounded-lg bg-green-100 px-3 py-2 text-2xl font-bold text-green-800">
                          {promotion.discount}% OFF
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            promotion.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {promotion.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <h3 className="mt-5 text-xl font-semibold">
                        {promotion.title}
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        {promotion.description}
                      </p>

                      <p className="mt-4 text-xs text-gray-400">
                        {promotion.start_date} — {promotion.end_date}
                      </p>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => togglePromotion(promotion)}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          {promotion.active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => deletePromotion(promotion.id)}
                          className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {promotions.length === 0 && (
                  <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
                    No promotions yet. Create your first offer!
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ANALYTICS */}
        {active === "Analytics" && (
          <div className="rounded-2xl border bg-white p-8">
            <h3 className="text-xl font-semibold">Business Analytics</h3>
            <p className="mt-3 text-sm text-gray-500">
              Current database records for {currentBusiness?.name}.
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl bg-green-50 p-5">
                <p className="text-sm text-green-800">Products listed</p>
                <h3 className="mt-2 text-3xl font-bold text-green-900">
                  {products.length}
                </h3>
              </div>

              <div className="rounded-xl bg-green-50 p-5">
                <p className="text-sm text-green-800">Active promotions</p>
                <h3 className="mt-2 text-3xl font-bold text-green-900">
                  {activePromotions}
                </h3>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Customer visits, product clicks and enquiries will appear here
              after interaction tracking is connected.
            </p>
          </div>
        )}
      </main>

      {/* ADD PRODUCT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={addProduct}
            className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">Add New Product</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xl text-gray-400"
              >
                ×
              </button>
            </div>

            <label className="mb-2 block text-sm font-medium">
              Product Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vanilla Latte"
              className="mb-5 w-full rounded-xl border px-4 py-3 text-sm"
            />

            <label className="mb-2 block text-sm font-medium">
              Price (₹)
            </label>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="mb-5 w-full rounded-xl border px-4 py-3 text-sm"
            />

            <label className="mb-2 block text-sm font-medium">
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="mb-5 w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option>Beverages</option>
              <option>Bakery</option>
              <option>Desserts</option>
              <option>Other</option>
            </select>

            <label className="mb-2 block text-sm font-medium">
              Product Image URL (optional)
            </label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Paste an image URL"
              className="mb-7 w-full rounded-xl border px-4 py-3 text-sm"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-green-800 py-3 font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </form>
        </div>
      )}

      {/* CREATE PROMOTION MODAL */}
      {showPromotionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={addPromotion}
            className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">Create Promotion</h3>
              <button
                type="button"
                onClick={() => setShowPromotionForm(false)}
                className="text-xl text-gray-400"
              >
                ×
              </button>
            </div>

            <label className="mb-2 block text-sm font-medium">
              Offer Title
            </label>
            <input
              required
              value={promotionTitle}
              onChange={(e) => setPromotionTitle(e.target.value)}
              placeholder="e.g. Weekend Special"
              className="mb-5 w-full rounded-xl border px-4 py-3 text-sm"
            />

            <label className="mb-2 block text-sm font-medium">
              Description
            </label>
            <textarea
              required
              value={promotionDescription}
              onChange={(e) => setPromotionDescription(e.target.value)}
              placeholder="Describe your offer..."
              className="mb-5 w-full rounded-xl border px-4 py-3 text-sm"
              rows={3}
            />

            <label className="mb-2 block text-sm font-medium">
              Discount (%)
            </label>
            <input
              required
              type="number"
              min="1"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="e.g. 20"
              className="mb-5 w-full rounded-xl border px-4 py-3 text-sm"
            />

            <label className="mb-2 block text-sm font-medium">
              Start Date
            </label>
            <input
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mb-5 w-full rounded-xl border px-4 py-3 text-sm"
            />

            <label className="mb-2 block text-sm font-medium">
              End Date
            </label>
            <input
              required
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mb-7 w-full rounded-xl border px-4 py-3 text-sm"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-green-800 py-3 font-medium text-white hover:bg-green-900 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Promotion"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
