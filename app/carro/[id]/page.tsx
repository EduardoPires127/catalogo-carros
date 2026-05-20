import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarById } from "@/lib/cars-db";
import ImageGallery from "@/components/ImageGallery";

const statusConfig = {
  disponivel: { label: "Disponível", className: "bg-yellow-100 text-yellow-800" },
  vendido: { label: "Vendido", className: "bg-gray-200 text-gray-600" },
};

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) return notFound();

  const status = statusConfig[car.status];
  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no ${car.brand} ${car.model} ${car.version} ${car.year} (${car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}). Ainda está disponível?`
  );
  const whatsappLink = `https://wa.me/${car.whatsapp}?text=${whatsappMsg}`;

  const specs = [
    { label: "Ano", value: car.year },
    { label: "KM", value: car.mileage.toLocaleString("pt-BR") + " km" },
    { label: "Combustível", value: car.fuel },
    { label: "Câmbio", value: car.transmission },
    { label: "Portas", value: car.doors },
    { label: "Cor", value: car.color },
  ];

  return (
    <main className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-yellow-600 transition-colors">Início</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/catalogo" className="hover:text-yellow-600 transition-colors">Estoque</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{car.brand} {car.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="relative">
            <ImageGallery images={car.images} alt={`${car.brand} ${car.model}`} />
            {car.status === "vendido" && (
              <div className="absolute inset-0 top-0 h-[calc(100%-4.5rem)] rounded-2xl bg-black/50 flex items-center justify-center pointer-events-none">
                <span className="text-white font-bold text-2xl rotate-[-20deg] border-2 border-white px-6 py-2 rounded">
                  VENDIDO
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{car.brand} {car.model}</h1>
                <p className="text-gray-500 mt-1">{car.version}</p>
              </div>
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${status.className}`}>
                {status.label}
              </span>
            </div>

            <p className="text-4xl font-bold text-gray-900 mt-4 mb-6">
              {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">{spec.label}</p>
                  <p className="font-semibold text-gray-900 text-sm">{spec.value}</p>
                </div>
              ))}
            </div>

            {car.description && (
              <div className="mb-6">
                <h2 className="font-semibold text-gray-900 mb-2">Descrição</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{car.description}</p>
              </div>
            )}

            {car.features.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-gray-900 mb-3">Opcionais</h2>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature) => (
                    <span key={feature} className="bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs px-3 py-1.5 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {car.status !== "vendido" ? (
              <div className="flex gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold text-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Tenho interesse
                </a>
                <Link
                  href="/catalogo"
                  className="px-5 py-3.5 rounded-xl border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-600 font-medium transition-colors"
                >
                  Ver outros
                </Link>
              </div>
            ) : (
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-gray-700 font-semibold">Este veículo já foi vendido</p>
                <Link href="/catalogo" className="text-yellow-600 hover:underline text-sm mt-1 inline-block">
                  Ver outros carros disponíveis →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
