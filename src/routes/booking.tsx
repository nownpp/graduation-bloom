import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FloralBackdrop, GradHeader } from "@/components/FloralBackdrop";
import { store, useStorageVersion, type MenuItem } from "@/lib/grad-store";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [{ title: "حجز الوجبة — تجمع التخرج 2026" }],
  }),
  component: BookingPage,
});

function BookingPage() {
  const navigate = useNavigate();
  useStorageVersion();
  const [user, setUser] = useState(() => store.getCurrentUser());
  const [itemId, setItemId] = useState<string>(user?.itemId ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);

  const menu = store.getMenu().filter(m => !m.hidden);
  const settings = store.getSettings();

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    menu.forEach(m => {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    });
    return Array.from(map.entries());
  }, [menu]);

  const selected = menu.find(m => m.id === itemId) || null;
  const foodPrice = selected?.price ?? 0;
  const delivery = selected ? settings.deliveryFee : 0;
  const total = foodPrice + delivery;

  function save() {
    if (!user) return;
    const students = store.getStudents();
    const updated = students.map(s => s.id === user.id ? { ...s, itemId: itemId || null } : s);
    store.setStudents(updated);
    const me = updated.find(s => s.id === user.id)!;
    store.setCurrentUser(me);
    setUser(me);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function logout() {
    store.setCurrentUser(null);
    navigate({ to: "/" });
  }

  if (!user) return null;

  return (
    <FloralBackdrop>
      <GradHeader />
      <main className="px-4 pb-16 max-w-2xl mx-auto">
        <div className="floral-card p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <p className="text-sm text-muted-foreground">أهلاً بيك 🌹</p>
              <h2 className="text-2xl font-bold text-gradient-rose">{user.name}</h2>
              <p className="text-xs text-muted-foreground mt-1">📱 {user.phone}</p>
            </div>
            <button onClick={logout} className="text-xs text-muted-foreground hover:text-destructive underline">
              تسجيل خروج
            </button>
          </div>
        </div>

        <div className="floral-card p-6 md:p-8">
          <h3 className="text-xl font-bold mb-1">🍽️ اختار وجبتك</h3>
          <p className="text-sm text-muted-foreground mb-5">اختر من القائمة، الديلفري {settings.deliveryFee} جنيه</p>

          <div className="space-y-4">
            {grouped.map(([cat, items]) => (
              <div key={cat}>
                <label className="block text-sm font-bold mb-2 text-rose-deep" style={{ color: "var(--rose-deep)" }}>
                  {cat}
                </label>
                <select
                  value={items.some(i => i.id === itemId) ? itemId : ""}
                  onChange={e => setItemId(e.target.value)}
                  className="w-full rounded-xl bg-cream/60 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-right"
                >
                  <option value="">— اختر من {cat} —</option>
                  {items.map(it => (
                    <option key={it.id} value={it.id}>
                      {it.emoji ?? ""} {it.name} — {it.price} جنيه
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {selected && (
            <div className="mt-6 rounded-xl bg-cream/70 border border-border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{selected.emoji} {selected.name}</span>
                <span className="font-semibold">{foodPrice} جنيه</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>🛵 رسوم الديلفري</span>
                <span>{delivery} جنيه</span>
              </div>
              <div className="border-t border-border my-2" />
              <div
                className="rounded-lg p-3 text-center font-bold text-lg text-primary-foreground"
                style={{ background: "var(--gradient-rose)" }}
              >
                إجمالي المبلغ المطلوب: {total} جنيه
              </div>
            </div>
          )}

          <button
            onClick={save}
            disabled={!itemId}
            className="w-full mt-6 rounded-xl py-3.5 font-bold text-primary-foreground shadow-gold transition disabled:opacity-50 hover:scale-[1.02]"
            style={{ background: "var(--gradient-gold)" }}
          >
            {saved ? "✅ تم حفظ طلبك" : "💾 تأكيد الحجز"}
          </button>
        </div>
      </main>
    </FloralBackdrop>
  );
}
