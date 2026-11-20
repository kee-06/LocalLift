
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `text-sm font-medium transition ${
      pathname === path
        ? "text-green-800"
        : "text-gray-600 hover:text-green-800"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/shop" className="text-2xl font-bold text-gray-900">
          Local<span className="text-green-700">Lift.</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/shop" className={linkClass("/shop")}>
            Explore
          </Link>

          <Link
            href="/register-business"
            className={linkClass("/register-business")}
          >
            For Businesses
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-green-800 px-3 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-50"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-green-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-900"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
