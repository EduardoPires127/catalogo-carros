import { NextRequest, NextResponse } from "next/server";
import { getAllCars, createCar } from "@/lib/cars-db";

export async function GET() {
  const cars = await getAllCars();
  return NextResponse.json(cars);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const car = await createCar(body);

  if (!car) {
    return NextResponse.json({ error: "Erro ao criar carro" }, { status: 500 });
  }

  return NextResponse.json(car, { status: 201 });
}
