import { getAllCars } from "@/lib/cars-db";
import CatalogoClient from "./CatalogoClient";

export default async function CatalogoPage() {
  const cars = await getAllCars();
  return <CatalogoClient cars={cars} />;
}
