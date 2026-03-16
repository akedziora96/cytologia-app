export interface Badanie {
  id: number;
  imie_zwierzecia: string;
  gatunek: string;
  rasa: string;
  plec: string;
  wiek: string;
  nr_chipa: string;
  wlasciciel: string;
  data_badania: string;
  material: string;
  informacje_kliniczne: string;
  ocena_makroskopowa: string;
  ocena_mikroskopowa: string;
  rozpoznanie: string;
  klasyfikacja: string;
  zalecenia: string;
  lekarz: string;
  utworzono: string;
  zmodyfikowano: string;
}

export type BadanieForm = Omit<Badanie, "id" | "utworzono" | "zmodyfikowano">;

export const EMPTY_FORM: BadanieForm = {
  imie_zwierzecia: "",
  gatunek: "Pies",
  rasa: "",
  plec: "",
  wiek: "",
  nr_chipa: "",
  wlasciciel: "",
  data_badania: new Date().toISOString().slice(0, 10),
  material: "Biopsja aspiracyjna cienkoigłowa (BAC)",
  informacje_kliniczne: "",
  ocena_makroskopowa: "",
  ocena_mikroskopowa: "",
  rozpoznanie: "",
  klasyfikacja: "",
  zalecenia: "",
  lekarz: "",
};

export function numerBadania(b: Pick<Badanie, "id" | "data_badania">): string {
  const rok = b.data_badania?.slice(0, 4) || new Date().getFullYear().toString();
  return `CYT-${rok}-${String(b.id).padStart(4, "0")}`;
}

export interface Ustawienia {
  tytul: string;
  imie_lekarza: string;
  nazwisko_lekarza: string;
  pwz: string;
}

export const EMPTY_USTAWIENIA: Ustawienia = {
  tytul: "lek. wet.",
  imie_lekarza: "",
  nazwisko_lekarza: "",
  pwz: "",
};

export const GATUNEK_OPTIONS = [
  "Pies",
  "Kot",
  "Królik",
  "Świnka morska",
  "Fretka",
  "Inne",
];

export const MATERIAL_OPTIONS = [
  "Biopsja aspiracyjna cienkoigłowa (BAC)",
  "Wymaz",
  "Odcisk",
  "Popłuczyny",
  "Płyn z jam ciała",
  "Osad moczu",
  "Węzeł chłonny",
  "Zmiana skórna",
  "Guz — lokalizacja: ...",
  "Inne",
];

export const KLASYFIKACJA_OPTIONS = [
  "Zmiana zapalna",
  "Zmiana rozrostowa łagodna",
  "Zmiana rozrostowa złośliwa",
  "Zmiana torbielowata",
  "Guz mezenchymalny",
  "Guz nabłonkowy",
  "Guz okrągłokomórkowy — chłoniak",
  "Guz okrągłokomórkowy — mastocytoma",
  "Guz okrągłokomórkowy — histiocytoma",
  "Guz melanocytarny",
  "Hiperplazja / dysplazja",
  "Materiał niediagnostyczny",
  "Inna",
];
