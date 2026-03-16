import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import type { Badanie } from "../lib/types";
import { numerBadania } from "../lib/types";
import { generujPDF } from "../lib/pdf";
import { loadLogoBase64 } from "../lib/logo";

interface Props {
  badanie: Badanie;
  onEdit: () => void;
  onDelete: () => void;
  pwz?: string;
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="detail-field">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function Section({ title, content }: { title: string; content?: string }) {
  if (!content) return null;
  return (
    <div className="detail-section">
      <h4>{title}</h4>
      <p>{content}</p>
    </div>
  );
}

export default function BadanieDetail({ badanie, onEdit, onDelete, pwz }: Props) {
  const handlePDF = async () => {
    const logo = await loadLogoBase64();
    const doc = generujPDF(badanie, logo, pwz);
    const defaultName = `${numerBadania(badanie)}_${badanie.imie_zwierzecia}.pdf`;

    const filePath = await save({
      defaultPath: defaultName,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (!filePath) return;

    const arrayBuf = doc.output("arraybuffer");
    await writeFile(filePath, new Uint8Array(arrayBuf));
  };

  return (
    <div className="detail">
      <div className="detail-header">
        <div>
          <h2>{badanie.imie_zwierzecia}</h2>
          <span className="detail-subtitle">
            {badanie.gatunek}{badanie.rasa ? ` — ${badanie.rasa}` : ""} | {numerBadania(badanie)}
          </span>
        </div>
        <div className="detail-actions">
          <button className="btn-secondary btn-sm" onClick={onEdit}>Edytuj</button>
          <button className="btn-danger btn-sm" onClick={onDelete}>Usuń</button>
          <button className="btn-primary btn-sm" onClick={handlePDF}>Pobierz PDF</button>
        </div>
      </div>

      <div className="detail-grid">
        <Field label="Gatunek" value={badanie.gatunek} />
        <Field label="Rasa" value={badanie.rasa} />
        <Field label="Płeć" value={badanie.plec} />
        <Field label="Wiek" value={badanie.wiek} />
        <Field label="Właściciel" value={badanie.wlasciciel} />
        <Field label="Materiał" value={badanie.material} />
        <Field label="Lekarz wet." value={badanie.lekarz} />
      </div>

      <Section title="Informacje kliniczne" content={badanie.informacje_kliniczne} />
      <Section title="Ocena mikroskopowa" content={badanie.ocena_mikroskopowa} />

      {(badanie.klasyfikacja || badanie.rozpoznanie) && (
        <div className="detail-section diagnosis">
          <h4>Rozpoznanie</h4>
          {badanie.klasyfikacja && (
            <p className="bethesda-result">
              <strong>Klasyfikacja:</strong> {badanie.klasyfikacja}
            </p>
          )}
          {badanie.rozpoznanie && <p>{badanie.rozpoznanie}</p>}
        </div>
      )}

      <Section title="Zalecenia" content={badanie.zalecenia} />
    </div>
  );
}
