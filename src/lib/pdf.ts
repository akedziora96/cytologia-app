import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Badanie } from "./types";
import { numerBadania } from "./types";
import { Arial_Regular } from "./fonts/Arial-Regular";
import { Arial_Bold } from "./fonts/Arial-Bold";

// Colors matching HTML report CSS variables
const SL: [number, number, number] = [100, 116, 139]; // --slate-500
const SD: [number, number, number] = [51, 65, 85];    // --slate-700
const DK: [number, number, number] = [15, 23, 42];    // --slate-900
const BR: [number, number, number] = [226, 232, 240]; // --border / --slate-200
const DV: [number, number, number] = [148, 163, 184]; // --slate-400
const AC: [number, number, number] = [29, 78, 216];   // --accent / --blue-700

function reg(d: jsPDF) {
  d.addFileToVFS("AR.ttf", Arial_Regular);
  d.addFileToVFS("AB.ttf", Arial_Bold);
  d.addFont("AR.ttf", "Arial", "normal");
  d.addFont("AB.ttf", "Arial", "bold");
}

export function generujPDF(b: Badanie, logo?: string | null, pwz?: string): jsPDF {
  const d = new jsPDF({ unit: "mm", format: "a4" });
  reg(d);
  d.setFont("Arial", "normal");
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m = 14, cw = pw - m * 2, R = 4;
  let y = 12;

  // Header
  if (logo) {
    d.addImage(logo, "PNG", m, y - 2, 16, 16);
    d.setFontSize(10); d.setTextColor(...SD); d.setFont("Arial", "bold");
    d.text("Przychodnia Weterynaryjna Sanatus", m + 19, y + 3);
    d.setFontSize(7); d.setTextColor(...DV); d.setFont("Arial", "normal");
    d.text("Magdalena Rembowska  \u2022  Krosinko, ul. Lipowa 1C", m + 19, y + 7);
    d.setFontSize(8); d.setTextColor(...SD); d.setFont("Arial", "bold");
    d.text("WYNIK BADANIA CYTOLOGICZNEGO", m + 19, y + 12);
    y += 20;
  } else {
    d.setFontSize(10); d.setTextColor(...SD); d.setFont("Arial", "bold");
    d.text("Przychodnia Weterynaryjna Sanatus", m, y + 3);
    d.setFontSize(7); d.setTextColor(...DV); d.setFont("Arial", "normal");
    d.text("Magdalena Rembowska  \u2022  Krosinko, ul. Lipowa 1C", m, y + 7);
    d.setFontSize(8); d.setTextColor(...SD); d.setFont("Arial", "bold");
    d.text("WYNIK BADANIA CYTOLOGICZNEGO", m, y + 12);
    y += 20;
  }

  // Nr + data
  d.setDrawColor(...BR); d.setLineWidth(0.2); d.line(m, y, m + cw, y);
  y += 3;
  d.setFontSize(7); d.setTextColor(...DV); d.setFont("Arial", "normal");
  d.text(numerBadania(b), m, y + 1.5);
  y += 5;

  // Patient table
  const rows = [
    ["Zwierzę", b.imie_zwierzecia],
    ["Gatunek / Rasa", `${b.gatunek}${b.rasa ? " — " + b.rasa : ""}`],
    ["Płeć / Wiek", `${b.plec || "—"}  /  ${b.wiek || "—"}`],
    ["Właściciel", b.wlasciciel || "—"],
    ["Data badania", b.data_badania],
    ["Materiał", b.material || "—"],
    ["Lekarz wet.", b.lekarz || "—"],
  ];

  autoTable(d, {
    startY: y, body: rows, theme: "plain",
    margin: { left: m, right: m },
    styles: {
      fontSize: 7.5, textColor: DK, font: "Arial",
      cellPadding: { top: 1.2, bottom: 1.2, left: 3, right: 3 },
    },
    columnStyles: { 0: { fontStyle: "bold", textColor: SL, cellWidth: 28 } },
    didParseCell(data) {
      data.cell.styles.fillColor = data.row.index % 2 === 0 ? [241, 245, 249] : [248, 250, 252];
    },
  });
  y = (d as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Sections
  const secs: [string, string | undefined][] = [
    ["Informacje kliniczne", b.informacje_kliniczne],
    ["Ocena mikroskopowa", b.ocena_mikroskopowa],
  ];
  for (const [t, c] of secs) {
    if (!c) continue;
    y = sec(d, t, c, y, m, cw, R);
  }

  // Diagnosis — blue accent bar (matching HTML border-left: 3px solid --accent)
  if (b.rozpoznanie || b.klasyfikacja) {
    let ch = 5;
    if (b.klasyfikacja) ch += 5;
    if (b.rozpoznanie) ch += d.splitTextToSize(b.rozpoznanie, cw - 10).length * 3.5 + 1;
    ch += 3;

    d.setFillColor(248, 250, 252); d.roundedRect(m, y, cw, ch, R, R, "F");
    // Blue accent bar on the left
    d.setFillColor(...AC); d.rect(m, y + 1, 1, ch - 2, "F");

    let ty = y + 4.5;
    d.setFontSize(7); d.setTextColor(...AC); d.setFont("Arial", "bold");
    d.text("ROZPOZNANIE", m + 5, ty); ty += 5;

    if (b.klasyfikacja) {
      d.setFontSize(7.5); d.setTextColor(...DK); d.setFont("Arial", "bold");
      const lb = "Klasyfikacja: ";
      d.text(lb, m + 5, ty);
      const lbWidth = d.getTextWidth(lb);
      d.setFont("Arial", "normal");
      d.text(b.klasyfikacja, m + 5 + lbWidth, ty);
      ty += 4.5;
    }
    if (b.rozpoznanie) {
      d.setFont("Arial", "normal"); d.setFontSize(7.5); d.setTextColor(...DK);
      d.text(d.splitTextToSize(b.rozpoznanie, cw - 10), m + 5, ty);
    }
    y += ch + 6;
  }

  if (b.zalecenia) y = sec(d, "Zalecenia", b.zalecenia, y, m, cw, R);

  // PWZ + Stamp area — right-aligned, above footer
  const stBoxW = 50, stBoxH = 22;
  const pwzW = 30;
  const gap = 10;
  const totalW = pwzW + gap + stBoxW;
  const areaX = m + cw - totalW;
  const areaY = ph - 38;

  // PWZ — label centered, value below
  d.setFontSize(6.5); d.setTextColor(...DV); d.setFont("Arial", "normal");
  d.text("Nr PWZ", areaX + pwzW / 2, areaY, { align: "center" });
  if (pwz) {
    d.setFontSize(9); d.setTextColor(...DK); d.setFont("Arial", "bold");
    d.text(pwz, areaX + pwzW / 2, areaY + 5, { align: "center" });
  }
  d.setDrawColor(...BR); d.setLineWidth(0.3);
  d.line(areaX, areaY + 8, areaX + pwzW, areaY + 8);

  // Stamp box — rounded rect with centered text
  const stX = areaX + pwzW + gap;
  d.setDrawColor(...BR); d.setLineWidth(0.3);
  d.roundedRect(stX, areaY - 4, stBoxW, stBoxH, 1.5, 1.5, "S");
  d.setFontSize(6.5); d.setTextColor(...DV);
  d.text("pieczątka i podpis", stX + stBoxW / 2, areaY + stBoxH / 2 - 2, { align: "center" });

  // Footer
  d.setDrawColor(...BR); d.setLineWidth(0.15); d.line(m, ph - 12, m + cw, ph - 12);
  d.setFontSize(6); d.setTextColor(...DV); d.setFont("Arial", "normal");
  d.text(numerBadania(b), m, ph - 8.5);
  d.text("Sanatus Magdalena Rembowska", m + cw, ph - 8.5, { align: "right" });

  return d;
}

function sec(d: jsPDF, title: string, content: string, y: number, m: number, cw: number, R: number): number {
  const lines = d.splitTextToSize(content, cw - 6);
  const h = 5 + lines.length * 3.5 + 3;

  d.setFillColor(248, 250, 252); d.roundedRect(m, y, cw, h, R, R, "F");
  d.setFontSize(6.5); d.setTextColor(...SL); d.setFont("Arial", "bold");
  d.text(title.toUpperCase(), m + 3, y + 3.5);
  d.setFontSize(7.5); d.setTextColor(...DK); d.setFont("Arial", "normal");
  d.text(lines, m + 3, y + 7.5);

  return y + h + 6;
}
