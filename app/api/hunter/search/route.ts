import { NextRequest, NextResponse } from "next/server";

const SCRAPINGBEE_KEY = process.env.SCRAPINGBEE_API_KEY;
const SERPER_KEY = process.env.SERPER_API_KEY;
const DAILY_LIMIT = 100;
const CACHE_TTL = 2 * 60 * 60 * 1000;

const cache = new Map<string, { data: unknown; ts: number }>();
let dailyCount = 0;
let dailyReset = new Date().setHours(24, 0, 0, 0);

type Listing = {
  title: string;
  link: string;
  snippet: string;
  image: string;
  platform: { name: string; color: string };
  price: number | null;
  year: string | null;
  km: number | null;
};

const PLATFORMS: Record<string, { name: string; color: string }> = {
  "olx.com.br":          { name: "OLX",          color: "#8B5CF6" },
  "webmotors.com.br":    { name: "Webmotors",    color: "#EF4444" },
  "icarros.com.br":      { name: "iCarros",      color: "#3B82F6" },
  "mercadolivre.com.br": { name: "Mercado Livre", color: "#EAB308" },
  "seminovos.com.br":    { name: "Seminovos",    color: "#F97316" },
  "autoline.com.br":     { name: "AutoLine",     color: "#22C55E" },
};

const STATE_NAMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte", RS: "Rio Grande do Sul", RO: "Rondônia",
  RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
};

function detectPlatform(url: string) {
  for (const [domain, info] of Object.entries(PLATFORMS)) {
    if (url.includes(domain)) return info;
  }
  return { name: "Web", color: "#6B7280" };
}

function extractYear(text: string): string | null {
  return text.match(/\b(20[0-2]\d|199\d)\b/)?.[1] ?? null;
}

function extractPrice(text: string): number | null {
  const m = text.match(/R\$\s*([\d.,]+)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
  return !isNaN(n) && n > 1000 && n < 50_000_000 ? n : null;
}

function extractKm(text: string): number | null {
  const m = text.match(/([\d.]+)\s*km/i);
  if (!m) return null;
  const n = parseInt(m[1].replace(/\./g, ""));
  return !isNaN(n) && n < 1_000_000 ? n : null;
}

async function fetchWithBee(url: string): Promise<string> {
  const params = new URLSearchParams({
    api_key: SCRAPINGBEE_KEY!,
    url,
    render_js: "true",
    premium_proxy: "true",
    country_code: "br",
    wait: "2000",
  });
  try {
    const res = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`, {
      signal: AbortSignal.timeout(35_000),
    });
    if (!res.ok) {
      console.error("ScrapingBee error:", res.status, url);
      return "";
    }
    return res.text();
  } catch (e) {
    console.error("ScrapingBee timeout/error:", e);
    return "";
  }
}

function parseOLX(html: string): Listing[] {
  if (!html) return [];
  const listings: Listing[] = [];

  // OLX is a Next.js app — try __NEXT_DATA__ first
  const nextDataRaw = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (nextDataRaw) {
    try {
      const data = JSON.parse(nextDataRaw);
      // Different OLX page structures
      const ads: unknown[] =
        data?.props?.pageProps?.ads ??
        data?.props?.pageProps?.searchData?.listings ??
        data?.props?.pageProps?.data?.searchData?.listings ??
        data?.props?.pageProps?.listing?.items ??
        [];

      for (const raw of ads.slice(0, 8)) {
        const ad = (raw as Record<string, unknown>);
        const inner = (ad.listing ?? ad) as Record<string, unknown>;

        const subject = String(inner.subject ?? inner.title ?? "");
        const url = String(inner.url ?? inner.link ?? "");
        if (!subject || !url || !url.startsWith("http")) continue;

        const priceRaw = (inner.price as Record<string, unknown> | undefined)?.value as string ?? "";
        const price = parseFloat(priceRaw.replace(/\D/g, "")) || extractPrice(subject) || null;

        const images = (inner.images as Record<string, unknown>[] | undefined) ?? [];
        const image = String(
          images[0]?.original ?? images[0]?.cdn_link ?? images[0]?.thumbnail ?? ""
        );

        const params = (inner.params ?? inner.properties ?? []) as Record<string, unknown>[];
        const mileage = params.find(p =>
          String(p.key ?? "").toLowerCase().includes("mileage") ||
          String(p.label ?? "").toLowerCase().includes("km")
        );

        const body = String(inner.body ?? inner.description ?? "");

        listings.push({
          title: subject,
          link: url,
          snippet: body || subject,
          image,
          platform: { name: "OLX", color: "#8B5CF6" },
          price: price && price > 1000 ? price : null,
          year: extractYear(subject),
          km: extractKm(String(mileage?.value ?? "")) ?? extractKm(body),
        });
      }
    } catch (e) {
      console.error("OLX NEXT_DATA parse error:", e);
    }
  }

  // HTML fallback: look for ad links with prices
  if (listings.length === 0) {
    const linkPattern = /href="(https?:\/\/[a-z]{2}\.olx\.com\.br\/[^"?]+\/\d+\.html[^"]*)"/g;
    const seen = new Set<string>();
    for (const m of html.matchAll(linkPattern)) {
      const url = m[1];
      if (seen.has(url)) continue;
      seen.add(url);
      const around = html.slice(Math.max(0, html.indexOf(url) - 200), html.indexOf(url) + 500);
      const title = around.match(/alt="([^"]{10,}?)"/)?.[1] ?? url.split("/").at(-1) ?? "";
      listings.push({
        title,
        link: url,
        snippet: title,
        image: around.match(/src="(https?:\/\/[^"]+(?:olx|img)[^"]+\.(?:jpg|webp|png)[^"]*)"/i)?.[1] ?? "",
        platform: { name: "OLX", color: "#8B5CF6" },
        price: extractPrice(around),
        year: extractYear(around),
        km: extractKm(around),
      });
      if (listings.length >= 6) break;
    }
  }

  return listings;
}

function parseICarros(html: string): Listing[] {
  if (!html) return [];
  const listings: Listing[] = [];

  // Try JSON-LD structured data
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const type = item["@type"];
        if (type !== "Car" && type !== "Product" && type !== "Vehicle") continue;
        const offer = (item.offers ?? {}) as Record<string, unknown>;
        const priceNum = parseFloat(String(offer.price ?? "0"));
        const url = String(item.url ?? "");
        if (!url) continue;
        listings.push({
          title: String(item.name ?? ""),
          link: url,
          snippet: String(item.description ?? "").slice(0, 200),
          image: String(Array.isArray(item.image) ? item.image[0] : item.image ?? ""),
          platform: { name: "iCarros", color: "#3B82F6" },
          price: priceNum > 1000 ? priceNum : null,
          year: String(item.vehicleModelDate ?? extractYear(String(item.name ?? "")) ?? ""),
          km: extractKm(String(item.mileageFromOdometer?.value ?? item.description ?? "")),
        });
      }
    } catch {}
  }

  // HTML fallback: iCarros individual ad links
  if (listings.length === 0) {
    const seen = new Set<string>();
    const pattern = /href="(https?:\/\/www\.icarros\.com\.br\/[^"]+\/anuncio\/[^"?#]+)"/g;
    for (const m of html.matchAll(pattern)) {
      const url = m[1];
      if (seen.has(url)) continue;
      seen.add(url);
      const idx = html.indexOf(url);
      const around = html.slice(Math.max(0, idx - 300), idx + 600);
      const title =
        around.match(/<h[23][^>]*>\s*([^<]{5,}?)\s*<\/h[23]>/)?.[1]?.trim() ??
        around.match(/alt="([^"]{10,}?)"/)?.[1] ??
        "";
      if (!title) continue;
      listings.push({
        title,
        link: url,
        snippet: title,
        image: around.match(/src="(https?:\/\/[^"]+(?:icarros|cdn)[^"]+\.(?:jpg|webp|png)[^"]*)"/i)?.[1] ?? "",
        platform: { name: "iCarros", color: "#3B82F6" },
        price: extractPrice(around),
        year: extractYear(around),
        km: extractKm(around),
      });
      if (listings.length >= 6) break;
    }
  }

  return listings;
}

// Serper fallback (Google search results with snippet parsing)
async function serperSearch(query: string): Promise<Listing[]> {
  if (!SERPER_KEY) return [];
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, gl: "br", hl: "pt-br", num: 8 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.organic ?? []).map((item: Record<string, unknown>) => {
      const url = String(item.link ?? "");
      const snippet = String(item.snippet ?? "");
      return {
        title: String(item.title ?? ""),
        link: url,
        snippet,
        image: String(item.imageUrl ?? item.thumbnailUrl ?? ""),
        platform: detectPlatform(url),
        price: extractPrice(snippet),
        year: extractYear(snippet),
        km: extractKm(snippet),
      } as Listing;
    });
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  if (!SCRAPINGBEE_KEY && !SERPER_KEY) {
    return NextResponse.json({ error: "API não configurada" }, { status: 500 });
  }

  if (Date.now() > dailyReset) {
    dailyCount = 0;
    dailyReset = new Date().setHours(24, 0, 0, 0);
  }

  if (dailyCount >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: "Limite diário de buscas atingido. Tente novamente amanhã." },
      { status: 429 }
    );
  }

  const { searchParams } = request.nextUrl;
  const marca    = searchParams.get("marca")    || "";
  const modelo   = searchParams.get("modelo")   || "";
  const state    = searchParams.get("state")    || "";
  const cidade   = searchParams.get("cidade")   || "";
  const yearMin  = searchParams.get("year_min") || "";
  const yearMax  = searchParams.get("year_max") || "";

  if (!marca.trim() || !modelo.trim() || !state) {
    return NextResponse.json({ error: "Preencha marca, modelo e estado." }, { status: 400 });
  }

  const cacheKey = `${marca}-${modelo}-${state}-${cidade}-${yearMin}-${yearMax}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ ...(cached.data as object), cached: true });
  }

  const stateName = STATE_NAMES[state] || state;
  const stateLC   = state.toLowerCase();
  const query     = `${marca.trim()} ${modelo.trim()}`;
  const encoded   = encodeURIComponent(query);

  let items: Listing[] = [];
  let source = "serper";

  if (SCRAPINGBEE_KEY) {
    source = "scrapingbee";
    const olxUrl = `https://${stateLC}.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios?q=${encoded}`;
    const icarrosUrl = `https://www.icarros.com.br/ache/listaanuncios.jsp?sop=rea_01_t&kw=${encoded}&est=${state}&pagina=1`;

    const [olxHtml, icarrosHtml] = await Promise.all([
      fetchWithBee(olxUrl),
      fetchWithBee(icarrosUrl),
    ]);
    dailyCount += 2;

    const olxItems      = parseOLX(olxHtml);
    const icarrosItems  = parseICarros(icarrosHtml);

    // Interleave: OLX, iCarros, OLX, iCarros...
    const maxLen = Math.max(olxItems.length, icarrosItems.length);
    for (let i = 0; i < maxLen && items.length < 12; i++) {
      if (olxItems[i])                     items.push(olxItems[i]);
      if (icarrosItems[i] && items.length < 12) items.push(icarrosItems[i]);
    }

    // Apply year filter
    if (yearMin || yearMax) {
      items = items.filter(item => {
        if (!item.year) return true;
        const y = parseInt(item.year);
        if (yearMin && y < parseInt(yearMin)) return false;
        if (yearMax && y > parseInt(yearMax)) return false;
        return true;
      });
    }
  }

  // Fall back to Serper if ScrapingBee returned nothing
  if (items.length === 0) {
    source = "serper";
    const location = cidade.trim() || stateName;
    const carTerm  = `"${marca.trim()} ${modelo.trim()}"`;
    const yearPart = yearMin && yearMax
      ? ` ${yearMin} ${yearMax}`
      : yearMin ? ` ${yearMin}` : yearMax ? ` ${yearMax}` : "";
    const base = `${carTerm} ${location}${yearPart}`;

    const [s1, s2] = await Promise.all([
      serperSearch(`${base} site:icarros.com.br inurl:/carros/anuncio/`),
      serperSearch(`${base} (site:mercadolivre.com.br OR site:${stateLC}.olx.com.br OR site:seminovos.com.br) -inurl:busca -inurl:lista -inurl:estoque`),
    ]);
    dailyCount += 2;

    const maxLen = Math.max(s1.length, s2.length);
    for (let i = 0; i < maxLen && items.length < 12; i++) {
      if (s1[i])                    items.push(s1[i]);
      if (s2[i] && items.length < 12) items.push(s2[i]);
    }
  }

  // Sort by data quality
  items.sort((a, b) => {
    const score = (x: Listing) =>
      (x.price ? 2 : 0) + (x.year ? 1 : 0) + (x.km ? 1 : 0) + (x.image ? 1 : 0);
    return score(b) - score(a);
  });

  const result = {
    items,
    totalResults: String(items.length),
    dailyUsed: dailyCount,
    dailyLimit: DAILY_LIMIT,
    source,
  };

  cache.set(cacheKey, { data: result, ts: Date.now() });
  return NextResponse.json(result);
}
