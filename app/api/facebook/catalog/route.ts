import { NextResponse } from "next/server";
import { getAllCars } from "@/lib/cars-db";
import { STORE_NAME, STORE_DESCRIPTION } from "@/data/cars";

function escape(str: string | number) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim();
  const cars = await getAllCars();
  const available = cars.filter((c) => c.status === "disponivel");

  const items = available.map((car) => {
    const image = car.images?.[0] ?? "";
    const title = `${car.brand} ${car.model} ${car.version} ${car.year}`;
    const price = car.price.toFixed(2);
    const desc = car.description ||
      `${car.brand} ${car.model} ${car.year} — ${car.mileage.toLocaleString("pt-BR")} km, ${car.fuel}, ${car.transmission}.`;

    return `    <item>
      <g:id>${escape(car.id)}</g:id>
      <g:title>${escape(title)}</g:title>
      <g:description>${escape(desc)}</g:description>
      <g:link>${escape(`${siteUrl}/carro/${car.id}`)}</g:link>
      ${image ? `<g:image_link>${escape(image)}</g:image_link>` : ""}
      <g:condition>used</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${escape(price)} BRL</g:price>
      <g:brand>${escape(car.brand)}</g:brand>
      <g:google_product_category>916</g:google_product_category>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escape(STORE_NAME)}</title>
    <link>${escape(siteUrl)}</link>
    <description>${escape(STORE_DESCRIPTION)}</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
