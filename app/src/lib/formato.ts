const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarNumero(n: number): string {
  return numero.format(n);
}

/** R$ 1.234,56 (com espaço normal, para não quebrar em textos do WhatsApp). */
export function formatarReais(n: number): string {
  return reais.format(n).replace(/ /g, ' ');
}

/** Gramas → "750 g" ou, a partir de 1000 g, "1,5 kg". */
export function formatarMassa(gramas: number): string {
  if (gramas >= 1000) return `${formatarNumero(gramas / 1000)} kg`;
  return `${formatarNumero(gramas)} g`;
}

/** Mililitros → "300 ml" ou, a partir de 1000 ml, "1,5 litro" / "7,5 litros". */
export function formatarVolume(ml: number): string {
  if (ml >= 1000) {
    const litros = ml / 1000;
    // Em português, o plural começa em 2: "1 litro", "1,5 litro", "2 litros".
    return `${formatarNumero(litros)} ${litros < 2 ? 'litro' : 'litros'}`;
  }
  return `${formatarNumero(ml)} ml`;
}

/** Lê um preço digitado em português: "12,90", "R$ 12,90", "1.234,56", "12.9". */
export function lerPreco(texto: string): number | null {
  let t = texto.replace(/R\$|\s/g, '');
  if (!t) return null;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

/** 12.9 → "12,90" (para mostrar no campo de preço). */
export function precoParaTexto(n: number | undefined): string {
  return n === undefined ? '' : n.toFixed(2).replace('.', ',');
}

/** 95 → "1 h 35 min"; 45 → "45 min"; 120 → "2 h". */
export function formatarMinutos(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** "Pernil" a partir de "pernil". */
export function primeiraMaiuscula(t: string): string {
  return t.charAt(0).toLocaleUpperCase('pt-BR') + t.slice(1);
}

/** Minúsculas, sem acentos e sem espaços repetidos (para comparar nomes). */
export function normalizar(t: string): string {
  return t
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
