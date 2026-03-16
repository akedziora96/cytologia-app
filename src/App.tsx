import { useEffect, useState, useCallback } from "react";
import { Stethoscope } from "lucide-react";
import type { Badanie, BadanieForm as FormData, Ustawienia } from "./lib/types";
import { numerBadania, EMPTY_USTAWIENIA } from "./lib/types";
import { pobierzWszystkie, szukaj, zapisz, aktualizuj, usun, pobierzUstawienia, zapiszUstawienia } from "./lib/db";
import HistoriaList from "./components/HistoriaList";
import BadanieForm from "./components/BadanieForm";
import BadanieDetail from "./components/BadanieDetail";
import UstawieniaModal from "./components/UstawieniaModal";

type View = "list" | "new" | "edit" | "detail";

export default function App() {
  const [badania, setBadania] = useState<Badanie[]>([]);
  const [selected, setSelected] = useState<Badanie | null>(null);
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");
  const [ustawienia, setUstawienia] = useState<Ustawienia>(EMPTY_USTAWIENIA);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const reload = useCallback(async () => {
    const data = search.trim()
      ? await szukaj(search.trim())
      : await pobierzWszystkie();
    setBadania(data);
  }, [search]);

  useEffect(() => {
    reload();
    pobierzUstawienia().then(setUstawienia);
  }, [reload]);

  const handleNew = () => {
    setSelected(null);
    setView("new");
  };

  const handleSelect = (b: Badanie) => {
    setSelected(b);
    setView("detail");
  };

  const handleSave = async (data: FormData) => {
    if (view === "edit" && selected) {
      await aktualizuj(selected.id, data);
    } else {
      await zapisz(data);
    }
    await reload();
    setView("list");
    setSelected(null);
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(`Usunąć badanie ${numerBadania(selected)} (${selected.imie_zwierzecia})?`)) return;
    await usun(selected.id);
    await reload();
    setSelected(null);
    setView("list");
  };

  const handleCancel = () => {
    setView(selected ? "detail" : "list");
  };

  const handleSaveSettings = async (u: Ustawienia) => {
    await zapiszUstawienia(u);
    setUstawienia(u);
    setSettingsOpen(false);
  };

  const renderContent = () => {
    switch (view) {
      case "new":
        return <BadanieForm onSubmit={handleSave} onCancel={handleCancel} ustawienia={ustawienia} />;
      case "edit":
        return selected ? (
          <BadanieForm initial={selected} onSubmit={handleSave} onCancel={handleCancel} isEdit />
        ) : null;
      case "detail":
        return selected ? (
          <BadanieDetail
            badanie={selected}
            onEdit={() => setView("edit")}
            onDelete={handleDelete}
            pwz={ustawienia.pwz}
          />
        ) : null;
      default:
        return (
          <div className="welcome">
            <Stethoscope size={56} strokeWidth={1.5} color="#2563EB" />
            <h2>Przychodnia Weterynaryjna SanatuS</h2>
            <p>Cytologia — wybierz badanie z listy lub utwórz nowe</p>
            <button className="btn-primary" onClick={handleNew}>+ Nowe badanie</button>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <HistoriaList
        badania={badania}
        search={search}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onNew={handleNew}
        onSettings={() => setSettingsOpen(true)}
      />
      <main className="content">
        {renderContent()}
      </main>
      <UstawieniaModal
        open={settingsOpen}
        initial={ustawienia}
        onSave={handleSaveSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
