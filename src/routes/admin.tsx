import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FloralBackdrop, GradHeader } from "@/components/FloralBackdrop";
import {
  useMenu, useStudents, useSettings,
  api, computeTotals,
  type MenuItem, type Student,
} from "@/lib/grad-store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الأدمن — تجمع التخرج 2026" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  if (!authed) {
    return (
      <FloralBackdrop>
        <GradHeader subtitle="لوحة تحكم الأدمن" />
        <main className="px-4 pb-16">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (pw === "admin123") setAuthed(true);
              else setErr("كلمة السر غير صحيحة");
            }}
            className="floral-card mx-auto max-w-md p-7"
          >
            <h2 className="text-xl font-bold mb-4">🔒 دخول الأدمن</h2>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="كلمة السر"
              className="w-full rounded-xl bg-cream/60 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-right"
            />
            {err && <p className="text-destructive text-sm mt-2">{err}</p>}
            <button
              type="submit"
              className="w-full mt-5 rounded-xl py-3 font-bold text-primary-foreground"
              style={{ background: "var(--gradient-rose)" }}
            >
              دخول
            </button>
          </form>
        </main>
      </FloralBackdrop>
    );
  }
  return <AdminDashboard />;
}

function AdminDashboard() {
  const { menu } = useMenu();
  const { students } = useStudents();
  const { settings } = useSettings();

  const studentsWithOrder = students.filter(s => (s.item_ids?.length ?? 0) > 0);
  const totals = students.map(s => ({ s, t: computeTotals(s, menu, settings) }));
  const totalExpected = totals.reduce((a, x) => a + x.t.total, 0);
  const totalCollected = totals.filter(x => x.s.paid).reduce((a, x) => a + x.t.total, 0);
  const totalFood = totals.reduce((a, x) => a + x.t.food, 0);
  const totalDrinks = totals.reduce((a, x) => a + x.t.drinks, 0);
  const totalDelivery = totals.reduce((a, x) => a + x.t.delivery, 0);
  const totalDonations = totals.reduce((a, x) => a + x.t.donation, 0);

  return (
    <FloralBackdrop>
      <GradHeader subtitle="لوحة الأدمن" />
      <main className="px-4 pb-20 max-w-6xl mx-auto space-y-8">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="إجمالي الحضور" value={students.length} emoji="👥" />
          <StatCard label="إجمالي الطلبات" value={studentsWithOrder.length} emoji="🍽️" />
          <StatCard label="المبالغ المتوقعة" value={`${totalExpected} ج`} emoji="💰" />
          <StatCard label="المبالغ المحصلة" value={`${totalCollected} ج`} emoji="✅" />
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="إجمالي الوجبات" value={`${totalFood} ج`} emoji="🍗" />
          <StatCard label="إجمالي المشروبات" value={`${totalDrinks} ج`} emoji="🥤" />
          <StatCard label="إجمالي الديلفري" value={`${totalDelivery} ج`} emoji="🛵" />
          <StatCard label="إجمالي التبرعات" value={`${totalDonations} ج`} emoji="🌷" />
        </section>

        <MenuManager menu={menu} />
        <PriceSettings />
        <OrderSummary students={students} menu={menu} />
        <StudentsTable students={students} menu={menu} settings={settings} />
        <ExportSection students={students} menu={menu} settings={settings} />
      </main>
    </FloralBackdrop>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div className="floral-card p-5 text-center">
      <div className="text-3xl mb-1">{emoji}</div>
      <div className="text-2xl font-black text-gradient-rose">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 font-semibold">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="floral-card p-5 md:p-7">
      <h2 className="text-xl font-bold mb-4 text-gradient-rose">{title}</h2>
      {children}
    </section>
  );
}

function MenuManager({ menu }: { menu: MenuItem[] }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [emoji, setEmoji] = useState("");
  const [category, setCategory] = useState("");
  const [newCat, setNewCat] = useState("");

  const categories = Array.from(new Set(menu.map(m => m.category)));
  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    menu.forEach(m => {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    });
    return Array.from(map.entries());
  }, [menu]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const cat = (category === "__new" ? newCat : category).trim();
    if (!name.trim() || !price || !cat) return;
    await api.addMenuItem({
      name: name.trim(),
      price: Number(price),
      category: cat,
      emoji: emoji.trim() || null,
      sort_order: menu.length + 1,
    });
    setName(""); setPrice(""); setEmoji(""); setNewCat("");
  }

  return (
    <Section title="🍽️ إدارة المنيو">
      <form onSubmit={addItem} className="grid md:grid-cols-5 gap-2 mb-6 bg-cream/60 p-4 rounded-xl">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="اسم الصنف" className="rounded-lg border border-border bg-card px-3 py-2 text-right" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-right">
          <option value="">— الفئة —</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
          <option value="__new">➕ فئة جديدة</option>
        </select>
        {category === "__new" ? (
          <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="اسم الفئة الجديدة" className="rounded-lg border border-border bg-card px-3 py-2 text-right" />
        ) : (
          <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="إيموجي (اختياري)" className="rounded-lg border border-border bg-card px-3 py-2 text-right" />
        )}
        <input value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="السعر" className="rounded-lg border border-border bg-card px-3 py-2 text-right" />
        <button type="submit" className="rounded-lg font-bold text-primary-foreground" style={{ background: "var(--gradient-gold)" }}>+ إضافة</button>
      </form>

      <div className="space-y-5">
        {grouped.map(([cat, items]) => (
          <div key={cat}>
            <h3 className="font-bold mb-2" style={{ color: "var(--rose-deep)" }}>{cat}</h3>
            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} className="grid grid-cols-12 gap-2 items-center bg-cream/40 rounded-lg p-2 text-sm">
                  <input
                    defaultValue={it.emoji ?? ""}
                    onBlur={e => { if (e.target.value !== (it.emoji ?? "")) api.updateMenuItem(it.id, { emoji: e.target.value }); }}
                    className="col-span-1 rounded border border-border bg-card px-2 py-1.5 text-center"
                  />
                  <input
                    defaultValue={it.name}
                    onBlur={e => { if (e.target.value !== it.name) api.updateMenuItem(it.id, { name: e.target.value }); }}
                    className="col-span-5 rounded border border-border bg-card px-2 py-1.5 text-right"
                  />
                  <select
                    defaultValue={it.category}
                    onChange={e => api.updateMenuItem(it.id, { category: e.target.value })}
                    className="col-span-3 rounded border border-border bg-card px-2 py-1.5 text-right"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="number"
                    defaultValue={it.price}
                    onBlur={e => { const n = Number(e.target.value); if (n !== it.price) api.updateMenuItem(it.id, { price: n }); }}
                    className="col-span-1 rounded border border-border bg-card px-2 py-1.5 text-right"
                  />
                  <button onClick={() => api.updateMenuItem(it.id, { hidden: !it.hidden })} className={`col-span-1 rounded px-2 py-1.5 text-xs font-bold ${it.hidden ? "bg-muted text-muted-foreground" : "bg-green-100 text-green-800"}`}>
                    {it.hidden ? "مخفي" : "ظاهر"}
                  </button>
                  <button
                    onClick={() => { if (confirm("احذف هذا الصنف؟")) api.deleteMenuItem(it.id); }}
                    className="col-span-1 rounded bg-destructive/10 text-destructive px-2 py-1.5 text-xs font-bold"
                  >حذف</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PriceSettings() {
  const { settings } = useSettings();
  return (
    <Section title="⚙️ ضبط الأسعار العامة">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">سعر المياه</label>
          <input
            type="number"
            defaultValue={settings.waterPrice}
            key={`w-${settings.waterPrice}`}
            onBlur={e => api.saveSettings({ ...settings, waterPrice: Number(e.target.value) })}
            className="w-full rounded-xl border border-border bg-cream/60 px-4 py-3 text-right"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">رسوم الديلفري</label>
          <input
            type="number"
            defaultValue={settings.deliveryFee}
            key={`d-${settings.deliveryFee}`}
            onBlur={e => api.saveSettings({ ...settings, deliveryFee: Number(e.target.value) })}
            className="w-full rounded-xl border border-border bg-cream/60 px-4 py-3 text-right"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">التغييرات تُحفظ تلقائياً عند الخروج من الحقل.</p>
    </Section>
  );
}

function OrderSummary({ students, menu }: { students: Student[]; menu: MenuItem[] }) {
  const counts = new Map<string, number>();
  students.forEach(s => {
    (s.item_ids ?? []).forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1));
  });
  const rows = Array.from(counts.entries()).map(([id, qty]) => {
    const it = menu.find(m => m.id === id);
    return { name: it?.name ?? "—", emoji: it?.emoji ?? "", qty, price: Number(it?.price ?? 0), total: Number(it?.price ?? 0) * qty };
  });
  const grand = rows.reduce((a, b) => a + b.total, 0);

  return (
    <Section title="📋 ملخص الطلبات (للمطعم)">
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">لا توجد طلبات بعد.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/70 text-right">
              <tr><th className="p-2">الصنف</th><th className="p-2">عدد الطلبات</th><th className="p-2">سعر الوحدة</th><th className="p-2">الإجمالي</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="p-2">{r.emoji} {r.name}</td>
                  <td className="p-2 font-bold">{r.qty}</td>
                  <td className="p-2">{r.price} ج</td>
                  <td className="p-2 font-bold">{r.total} ج</td>
                </tr>
              ))}
              <tr className="font-black" style={{ color: "var(--rose-deep)" }}>
                <td className="p-2" colSpan={3}>الإجمالي الكلي</td>
                <td className="p-2">{grand} ج</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

function StudentsTable({ students, menu, settings }: { students: Student[]; menu: MenuItem[]; settings: { waterPrice: number; deliveryFee: number } }) {
  return (
    <Section title="👥 قائمة الطلاب">
      {students.length === 0 ? (
        <p className="text-muted-foreground text-sm">لا يوجد طلاب مسجلين.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/70 text-right">
              <tr>
                <th className="p-2">الاسم</th><th className="p-2">التليفون</th><th className="p-2">الوجبة</th>
                <th className="p-2">وجبات</th><th className="p-2">مشروبات</th><th className="p-2">ديلفري</th>
                <th className="p-2">تبرع</th><th className="p-2">الإجمالي</th>
                <th className="p-2">الدفع</th><th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const t = computeTotals(s, menu, settings);
                return (
                  <tr key={s.id} className="border-b border-border">
                    <td className="p-2 font-bold">{s.name}</td>
                    <td className="p-2">{s.phone}</td>
                    <td className="p-2">
                      {t.items.length === 0 ? "—" : (
                        <ul className="space-y-0.5">
                          {t.items.map((it, idx) => (
                            <li key={idx}>{it.emoji ?? ""} {it.name} <span className="text-muted-foreground">({it.price} ج)</span></li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="p-2">{t.food} ج</td>
                    <td className="p-2">{t.drinks} ج</td>
                    <td className="p-2">{t.delivery} ج</td>
                    <td className="p-2">{t.donation} ج</td>
                    <td className="p-2 font-bold">{t.total} ج</td>
                    <td className="p-2">
                      <button
                        onClick={() => api.updateStudent(s.id, { paid: !s.paid })}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${s.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {s.paid ? "✅ دفع" : "🔴 لم يدفع"}
                      </button>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => { if (confirm("احذف هذا الطالب؟")) api.deleteStudent(s.id); }}
                        className="text-destructive text-xs"
                      >حذف</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

function ExportSection({ students, menu, settings }: { students: Student[]; menu: MenuItem[]; settings: { waterPrice: number; deliveryFee: number } }) {
  function exportCsv() {
    const header = ["الاسم", "التليفون", "الوجبة", "وجبات", "مشروبات", "ديلفري", "تبرع", "الإجمالي", "حالة الدفع"];
    const rows = students.map(s => {
      const t = computeTotals(s, menu, settings);
      const names = t.items.map(i => i.name).join(" + ");
      return [s.name, s.phone, names, t.food, t.drinks, t.delivery, t.donation, t.total, s.paid ? "دفع" : "لم يدفع"];
    });
    const csv = [header, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graduation-2026-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Section title="📤 تصدير البيانات">
      <button
        onClick={exportCsv}
        className="rounded-xl px-6 py-3 font-bold text-primary-foreground shadow-gold"
        style={{ background: "var(--gradient-gold)" }}
      >
        📊 تصدير CSV
      </button>
    </Section>
  );
}
