import Link from "next/link";
import CarForm from "@/components/CarForm";
import { getCarById } from "@/lib/cars-db";
import { notFound } from "next/navigation";

export default async function EditarCarroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) return notFound();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-black border-b border-yellow-600/30 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-gray-400 hover:text-yellow-400 transition-colors">
            ← Voltar
          </Link>
          <h1 className="font-bold text-lg">Editar: {car.brand} {car.model}</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <CarForm initialData={car} carId={id} />
      </main>
    </div>
  );
}
