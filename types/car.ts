export type FuelType = "Flex" | "Gasolina" | "Etanol" | "Diesel" | "GNV" | "Elétrico" | "Híbrido";
export type Transmission = "Manual" | "Automático" | "CVT";
export type CarStatus = "disponivel" | "vendido";

export interface Car {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuel: FuelType;
  transmission: Transmission;
  doors: number;
  status: CarStatus;
  images: string[];
  description: string;
  features: string[];
  whatsapp: string;
  fipe_price?: number;
  fipe_code?: string;
  fipe_ref?: string;
}
