"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Car } from "@/types/car";

type CarFormData = Omit<Car, "id" | "whatsapp">;

interface CarFormProps {
  initialData?: Partial<Car>;
  carId?: string;
}

const defaultData: CarFormData = {
  brand: "",
  model: "",
  version: "",
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  color: "",
  fuel: "Flex",
  transmission: "Manual",
  doors: 4,
  status: "disponivel",
  images: [],
  description: "",
  features: [],
};

interface FipeResult {
  preco: number;
  preco_formatado: string;
  codigo_fipe: string;
  mes_referencia: string;
  error?: string;
}

export default function CarForm({ initialData, carId }: CarFormProps) {
  const [form, setForm] = useState<CarFormData>({ ...defaultData, ...initialData });
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [featuresText, setFeaturesText] = useState((initialData?.features ?? []).join(", "));
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fipe, setFipe] = useState<FipeResult | null>(initialData?.fipe_price ? {
    preco: initialData.fipe_price,
    preco_formatado: initialData.fipe_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }),
    codigo_fipe: initialData.fipe_code ?? "",
    mes_referencia: initialData.fipe_ref ?? "",
  } : null);
  const [fipeLoading, setFipeLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchFipe = useCallback(async (brand: string, model: string, year: number) => {
    if (!brand.trim() || !model.trim() || !year) return;
    setFipeLoading(true);
    setFipe(null);
    try {
      const res = await fetch(`/api/fipe?marca=${encodeURIComponent(brand)}&modelo=${encodeURIComponent(model)}&ano=${year}`);
      const data: FipeResult = await res.json();
      setFipe(data);
    } catch {
      setFipe({ preco: 0, preco_formatado: "", codigo_fipe: "", mes_referencia: "", error: "Erro ao consultar" });
    }
    setFipeLoading(false);
  }, []);

  // Auto-consulta com debounce quando marca/modelo/ano mudam
  useEffect(() => {
    if (!form.brand || !form.model || !form.year) return;
    const t = setTimeout(() => fetchFipe(form.brand, form.model, form.year), 1000);
    return () => clearTimeout(t);
  }, [form.brand, form.model, form.year, fetchFipe]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setImages((prev) => [...prev, url]);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  const isEditing = !!carId;

  function set(field: keyof CarFormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: CarFormData = {
      ...form,
      images,
      features: featuresText.split(",").map(s => s.trim()).filter(Boolean),
      ...(fipe && !fipe.error ? {
        fipe_price: fipe.preco,
        fipe_code:  fipe.codigo_fipe,
        fipe_ref:   fipe.mes_referencia,
      } : {}),
    };

    const url = isEditing ? `/api/admin/cars/${carId}` : "/api/admin/cars";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Erro ao salvar. Verifique os dados e tente novamente.");
    }
    setLoading(false);
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-yellow-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações básicas */}
      <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-yellow-500 text-black rounded-full text-xs flex items-center justify-center font-bold">1</span>
          Informações básicas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Marca *</label>
            <input value={form.brand} onChange={e => set("brand", e.target.value)} className={inputClass} placeholder="Ex: Toyota" required />
          </div>
          <div>
            <label className={labelClass}>Modelo *</label>
            <input value={form.model} onChange={e => set("model", e.target.value)} className={inputClass} placeholder="Ex: Corolla" required />
          </div>
          <div>
            <label className={labelClass}>Versão *</label>
            <input value={form.version} onChange={e => set("version", e.target.value)} className={inputClass} placeholder="Ex: XEi 2.0 Flex" required />
          </div>
          <div>
            <label className={labelClass}>Ano *</label>
            <input type="number" value={form.year} onChange={e => set("year", Number(e.target.value))} className={inputClass} min={1990} max={2030} required />
          </div>
          <div>
            <label className={labelClass}>Cor *</label>
            <input value={form.color} onChange={e => set("color", e.target.value)} className={inputClass} placeholder="Ex: Prata" required />
          </div>
          <div>
            <label className={labelClass}>Portas</label>
            <select value={form.doors} onChange={e => set("doors", Number(e.target.value))} className={inputClass}>
              <option value={2}>2 portas</option>
              <option value={4}>4 portas</option>
            </select>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-yellow-500 text-black rounded-full text-xs flex items-center justify-center font-bold">2</span>
          Valores e quilometragem
        </h2>

        {/* FIPE */}
        <div className={`mb-4 rounded-xl border p-4 flex items-center gap-4 transition-all ${
          fipeLoading ? "border-yellow-700/40 bg-yellow-900/10" :
          fipe && !fipe.error ? "border-green-700/40 bg-green-900/10" :
          fipe?.error ? "border-red-700/30 bg-red-900/10" :
          "border-gray-700 bg-gray-800/50"
        }`}>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Tabela FIPE</p>
            {fipeLoading && (
              <p className="text-yellow-400 text-sm animate-pulse">Consultando FIPE...</p>
            )}
            {!fipeLoading && fipe && !fipe.error && (
              <>
                <p className="text-green-400 text-xl font-bold">{fipe.preco_formatado}</p>
                <p className="text-gray-500 text-xs mt-0.5">Cód. {fipe.codigo_fipe} · Ref. {fipe.mes_referencia}</p>
              </>
            )}
            {!fipeLoading && fipe?.error && (
              <p className="text-red-400 text-sm">Não encontrado na tabela FIPE</p>
            )}
            {!fipeLoading && !fipe && (
              <p className="text-gray-500 text-sm">Preencha marca, modelo e ano para consultar</p>
            )}
          </div>
          {fipe && !fipe.error && form.price > 0 && (
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500">Diferença</p>
              <p className={`text-sm font-bold ${form.price < fipe.preco ? "text-green-400" : "text-red-400"}`}>
                {form.price < fipe.preco
                  ? `${((1 - form.price / fipe.preco) * 100).toFixed(0)}% abaixo`
                  : `${((form.price / fipe.preco - 1) * 100).toFixed(0)}% acima`
                }
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Preço (R$) *</label>
            <input type="number" value={form.price} onChange={e => set("price", Number(e.target.value))} className={inputClass} min={0} required />
          </div>
          <div>
            <label className={labelClass}>Quilometragem *</label>
            <input type="number" value={form.mileage} onChange={e => set("mileage", Number(e.target.value))} className={inputClass} min={0} required />
          </div>
          <div>
            <label className={labelClass}>Status *</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} className={inputClass}>
              <option value="disponivel">Disponível</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
        </div>
      </section>

      {/* Motor */}
      <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-yellow-500 text-black rounded-full text-xs flex items-center justify-center font-bold">3</span>
          Motor e câmbio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Combustível *</label>
            <select value={form.fuel} onChange={e => set("fuel", e.target.value)} className={inputClass}>
              <option value="Flex">Flex</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Etanol">Etanol</option>
              <option value="Diesel">Diesel</option>
              <option value="GNV">GNV</option>
              <option value="Elétrico">Elétrico</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Câmbio *</label>
            <select value={form.transmission} onChange={e => set("transmission", e.target.value)} className={inputClass}>
              <option value="Manual">Manual</option>
              <option value="Automático">Automático</option>
              <option value="CVT">CVT</option>
            </select>
          </div>
        </div>
      </section>

      {/* Fotos */}
      <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
          <span className="w-6 h-6 bg-yellow-500 text-black rounded-full text-xs flex items-center justify-center font-bold">4</span>
          Fotos
        </h2>
        <p className="text-gray-400 text-xs mb-4">Selecione as fotos do celular ou computador. Pode enviar várias de uma vez.</p>

        {/* Preview das fotos */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {images.map((url, i) => (
              <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-700 group">
                <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="96px" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                >
                  Remover
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-yellow-500 text-black text-xs px-1.5 rounded font-bold">Capa</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botão de upload */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-600 hover:border-yellow-500 rounded-xl py-8 text-center transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <p className="text-yellow-400 font-medium">Enviando fotos...</p>
          ) : (
            <>
              <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-sm">Clique para selecionar fotos</p>
              <p className="text-gray-600 text-xs mt-1">JPG, PNG ou WEBP — várias de uma vez</p>
            </>
          )}
        </button>
      </section>

      {/* Descrição e opcionais */}
      <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-yellow-500 text-black rounded-full text-xs flex items-center justify-center font-bold">5</span>
          Descrição e opcionais
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              className={`${inputClass} h-24 resize-none`}
              placeholder="Descreva o veículo, histórico, estado de conservação..."
            />
          </div>
          <div>
            <label className={labelClass}>Opcionais</label>
            <input
              value={featuresText}
              onChange={e => setFeaturesText(e.target.value)}
              className={inputClass}
              placeholder="Ar condicionado, Câmera de ré, Multimídia, Sensor de estacionamento"
            />
            <p className="text-gray-500 text-xs mt-1">Separe por vírgula</p>
          </div>
        </div>
      </section>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-colors text-lg"
        >
          {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Adicionar carro"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="px-6 py-3.5 rounded-xl border border-gray-700 text-gray-300 hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
