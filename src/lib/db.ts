import Database from "@tauri-apps/plugin-sql";
import type { Badanie, BadanieForm, Ustawienia } from "./types";
import { EMPTY_USTAWIENIA } from "./types";

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:cytologia.db");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ustawienia (
        klucz TEXT PRIMARY KEY,
        wartosc TEXT NOT NULL DEFAULT ''
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS badania (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imie_zwierzecia TEXT NOT NULL,
        gatunek TEXT DEFAULT '',
        rasa TEXT DEFAULT '',
        plec TEXT DEFAULT '',
        wiek TEXT DEFAULT '',
        nr_chipa TEXT DEFAULT '',
        wlasciciel TEXT DEFAULT '',
        data_badania TEXT NOT NULL,
        material TEXT DEFAULT '',
        informacje_kliniczne TEXT DEFAULT '',
        ocena_makroskopowa TEXT DEFAULT '',
        ocena_mikroskopowa TEXT DEFAULT '',
        rozpoznanie TEXT DEFAULT '',
        klasyfikacja TEXT DEFAULT '',
        zalecenia TEXT DEFAULT '',
        lekarz TEXT DEFAULT '',
        utworzono TEXT NOT NULL,
        zmodyfikowano TEXT NOT NULL
      )
    `);
  }
  return db;
}

export async function zapisz(dane: BadanieForm): Promise<number> {
  const d = await getDb();
  const now = new Date().toISOString();
  const result = await d.execute(
    `INSERT INTO badania (imie_zwierzecia, gatunek, rasa, plec, wiek, nr_chipa,
      wlasciciel, data_badania, material, informacje_kliniczne,
      ocena_makroskopowa, ocena_mikroskopowa, rozpoznanie, klasyfikacja,
      zalecenia, lekarz, utworzono, zmodyfikowano)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
    [
      dane.imie_zwierzecia, dane.gatunek, dane.rasa, dane.plec, dane.wiek,
      dane.nr_chipa, dane.wlasciciel, dane.data_badania, dane.material,
      dane.informacje_kliniczne, dane.ocena_makroskopowa, dane.ocena_mikroskopowa,
      dane.rozpoznanie, dane.klasyfikacja, dane.zalecenia, dane.lekarz, now, now,
    ]
  );
  return result.lastInsertId as number;
}

export async function aktualizuj(id: number, dane: BadanieForm): Promise<void> {
  const d = await getDb();
  const now = new Date().toISOString();
  await d.execute(
    `UPDATE badania SET imie_zwierzecia=$1, gatunek=$2, rasa=$3, plec=$4,
      wiek=$5, nr_chipa=$6, wlasciciel=$7, data_badania=$8, material=$9,
      informacje_kliniczne=$10, ocena_makroskopowa=$11, ocena_mikroskopowa=$12,
      rozpoznanie=$13, klasyfikacja=$14, zalecenia=$15, lekarz=$16, zmodyfikowano=$17
    WHERE id=$18`,
    [
      dane.imie_zwierzecia, dane.gatunek, dane.rasa, dane.plec, dane.wiek,
      dane.nr_chipa, dane.wlasciciel, dane.data_badania, dane.material,
      dane.informacje_kliniczne, dane.ocena_makroskopowa, dane.ocena_mikroskopowa,
      dane.rozpoznanie, dane.klasyfikacja, dane.zalecenia, dane.lekarz, now, id,
    ]
  );
}

export async function pobierzWszystkie(): Promise<Badanie[]> {
  const d = await getDb();
  return await d.select<Badanie[]>(
    "SELECT * FROM badania ORDER BY data_badania DESC"
  );
}

export async function pobierz(id: number): Promise<Badanie | undefined> {
  const d = await getDb();
  const rows = await d.select<Badanie[]>(
    "SELECT * FROM badania WHERE id=$1", [id]
  );
  return rows[0];
}

export async function usun(id: number): Promise<void> {
  const d = await getDb();
  await d.execute("DELETE FROM badania WHERE id=$1", [id]);
}

export async function pobierzUstawienia(): Promise<Ustawienia> {
  const d = await getDb();
  const rows = await d.select<{ klucz: string; wartosc: string }[]>(
    "SELECT klucz, wartosc FROM ustawienia"
  );
  const result = { ...EMPTY_USTAWIENIA };
  for (const row of rows) {
    if (row.klucz in result) {
      (result as Record<string, string>)[row.klucz] = row.wartosc;
    }
  }
  return result;
}

export async function zapiszUstawienia(u: Ustawienia): Promise<void> {
  const d = await getDb();
  for (const [klucz, wartosc] of Object.entries(u)) {
    await d.execute(
      `INSERT INTO ustawienia (klucz, wartosc) VALUES ($1, $2)
       ON CONFLICT(klucz) DO UPDATE SET wartosc = $2`,
      [klucz, wartosc]
    );
  }
}

export async function szukaj(fraza: string): Promise<Badanie[]> {
  const d = await getDb();
  const like = `%${fraza}%`;
  return await d.select<Badanie[]>(
    `SELECT * FROM badania
     WHERE imie_zwierzecia LIKE $1 OR wlasciciel LIKE $2 OR nr_chipa LIKE $3 OR rasa LIKE $4
     ORDER BY data_badania DESC`,
    [like, like, like, like]
  );
}
