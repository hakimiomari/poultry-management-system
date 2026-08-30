export const fmtDate = (d: Date | string) => new Date(d).toISOString().slice(0, 10);
/** Date for display inside translated text: wrapped in LTR-isolate marks so RTL bidi never reorders "YYYY-MM-DD". */
export const fmtDateDisplay = (d: Date | string) => `\u2066${fmtDate(d)}\u2069`;
export const toDate = (s: string) => new Date(`${s}T00:00:00.000Z`);
export const todayStr = () => new Date().toISOString().slice(0, 10);
export const fmtNum = (n: number, digits = 0) => n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
/** Solar Hijri (Jalali) date for dual calendar display (SPEC Part D.5). */
export const fmtJalali = (d: Date | string) => new Intl.DateTimeFormat("fa-AF-u-ca-persian-nu-latn", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(d));
