import { Cat, Dog } from "lucide-react";
import type { Badanie } from "../lib/types";

interface Props {
  badania: Badanie[];
  search: string;
  onSearchChange: (val: string) => void;
  onSelect: (b: Badanie) => void;
  onNew: () => void;
}

function SpeciesIcon({ gatunek }: { gatunek: string }) {
  if (gatunek === "Kot") return <Cat size={14} />;
  return <Dog size={14} />;
}

export default function HistoriaList({ badania, search, onSearchChange, onSelect, onNew }: Props) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Historia badań</h2>
        <button className="btn-primary btn-sm" onClick={onNew}>+ Nowe</button>
      </div>
      <input
        className="search-input"
        type="search"
        placeholder="Szukaj pacjenta / właściciela..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="list">
        {badania.length === 0 && (
          <p className="empty-state">Brak wyników</p>
        )}
        {badania.map((b) => (
          <button key={b.id} className="list-item" onClick={() => onSelect(b)}>
            <div className="list-item-name">
              <SpeciesIcon gatunek={b.gatunek} />
              {b.imie_zwierzecia}
              {b.rasa && <span className="list-item-breed"> ({b.rasa})</span>}
            </div>
            <div className="list-item-meta">
              <span>{b.data_badania}</span>
              {b.wlasciciel && <span>wł. {b.wlasciciel}</span>}
              {b.klasyfikacja && (
                <span className="badge">{b.klasyfikacja.split(" — ")[0]}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
