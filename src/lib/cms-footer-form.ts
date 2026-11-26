import { DEFAULT_FOOTER_COLUMNS, type FooterColumn, parseFooterColumns } from "@/lib/footer-nav";

const COLS = 4;
const LINKS_PER_COL = 4;

export function footerColumnsForForm(raw: string | null | undefined): FooterColumn[] {
  const cols = parseFooterColumns(raw);
  // Pad to fixed editor slots
  const out: FooterColumn[] = [];
  for (let i = 0; i < COLS; i++) {
    const src = cols[i] || DEFAULT_FOOTER_COLUMNS[i] || { title: "", links: [] };
    const links = [...(src.links || [])];
    while (links.length < LINKS_PER_COL) links.push({ label: "", href: "" });
    out.push({ title: src.title || "", links: links.slice(0, LINKS_PER_COL) });
  }
  return out;
}

export function footerNavJsonFromForm(formData: FormData): string {
  const cols: FooterColumn[] = [];
  for (let c = 0; c < COLS; c++) {
    const title = String(formData.get(`footer_col_${c}_title`) || "").trim();
    const links: { label: string; href: string }[] = [];
    for (let l = 0; l < LINKS_PER_COL; l++) {
      const label = String(formData.get(`footer_col_${c}_link_${l}_label`) || "").trim();
      const href = String(formData.get(`footer_col_${c}_link_${l}_href`) || "").trim();
      if (label || href) links.push({ label: label || href, href: href || "#" });
    }
    if (title || links.length) cols.push({ title: title || `Column ${c + 1}`, links });
  }
  return JSON.stringify(cols.length ? cols : DEFAULT_FOOTER_COLUMNS);
}
