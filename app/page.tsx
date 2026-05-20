import Link from "next/link";
import CarCard from "@/components/CarCard";
import HeroSection from "@/components/HeroSection";
import { STORE_NAME, STORE_DESCRIPTION, WHATSAPP_NUMBER } from "@/data/cars";
import { getAllCars } from "@/lib/cars-db";

export default async function HomePage() {
  const cars = await getAllCars();
  const available = cars.filter((c) => c.status === "disponivel");
  const featured = available.slice(0, 3);

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Vim pelo catálogo online e gostaria de mais informações.`;

  return (
    <main className="bg-white">
      <HeroSection availableCount={available.length} storeDescription={STORE_DESCRIPTION} />

      {/* Stats */}
      <section className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center gap-16">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{cars.length}+</p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide font-medium">Carros no estoque</p>
            </div>
            <div className="w-px bg-gray-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{available.length}</p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide font-medium">Disponíveis agora</p>
            </div>
            <div className="hidden sm:block w-px bg-gray-700" />
            <div className="hidden sm:block text-center">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide font-medium">Com procedência</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-yellow-600 text-sm font-semibold uppercase tracking-widest mb-2">Nossos diferenciais</p>
            <h2 className="text-3xl font-bold text-gray-900">Por que escolher a {STORE_NAME}?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Melhor preço — destaque */}
            <div className="text-center p-8 rounded-2xl bg-yellow-50 border border-yellow-300">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-2xl mb-5">
                <svg className="w-7 h-7 text-yellow-600" viewBox="0 0 24 24" fill="none">
                  {/* Coin */}
                  <circle cx="12" cy="14" r="8" fill="currentColor" fillOpacity="0.2"/>
                  <circle cx="12" cy="14" r="8" stroke="currentColor" strokeWidth="1.5"/>
                  {/* Dollar sign */}
                  <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
                    d="M12 8.5v11M10 11c0-1 1-1.5 2-1.5s2 .5 2 1.5-1 1.5-2 1.5-2 .5-2 1.5 1 1.5 2 1.5 2-.5 2-1.5"/>
                  {/* Tiny tilted crown */}
                  <g transform="translate(15.5,1) rotate(18,3,2.5)">
                    <path fill="currentColor" d="M0 4.5V3L1.5 4 3 .5 4.5 4 6 3v1.5z"/>
                  </g>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Melhor preço</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Preços justos e negociação transparente. Sem surpresas na hora do fechamento.</p>
            </div>

            {[
              {
                icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
                title: "Atendimento ágil",
                desc: "Resposta rápida pelo WhatsApp. Tire dúvidas e agende uma visita na hora.",
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Transparência total",
                desc: "Informamos tudo sobre cada veículo — situação da documentação, histórico e condições reais. Sem surpresas.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-yellow-200 hover:bg-yellow-50/50 transition-all group">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-100 group-hover:bg-yellow-200 rounded-2xl mb-5 transition-colors">
                  <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-yellow-600 text-sm font-semibold uppercase tracking-widest mb-1">Seleção especial</p>
              <h2 className="text-3xl font-bold text-gray-900">Destaques do estoque</h2>
            </div>
            <Link
              href="/catalogo"
              className="text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-1 text-sm"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/catalogo"
              className="inline-block bg-white hover:bg-yellow-50 text-yellow-700 border border-yellow-300 hover:border-yellow-400 px-8 py-3.5 rounded-xl font-bold transition-colors"
            >
              Ver estoque completo ({cars.length} carros)
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-3">Fale conosco</p>
          <h2 className="text-3xl font-bold text-white mb-4">Não encontrou o que procura?</h2>
          <p className="text-gray-400 mb-8 text-base leading-relaxed">
            Fale diretamente conosco pelo WhatsApp e nos diga o carro ideal para você!
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-white px-8 py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-yellow-900/30"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Entrar em contato agora
          </a>
        </div>
      </section>
    </main>
  );
}
