/**
 * Code 128 Subset B encoder → SVG bar geometry (scannable).
 * Patterns are the standard Code 128 bar/space widths (11 modules per symbol; stop has 13).
 */

const PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];

const START_B = 104;
const STOP = 106;

function charValue(ch: string): number {
  const code = ch.charCodeAt(0);
  if (code < 32 || code > 127) {
    throw new Error(`Code128B cannot encode character code ${code}`);
  }
  return code - 32;
}

/** Encode text as Code 128B module widths (array of bar/space widths). */
export function encodeCode128B(text: string): number[] {
  if (!text) throw new Error("Barcode value required");
  const values = [START_B];
  let checksum = START_B;
  for (let i = 0; i < text.length; i++) {
    const v = charValue(text[i]!);
    values.push(v);
    checksum += v * (i + 1);
  }
  values.push(checksum % 103);
  values.push(STOP);

  const widths: number[] = [];
  for (const v of values) {
    const pattern = PATTERNS[v];
    if (!pattern) throw new Error(`Missing Code128 pattern for ${v}`);
    for (const d of pattern) widths.push(Number(d));
  }
  return widths;
}

export type BarcodeSvgOpts = {
  height?: number;
  moduleWidth?: number;
  quietModules?: number;
};

/** Build an SVG string for a Code 128B barcode (black bars on transparent). */
export function code128Svg(text: string, opts: BarcodeSvgOpts = {}): string {
  const height = opts.height ?? 48;
  const moduleWidth = opts.moduleWidth ?? 1.6;
  const quiet = opts.quietModules ?? 10;
  const widths = encodeCode128B(text);
  const modules = widths.reduce((s, w) => s + w, 0) + quiet * 2;
  const width = modules * moduleWidth;

  let x = quiet * moduleWidth;
  let bars = "";
  let isBar = true;
  for (const w of widths) {
    const bw = w * moduleWidth;
    if (isBar) {
      bars += `<rect x="${x.toFixed(2)}" y="0" width="${bw.toFixed(2)}" height="${height}" fill="#0b1f33"/>`;
    }
    x += bw;
    isBar = !isBar;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width.toFixed(2)}" height="${height}" viewBox="0 0 ${width.toFixed(2)} ${height}" role="img" aria-label="Barcode ${escapeXml(text)}">${bars}</svg>`;
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
