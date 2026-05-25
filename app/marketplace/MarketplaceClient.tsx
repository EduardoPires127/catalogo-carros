"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MarketplaceCar, Dealer } from "@/types/marketplace";

interface Props {
  cars: MarketplaceCar[];
  dealers: Dealer[];
}

// Dados extras simulados por veículo (demo)
const extraData: Record<string, { bids: number; endsInHours: number; minBid: number; possuiDoc: boolean; laudoAprovado: boolean }> = {
  "m1": { bids: 14, endsInHours: 2,   minBid: 5000,  possuiDoc: true,  laudoAprovado: true  },
  "m2": { bids: 7,  endsInHours: 5,   minBid: 8000,  possuiDoc: true,  laudoAprovado: false },
  "m3": { bids: 23, endsInHours: 0.5, minBid: 3000,  possuiDoc: false, laudoAprovado: true  },
  "m4": { bids: 3,  endsInHours: 18,  minBid: 10000, possuiDoc: true,  laudoAprovado: true  },
  "m5": { bids: 11, endsInHours: 8,   minBid: 4000,  possuiDoc: false, laudoAprovado: false },
  "m6": { bids: 6,  endsInHours: 12,  minBid: 6000,  possuiDoc: true,  laudoAprovado: true  },
};
function getExtra(id: string) {
  return extraData[id] ?? { bids: 5, endsInHours: 3, minBid: 5000, possuiDoc: true, laudoAprovado: false };
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

const MAX_PRICE  = 300000;
const MAX_KM     = 250000;
const MIN_YEAR   = 2010;
const MAX_YEAR   = new Date().getFullYear();

const selectCls = "w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-yellow-500";
const labelCls  = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

export default function MarketplaceClient({ cars, dealers }: Props) {
  const [q,             setQ]             = useState("");
  const [estado,        setEstado]        = useState("");
  const [cidade,        setCidade]        = useState("");
  const [priceMax,      setPriceMax]      = useState(MAX_PRICE);
  const [kmMax,         setKmMax]         = useState(MAX_KM);
  const [yearMin,       setYearMin]       = useState(MIN_YEAR);
  const [yearMax,       setYearMax]       = useState(MAX_YEAR);
  const [possuiDoc,     setPossuiDoc]     = useState("");   // "" | "sim" | "nao"
  const [laudoAprov,    setLaudoAprov]    = useState("");   // "" | "sim" | "nao"
  const [combustivel,   setCombustivel]   = useState("");
  const [cambio,        setCambio]        = useState("");
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  const estados     = useMemo(() => [...new Set(dealers.map(d => d.state))].sort(), [dealers]);
  const cidades     = useMemo(() => {
    const base = dealers.filter(d => !estado || d.state === estado);
    return [...new Set(base.map(d => d.city))].sort();
  }, [dealers, estado]);
  const combustiveis = useMemo(() => [...new Set(cars.map(c => c.fuel))].sort(), [cars]);
  const cambios      = useMemo(() => [...new Set(cars.map(c => c.transmission))].sort(), [cars]);

  useEffect(() => { setCidade(""); }, [estado]);

  const filtered = useMemo(() => {
    return cars.filter(c => {
      if (c.status !== "disponivel") return false;
      if (q) {
        const s = q.toLowerCase();
        if (!c.brand.toLowerCase().includes(s) && !c.model.toLowerCase().includes(s) && !c.version.toLowerCase().includes(s)) return false;
      }
      if (estado && c.dealer.state !== estado) return false;
      if (cidade && c.dealer.city  !== cidade) return false;
      if (c.price   > priceMax) return false;
      if (c.mileage > kmMax)    return false;
      if (c.year    < yearMin)  return false;
      if (c.year    > yearMax)  return false;
      if (combustivel && c.fuel         !== combustivel) return false;
      if (cambio      && c.transmission !== cambio)      return false;
      const ex = getExtra(c.id);
      if (possuiDoc  === "sim" && !ex.possuiDoc)     return false;
      if (possuiDoc  === "nao" && ex.possuiDoc)      return false;
      if (laudoAprov === "sim" && !ex.laudoAprovado) return false;
      if (laudoAprov === "nao" && ex.laudoAprovado)  return false;
      return true;
    });
  }, [cars, q, estado, cidade, priceMax, kmMax, yearMin, yearMax, combustivel, cambio, possuiDoc, laudoAprov]);

  const activeCount = [
    estado, cidade, combustivel, cambio, possuiDoc, laudoAprov,
    priceMax < MAX_PRICE ? "p" : "",
    kmMax    < MAX_KM    ? "k" : "",
    yearMin  > MIN_YEAR  ? "y" : "",
    yearMax  < MAX_YEAR  ? "y" : "",
  ].filter(Boolean).length;

  function clearFilters() {
    setEstado(""); setCidade(""); setCombustivel(""); setCambio("");
    setPossuiDoc(""); setLaudoAprov("");
    setPriceMax(MAX_PRICE); setKmMax(MAX_KM);
    setYearMin(MIN_YEAR);   setYearMax(MAX_YEAR);
  }

  const Sidebar = (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-sm">Filtros</span>
        {activeCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 transition-colors">
            Limpar tudo
          </button>
        )}
      </div>

      {/* Estado */}
      <div>
        <label className={labelCls}>Estado</label>
        <select value={estado} onChange={e => setEstado(e.target.value)} className={selectCls}>
          <option value="">Todos</option>
          {estados.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Cidade */}
      <div>
        <label className={labelCls}>Cidade</label>
        <select value={cidade} onChange={e => setCidade(e.target.value)} className={selectCls} disabled={!estado}>
          <option value="">Todas</option>
          {cidades.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="border-t border-gray-800" />

      {/* Lance máx */}
      <div>
        <label className={labelCls}>
          Lance máx.{" "}
          <span className="text-yellow-400 normal-case font-semibold">
            {priceMax === MAX_PRICE ? "— Qualquer" : `— ${priceMax.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}`}
          </span>
        </label>
        <input type="range" min={30000} max={MAX_PRICE} step={5000} value={priceMax}
          onChange={e => setPriceMax(Number(e.target.value))}
          className="w-full accent-yellow-500 cursor-pointer" />
        <div className="flex justify-between text-xs text-gray-600 mt-1"><span>R$ 30k</span><span>R$ 300k</span></div>
      </div>

      {/* KM máx */}
      <div>
        <label className={labelCls}>
          KM máx.{" "}
          <span className="text-yellow-400 normal-case font-semibold">
            {kmMax === MAX_KM ? "— Qualquer" : `— ${kmMax.toLocaleString("pt-BR")} km`}
          </span>
        </label>
        <input type="range" min={0} max={MAX_KM} step={10000} value={kmMax}
          onChange={e => setKmMax(Number(e.target.value))}
          className="w-full accent-yellow-500 cursor-pointer" />
        <div className="flex justify-between text-xs text-gray-600 mt-1"><span>0 km</span><span>250k km</span></div>
      </div>

      {/* Ano entre */}
      <div>
        <label className={labelCls}>Ano entre</label>
        <div className="flex items-center gap-2">
          <select value={yearMin} onChange={e => setYearMin(Number(e.target.value))} className={selectCls}>
            {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-gray-500 text-sm shrink-0">–</span>
          <select value={yearMax} onChange={e => setYearMax(Number(e.target.value))} className={selectCls}>
            {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).reverse().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-gray-800" />

      {/* Combustível */}
      <div>
        <label className={labelCls}>Combustível</label>
        <select value={combustivel} onChange={e => setCombustivel(e.target.value)} className={selectCls}>
          <option value="">Todos</option>
          {combustiveis.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Câmbio */}
      <div>
        <label className={labelCls}>Câmbio</label>
        <select value={cambio} onChange={e => setCambio(e.target.value)} className={selectCls}>
          <option value="">Todos</option>
          {cambios.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="border-t border-gray-800" />

      {/* Possui doc */}
      <div>
        <label className={labelCls}>Possui documentação</label>
        <select value={possuiDoc} onChange={e => setPossuiDoc(e.target.value)} className={selectCls}>
          <option value="">Qualquer</option>
          <option value="sim">✅ Sim</option>
          <option value="nao">❌ Não</option>
        </select>
      </div>

      {/* Laudo aprovado */}
      <div>
        <label className={labelCls}>Laudo aprovado</label>
        <select value={laudoAprov} onChange={e => setLaudoAprov(e.target.value)} className={selectCls}>
          <option value="">Qualquer</option>
          <option value="sim">✅ Aprovado</option>
          <option value="nao">❌ Não aprovado</option>
        </select>
      </div>

    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">AO VIVO</span>
          <span className="text-gray-500 text-sm">{filtered.length} leilão{filtered.length !== 1 ? "s" : ""} em andamento</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">Auto Avaliar de Veículos</h1>
        <p className="text-gray-400">Dê seu lance e arremate o carro ideal com total transparência e segurança</p>
      </div>

      {/* Busca + botão filtros (mobile) */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Buscar marca, modelo, versão..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-yellow-500 placeholder-gray-600"
          />
        </div>

        {/* Botão filtros — só aparece no mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
            sidebarOpen || activeCount > 0
              ? "bg-yellow-500 border-yellow-500 text-black"
              : "bg-gray-900 border-gray-700 text-gray-300"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filtros
          {activeCount > 0 && (
            <span className="bg-black/20 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Layout: sidebar + grid */}
      <div className="flex gap-6 items-start">

        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-64 shrink-0 bg-gray-900 border border-gray-800 rounded-2xl p-5 sticky top-20">
          {Sidebar}
        </aside>

        {/* Sidebar mobile (drawer) */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-72 bg-gray-950 border-r border-gray-800 h-full overflow-y-auto p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">Filtros</span>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {Sidebar}
              <button onClick={() => setSidebarOpen(false)} className="mt-4 w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl text-sm transition-colors">
                Ver {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-14 h-14 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">Nenhum leilão encontrado</p>
              <button onClick={clearFilters} className="text-yellow-400 hover:underline mt-2 text-sm">Limpar filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(car => {
                const ex = getExtra(car.id);
                const nextBid = car.price + ex.minBid;
                return (
                  <Link
                    key={car.id}
                    href={`/marketplace/carro/${car.id}`}
                    className="bg-gray-900 rounded-2xl border border-gray-800 hover:border-yellow-500/60 transition-all hover:-translate-y-0.5 overflow-hidden group flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative w-full h-44 bg-gray-800 overflow-hidden">
                      {car.images[0] ? (
                        <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-14 h-14 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                        <Countdown endsInHours={ex.endsInHours} />
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-xs text-gray-300 font-medium">{ex.bids} lance{ex.bids !== 1 ? "s" : ""}</span>
                      </div>
                      {/* Badges doc/laudo */}
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {ex.possuiDoc && (
                          <span className="bg-green-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">DOC</span>
                        )}
                        {ex.laudoAprovado && (
                          <span className="bg-blue-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">LAUDO ✓</span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-white font-bold">{car.brand} {car.model}</p>
                      <p className="text-gray-400 text-xs mb-3">{car.version} · {car.year} · {car.mileage.toLocaleString("pt-BR")} km</p>

                      <div className="bg-gray-800 rounded-xl p-3 mb-3">
                        <p className="text-xs text-gray-500 mb-0.5">Lance atual</p>
                        <p className="text-yellow-400 font-bold text-lg leading-tight">
                          {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Próximo mín: {nextBid.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                        </p>
                      </div>

                      <div className="mt-auto w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl text-sm text-center transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Dar lance
                      </div>

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

          <div className="mt-10 text-center">
            <p className="text-gray-600 text-sm">Quer leiloar seu veículo?</p>
            <Link href="/marketplace/cadastro" className="text-yellow-400 hover:text-yellow-300 font-medium text-sm">
              Cadastre-se como leiloeiro →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
