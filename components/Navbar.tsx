"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { STORE_NAME } from "@/data/cars";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function handleInicio(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMenuOpen(false);
  }

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-yellow-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.jpeg" alt={STORE_NAME} width={36} height={36} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-gray-900">{STORE_NAME}</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" onClick={handleInicio} className="text-gray-600 hover:text-yellow-600 transition-colors font-medium text-sm">
              Início
            </Link>

            <Link href="/marketplace" className="text-gray-600 hover:text-yellow-600 transition-colors font-medium text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Auto Avaliar <span className="text-xs text-gray-400 font-normal">(DEMO)</span>
            </Link>
            <Link href="/catalogo" className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm">
              Ver Carros
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-yellow-600 hover:bg-yellow-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1 border-t border-yellow-100 pt-3">
            <Link href="/" className="text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 px-3 py-2.5 rounded-lg text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Início
            </Link>

            <Link href="/marketplace" className="text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5" onClick={() => setMenuOpen(false)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Auto Avaliar <span className="text-xs text-gray-400 font-normal">(DEMO)</span>
            </Link>
            <Link href="/catalogo" className="bg-yellow-500 text-white text-center px-4 py-2.5 rounded-lg font-semibold text-sm mt-2" onClick={() => setMenuOpen(false)}>
              Ver Carros
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
