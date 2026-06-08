import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FloralBackdrop, GradHeader } from "@/components/FloralBackdrop";
import { store } from "@/lib/grad-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — تجمع التخرج 2026" },
      { name: "description", content: "سجل اسمك ورقم تليفونك لحجز مكانك في تجمع التخرج 2026" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const u = store.getCurrentUser();
    if (u) navigate({ to: "/booking" });
  }, [navigate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) { setError("ادخل اسم صحيح"); return; }
    if (!/^[0-9+\-\s]{7,}$/.test(phone.trim())) { setError("ادخل رقم تليفون صحيح"); return; }
    const students = store.getStudents();
    let existing = students.find(s => s.phone === phone.trim());
    if (!existing) {
      existing = {
        id: crypto.randomUUID(),
        name: name.trim(),
        phone: phone.trim(),
        itemId: null,
        paid: false,
        createdAt: Date.now(),
      };
      store.setStudents([...students, existing]);
    } else {
      existing.name = name.trim();
      store.setStudents(students.map(s => s.id === existing!.id ? existing! : s));
    }
    store.setCurrentUser(existing);
    navigate({ to: "/booking" });
  }

  return (
    <FloralBackdrop>
      <GradHeader subtitle="احجز مكانك ووجبتك في حفل التخرج" />
      <main className="px-4 pb-16">
        <form onSubmit={submit} className="floral-card mx-auto max-w-md p-7 md:p-9">
          <h2 className="text-2xl font-bold mb-1">🌸 تسجيل الدخول</h2>
          <p className="text-sm text-muted-foreground mb-6">ادخل بياناتك لحجز مكانك بالحفلة</p>

          <label className="block text-sm font-semibold mb-2">الاسم الكامل</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="مثال: أحمد محمد"
            className="w-full rounded-xl bg-cream/60 border border-border px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-ring text-right"
          />

          <label className="block text-sm font-semibold mb-2">رقم التليفون</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            inputMode="tel"
            className="w-full rounded-xl bg-cream/60 border border-border px-4 py-3 mb-2 outline-none focus:ring-2 focus:ring-ring text-right"
          />

          {error && <p className="text-destructive text-sm mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full mt-6 rounded-xl py-3.5 font-bold text-primary-foreground shadow-soft transition hover:scale-[1.02]"
            style={{ background: "var(--gradient-rose)" }}
          >
            🌹 تسجيل الدخول / حجز مكان
          </button>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/admin" className="hover:text-primary">لوحة الأدمن →</Link>
          </div>
        </form>
      </main>
    </FloralBackdrop>
  );
}
