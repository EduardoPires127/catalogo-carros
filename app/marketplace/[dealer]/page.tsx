import { notFound } from "next/navigation";
import Link from "next/link";
import { STATIC_DEALERS, STATIC_MARKETPLACE_CARS } from "@/data/marketplace";

function DealerInitials({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  return (
    <div className="w-20 h-20 flex items-center justify-center bg-yellow-500 text-black font-bold text-2xl rounded-2xl">
      {initials}
    </div>
  );
}

export default async function DealerPage({ params }: { params: Promise<{ dealer: string }> }) {
  const { dealer: slug } = await params;
  const dealer = STATIC_DEALERS.find(d => d.slug === slug);
  if (!dealer) notFound();

  const cars = STATIC_MARKETPLACE_CARS.filter(c => c.dealer_id === dealer.id && c.status === "disponivel");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/marketplace" className="hover:text-yellow-400 transition-colors">Auto Avaliar</Link>
          <span>/</span>
          <span className="text-gray-300">{dealer.company_name}</span>
        </div>

        {/* Dealer header */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-8">
          <div className="flex items-start gap-5">
            {dealer.logo_url ? (
              <img src={dealer.logo_url} alt={dealer.company_name} className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <DealerInitials name={dealer.company_name} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">{dealer.company_name}</h1>
                  <p className="text-gray-400 text-sm mt-0.5">{dealer.city} · {dealer.state}</p>
                </div>
                <span className="flex-shrink-0 bg-green-500/10 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/20">
                  Verificada
                </span>
              </div>
              {dealer.description && (
                <p className="text-gray-300 text-sm mt-3 leading-relaxed">{dealer.description}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  CNPJ: {dealer.cnpj}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {dealer.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Veículos disponíveis", value: cars.length, color: "text-yellow-400" },
            { label: "Cidade", value: dealer.city, color: "text-white" },
            { label: "Estado", value: dealer.state, color: "text-white" },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Cars */}
        <h2 className="text-xl font-bold mb-5">Estoque disponível</h2>
        {cars.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Nenhum veículo disponível no momento.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cars.map(car => (
              <Link
                key={car.id}
                href={`/marketplace/carro/${car.id}`}
                className="bg-gray-900 rounded-2xl border border-gray-800 hover:border-yellow-600/50 transition-all hover:-translate-y-0.5 overflow-hidden group"
              >
                <div className="relative w-full h-44 bg-gray-800 flex items-center justify-center">
                  {car.images[0] ? (
                    <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <svg className="w-14 h-14 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-white font-bold">{car.brand} {car.model}</p>
                  <p className="text-gray-400 text-xs mb-2">{car.version} · {car.year}</p>
                  <p className="text-yellow-400 font-bold text-lg">
                    {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                  </p>
                  <div className="flex gap-3 text-xs text-gray-500 mt-2">
                    <span>{car.mileage.toLocaleString("pt-BR")} km</span>
                    <span>·</span>
                    <span>{car.fuel}</span>
                    <span>·</span>
                    <span>{car.transmission}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
