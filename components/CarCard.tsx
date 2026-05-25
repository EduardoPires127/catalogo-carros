import Link from "next/link";
import Image from "next/image";
import { Car } from "@/types/car";

interface CarCardProps {
  car: Car;
}

const statusConfig = {
  disponivel: { label: "Disponível", className: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
  vendido:    { label: "Vendido",    className: "bg-gray-100 text-gray-500 border border-gray-200" },
};

export default function CarCard({ car }: CarCardProps) {
  const status = statusConfig[car.status as keyof typeof statusConfig] ?? statusConfig.disponivel;
  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no ${car.brand} ${car.model} ${car.version} ${car.year}. Ainda está disponível?`
  );
  const whatsappLink = `https://wa.me/${car.whatsapp}?text=${whatsappMsg}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden group border border-gray-100 hover:border-yellow-300 hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <Link href={`/carro/${car.id}`} className="block relative h-52 overflow-hidden bg-gray-100">
        <Image
          src={car.images[0]}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
            {status.label}
          </span>
        </div>
        {car.status === "vendido" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-lg rotate-[-20deg] border-2 border-white px-4 py-1 rounded">
              VENDIDO
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/carro/${car.id}`}>
          <h2 className="font-bold text-gray-900 text-lg leading-tight hover:text-yellow-600 transition-colors">
            {car.brand} {car.model}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">{car.version}</p>
        </Link>

        {/* Specs */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {car.year}
          </span>
          <span className="text-gray-200">|</span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {car.fuel}
          </span>
          <span className="text-gray-200">|</span>
          <span>{car.mileage.toLocaleString("pt-BR")} km</span>
        </div>

        {/* Price */}
        <div className="mt-3 mb-4">
          <p className="text-2xl font-bold text-yellow-600">
            {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
          </p>
          {car.fipe_price && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">
                FIPE: {car.fipe_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
              </span>
              {car.price < car.fipe_price && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                  {((1 - car.price / car.fipe_price) * 100).toFixed(0)}% abaixo
                </span>
              )}
              {car.price > car.fipe_price && (
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                  {((car.price / car.fipe_price - 1) * 100).toFixed(0)}% acima
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/carro/${car.id}`}
            className="flex-1 text-center border border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 text-yellow-700 text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Ver detalhes
          </Link>
          {car.status !== "vendido" && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
