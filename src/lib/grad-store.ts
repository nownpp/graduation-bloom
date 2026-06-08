// LocalStorage data layer for graduation booking app
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji?: string;
  hidden?: boolean;
};

export type Student = {
  id: string;
  name: string;
  phone: string;
  itemId?: string | null;
  paid?: boolean;
  createdAt: number;
};

export type Settings = {
  waterPrice: number;
  deliveryFee: number;
};

const KEYS = {
  menu: "grad2026_menu",
  students: "grad2026_students",
  settings: "grad2026_settings",
  currentUser: "grad2026_current_user",
};

const DEFAULT_MENU: MenuItem[] = [
  // Chicken
  { id: "c1", category: "🍗 وجبات الدجاج (بروستد ومشوي)", name: "نصف فرخة بروستد (وركين)", price: 200, emoji: "🍗" },
  { id: "c2", category: "🍗 وجبات الدجاج (بروستد ومشوي)", name: "نصف فرخة مشوية (وركين)", price: 200, emoji: "🍗" },
  { id: "c3", category: "🍗 وجبات الدجاج (بروستد ومشوي)", name: "وجبة كرسبي 4 قطع", price: 165, emoji: "🍗" },
  { id: "c4", category: "🍗 وجبات الدجاج (بروستد ومشوي)", name: "وجبة سبايسي 4 قطع", price: 165, emoji: "🌶️" },
  { id: "c5", category: "🍗 وجبات الدجاج (بروستد ومشوي)", name: "وجبة شيش طاووق", price: 180, emoji: "🍢" },
  { id: "c6", category: "🍗 وجبات الدجاج (بروستد ومشوي)", name: "كفتة فراخ مع أرز", price: 145, emoji: "🍚" },
  { id: "c7", category: "🍗 وجبات الدجاج (بروستد ومشوي)", name: "ربع فرخة بروستد (صدر)", price: 145, emoji: "🍗" },
  { id: "c8", category: "🍗 وجبات الدجاج (بروستد ومشوي)", name: "ربع فرخة مشوية (صدر)", price: 140, emoji: "🍗" },
  { id: "c9", category: "🍗 وجبات الدجاج (بروستد ومشوي)", name: "ربع فرخة بروستد (ورك)", price: 115, emoji: "🍗" },
  { id: "c10", category: "🍗 وجبات الدجاج (بروستد ومشوي)", name: "ربع فرخة مشوية (ورك)", price: 115, emoji: "🍗" },
  // Shawarma
  { id: "s1", category: "🌯 وجبات وفتة الشاورما", name: "وجبة شاورما فرط ميكس", price: 195, emoji: "🌯" },
  { id: "s2", category: "🌯 وجبات وفتة الشاورما", name: "وجبة فتة شاورما لحم كبير", price: 170, emoji: "🥘" },
  { id: "s3", category: "🌯 وجبات وفتة الشاورما", name: "وجبة فتة شاورما ميكس كبير", price: 145, emoji: "🥘" },
  { id: "s4", category: "🌯 وجبات وفتة الشاورما", name: "وجبة شاورما عربي لحم", price: 140, emoji: "🌯" },
  { id: "s5", category: "🌯 وجبات وفتة الشاورما", name: "وجبة شاورما فرط فراخ", price: 140, emoji: "🌯" },
  { id: "s6", category: "🌯 وجبات وفتة الشاورما", name: "وجبة ماريا", price: 130, emoji: "🍽️" },
  { id: "s7", category: "🌯 وجبات وفتة الشاورما", name: "وجبة شاورما عربي فراخ", price: 120, emoji: "🌯" },
  { id: "s8", category: "🌯 وجبات وفتة الشاورما", name: "وجبة فتة شاورما فراخ كبير", price: 120, emoji: "🥘" },
  // Sandwiches
  { id: "n1", category: "🍔 الساندوتشات (حجم كبير)", name: "ساندوتش تشكن كلاسيك الشامي", price: 200, emoji: "🥪" },
  { id: "n2", category: "🍔 الساندوتشات (حجم كبير)", name: "ساندوتش تشكن سبايسي الشامي", price: 200, emoji: "🌶️" },
  { id: "n3", category: "🍔 الساندوتشات (حجم كبير)", name: "ساندوتش فرانشيسكو", price: 110, emoji: "🥪" },
  { id: "n4", category: "🍔 الساندوتشات (حجم كبير)", name: "ساندوتش فاهيتا دجاج", price: 110, emoji: "🥪" },
  { id: "n5", category: "🍔 الساندوتشات (حجم كبير)", name: "ساندوتش شاورما لحم", price: 110, emoji: "🥪" },
  { id: "n6", category: "🍔 الساندوتشات (حجم كبير)", name: "ساندوتش كباب", price: 110, emoji: "🍢" },
  { id: "n7", category: "🍔 الساندوتشات (حجم كبير)", name: "برجر لحم", price: 100, emoji: "🍔" },
  // Drinks
  { id: "d1", category: "💧 المشروبات", name: "مياه", price: 10, emoji: "💧" },
];

const DEFAULT_SETTINGS: Settings = { waterPrice: 10, deliveryFee: 10 };

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("grad2026:update"));
}

export const store = {
  getMenu(): MenuItem[] {
    const m = safeGet<MenuItem[] | null>(KEYS.menu, null);
    if (!m) {
      safeSet(KEYS.menu, DEFAULT_MENU);
      return DEFAULT_MENU;
    }
    return m;
  },
  setMenu(m: MenuItem[]) { safeSet(KEYS.menu, m); },
  getStudents(): Student[] { return safeGet<Student[]>(KEYS.students, []); },
  setStudents(s: Student[]) { safeSet(KEYS.students, s); },
  getSettings(): Settings {
    const s = safeGet<Settings | null>(KEYS.settings, null);
    if (!s) { safeSet(KEYS.settings, DEFAULT_SETTINGS); return DEFAULT_SETTINGS; }
    return { ...DEFAULT_SETTINGS, ...s };
  },
  setSettings(s: Settings) {
    safeSet(KEYS.settings, s);
    // also sync water price into menu item named "مياه"
    const menu = store.getMenu();
    const updated = menu.map(m => m.name === "مياه" ? { ...m, price: s.waterPrice } : m);
    safeSet(KEYS.menu, updated);
  },
  getCurrentUser(): Student | null { return safeGet<Student | null>(KEYS.currentUser, null); },
  setCurrentUser(s: Student | null) { safeSet(KEYS.currentUser, s); },
  resetAll() {
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach(k => window.localStorage.removeItem(k));
    window.dispatchEvent(new Event("grad2026:update"));
  },
};

export function useStorageVersion() {
  // hook to re-render on storage updates
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect, useState } = require("react") as typeof import("react");
  const [v, setV] = useState(0);
  useEffect(() => {
    const handler = () => setV(x => x + 1);
    window.addEventListener("grad2026:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("grad2026:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return v;
}
