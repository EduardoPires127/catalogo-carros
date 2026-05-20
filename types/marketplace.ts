export interface Dealer {
  id: string;
  slug: string;
  company_name: string;
  cnpj: string;
  logo_url: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface MarketplaceCar {
  id: string;
  dealer_id: string;
  dealer: Pick<Dealer, "id" | "slug" | "company_name" | "logo_url" | "city" | "state">;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuel: string;
  transmission: string;
  doors: number;
  status: "disponivel" | "vendido";
  images: string[];
  description: string;
  features: string[];
  created_at: string;
}
