-- =====================================================================
-- Демо-данные для проверки сайта. Выполнять ПОСЛЕ schema.sql.
-- Когда наполните каталог реальными товарами — эти строки можно удалить:
--   delete from public.brands where slug in ('lumina','dermapro','vitaline');
-- =====================================================================

insert into public.brands (slug, name, description, sort_order) values
  ('lumina',   'Lumina',    'Аппараты для лазерной эпиляции и омоложения.', 1),
  ('dermapro', 'DermaPro',  'Косметологические аппараты для ухода за кожей лица.', 2),
  ('vitaline', 'Vitaline',  'Расходные материалы и профессиональная косметика.', 3)
on conflict (slug) do nothing;

insert into public.categories (brand_id, slug, name, sort_order)
select b.id, c.slug, c.name, c.sort_order
from public.brands b
join (values
  ('lumina',   'lazernaya-epilyaciya', 'Лазерная эпиляция', 1),
  ('lumina',   'omolozhenie',          'Омоложение',        2),
  ('dermapro', 'chistka-lica',         'Чистка лица',       1),
  ('dermapro', 'apparaty-rf',          'RF-лифтинг',        2),
  ('vitaline', 'rashodniki',           'Расходные материалы', 1)
) as c(brand_slug, slug, name, sort_order) on c.brand_slug = b.slug
on conflict (brand_id, slug) do nothing;

insert into public.products (brand_id, category_id, slug, name, short_description, description, price, old_price, sku, specs, is_featured, sort_order)
select b.id, c.id, p.slug, p.name, p.short_desc, p.descr, p.price, p.old_price, p.sku, p.specs::jsonb, p.featured, p.sort_order
from public.brands b
join public.categories c on c.brand_id = b.id
join (values
  ('lumina','lazernaya-epilyaciya','lumina-ice-800','Lumina ICE 800','Диодный лазер 808 нм с системой охлаждения','Профессиональный диодный лазер для эпиляции всех типов кожи. Сапфировое охлаждение до -4 °C, большой рабочий ресурс лампы.', 4500000, 5200000, 'LM-ICE-800', '[{"name":"Длина волны","value":"808 нм"},{"name":"Мощность","value":"800 Вт"},{"name":"Ресурс","value":"20 млн вспышек"}]', true, 1),
  ('lumina','lazernaya-epilyaciya','lumina-ice-1200','Lumina ICE 1200','Трёхволновой диодный лазер 755/808/1064 нм','Трёхволновой диодный лазер для салонов с высокой проходимостью. Подходит для всех фототипов кожи.', 7900000, null, 'LM-ICE-1200', '[{"name":"Длины волн","value":"755/808/1064 нм"},{"name":"Мощность","value":"1200 Вт"}]', true, 2),
  ('lumina','omolozhenie','lumina-glow-ipl','Lumina Glow IPL','IPL-аппарат для фотоомоложения','Широкополосный импульсный свет для фотоомоложения, лечения купероза и пигментации.', 2300000, null, 'LM-GLW', '[{"name":"Спектр","value":"530–1200 нм"}]', false, 1),
  ('dermapro','chistka-lica','dermapro-aqua-5','DermaPro Aqua 5','Аппарат гидропилинга 5 в 1','Комбайн для гидропилинга: вакуумная чистка, ультразвук, оксигенация, RF и микротоки.', 1250000, 1400000, 'DP-AQ5', '[{"name":"Функций","value":"5"},{"name":"Питание","value":"220 В"}]', true, 1),
  ('dermapro','apparaty-rf','dermapro-rf-lift','DermaPro RF Lift','RF-лифтинг для лица и тела','Радиочастотный лифтинг с двумя манипулами — для лица и для тела.', 890000, null, 'DP-RF', '[{"name":"Частота","value":"5 МГц"}]', false, 1),
  ('vitaline','rashodniki','vitaline-gel-5l','Vitaline Гель контактный 5 л','Гель для лазерных и ультразвуковых процедур','Прозрачный контактный гель без запаха, подходит для лазера, IPL и УЗИ. Канистра 5 литров.', 12000, null, 'VT-GEL5', '[{"name":"Объём","value":"5 л"}]', false, 1),
  ('vitaline','rashodniki','vitaline-nasadki','Vitaline Насадки для гидропилинга','Комплект сменных насадок','Комплект из 6 сменных насадок для аппаратов гидропилинга.', null, null, 'VT-NZL', '[{"name":"В комплекте","value":"6 шт"}]', false, 2)
) as p(brand_slug, cat_slug, slug, name, short_desc, descr, price, old_price, sku, specs, featured, sort_order)
  on p.brand_slug = b.slug and p.cat_slug = c.slug
on conflict (slug) do nothing;
