"use client";

import { useState, useMemo } from "react";
import CarCard from "@/components/CarCard";
import { Car } from "@/types/car";

const getBrands = (cars: Car[]) => [...new Set(cars.map((c) => c.brand))].sort();
const getFuels  = (cars: Car[]) => [...new Set(cars.map((c) => c.fuel))].sort();

export default function CatalogoClient({ cars }: { cars: Car[] }) {
  const [search,      setSearch]      = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [fuelFilter,  setFuelFilter]  = useState("");
  const [maxPrice,    setMaxPrice]    = useState("");
  const [maxKm,       setMaxKm]       = useState("");
  const [sortBy,      setSortBy]      = useState("recente");
  const [filterOpen,  setFilterOpen]  = useState(false);

  const brands = getBrands(cars);
  const fuels  = getFuels(cars);

  const activeCount = [brandFilter, fuelFilter, maxPrice, maxKm].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = cars.filter((c) => c.status !== "vendido");
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.version.toLowerCase().includes(q) ||
        String(c.year).includes(q)
      );
    }
    if (brandFilter) result = result.filter((c) => c.brand === brandFilter);
    if (fuelFilter)  result = result.filter((c) => c.fuel === fuelFilter);
    if (maxPrice) result = result.filter((c) => c.price   <= Number(maxPrice));
    if (maxKm)    result = result.filter((c) => c.mileage <= Number(maxKm));
    switch (sortBy) {
      case "menor-preco": result.sort((a, b) => a.price - b.price);   break;
      case "maior-preco": result.sort((a, b) => b.price - a.price);   break;
      case "menor-km":    result.sort((a, b) => a.mileage - b.mileage); break;
      case "mais-novo":   result.sort((a, b) => b.year - a.year);     break;
    }
    return result;
  }, [cars, search, brandFilter, fuelFilter, maxPrice, maxKm, sortBy]);

  const clearFilters = () => {
    setBrandFilter(""); setFuelFilter("");
    setMaxPrice(""); setMaxKm(""); setSortBy("recente");
  };

  const selectClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm";

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gray-900 text-white py-10 border-b border-yellow-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-1">Estoque completo</h1>
          <p className="text-gray-400">
            {filtered.length} carro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Barra superior: busca + botão filtrar + ordenar */}
        <div className="flex gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar marca, modelo, ano..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
            />
          </div>

          {/* Botão Filtrar */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold shadow-sm transition-colors ${
              filterOpen || activeCount > 0
                ? "bg-yellow-500 border-yellow-500 text-white"
                : "bg-white border-gray-200 text-gray-700 hover:border-yellow-400 hover:text-yellow-600"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtrar
            {activeCount > 0 && (
              <span className="bg-white text-yellow-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Ordenar */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="hidden sm:block px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
          >
            <option value="recente">Mais recentes</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
            <option value="menor-km">Menor KM</option>
            <option value="mais-novo">Mais novo</option>
          </select>
        </div>

        {/* Painel de filtros */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${filterOpen ? "max-h-96 opacity-100 mb-6" : "max-h-0 opacity-0"}`}>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:grid-cols-4">
              {/* Marca */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Marca</label>
                <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className={selectClass}>
                  <option value="">Todas</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Combustível */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Combustível</label>
                <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)} className={selectClass}>
                  <option value="">Todos</option>
                  {fuels.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Preço máximo */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Preço máx.</label>
                <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={selectClass}>
                  <option value="">Qualquer</option>
                  {[50000, 70000, 90000, 110000, 130000, 150000].map((p) => (
                    <option key={p} value={p}>Até R$ {p.toLocaleString("pt-BR")}</option>
                  ))}
                </select>
              </div>

              {/* KM máximo */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">KM máx.</label>
                <select value={maxKm} onChange={(e) => setMaxKm(e.target.value)} className={selectClass}>
                  <option value="">Qualquer</option>
                  {[20000, 50000, 80000, 100000, 150000, 200000].map((k) => (
                    <option key={k} value={k}>Até {k.toLocaleString("pt-BR")} km</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ordenar (mobile) + limpar */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="sm:hidden flex-1 mr-3">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
                  <option value="recente">Mais recentes</option>
                  <option value="menor-preco">Menor preço</option>
                  <option value="maior-preco">Maior preço</option>
                  <option value="menor-km">Menor KM</option>
                  <option value="mais-novo">Mais novo</option>
                </select>
              </div>
              <div className="flex gap-2 ml-auto">
                {activeCount > 0 && (
                  <button onClick={clearFilters} className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
                    Limpar filtros
                  </button>
                )}
                <button onClick={() => setFilterOpen(false)} className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold transition-colors">
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum carro encontrado</h3>
            <button onClick={clearFilters} className="text-yellow-600 font-medium hover:underline">Limpar filtros</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        )}
      </div>
    </main>
  );
}
