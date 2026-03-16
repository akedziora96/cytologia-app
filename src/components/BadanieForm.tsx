import { useState } from "react";
import type { BadanieForm as FormData, Ustawienia } from "../lib/types";
import { GATUNEK_OPTIONS, MATERIAL_OPTIONS, KLASYFIKACJA_OPTIONS, EMPTY_FORM } from "../lib/types";

function lekarzFromUstawienia(u?: Ustawienia): string {
  if (!u || (!u.imie_lekarza && !u.nazwisko_lekarza)) return "";
  const parts = [u.tytul, u.imie_lekarza, u.nazwisko_lekarza].filter(Boolean);
  return parts.join(" ");
}

interface Props {
  initial?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
  ustawienia?: Ustawienia;
}

export default function BadanieForm({ initial, onSubmit, onCancel, isEdit, ustawienia }: Props) {
  const [form, setForm] = useState<FormData>(() => {
    if (initial) return initial;
    const defaults = { ...EMPTY_FORM };
    const lekarz = lekarzFromUstawienia(ustawienia);
    if (lekarz) defaults.lekarz = lekarz;
    return defaults;
  });

  const set = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>{isEdit ? "Edytuj badanie" : "Nowe badanie cytologiczne"}</h2>

      <fieldset>
        <legend>Pacjent</legend>
        <div className="form-row">
          <label>
            Imię zwierzęcia *
            <input required value={form.imie_zwierzecia} onChange={(e) => set("imie_zwierzecia", e.target.value)} />
          </label>
          <label>
            Gatunek
            <select value={form.gatunek} onChange={(e) => set("gatunek", e.target.value)}>
              {GATUNEK_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
          <label>
            Rasa
            <input value={form.rasa} onChange={(e) => set("rasa", e.target.value)} placeholder="np. Labrador, Maine Coon" />
          </label>
        </div>
        <div className="form-row">
          <label>
            Płeć
            <select value={form.plec} onChange={(e) => set("plec", e.target.value)}>
              <option value="">—</option>
              <option value="Samiec">Samiec</option>
              <option value="Samica">Samica</option>
              <option value="Samiec kastrowany">Samiec kastrowany</option>
              <option value="Samica sterylizowana">Samica sterylizowana</option>
            </select>
          </label>
          <label>
            Wiek
            <input value={form.wiek} onChange={(e) => set("wiek", e.target.value)} placeholder="np. 5 lat, 8 mies." />
          </label>
        </div>
        <label>
          Właściciel
          <input value={form.wlasciciel} onChange={(e) => set("wlasciciel", e.target.value)} placeholder="Imię i nazwisko właściciela" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Informacje o badaniu</legend>
        <div className="form-row">
          <label>
            Data badania *
            <input type="date" required value={form.data_badania} onChange={(e) => set("data_badania", e.target.value)} />
          </label>
          <label>
            Materiał
            <select value={form.material} onChange={(e) => set("material", e.target.value)}>
              {MATERIAL_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Lekarz weterynarii
            <input value={form.lekarz} onChange={(e) => set("lekarz", e.target.value)} placeholder="lek. wet. ..." />
          </label>
        </div>
        <label>
          Informacje kliniczne
          <textarea rows={3} value={form.informacje_kliniczne} onChange={(e) => set("informacje_kliniczne", e.target.value)} placeholder="Lokalizacja zmiany, wywiad, objawy..." />
        </label>
      </fieldset>

      <fieldset>
        <legend>Wyniki</legend>
        <label>
          Ocena mikroskopowa
          <textarea rows={4} value={form.ocena_mikroskopowa} onChange={(e) => set("ocena_mikroskopowa", e.target.value)} />
        </label>
        <label>
          Klasyfikacja
          <select value={form.klasyfikacja} onChange={(e) => set("klasyfikacja", e.target.value)}>
            <option value="">— Wybierz —</option>
            {KLASYFIKACJA_OPTIONS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>
        <label>
          Rozpoznanie
          <textarea rows={4} value={form.rozpoznanie} onChange={(e) => set("rozpoznanie", e.target.value)} />
        </label>
        <label>
          Zalecenia
          <textarea rows={3} value={form.zalecenia} onChange={(e) => set("zalecenia", e.target.value)} />
        </label>
      </fieldset>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Anuluj</button>
        <button type="submit" className="btn-primary">
          {isEdit ? "Zapisz zmiany" : "Zapisz badanie"}
        </button>
      </div>
    </form>
  );
}
