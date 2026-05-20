import { NextResponse } from "next/server";
import { getAllCars } from "@/lib/cars-db";

function escape(str: string | number) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const cars = await getAllCars();
  const available = cars.filter((c) => c.status === "disponivel");

  const items = available.map((car) => {
    const image = car.images?.[0] ?? "";
    const title = `${car.brand} ${car.model} ${car.version} ${car.year}`;
    const price = car.price.toFixed(2);
    const desc = car.description ||
      `${car.brand} ${car.model} ${car.year} — ${car.mileage.toLocaleString("pt-BR")} km, ${car.fuel}, ${car.transmission}.`;

    return `
  <listing>
    <id>${escape(car.id)}</id>
    <title>${escape(title)}</title>
    <description>${escape(desc)}</description>
    <condition>used</condition>
    <availability>in stock</availability>
    <price>${escape(price)} BRL</price>
    <link>${escape(`${siteUrl}/carro/${car.id}`)}</link>
    ${image ? `<image_link>${escape(image)}</image_link>` : ""}
    <make>${escape(car.brand)}</make>
    <model>${escape(car.model)}</model>
    <year>${escape(car.year)}</year>
    <mileage>
      <value>${escape(car.mileage)}</value>
      <unit>KM</unit>
    </mileage>
    <transmission>${escape(car.transmission)}</transmission>
    <fuel_type>${escape(car.fuel)}</fuel_type>
    <exterior_color>${escape(car.color)}</exterior_color>
    <state_of_vehicle>used</state_of_vehicle>
    <body_style>Sedan</body_style>
    <drivetrain>FWD</drivetrain>
  </listing>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<listings>
${items}
</listings>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
