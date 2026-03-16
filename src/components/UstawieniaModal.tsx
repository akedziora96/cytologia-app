import { useState, useEffect } from "react";
import type { Ustawienia } from "../lib/types";

interface Props {
  open: boolean;
  initial: Ustawienia;
  onSave: (u: Ustawienia) => void;
  onClose: () => void;
}

export default function UstawieniaModal({ open, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<Ustawienia>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial, open]);

  if (!open) return null;

  const set = (key: keyof Ustawienia, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel">
        <h3>Ustawienia lekarza</h3>
        <p className="modal-desc">
          Te dane będą automatycznie wypełniane przy tworzeniu nowego badania.
        </p>

        <label>
          Tytuł zawodowy
          <input value={form.tytul} onChange={(e) => set("tytul", e.target.value)} placeholder="np. lek. wet." />
        </label>
        <label>
          Imię
          <input value={form.imie_lekarza} onChange={(e) => set("imie_lekarza", e.target.value)} placeholder="np. Jan" />
        </label>
        <label>
          Nazwisko
          <input value={form.nazwisko_lekarza} onChange={(e) => set("nazwisko_lekarza", e.target.value)} placeholder="np. Kowalski" />
        </label>
        <label>
          Nr PWZ
          <input value={form.pwz} onChange={(e) => set("pwz", e.target.value)} placeholder="np. 1234567" />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Anuluj</button>
          <button type="button" className="btn-primary" onClick={handleSave}>Zapisz</button>
        </div>
      </div>
    </div>
  );
}
