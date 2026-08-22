-- =====================================================================
-- Автоматический артикул для товаров
--
-- Если при сохранении товара поле «Артикул» оставлено пустым, оно
-- заполняется само: три буквы бренда + сквозной номер, например CUT-01042.
-- Работает и в админке, и при импорте — логика живёт в базе, а не в коде.
--
-- Скрипт идемпотентный, запускать повторно безопасно.
-- =====================================================================

create sequence if not exists public.products_sku_seq start 1000;

create or replace function public.set_product_sku()
returns trigger language plpgsql as $$
declare
  prefix text;
begin
  -- Пустую строку из формы считаем отсутствующим значением.
  if new.sku is not null and btrim(new.sku) = '' then
    new.sku := null;
  end if;

  -- При редактировании не затираем уже присвоенный артикул.
  if tg_op = 'UPDATE' and new.sku is null and old.sku is not null then
    new.sku := old.sku;
    return new;
  end if;

  if new.sku is null then
    select upper(substring(regexp_replace(b.slug, '[^a-zA-Z]', '', 'g') from 1 for 3))
      into prefix
      from public.brands b
     where b.id = new.brand_id;

    if prefix is null or prefix = '' then
      prefix := 'TOV';
    end if;

    new.sku := prefix || '-' || lpad(nextval('public.products_sku_seq')::text, 5, '0');
  end if;

  return new;
end $$;

drop trigger if exists products_set_sku on public.products;
create trigger products_set_sku
  before insert or update on public.products
  for each row execute function public.set_product_sku();

-- Проставить артикулы товарам, заведённым до появления триггера.
update public.products
   set sku = null
 where sku is not null and btrim(sku) = '';

update public.products p
   set sku = upper(substring(regexp_replace(b.slug, '[^a-zA-Z]', '', 'g') from 1 for 3))
             || '-' || lpad(nextval('public.products_sku_seq')::text, 5, '0')
  from public.brands b
 where b.id = p.brand_id
   and p.sku is null;
