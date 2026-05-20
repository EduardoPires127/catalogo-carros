import { NextRequest, NextResponse } from "next/server";
import { updateCar, deleteCar } from "@/lib/cars-db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const car = await updateCar(id, body);

  if (!car) {
    return NextResponse.json({ error: "Erro ao atualizar carro" }, { status: 500 });
  }

  return NextResponse.json(car);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await deleteCar(id);

  if (!ok) {
    return NextResponse.json({ error: "Erro ao deletar carro" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
