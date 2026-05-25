"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MarketplaceCar, Dealer } from "@/types/marketplace";

interface Props {
  cars: MarketplaceCar[];
  dealers: Dealer[];
}

const inputClass = "w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-yellow-500";
const labelClass = "block text-xs font-medium text-gray-400 mb-1";

// Dados de leilão simulados por carro
const auctionData: Record<string, { bids: number; endsInHours: number; minBid: number }> = {
  "m1": { bids: 14, endsInHours: 2,  minBid: 5000  },
  "m2": { bids: 7,  endsInHours: 5,  minBid: 8000  },
  "m3": { bids: 23, endsInHours: 0.5, minBid: 3000 },
  "m4": { bids: 3,  endsInHours: 18, minBid: 10000 },
  "m5": { bids: 11, endsInHours: 8,  minBid: 4000  },
  "m6": { bids: 6,  endsInHours: 12, minBid: 6000  },
};

function getAuction(id: string) {
  return auctionData[id] ?? { bids: Math.floor(Math.random() * 20) + 1, endsInHours: 3, minBid: 5000 };
}

function Countdown({ endsInHours }: { endsInHours: number }) {
  const totalSecs = Math.floor(endsInHours * 3600);
  const [secs, setSecs] = useState(totalSecs);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [secs]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const urgent = secs < 3600;

  return (
    <div className={`flex items-center gap-1 text-xs font-mono font-bold ${urgent ? "text-red-400" : "text-yellow-400"}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {h > 0 && `${String(h).padStart(2,"0")}:`}{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
    </div>
  );
}

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
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
            AO VIVO
          </span>
          <span className="text-gray-500 text-sm">{filtered.length} leilão{filtered.length !== 1 ? "s" : ""} em andamento</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">Auto Avaliar de Veículos</h1>
        <p className="text-gray-400">Dê seu lance e arremate o carro ideal com total transparência e segurança</p>
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
            <label className={labelClass}>Lance máx. (R$)</label>
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
            Todos os leiloeiros
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-14 h-14 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg">Nenhum leilão encontrado</p>
          <button onClick={clearFilters} className="text-yellow-400 hover:underline mt-2 text-sm">Limpar filtros</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(car => {
            const auction = getAuction(car.id);
            const nextBid = car.price + auction.minBid;
            return (
              <Link
                key={car.id}
                href={`/marketplace/carro/${car.id}`}
                className="bg-gray-900 rounded-2xl border border-gray-800 hover:border-yellow-500/60 transition-all hover:-translate-y-0.5 overflow-hidden group flex flex-col"
              >
                {/* Image */}
                <div className="relative w-full h-44 bg-gray-800 flex items-center justify-center overflow-hidden">
                  {car.images[0] ? (
                    <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <svg className="w-14 h-14 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                  )}
                  {/* Timer badge */}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                    <Countdown endsInHours={auction.endsInHours} />
                  </div>
                  {/* Bid count badge */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                    <span className="text-xs text-gray-300 font-medium">{auction.bids} lance{auction.bids !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-white font-bold text-base">{car.brand} {car.model}</p>
                  <p className="text-gray-400 text-xs mb-3">{car.version} · {car.year} · {car.mileage.toLocaleString("pt-BR")} km</p>

                  {/* Lance atual */}
                  <div className="bg-gray-800 rounded-xl p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-0.5">Lance atual</p>
                    <p className="text-yellow-400 font-bold text-lg leading-tight">
                      {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Próximo mín: {nextBid.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    <div className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl text-sm text-center transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Dar lance
                    </div>
                  </div>

                  {/* Leiloeiro */}
                  <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-800">
                    {car.dealer.logo_url ? (
                      <img src={car.dealer.logo_url} alt={car.dealer.company_name} className="w-6 h-6 rounded-md object-cover" />
                    ) : (
                      <DealerInitials name={car.dealer.company_name} className="w-6 h-6 text-xs" />
                    )}
                    <p className="text-gray-500 text-xs truncate">{car.dealer.company_name} · {car.dealer.city}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* CTA cadastro */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">Quer leiloar seu veículo?</p>
        <Link href="/marketplace/cadastro" className="text-yellow-400 hover:text-yellow-300 font-medium text-sm transition-colors">
          Cadastre-se como leiloeiro →
        </Link>
      </div>
    </div>
  );
}
