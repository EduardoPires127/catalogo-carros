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
                  <p className="text-gray-400 text-sm mt-1">Você será notificado por e-mail se for superado.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div>
                    <label className={labelClass}>Seu nome *</label>
                    <input value={msgName} onChange={e => setMsgName(e.target.value)} className={inputClass} placeholder="João Silva" required />
                  </div>
                  <div>
                    <label className={labelClass}>Seu e-mail *</label>
                    <input type="email" value={msgEmail} onChange={e => setMsgEmail(e.target.value)} className={inputClass} placeholder="joao@email.com" required />
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
