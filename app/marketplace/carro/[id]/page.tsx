"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { STATIC_MARKETPLACE_CARS, STATIC_DEALERS } from "@/data/marketplace";

export default function MarketplaceCarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const car = STATIC_MARKETPLACE_CARS.find(c => c.id === id);
  const dealer = car ? STATIC_DEALERS.find(d => d.id === car.dealer_id) : null;

  const [activeImg, setActiveImg] = useState(0);
  const [msgName, setMsgName] = useState("");
  const [msgEmail, setMsgEmail] = useState("");
  const [msgText, setMsgText] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!car || !dealer) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Veículo não encontrado.</p>
          <button onClick={() => router.back()} className="text-yellow-400 hover:underline">← Voltar</button>
        </div>
      </div>
    );
  }

  const pics = car.images.length > 0 ? car.images : [];
  const hasPics = pics.length > 0;

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // TODO: connect to API
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setSending(false);
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:outline-none focus:border-yellow-500 placeholder-gray-600";
  const labelClass = "block text-xs font-medium text-gray-400 mb-1";

  const dealerInitials = dealer.company_name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href="/marketplace" className="hover:text-yellow-400 transition-colors">Auto Avaliar</Link>
          <span>/</span>
          <Link href={`/marketplace/${dealer.slug}`} className="hover:text-yellow-400 transition-colors">{dealer.company_name}</Link>
          <span>/</span>
          <span className="text-gray-300">{car.brand} {car.model}</span>
        </div>

        {/* Status leilão */}
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">LEILÃO AO VIVO</span>
          <span className="text-gray-400 text-sm">Encerra em <span className="text-yellow-400 font-mono font-bold">02:34:17</span></span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-400 text-sm">14 lances</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Gallery + Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div>
              <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center mb-3">
                {hasPics ? (
                  <img src={pics[activeImg]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-20 h-20 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                )}
              </div>
              {hasPics && pics.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {pics.map((p, i) => (
                    <button key={i} onClick={() => setActiveImg(i)} className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-yellow-500" : "border-gray-700"}`}>
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + Price */}
            <div>
              <h1 className="text-2xl font-bold">{car.brand} {car.model}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{car.version} · {car.year}</p>
              <div className="mt-3 bg-gray-900 border border-yellow-600/30 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Lance atual</p>
                <p className="text-yellow-400 text-3xl font-bold">
                  {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Próximo lance mínimo: {(car.price + 5000).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                </p>
                {car.fipe_price && (
                  <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-gray-400">
                      Tabela FIPE: <span className="text-gray-200 font-semibold">
                        {car.fipe_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                      </span>
                    </span>
                    {car.price < car.fipe_price ? (
                      <span className="text-xs font-bold text-green-400 bg-green-900/30 border border-green-700/40 px-2 py-0.5 rounded-full">
                        {((1 - car.price / car.fipe_price) * 100).toFixed(0)}% abaixo da FIPE ↓
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-400 bg-red-900/20 border border-red-700/30 px-2 py-0.5 rounded-full">
                        {((car.price / car.fipe_price - 1) * 100).toFixed(0)}% acima da FIPE ↑
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Specs grid */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Características</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                {[
                  { label: "Ano", value: car.year },
                  { label: "Quilometragem", value: `${car.mileage.toLocaleString("pt-BR")} km` },
                  { label: "Combustível", value: car.fuel },
                  { label: "Câmbio", value: car.transmission },
                  { label: "Cor", value: car.color },
                  { label: "Portas", value: `${car.doors} portas` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-white font-medium text-sm mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Descrição</h2>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{car.description}</p>
              </div>
            )}

            {/* Features */}
            {car.features.length > 0 && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Opcionais</h2>
                <div className="flex flex-wrap gap-2">
                  {car.features.map(f => (
                    <span key={f} className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Documentação */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Documentação</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "CRLV em dia",          ok: true  },
                  { label: "IPVA pago",             ok: true  },
                  { label: "Multas pendentes",      ok: false },
                  { label: "Restrição judicial",    ok: false },
                  { label: "Recall pendente",       ok: false },
                  { label: "Financiamento quitado", ok: true  },
                ].map(({ label, ok }) => (
                  <div key={label} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium ${
                    ok
                      ? "bg-green-900/20 border-green-700/40 text-green-400"
                      : "bg-gray-800 border-gray-700 text-gray-500 line-through"
                  }`}>
                    <span className="text-base leading-none">{ok ? "✅" : "—"}</span>
                    {label}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">* Informações declaradas pelo leiloeiro. Verifique antes de arrematar.</p>
            </div>

            {/* Laudo Cautelar */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Laudo Cautelar</h2>
                </div>
                <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-700/40">
                  APROVADO
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Chassi original",      ok: true  },
                  { label: "Motor original",        ok: true  },
                  { label: "Sinistro grave",        ok: false },
                  { label: "Lataria original",      ok: true  },
                  { label: "Hodômetro adulterado",  ok: false },
                  { label: "Veículo clonado",       ok: false },
                ].map(({ label, ok }) => (
                  <div key={label} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium ${
                    ok
                      ? "bg-green-900/20 border-green-700/40 text-green-400"
                      : "bg-gray-800 border-gray-700 text-gray-500 line-through"
                  }`}>
                    <span className="text-base leading-none">{ok ? "✅" : "—"}</span>
                    {label}
                  </div>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-700/40 text-blue-400 hover:bg-blue-900/20 text-sm font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Baixar laudo completo (PDF)
              </button>
            </div>
          </div>

          {/* Right: Dealer + Message */}
          <div className="space-y-5">
            {/* Dealer card */}
            <Link href={`/marketplace/${dealer.slug}`} className="block bg-gray-900 rounded-2xl border border-gray-800 hover:border-yellow-600/40 transition-colors p-5">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Leiloeiro</p>
              <div className="flex items-center gap-3">
                {dealer.logo_url ? (
                  <img src={dealer.logo_url} alt={dealer.company_name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-bold text-sm">
                    {dealerInitials}
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold">{dealer.company_name}</p>
                  <p className="text-gray-400 text-xs">{dealer.city} · {dealer.state}</p>
                </div>
              </div>
              <p className="text-yellow-400 text-xs mt-3 hover:text-yellow-300">Ver perfil completo →</p>
            </Link>

            {/* Message form */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Dar lance
              </h2>

              {sent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold">Lance registrado!</p>
                  <p className="text-gray-400 text-sm mt-1">O leiloeiro entrará em contato pelo WhatsApp informado.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div>
                    <label className={labelClass}>Seu nome *</label>
                    <input value={msgName} onChange={e => setMsgName(e.target.value)} className={inputClass} placeholder="João Silva" required />
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp / Telefone *</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <input
                        type="tel"
                        value={msgEmail}
                        onChange={e => setMsgEmail(e.target.value)}
                        className={`${inputClass} pl-9`}
                        placeholder="(47) 99999-0000"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Valor do seu lance (R$) *</label>
                    <input
                      type="number"
                      value={msgText}
                      onChange={e => setMsgText(e.target.value)}
                      className={inputClass}
                      placeholder={`Mín: ${(car.price + 5000).toLocaleString("pt-BR")}`}
                      min={car.price + 5000}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {sending ? "Registrando..." : "Confirmar lance"}
                  </button>
                </form>
              )}
            </div>

            <button onClick={() => router.back()} className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">
              ← Voltar aos leilões
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
