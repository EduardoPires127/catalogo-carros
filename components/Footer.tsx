import Link from "next/link";
import Image from "next/image";
import { STORE_NAME } from "@/data/cars";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-yellow-900/30">
      <div className="h-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.jpeg" alt={STORE_NAME} width={36} height={36} className="rounded-lg" />
              <span className="text-white font-bold text-lg">{STORE_NAME}</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sua loja de confiança para encontrar o carro dos seus sonhos com procedência e os melhores preços.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-yellow-400 font-semibold text-sm uppercase tracking-wider mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-yellow-400 transition-colors">Início</Link></li>
              <li><Link href="/catalogo" className="hover:text-yellow-400 transition-colors">Estoque completo</Link></li>
              <li><Link href="/marketplace" className="hover:text-yellow-400 transition-colors">Marketplace</Link></li>
            </ul>
          </div>

          {/* Mapa */}
          <div className="w-full h-40 rounded-xl overflow-hidden border border-gray-700">
            <iframe
              src="https://maps.google.com/maps?q=Balneário+Camboriú,+Santa+Catarina,+Brasil&output=embed&z=13&hl=pt-BR"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização - Balneário Camboriú"
            />
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} {STORE_NAME}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
