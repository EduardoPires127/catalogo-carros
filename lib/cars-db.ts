import { getPool, isConfigured } from "./mysql";
import { Car } from "@/types/car";
import { cars as staticCars, WHATSAPP_NUMBER } from "@/data/cars";

// Converte linha do MySQL (JSON strings) para Car
function rowToCar(row: Record<string, unknown>): Car {
  return {
    ...row,
    images: typeof row.images === "string" ? JSON.parse(row.images) : row.images ?? [],
    features: typeof row.features === "string" ? JSON.parse(row.features) : row.features ?? [],
  } as Car;
}

export async function getAllCars(): Promise<Car[]> {
  if (!isConfigured()) return staticCars;
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cars ORDER BY created_at DESC");
    return (rows as Record<string, unknown>[]).map(rowToCar);
  } catch (e) {
    console.error("MySQL getAllCars:", e);
    return staticCars;
  }
}

export async function getCarById(id: string): Promise<Car | null> {
  if (!isConfigured()) return staticCars.find((c) => c.id === id) ?? null;
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cars WHERE id = ? LIMIT 1", [id]);
    const data = rows as Record<string, unknown>[];
    if (!data.length) return null;
    return rowToCar(data[0]);
  } catch (e) {
    console.error("MySQL getCarById:", e);
    return staticCars.find((c) => c.id === id) ?? null;
  }
}

export async function createCar(car: Omit<Car, "id" | "whatsapp">): Promise<Car | null> {
  if (!isConfigured()) return null;
  try {
    const pool = getPool();
    const id = Date.now().toString();
    const newCar = { ...car, id, whatsapp: WHATSAPP_NUMBER };

    await pool.query(
      `INSERT INTO cars (id, brand, model, version, year, price, mileage, color, fuel, transmission, doors, status, images, description, features, whatsapp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCar.id, newCar.brand, newCar.model, newCar.version,
        newCar.year, newCar.price, newCar.mileage, newCar.color,
        newCar.fuel, newCar.transmission, newCar.doors, newCar.status,
        JSON.stringify(newCar.images), newCar.description,
        JSON.stringify(newCar.features), newCar.whatsapp,
      ]
    );

    return newCar as Car;
  } catch (e) {
    console.error("MySQL createCar:", e);
    return null;
  }
}

export async function updateCar(id: string, car: Partial<Car>): Promise<Car | null> {
  if (!isConfigured()) return null;
  try {
    const pool = getPool();
    const fields = { ...car };

    if (fields.images) fields.images = JSON.stringify(fields.images) as unknown as string[];
    if (fields.features) fields.features = JSON.stringify(fields.features) as unknown as string[];

    const keys = Object.keys(fields).filter((k) => k !== "id");
    const values = keys.map((k) => (fields as Record<string, unknown>)[k]);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");

    await pool.query(`UPDATE cars SET ${setClause} WHERE id = ?`, [...values, id]);
    return getCarById(id);
  } catch (e) {
    console.error("MySQL updateCar:", e);
    return null;
  }
}

export async function deleteCar(id: string): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    const pool = getPool();
    await pool.query("DELETE FROM cars WHERE id = ?", [id]);
    return true;
  } catch (e) {
    console.error("MySQL deleteCar:", e);
    return false;
  }
}
