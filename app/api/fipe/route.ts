import { NextRequest, NextResponse } from "next/server";

const BASE = "https://parallelum.com.br/fipe/api/v1/carros";

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function score(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (nb.includes(na) || na.includes(nb)) return 0.9;
  const wa = na.split(" ");
  const wb = nb.split(" ");
  const hits = wa.filter(w => w.length > 2 && wb.some(x => x.includes(w) || w.includes(x)));
  return hits.length / Math.max(wa.length, wb.length);
}

function best<T extends { nome: string }>(items: T[], name: string): T | null {
  let top: T | null = null;
  let topScore = 0;
  for (const item of items) {
    const s = score(item.nome, name);
    if (s > topScore) { topScore = s; top = item; }
  }
  return topScore >= 0.3 ? top : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const marca  = searchParams.get("marca")  ?? "";
  const modelo = searchParams.get("modelo") ?? "";
  const ano    = searchParams.get("ano")    ?? "";

  if (!marca || !modelo || !ano) {
    return NextResponse.json({ error: "Parâmetros obrigatórios: marca, modelo, ano" }, { status: 400 });
  }

  try {
    // 1. Marcas
    const brandsRes = await fetch(`${BASE}/marcas`, { next: { revalidate: 86400 } });
    const brands: Array<{ codigo: string; nome: string }> = await brandsRes.json();
    const brandMatch = best(brands, marca);
    if (!brandMatch) return NextResponse.json({ error: "Marca não encontrada na tabela FIPE" }, { status: 404 });

    // 2. Modelos
    const modelsRes = await fetch(`${BASE}/marcas/${brandMatch.codigo}/modelos`, { next: { revalidate: 86400 } });
    const { modelos }: { modelos: Array<{ codigo: number; nome: string }> } = await modelsRes.json();
    const modelMatch = best(modelos.map(m => ({ ...m, nome: m.nome, codigo: String(m.codigo) })), modelo);
    if (!modelMatch) return NextResponse.json({ error: "Modelo não encontrado na tabela FIPE" }, { status: 404 });

    // 3. Anos
    const yearsRes = await fetch(`${BASE}/marcas/${brandMatch.codigo}/modelos/${modelMatch.codigo}/anos`, { next: { revalidate: 3600 } });
    const years: Array<{ codigo: string; nome: string }> = await yearsRes.json();
    const yearMatch = years.find(y => y.nome.startsWith(String(ano)));
    if (!yearMatch) return NextResponse.json({ error: "Ano não encontrado na tabela FIPE" }, { status: 404 });

    // 4. Preço
    const priceRes = await fetch(
      `${BASE}/marcas/${brandMatch.codigo}/modelos/${modelMatch.codigo}/anos/${yearMatch.codigo}`,
      { next: { revalidate: 3600 } }
    );
    const p = await priceRes.json();

    const preco = Number(
      (p.Valor as string).replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    );

    return NextResponse.json({
      preco,
      preco_formatado: p.Valor,
      codigo_fipe:     p.CodigoFipe,
      marca:           p.Marca,
      modelo:          p.Modelo,
      ano:             p.AnoModelo,
      combustivel:     p.Combustivel,
      mes_referencia:  p.MesReferencia,
    });
  } catch (err) {
    console.error("FIPE error:", err);
    return NextResponse.json({ error: "Erro ao consultar tabela FIPE" }, { status: 500 });
  }
}
