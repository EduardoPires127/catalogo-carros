"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MarketplaceCar, Dealer } from "@/types/marketplace";

interface Props {
  cars: MarketplaceCar[];
  dealers: Dealer[];
}

const inputClass = "w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-yellow-500";
const labelClass = "block text-xs font-medium text-gray-400 mb-1";

function DealerInitials({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div className={`flex items-center justify-center bg-yellow-500 text-black font-bold rounded-lg ${className}`}>
      {initials}
    </div>
  );
}

export default function MarketplaceClient({ cars, dealers }: Props) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [state, setState] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [yearMin, setYearMin] = useState("");

  const brands = useMemo(() => [...new Set(cars.map(c => c.brand))].sort(), [cars]);
  const states = useMemo(() => [...new Set(dealers.map(d => d.state))].sort(), [dealers]);

  const filtered = useMemo(() => {
    return cars.filter(c => {
      if (c.status !== "disponivel") return false;
      if (q) {
        const search = q.toLowerCase();
        if (
          !c.brand.toLowerCase().includes(search) &&
          !c.model.toLowerCase().includes(search) &&
          !c.version.toLowerCase().includes(search)
        ) return false;
      }
      if (brand && c.brand !== brand) return false;
      if (dealerId && c.dealer_id !== dealerId) return false;
      if (state && c.dealer.state !== state) return false;
      if (priceMax && c.price > Number(priceMax)) return false;
      if (yearMin && c.year < Number(yearMin)) return false;
      return true;
    });
  }, [cars, q, brand, dealerId, state, priceMax, yearMin]);

  function clearFilters() {
    setQ(""); setBrand(""); setDealerId(""); setState(""); setPriceMax(""); setYearMin("");
  }

  const hasFilters = q || brand || dealerId || state || priceMax || yearMin;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Marketplace de Veículos</h1>
        <p className="text-gray-400">Encontre o carro ideal nas melhores revendedoras do Brasil</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <label className={labelClass}>Busca</label>
            <input value={q} onChange={e => setQ(e.target.value)} className={inputClass} placeholder="Marca, modelo ou versão..." />
          </div>
          <div>
            <label className={labelClass}>Marca</label>
            <select value={brand} onChange={e => setBrand(e.target.value)} className={inputClass}>
              <option value="">Todas</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select value={state} onChange={e => setState(e.target.value)} className={inputClass}>
              <option value="">Todos</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Preço até (R$)</label>
            <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} className={inputClass} placeholder="Ex: 150000" min={0} />
          </div>
          <div>
            <label className={labelClass}>Ano mínimo</label>
            <input type="number" value={yearMin} onChange={e => setYearMin(e.target.value)} className={inputClass} placeholder="Ex: 2020" min={1990} max={2030} />
          </div>
        </div>

        {/* Dealer chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setDealerId("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!dealerId ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"}`}
          >
            Todas as lojas
          </button>
          {dealers.map(d => (
            <button
              key={d.id}
              onClick={() => setDealerId(dealerId === d.id ? "" : d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dealerId === d.id ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              {d.company_name}
            </button>
          ))}
          {hasFilters && (
            <button onClick={clearFilters} className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 transition-colors ml-auto">
              Limpar filtros ×
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-400 text-sm">
          <span className="text-white font-semibold">{filtered.length}</span> veículo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </p>
        <Link href="/marketplace/cadastro" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors">
          Sua revendedora aqui →
        </Link>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-14 h-14 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg">Nenhum veículo encontrado</p>
          <button onClick={clearFilters} className="text-yellow-400 hover:underline mt-2 text-sm">Limpar filtros</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(car => (
            <Link
              key={car.id}
              href={`/marketplace/carro/${car.id}`}
              className="bg-gray-900 rounded-2xl border border-gray-800 hover:border-yellow-600/50 transition-all hover:-translate-y-0.5 overflow-hidden group"
            >
              {/* Image */}
              <div className="relative w-full h-44 bg-gray-800 flex items-center justify-center">
                {car.images[0] ? (
                  <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <svg className="w-14 h-14 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-white font-bold text-base">{car.brand} {car.model}</p>
                <p className="text-gray-400 text-xs mb-2">{car.version} · {car.year}</p>
                <p className="text-yellow-400 font-bold text-lg mb-3">
                  {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                </p>

                {/* Stats */}
                <div className="flex gap-3 text-xs text-gray-500 mb-3">
                  <span>{car.mileage.toLocaleString("pt-BR")} km</span>
                  <span>·</span>
                  <span>{car.fuel}</span>
                  <span>·</span>
                  <span>{car.transmission}</span>
                </div>

                {/* Dealer */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
                  {car.dealer.logo_url ? (
                    <img src={car.dealer.logo_url} alt={car.dealer.company_name} className="w-7 h-7 rounded-md object-cover" />
                  ) : (
                    <DealerInitials name={car.dealer.company_name} className="w-7 h-7 text-xs" />
                  )}
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{car.dealer.company_name}</p>
                    <p className="text-gray-500 text-xs">{car.dealer.city} · {car.dealer.state}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
