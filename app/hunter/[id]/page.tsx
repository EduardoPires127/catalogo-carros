"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface HunterDetail {
  id: string;
  title: string;
  price: number;
  condition: string;
  pictures: string[];
  thumbnail: string;
  permalink: string;
  location: Record<string, string> | null;
  seller: { nickname: string };
  attributes: Record<string, string>;
  description: string;
}

const ATTR_PRIORITY = [
  "Marca", "Modelo", "Versão", "Ano do modelo", "Quilometragem",
  "Combustível", "Transmissão", "Cor", "Portas", "Motor",
];

export default function HunterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<HunterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/hunter/item/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setItem(data);
      } catch {
        setError("Veículo não encontrado.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-10 h-10 text-yellow-500 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-gray-400">Carregando veículo...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{error || "Veículo não encontrado."}</p>
          <button onClick={() => router.back()} className="text-yellow-400 hover:underline">← Voltar</button>
        </div>
      </div>
    );
  }

  const pics = item.pictures.length > 0 ? item.pictures : [item.thumbnail];
  const conditionLabel = item.condition === "new" ? "Novo" : "Usado";
  const locationStr = [item.location?.city_name, item.location?.state_name].filter(Boolean).join(", ");
  const priorityAttrs = ATTR_PRIORITY.map(k => item.attributes[k] ? [k, item.attributes[k]] : null).filter(Boolean) as [string, string][];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="max-w-6xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/hunter" className="hover:text-yellow-400 transition-colors">Hunter Car</Link>
          <span>/</span>
          <span className="text-gray-300 line-clamp-1">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 mb-3">
              {pics[activeImg] && (
                <Image src={pics[activeImg]} alt={item.title} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 50vw" unoptimized />
              )}
              <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${item.condition === "new" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}>
                {conditionLabel}
              </span>
            </div>
            {pics.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {pics.map((p, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-yellow-500" : "border-gray-700 hover:border-gray-500"}`}>
                    <Image src={p} alt="" fill className="object-cover" sizes="64px" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight mb-3">{item.title}</h1>
              <p className="text-yellow-400 text-3xl font-bold">
                {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
              </p>
              {locationStr && (
                <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {locationStr}
                </p>
              )}
            </div>

            {priorityAttrs.length > 0 && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Características</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {priorityAttrs.map(([key, val]) => (
                    <div key={key}>
                      <p className="text-xs text-gray-500">{key}</p>
                      <p className="text-sm text-white font-medium">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <a href={item.permalink} target="_blank" rel="noopener noreferrer" className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl text-center transition-colors text-lg">
              Ver no Mercado Livre ↗
            </a>

            {item.seller.nickname && (
              <p className="text-gray-500 text-xs text-center">Vendedor: <span className="text-gray-400">{item.seller.nickname}</span></p>
            )}

            <button onClick={() => router.back()} className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm">
              ← Voltar à busca
            </button>
          </div>
        </div>

        {item.description && (
          <div className="mt-8 bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="font-semibold text-white mb-3">Descrição do vendedor</h2>
            <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{item.description}</p>
          </div>
        )}

        {Object.keys(item.attributes).length > 0 && (
          <div className="mt-6 bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="font-semibold text-white mb-4">Especificações completas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
              {Object.entries(item.attributes).map(([key, val]) => (
                <div key={key} className="py-1.5 border-b border-gray-800 last:border-0">
                  <p className="text-xs text-gray-500">{key}</p>
                  <p className="text-sm text-white">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
