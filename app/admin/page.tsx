"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car } from "@/types/car";

const statusLabel = {
  disponivel: { label: "Disponível", className: "bg-yellow-100 text-yellow-800" },
  vendido: { label: "Vendido", className: "bg-gray-200 text-gray-600" },
};

export default function AdminPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const router = useRouter();

  async function handleMarkVendido(id: string) {
    setMarking(id);
    await fetch(`/api/admin/cars/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "vendido" }),
    });
    await loadCars();
    setMarking(null);
  }

  async function loadCars() {
    const res = await fetch("/api/admin/cars");
    if (res.ok) {
      const data = await res.json();
      setCars(data);
    }
    setLoading(false);
  }

  useEffect(() => { loadCars(); }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deletar "${name}"? Essa ação não pode ser desfeita.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
    await loadCars();
    setDeleting(null);
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-black border-b border-yellow-600/30 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 rounded-lg p-1.5">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="font-bold text-lg">Painel Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
              Ver site ↗
            </Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition-colors">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", value: cars.length, color: "text-white" },
            { label: "Disponíveis", value: cars.filter(c => c.status === "disponivel").length, color: "text-yellow-400" },
            { label: "Vendidos", value: cars.filter(c => c.status === "vendido").length, color: "text-gray-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Todos os carros</h2>
          <Link
            href="/admin/novo"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar carro
          </Link>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Carregando...</div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">Nenhum carro cadastrado ainda.</p>
            <Link href="/admin/novo" className="text-yellow-400 hover:underline font-medium">
              Adicionar o primeiro carro →
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">Veículo</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Ano / KM</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Preço</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => {
                  const st = statusLabel[car.status];
                  return (
                    <tr key={car.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{car.brand} {car.model}</p>
                        <p className="text-gray-400 text-xs">{car.version}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-300">
                        {car.year} · {car.mileage.toLocaleString("pt-BR")} km
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-semibold text-white">
                        {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.className}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {car.status !== "vendido" && (
                            <button
                              onClick={() => handleMarkVendido(car.id)}
                              disabled={marking === car.id}
                              className="text-gray-400 hover:text-white font-medium text-xs px-3 py-1.5 border border-gray-700 rounded-lg transition-colors disabled:opacity-40"
                            >
                              {marking === car.id ? "..." : "Vendido"}
                            </button>
                          )}
                          <Link
                            href={`/admin/${car.id}`}
                            className="text-yellow-400 hover:text-yellow-300 font-medium text-xs px-3 py-1.5 border border-yellow-600/30 rounded-lg transition-colors"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(car.id, `${car.brand} ${car.model}`)}
                            disabled={deleting === car.id}
                            className="text-gray-400 hover:text-red-400 font-medium text-xs px-3 py-1.5 border border-gray-700 rounded-lg transition-colors disabled:opacity-40"
                          >
                            {deleting === car.id ? "..." : "Deletar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
