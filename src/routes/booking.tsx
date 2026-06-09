import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FloralBackdrop, GradHeader } from "@/components/FloralBackdrop";
import { store, useStorageVersion, computeTotals, type MenuItem } from "@/lib/grad-store";

export const Route = createFileRoute("/booking")({
  head: () => ({ meta: [{ title: "حجز الوجبة — تجمع التخرج 2026" }] }),
  component: BookingPage,
});

function BookingPage() {
  const navigate = useNavigate();
  useStorageVersion();
  const [user, setUser] = useState(() => store.getCurrentUser());
  const [selected, setSelected] = useState<string[]>(user?.itemIds ?? []);
  const [donation, setDonation] = useState<number>(user?.donation ?? 0);
  const [editing, setEditing] = useState<boolean>(!(user?.itemIds && user.itemIds.length > 0));

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

  const preview = computeTotals({ itemIds: selected, donation }, menu, settings);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function confirm() {
    if (!user || selected.length === 0) return;
    const students = store.getStudents();
    const updated = students.map(s =>
      s.id === user.id ? { ...s, itemIds: selected, donation: Math.max(0, donation || 0) } : s
    );
    store.setStudents(updated);
    const me = updated.find(s => s.id === user.id)!;
    store.setCurrentUser(me);
    setUser(me);
    setEditing(false);
  }

  function logout() {
    store.setCurrentUser(null);
    navigate({ to: "/" });
  }

  if (!user) return null;

  // Confirmed view uses fresh menu (no hidden filter so removed items still show price if present)
  const fullMenu = store.getMenu();
  const confirmed = computeTotals(user, fullMenu, settings);

  return (
    <FloralBackdrop>
      <GradHeader />
      <main className="px-4 pb-16 max-w-2xl mx-auto">
        <div className="floral-card p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between gap-3">
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

        {!editing && confirmed.items.length > 0 ? (
          <div className="floral-card p-6 md:p-8">
            <div className="text-center mb-5">
              <div className="text-5xl mb-2">✅</div>
              <h3 className="text-xl font-bold text-gradient-rose">تم تأكيد طلبك</h3>
              <p className="text-sm text-muted-foreground mt-1">تم إضافة طلبك إلى قائمة الأدمن</p>
            </div>

            <div className="space-y-2">
              {confirmed.items.map(it => (
                <div key={it.id} className="flex justify-between items-center bg-cream/70 rounded-xl p-3 border border-border">
                  <span className="font-semibold">{it.emoji} {it.name}</span>
                  <span className="font-bold">{it.price} ج</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-cream/70 border border-border p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>إجمالي الوجبات</span><span className="font-semibold">{confirmed.food} ج</span></div>
              <div className="flex justify-between"><span>إجمالي المشروبات</span><span className="font-semibold">{confirmed.drinks} ج</span></div>
              <div className="flex justify-between text-muted-foreground"><span>🛵 رسوم الديلفري</span><span>{confirmed.delivery} ج</span></div>
              {confirmed.donation > 0 && (
                <div className="flex justify-between"><span>🌷 تبرع</span><span className="font-semibold">{confirmed.donation} ج</span></div>
              )}
              <div className="border-t border-border my-2" />
              <div className="rounded-lg p-3 text-center font-bold text-lg text-primary-foreground" style={{ background: "var(--gradient-rose)" }}>
                إجمالي المبلغ المطلوب: {confirmed.total} جنيه
              </div>
            </div>

            <button
              onClick={() => { setSelected(user.itemIds ?? []); setDonation(user.donation ?? 0); setEditing(true); }}
              className="w-full mt-5 rounded-xl py-3 font-bold border-2 border-border bg-cream/60 hover:bg-cream"
            >
              ✏️ تعديل الطلب
            </button>
          </div>
        ) : (
          <div className="floral-card p-6 md:p-8">
            <h3 className="text-xl font-bold mb-1">🍽️ اختار وجباتك</h3>
            <p className="text-sm text-muted-foreground mb-5">
              يمكنك اختيار أكثر من صنف. الديلفري {settings.deliveryFee} جنيه يُضاف مرة واحدة.
            </p>

            <div className="space-y-6">
              {grouped.map(([cat, items]) => (
                <div key={cat}>
                  <h4 className="font-bold mb-2" style={{ color: "var(--rose-deep)" }}>{cat}</h4>
                  <div className="space-y-2">
                    {items.map(it => {
                      const checked = selected.includes(it.id);
                      return (
                        <label
                          key={it.id}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3 cursor-pointer transition ${
                            checked ? "border-primary bg-cream shadow-soft" : "border-border bg-cream/40 hover:bg-cream/70"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(it.id)}
                              className="w-5 h-5 accent-[color:var(--rose-deep)]"
                            />
                            <span className="font-semibold">{it.emoji} {it.name}</span>
                          </div>
                          <span className="font-bold text-sm">{it.price} ج</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Donation */}
            <div className="mt-6 rounded-xl border border-border bg-cream/60 p-4">
              <h4 className="font-bold mb-1">🌷 تبرع للحفلة (اختياري)</h4>
              <p className="text-xs text-muted-foreground mb-3">يمكنك زيادة أو إنقاص المبلغ</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDonation(d => Math.max(0, (Number(d) || 0) - 10))}
                  className="w-11 h-11 rounded-full font-black text-lg bg-card border-2 border-border hover:bg-cream"
                >−</button>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    value={donation}
                    onChange={e => setDonation(Math.max(0, Number(e.target.value) || 0))}
                    className="w-24 text-center rounded-lg border border-border bg-card px-2 py-2 font-bold text-lg"
                  />
                  <span className="text-sm text-muted-foreground">ج</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDonation(d => (Number(d) || 0) + 10)}
                  className="w-11 h-11 rounded-full font-black text-lg text-primary-foreground"
                  style={{ background: "var(--gradient-rose)" }}
                >+</button>
              </div>
            </div>

            {selected.length > 0 && (
              <div className="mt-6 rounded-xl bg-cream/70 border border-border p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>عدد الأصناف</span><span className="font-semibold">{selected.length}</span></div>
                <div className="flex justify-between"><span>إجمالي الوجبات</span><span className="font-semibold">{preview.food} ج</span></div>
                <div className="flex justify-between"><span>إجمالي المشروبات</span><span className="font-semibold">{preview.drinks} ج</span></div>
                <div className="flex justify-between text-muted-foreground"><span>🛵 رسوم الديلفري</span><span>{preview.delivery} ج</span></div>
                {preview.donation > 0 && (
                  <div className="flex justify-between"><span>🌷 تبرع</span><span className="font-semibold">{preview.donation} ج</span></div>
                )}
                <div className="border-t border-border my-2" />
                <div className="rounded-lg p-3 text-center font-bold text-lg text-primary-foreground" style={{ background: "var(--gradient-rose)" }}>
                  إجمالي المبلغ المطلوب: {preview.total} جنيه
                </div>
              </div>
            )}

            <button
              onClick={confirm}
              disabled={selected.length === 0}
              className="w-full mt-6 rounded-xl py-3.5 font-bold text-primary-foreground shadow-gold transition disabled:opacity-50 hover:scale-[1.02]"
              style={{ background: "var(--gradient-gold)" }}
            >
              💾 تأكيد الحجز
            </button>
          </div>
        )}
      </main>
    </FloralBackdrop>
  );
}
