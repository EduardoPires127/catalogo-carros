import { getAllCars } from "@/lib/cars-db";
import { STORE_NAME, STORE_DESCRIPTION } from "@/data/cars";
import { Car, FuelType, Transmission } from "@/types/car";

// Altere para a URL do seu site quando publicar (ex: https://revendavendaauto.com.br)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function mapFuel(fuel: FuelType): string {
  const map: Record<FuelType, string> = {
    Flex: "Flex Fuel",
    Gasolina: "Gasoline",
    Etanol: "Ethanol",
    Diesel: "Diesel",
    Elétrico: "Electric",
    Híbrido: "Hybrid",
  };
  return map[fuel] ?? fuel;
}

function mapTransmission(t: Transmission): string {
  const map: Record<Transmission, string> = {
    Automático: "Automatic",
    Manual: "Manual",
    CVT: "Automatic",
  };
  return map[t] ?? t;
}

function mapAvailability(status: Car["status"]): string {
  if (status === "disponivel") return "in stock";
  return "out of stock";
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildXml(cars: Awaited<ReturnType<typeof getAllCars>>): string {
  const items = cars
    .map((car) => {
      const title = `${car.brand} ${car.model} ${car.version} ${car.year}`;
      const url = `${SITE_URL}/carro/${car.id}`;
      const imageLink = car.images[0];
      const additionalImages = car.images
        .slice(1)
        .map((img) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join("\n        ");

      return `
    <item>
      <g:id>${escapeXml(car.id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(car.description)}</g:description>
      <g:link>${escapeXml(url)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      ${additionalImages}
      <g:price>${car.price} BRL</g:price>
      <g:availability>${mapAvailability(car.status)}</g:availability>
      <g:condition>used</g:condition>
      <g:make>${escapeXml(car.brand)}</g:make>
      <g:model>${escapeXml(car.model)}</g:model>
      <g:year>${car.year}</g:year>
      <g:mileage>${car.mileage} KM</g:mileage>
      <g:exterior_color>${escapeXml(car.color)}</g:exterior_color>
      <g:fuel_type>${mapFuel(car.fuel)}</g:fuel_type>
      <g:transmission>${mapTransmission(car.transmission)}</g:transmission>
      <g:trim>${escapeXml(car.version)}</g:trim>
      <g:doors>${car.doors}</g:doors>
      <g:state_of_vehicle>used</g:state_of_vehicle>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(STORE_NAME)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(STORE_DESCRIPTION)}</description>
    ${items}
  </channel>
</rss>`;
}

export async function GET() {
  const cars = await getAllCars();
  const xml = buildXml(cars);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Permite que o Facebook acesse o feed
      "Access-Control-Allow-Origin": "*",
      // Cache de 1 hora
      "Cache-Control": "public, max-age=3600",
    },
  });
}
