import seedData from "@/data/printhub-seed-data.json";
import { setDoc, doc } from "firebase/firestore";
import { firebaseDb, isFirebaseEnabled } from "@/lib/firebase";

export interface SeedImportPayload {
  services: any[];
  products: any[];
  users: any[];
  orders: any[];
  carousel: any[];
  settings: any;
  offers: any[];
}

export async function importSeedDataFromJson(payload: SeedImportPayload = seedData as SeedImportPayload) {
  if (!isFirebaseEnabled || !firebaseDb) {
    throw new Error("Firebase is not configured.");
  }

  const db = firebaseDb;
  const tasks: Promise<unknown>[] = [];

  payload.services.forEach((item) => {
    tasks.push(setDoc(doc(db, "services", item.id), item));
  });

  payload.products.forEach((item) => {
    tasks.push(setDoc(doc(db, "products", item.id), item));
  });

  payload.users.forEach((item) => {
    tasks.push(setDoc(doc(db, "users", item.uid), item));
  });

  payload.orders.forEach((item) => {
    tasks.push(setDoc(doc(db, "orders", item.id), item));
  });

  payload.carousel.forEach((item) => {
    tasks.push(setDoc(doc(db, "carousel", item.id), item));
  });

  (payload.offers ?? []).forEach((item: { id: string }) => {
    tasks.push(setDoc(doc(db, "offers", item.id), item));
  });

  tasks.push(setDoc(doc(db, "settings", "app-settings"), payload.settings));

  await Promise.all(tasks);
}
