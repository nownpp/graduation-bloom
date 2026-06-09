// Cloud-backed data layer for graduation booking app
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji?: string | null;
  hidden?: boolean;
  sort_order?: number;
};

export type Student = {
  id: string;
  name: string;
  phone: string;
  item_ids: string[];
  donation: number;
  paid: boolean;
  created_at?: string;
};

export type Settings = {
  waterPrice: number;
  deliveryFee: number;
};

const CURRENT_USER_KEY = "grad2026_current_user";

export function isDrink(cat: string) {
  return /مشروب|💧/.test(cat);
}

export function computeTotals(
  student: { item_ids?: string[]; donation?: number | null },
  menu: MenuItem[],
  settings: Settings,
) {
  const items = (student.item_ids ?? [])
    .map(id => menu.find(m => m.id === id))
    .filter((x): x is MenuItem => !!x);
  const drinksItems = items.filter(i => isDrink(i.category));
  const foodItems = items.filter(i => !isDrink(i.category));
  const food = foodItems.reduce((a, b) => a + Number(b.price), 0);
  const drinks = drinksItems.reduce((a, b) => a + Number(b.price), 0);
  const delivery = items.length > 0 ? settings.deliveryFee : 0;
  const donation = Math.max(0, Number(student.donation ?? 0) || 0);
  const total = food + drinks + delivery + donation;
  return { items, foodItems, drinksItems, food, drinks, delivery, donation, total };
}

// ============= Realtime hooks =============

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("menu_items" as any)
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setMenu(data as any);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("menu_items_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  return { menu, loading, refresh };
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("students" as any)
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setStudents(data as any);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("students_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  return { students, loading, refresh };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({ waterPrice: 10, deliveryFee: 10 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("app_settings" as any)
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (data) {
      const row = data as any;
      setSettings({ waterPrice: Number(row.water_price), deliveryFee: Number(row.delivery_fee) });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("settings_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  return { settings, loading, refresh };
}

// ============= Mutations =============

export const api = {
  async addMenuItem(item: Omit<MenuItem, "id">) {
    const { data, error } = await supabase
      .from("menu_items" as any)
      .insert([{ ...item, emoji: item.emoji ?? null }] as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async updateMenuItem(id: string, patch: Partial<MenuItem>) {
    const { error } = await supabase.from("menu_items" as any).update(patch as any).eq("id", id);
    if (error) throw error;
  },
  async deleteMenuItem(id: string) {
    const { error } = await supabase.from("menu_items" as any).delete().eq("id", id);
    if (error) throw error;
  },

  async upsertStudent(s: { id?: string; name: string; phone: string }) {
    // Try by phone first
    const { data: existing } = await supabase
      .from("students" as any)
      .select("*")
      .eq("phone", s.phone)
      .maybeSingle();
    if (existing) {
      const { data, error } = await supabase
        .from("students" as any)
        .update({ name: s.name } as any)
        .eq("id", (existing as any).id)
        .select()
        .single();
      if (error) throw error;
      return data as any as Student;
    }
    const { data, error } = await supabase
      .from("students" as any)
      .insert([{ name: s.name, phone: s.phone }] as any)
      .select()
      .single();
    if (error) throw error;
    return data as any as Student;
  },
  async updateStudent(id: string, patch: Partial<Student>) {
    const { error } = await supabase.from("students" as any).update(patch as any).eq("id", id);
    if (error) throw error;
  },
  async deleteStudent(id: string) {
    const { error } = await supabase.from("students" as any).delete().eq("id", id);
    if (error) throw error;
  },

  async saveSettings(s: Settings) {
    const { error } = await supabase
      .from("app_settings" as any)
      .update({ water_price: s.waterPrice, delivery_fee: s.deliveryFee, updated_at: new Date().toISOString() } as any)
      .eq("id", 1);
    if (error) throw error;
    // Also sync "مياه" price
    await supabase.from("menu_items" as any).update({ price: s.waterPrice } as any).eq("name", "مياه");
  },
};

// ============= Current user (local only) =============

export function getCurrentUser(): { id: string; phone: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CURRENT_USER_KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
export function setCurrentUser(u: { id: string; phone: string } | null) {
  if (typeof window === "undefined") return;
  if (u) window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
  else window.localStorage.removeItem(CURRENT_USER_KEY);
}

export function useCurrentStudent() {
  const { students } = useStudents();
  const ref = getCurrentUser();
  const student = ref ? students.find(s => s.id === ref.id) ?? null : null;
  return student;
}
