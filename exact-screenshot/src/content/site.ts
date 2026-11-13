// ============================================================
// AgroMax — editable site data. Change contacts, products, categories here.
// Product names and pack text live in translations.ts (both languages).
// Values marked (vaqtinchalik) are placeholders — replace with real data.
// ============================================================
import eggSmall from "@/assets/egg-small.jpg";
import eggMedium from "@/assets/egg-medium.jpg";
import eggLarge from "@/assets/egg-large.jpg";
import dairy from "@/assets/dairy.jpg";
import chickenWhole from "@/assets/chicken-whole.jpg";
import chickenBreast from "@/assets/chicken-breast.jpg";
import chickenLeg from "@/assets/chicken-leg.jpg";
import chicken from "@/assets/chicken.jpg";
import beef from "@/assets/beef.jpg";

export const contacts = {
  phone: "+998 90 000 00 00", // vaqtinchalik
  phoneHref: "tel:+998900000000",
  telegram: "https://t.me/agromax_uz", // vaqtinchalik
  instagram: "https://instagram.com/agromax_uz", // vaqtinchalik
  mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=69.20%2C41.27%2C69.32%2C41.34&layer=mapnik",
  catalogPdf: "#", // vaqtinchalik PDF havola
};

// Form submissions are POSTed here as JSON. Leave empty to simulate.
// Later: point to a Lovable Cloud function, email or Telegram webhook.
export const formEndpoint = "/api/order";

export const categories = ["eggs", "chicken", "beef", "dairy"] as const;
export type Category = (typeof categories)[number];

/** fresh = yangi (tuxum), chilled = sovutilgan, frozen = muzlatilgan */
export type ProductState = "fresh" | "chilled" | "frozen";

export const products = [
  { id: "egg-s", category: "eggs", image: eggSmall, state: "fresh", temp: "+2…+20 °C", shelfDays: 25 },
  { id: "egg-m", category: "eggs", image: eggMedium, state: "fresh", temp: "+2…+20 °C", shelfDays: 25 },
  { id: "egg-l", category: "eggs", image: eggLarge, state: "fresh", temp: "+2…+20 °C", shelfDays: 25 },
  { id: "chicken-whole", category: "chicken", image: chickenWhole, state: "chilled", temp: "0…+4 °C", shelfDays: 7 },
  { id: "chicken-breast", category: "chicken", image: chickenBreast, state: "chilled", temp: "0…+4 °C", shelfDays: 7 },
  { id: "chicken-leg", category: "chicken", image: chickenLeg, state: "chilled", temp: "0…+4 °C", shelfDays: 7 },
  { id: "chicken-wing", category: "chicken", image: chicken, state: "frozen", temp: "−18 °C", shelfDays: 180 },
  { id: "chicken-mince", category: "chicken", image: chicken, state: "frozen", temp: "−18 °C", shelfDays: 90 },
  { id: "beef-tender", category: "beef", image: beef, state: "chilled", temp: "0…+4 °C", shelfDays: 10 },
  { id: "beef-soup", category: "beef", image: beef, state: "chilled", temp: "0…+4 °C", shelfDays: 10 },
  { id: "beef-ribs", category: "beef", image: beef, state: "frozen", temp: "−18 °C", shelfDays: 180 },
  { id: "beef-mince", category: "beef", image: beef, state: "frozen", temp: "−18 °C", shelfDays: 90 },
  { id: "qatiq", category: "dairy", image: dairy, state: "chilled", temp: "+2…+6 °C", shelfDays: 7 },
  { id: "milk", category: "dairy", image: dairy, state: "chilled", temp: "+2…+6 °C", shelfDays: 5 },
  { id: "cream", category: "dairy", image: dairy, state: "chilled", temp: "+2…+6 °C", shelfDays: 7 },
] as const satisfies readonly { id: string; category: Category; image: string; state: ProductState; temp: string; shelfDays: number }[];

export type ProductId = (typeof products)[number]["id"];
