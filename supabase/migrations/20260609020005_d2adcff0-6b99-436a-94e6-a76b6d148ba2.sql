
-- Settings (singleton)
CREATE TABLE public.app_settings (
  id int PRIMARY KEY DEFAULT 1,
  water_price numeric NOT NULL DEFAULT 10,
  delivery_fee numeric NOT NULL DEFAULT 10,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_singleton CHECK (id = 1)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "public write settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
INSERT INTO public.app_settings (id, water_price, delivery_fee) VALUES (1, 10, 10);

-- Menu items
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  emoji text,
  hidden boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read menu" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "public write menu" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);

-- Students
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  item_ids uuid[] NOT NULL DEFAULT '{}',
  donation numeric NOT NULL DEFAULT 0,
  paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon, authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "public write students" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER TABLE public.app_settings REPLICA IDENTITY FULL;
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;

-- Seed default menu
INSERT INTO public.menu_items (name, price, category, emoji, sort_order) VALUES
('نصف فرخة بروستد (وركين)', 200, '🍗 وجبات الدجاج (بروستد ومشوي)', '🍗', 1),
('نصف فرخة مشوية (وركين)', 200, '🍗 وجبات الدجاج (بروستد ومشوي)', '🍗', 2),
('وجبة كرسبي 4 قطع', 165, '🍗 وجبات الدجاج (بروستد ومشوي)', '🍗', 3),
('وجبة سبايسي 4 قطع', 165, '🍗 وجبات الدجاج (بروستد ومشوي)', '🌶️', 4),
('وجبة شيش طاووق', 180, '🍗 وجبات الدجاج (بروستد ومشوي)', '🍢', 5),
('كفتة فراخ مع أرز', 145, '🍗 وجبات الدجاج (بروستد ومشوي)', '🍚', 6),
('ربع فرخة بروستد (صدر)', 145, '🍗 وجبات الدجاج (بروستد ومشوي)', '🍗', 7),
('ربع فرخة مشوية (صدر)', 140, '🍗 وجبات الدجاج (بروستد ومشوي)', '🍗', 8),
('ربع فرخة بروستد (ورك)', 115, '🍗 وجبات الدجاج (بروستد ومشوي)', '🍗', 9),
('ربع فرخة مشوية (ورك)', 115, '🍗 وجبات الدجاج (بروستد ومشوي)', '🍗', 10),
('وجبة شاورما فرط ميكس', 195, '🌯 وجبات وفتة الشاورما', '🌯', 11),
('وجبة فتة شاورما لحم كبير', 170, '🌯 وجبات وفتة الشاورما', '🥘', 12),
('وجبة فتة شاورما ميكس كبير', 145, '🌯 وجبات وفتة الشاورما', '🥘', 13),
('وجبة شاورما عربي لحم', 140, '🌯 وجبات وفتة الشاورما', '🌯', 14),
('وجبة شاورما فرط فراخ', 140, '🌯 وجبات وفتة الشاورما', '🌯', 15),
('وجبة ماريا', 130, '🌯 وجبات وفتة الشاورما', '🍽️', 16),
('وجبة شاورما عربي فراخ', 120, '🌯 وجبات وفتة الشاورما', '🌯', 17),
('وجبة فتة شاورما فراخ كبير', 120, '🌯 وجبات وفتة الشاورما', '🥘', 18),
('ساندوتش تشكن كلاسيك الشامي', 200, '🍔 الساندوتشات (حجم كبير)', '🥪', 19),
('ساندوتش تشكن سبايسي الشامي', 200, '🍔 الساندوتشات (حجم كبير)', '🌶️', 20),
('ساندوتش فرانشيسكو', 110, '🍔 الساندوتشات (حجم كبير)', '🥪', 21),
('ساندوتش فاهيتا دجاج', 110, '🍔 الساندوتشات (حجم كبير)', '🥪', 22),
('ساندوتش شاورما لحم', 110, '🍔 الساندوتشات (حجم كبير)', '🥪', 23),
('ساندوتش كباب', 110, '🍔 الساندوتشات (حجم كبير)', '🍢', 24),
('برجر لحم', 100, '🍔 الساندوتشات (حجم كبير)', '🍔', 25),
('مياه', 10, '💧 المشروبات', '💧', 26);
