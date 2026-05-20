"use client";

import { useState } from "react";

const MARCAS = [
  "", "Audi", "BMW", "BYD", "Caoa Chery", "Chevrolet", "Chrysler", "Citroën",
  "Dodge", "Fiat", "Ford", "GWM", "Honda", "Hyundai", "JAC", "Jeep",
  "Kia", "Land Rover", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan",
  "Peugeot", "Porsche", "RAM", "Renault", "Subaru", "Suzuki", "Toyota",
  "Volkswagen", "Volvo",
];

const BR_STATES = [
  { uf: "", name: "Selecione o estado" },
  { uf: "AC", name: "Acre" }, { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" }, { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" }, { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" }, { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" }, { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" }, { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" }, { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" }, { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" }, { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" }, { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" }, { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" }, { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" }, { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

interface ResultItem {
  title: string;
  link: string;
  snippet: string;
  image: string;
  platform: { name: string; color: string };
  price: number | null;
  year: string | null;
  km: number | null;
}

interface SearchResult {
  items: ResultItem[];
  totalResults: string;
  dailyUsed: number;
  dailyLimit: number;
  cached?: boolean;
  error?: string;
}

interface LastSearch {
  marca: string;
  modelo: string;
  state: string;
  cidade: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
}

const inputClass = "w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-yellow-500 placeholder-gray-500";
const inputRequiredClass = "w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-yellow-600/50 text-white text-sm focus:outline-none focus:border-yellow-500 placeholder-gray-500";
const labelClass = "block text-xs font-medium text-gray-400 mb-1";
const labelRequiredClass = "block text-xs font-medium text-yellow-400 mb-1";

function formatPrice(price: number | null) {
  if (price == null) return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0,
  }).format(price);
}

function formatKm(km: number | null) {
  if (km == null) return null;
  return new Intl.NumberFormat("pt-BR").format(km) + " km";
}

function buildExternalLinks(s: LastSearch) {
  const q = encodeURIComponent(`${s.marca} ${s.modelo}`);
  const uf = s.state.toLowerCase();
  return [
    { name: "OLX", color: "#8B5CF6", url: `https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios?q=${q}&re=${uf}` },
    { name: "Webmotors", color: "#EF4444", url: `https://www.webmotors.com.br/carros/estoque?q=${q}${s.yearMin ? `&AnoFabricacaoMenor=${s.yearMin}` : ""}${s.yearMax ? `&AnoFabricacaoMaior=${s.yearMax}` : ""}${s.priceMin ? `&PrecoMenor=${s.priceMin}` : ""}${s.priceMax ? `&PrecoMaior=${s.priceMax}` : ""}` },
    { name: "iCarros", color: "#3B82F6", url: `https://www.icarros.com.br/anuncios/lista.jsp?pais=1&uf=${s.state}&q=${q}` },
    { name: "Seminovos", color: "#F97316", url: `https://www.seminovos.com.br/carros?q=${q}&uf=${s.state}` },
  ];
}

function CarIcon() {
  return (
    <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
    </svg>
  );
}

export default function HunterPage() {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [cidade, setCidade] = useState("");
  const [state, setState] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [formError, setFormError] = useState("");
  const [lastSearch, setLastSearch] = useState<LastSearch | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!marca.trim() || !modelo.trim() || !state) {
      setFormError("Preencha os campos obrigatórios: Marca, Modelo e Estado.");
      return;
    }

    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams({ marca: marca.trim(), modelo: modelo.trim(), state });
    if (cidade.trim()) params.set("cidade", cidade.trim());
    if (priceMin) params.set("price_min", priceMin);
    if (priceMax) params.set("price_max", priceMax);
    if (yearMin) params.set("year_min", yearMin);
    if (yearMax) params.set("year_max", yearMax);

    try {
      const res = await fetch(`/api/hunter/search?${params}`);
      const data = await res.json();
      setResult(data);
      if (!data.error) setLastSearch({ marca, modelo, state, cidade, priceMin, priceMax, yearMin, yearMax });
    } catch {
      setResult({ items: [], totalResults: "0", dailyUsed: 0, dailyLimit: 100, error: "Erro ao buscar. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  const externalLinks = lastSearch ? buildExternalLinks(lastSearch) : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="max-w-5xl mx-auto px-4 py-10">

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-yellow-500 rounded-xl p-2.5">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth={2} />
              <path strokeLinecap="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hunter Car</h1>
            <p className="text-gray-400 text-sm">Busque veículos nos maiores portais do Brasil</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-8">
          <p className="text-xs text-gray-500 mb-4">Campos com <span className="text-yellow-400">*</span> são obrigatórios</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelRequiredClass}>Marca *</label>
              <select value={marca} onChange={e => setMarca(e.target.value)} className={inputRequiredClass}>
                <option value="">Selecione a marca</option>
                {MARCAS.filter(m => m).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelRequiredClass}>Modelo *</label>
              <input value={modelo} onChange={e => setModelo(e.target.value)} className={inputRequiredClass} placeholder="Ex: Corolla, Civic, Gol..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelRequiredClass}>Estado *</label>
              <select value={state} onChange={e => setState(e.target.value)} className={inputRequiredClass}>
                {BR_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Cidade</label>
              <input value={cidade} onChange={e => setCidade(e.target.value)} className={inputClass} placeholder="Ex: Joinville, São Paulo..." />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Preço (R$)</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} className={inputClass} placeholder="De: Ex: 20000" min={0} />
              <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} className={inputClass} placeholder="Até: Ex: 80000" min={0} />
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Ano</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={yearMin} onChange={e => setYearMin(e.target.value)} className={inputClass} placeholder="De: Ex: 2018" min={1990} max={2030} />
              <input type="number" value={yearMax} onChange={e => setYearMax(e.target.value)} className={inputClass} placeholder="Até: Ex: 2024" min={1990} max={2030} />
            </div>
          </div>

          {formError && <p className="text-red-400 text-sm mb-4">{formError}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Buscando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth={2} />
                  <path strokeLinecap="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
                </svg>
                Buscar veículos
              </>
            )}
          </button>
        </form>

        {lastSearch && (
          <div className="mb-6 bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3">Buscar também em:</p>
            <div className="flex flex-wrap gap-2">
              {externalLinks.map(link => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80"
                  style={{ backgroundColor: link.color }}
                >
                  {link.name}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {result && !result.error && (
          <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
            <span>{result.cached ? "⚡ Resultado em cache" : `🔍 ${result.dailyUsed} de ${result.dailyLimit} buscas hoje`}</span>
            <span>{result.items?.length ?? 0} resultado{result.items?.length !== 1 ? "s" : ""}</span>
          </div>
        )}

        {result?.error && (
          <div className="bg-red-900/30 border border-red-700 rounded-2xl p-6 text-center mb-6">
            <p className="text-red-400">{result.error}</p>
          </div>
        )}

        {searched && !loading && result && !result.error && result.items?.length === 0 && (
          <div className="text-center py-16">
            <CarIcon />
            <p className="text-gray-400 mt-4">Nenhum anúncio encontrado. Tente ajustar os filtros.</p>
          </div>
        )}

        {result && result.items?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.items.map((item, i) => {
              const price = formatPrice(item.price);
              const km = formatKm(item.km);
              return (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-yellow-600/40 transition-colors">
                  <div className="relative w-full h-44 bg-gray-800 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <CarIcon />
                    )}
                    <span className="absolute top-2.5 left-2.5 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow"
                      style={{ backgroundColor: item.platform.color }}>
                      {item.platform.name}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2">{item.title}</h3>

                    {price && (
                      <p className="text-yellow-400 font-bold text-xl mb-2">{price}</p>
                    )}

                    {(item.year || km) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-2">
                        {item.year && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                              <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
                              <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
                              <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                            </svg>
                            {item.year}
                          </span>
                        )}
                        {km && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" strokeWidth={2} />
                              <polyline points="12 6 12 12 16 14" strokeWidth={2} />
                            </svg>
                            {km}
                          </span>
                        )}
                      </div>
                    )}

                    {!price && (
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 flex-1 mb-2">{item.snippet}</p>
                    )}

                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                      className="mt-auto w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl text-center text-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      Ver anúncio
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!searched && (
          <div className="text-center py-16 text-gray-600">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth={1.5} />
              <path strokeLinecap="round" strokeWidth={1.5} d="M21 21l-4.35-4.35" />
            </svg>
            <p className="text-sm">Preencha a marca, modelo e estado para buscar</p>
            <p className="text-xs mt-1 opacity-60">OLX · Webmotors · iCarros · Mercado Livre · Seminovos</p>
          </div>
        )}

      </main>
    </div>
  );
}
