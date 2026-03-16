import { useEffect, useState, useCallback } from "react";
import { Stethoscope } from "lucide-react";
import type { Badanie, BadanieForm as FormData } from "./lib/types";
import { numerBadania } from "./lib/types";
import { pobierzWszystkie, szukaj, zapisz, aktualizuj, usun } from "./lib/db";
import HistoriaList from "./components/HistoriaList";
import BadanieForm from "./components/BadanieForm";
import BadanieDetail from "./components/BadanieDetail";

type View = "list" | "new" | "edit" | "detail";

export default function App() {
  const [badania, setBadania] = useState<Badanie[]>([]);
  const [selected, setSelected] = useState<Badanie | null>(null);
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");

  const reload = useCallback(async () => {
    const data = search.trim()
      ? await szukaj(search.trim())
      : await pobierzWszystkie();
    setBadania(data);
  }, [search]);

  useEffect(() => {
    reload();
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

  const renderContent = () => {
    switch (view) {
      case "new":
        return <BadanieForm onSubmit={handleSave} onCancel={handleCancel} />;
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
      />
      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
}
