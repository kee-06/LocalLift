
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <nav className="flex items-center justify-between px-8 py-6 md:px-16">
        <h1 className="text-2xl font-bold tracking-tight">
          Local<span className="text-green-700">Lift.</span>
        </h1>

        <div className="hidden gap-8 text-sm font-medium md:flex">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </div>

        <Link
          href="/dashboard"
          className="rounded-full bg-green-800 px-6 py-3 text-sm text-white hover:bg-green-900"
        >
          Vendor Dashboard →
        </Link>
      </nav>

      <section className="grid min-h-[75vh] items-center gap-12 px-8 py-16 md:grid-cols-2 md:px-16">
        <div>
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-green-800">
            Your neighbourhood. Your marketplace.
          </p>

          <h2 className="text-5xl font-semibold leading-tight md:text-7xl">
            Small businesses.
            <br />
            <span className="text-green-800">Big possibilities.</span>
          </h2>

          <p className="mt-7 max-w-lg text-lg leading-8 text-gray-600">
            Helping local businesses get discovered, connect with customers
            and grow their presence — all in one place.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-full bg-green-800 px-7 py-4 font-medium text-white hover:bg-green-900"
            >
              Explore Dashboard →
            </Link>

            <a
              href="#features"
              className="rounded-full border border-gray-300 px-7 py-4 font-medium hover:bg-white"
            >
              Discover More
            </a>
          </div>
        </div>

        <div className="rounded-3xl bg-[#e7ebdf] p-8 md:p-12">
          <p className="text-sm font-medium uppercase tracking-widest text-green-900">
            Local businesses, elevated.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-6">
              <span className="text-3xl">🏪</span>
              <h3 className="mt-4 font-semibold">Digital Stores</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your own online storefront.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6">
              <span className="text-3xl">📊</span>
              <h3 className="mt-4 font-semibold">Smart Insights</h3>
              <p className="mt-2 text-sm text-gray-500">
                Understand your customers.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6">
              <span className="text-3xl">📢</span>
              <h3 className="mt-4 font-semibold">Promotions</h3>
              <p className="mt-2 text-sm text-gray-500">
                Showcase offers and products.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6">
              <span className="text-3xl">📍</span>
              <h3 className="mt-4 font-semibold">Local Reach</h3>
              <p className="mt-2 text-sm text-gray-500">
                Connect with nearby customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-8 py-20 text-center md:px-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-green-800">
          Why LocalLift?
        </p>
        <h2 className="mt-4 text-4xl font-semibold">
          Growth should be accessible to everyone.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-gray-600">
          One simple platform to manage your business presence,
          promote your offerings and understand your market.
        </p>
      </section>

      <footer className="border-t border-gray-200 px-8 py-8 text-center text-sm text-gray-500">
        © 2026 LocalLift. Empowering local businesses.
      </footer>
    </main>
  );
}
