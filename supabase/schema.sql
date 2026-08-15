-- =====================================================================
-- Beauty Pro — схема каталога
-- Выполните этот файл целиком в Supabase → SQL Editor → New query → Run
-- Скрипт идемпотентный: его можно запускать повторно.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Бренды
-- ---------------------------------------------------------------------
create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  logo_url    text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Категории (принадлежат бренду)
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  brand_id    uuid not null references public.brands(id) on delete cascade,
  slug        text not null,
  name        text not null,
  description text,
  image_url   text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (brand_id, slug)
);

create index if not exists categories_brand_id_idx on public.categories (brand_id);

-- ---------------------------------------------------------------------
-- Товары
-- price хранится в тенге целым числом. NULL = «цена по запросу».
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  brand_id     uuid not null references public.brands(id) on delete cascade,
  category_id  uuid references public.categories(id) on delete set null,
  slug         text not null unique,
  name         text not null,
  short_description text,
  description  text,
  specs        jsonb not null default '[]'::jsonb,  -- [{ "name": "Мощность", "value": "60 Вт" }]
  sku          text,
  price        int,
  old_price    int,
  images       text[] not null default '{}',
  in_stock     boolean not null default true,
  is_featured  boolean not null default false,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_brand_id_idx    on public.products (brand_id);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_active_idx      on public.products (is_active);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Заказы (корзина) и заявки (кнопка «Оставить заявку»)
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  number        bigint generated always as identity,
  customer_name text not null,
  phone         text not null,
  email         text,
  comment       text,
  total         int not null default 0,
  status        text not null default 'new',   -- new | in_progress | done | canceled
  created_at    timestamptz not null default now()
);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  price        int,
  quantity     int not null default 1
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid references public.products(id) on delete set null,
  product_name text,
  name         text not null,
  phone        text not null,
  comment      text,
  status       text not null default 'new',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Настройки сайта (контакты в шапке/подвале)
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  key   text primary key,
  value text
);

insert into public.settings (key, value) values
  ('phone',     '+7 700 000 00 00'),
  ('whatsapp',  '77000000000'),
  ('email',     'info@beautypro.kz'),
  ('address',   'г. Алматы'),
  ('instagram', ''),
  ('about',     'Профессиональное оборудование и косметика для салонов красоты.')
on conflict (key) do nothing;

-- =====================================================================
-- Row Level Security
--   • анонимный посетитель: читает только активные записи каталога,
--     может создать заказ/заявку;
--   • авторизованный пользователь (= администратор): полный доступ.
--   Регистрацию в Supabase → Authentication → Sign In / Providers
--   обязательно отключите, чтобы админом мог стать только тот,
--   кого вы завели вручную.
-- =====================================================================

alter table public.brands      enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.leads       enable row level security;
alter table public.settings    enable row level security;

-- Каталог: публичное чтение активных записей
drop policy if exists brands_public_read on public.brands;
create policy brands_public_read on public.brands
  for select to anon using (is_active);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon using (is_active);

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon using (is_active);

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings
  for select to anon using (true);

-- Каталог: полный доступ администратора
drop policy if exists brands_admin_all on public.brands;
create policy brands_admin_all on public.brands
  for all to authenticated using (true) with check (true);

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories
  for all to authenticated using (true) with check (true);

drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products
  for all to authenticated using (true) with check (true);

drop policy if exists settings_admin_all on public.settings;
create policy settings_admin_all on public.settings
  for all to authenticated using (true) with check (true);

-- Заказы и заявки: посетитель только создаёт, читает только админ
drop policy if exists orders_public_insert on public.orders;
create policy orders_public_insert on public.orders
  for insert to anon with check (true);

drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all on public.orders
  for all to authenticated using (true) with check (true);

drop policy if exists order_items_public_insert on public.order_items;
create policy order_items_public_insert on public.order_items
  for insert to anon with check (true);

drop policy if exists order_items_admin_all on public.order_items;
create policy order_items_admin_all on public.order_items
  for all to authenticated using (true) with check (true);

drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads
  for insert to anon with check (true);

drop policy if exists leads_admin_all on public.leads;
create policy leads_admin_all on public.leads
  for all to authenticated using (true) with check (true);

-- =====================================================================
-- Оформление заказа.
-- Посетителю нельзя давать SELECT по таблице orders, поэтому заказ
-- создаётся через SECURITY DEFINER-функцию: она сама берёт актуальные
-- цены из products (корзина в браузере не является источником правды)
-- и возвращает только номер заказа.
-- =====================================================================
create or replace function public.create_order(
  p_name    text,
  p_phone   text,
  p_email   text,
  p_comment text,
  p_items   jsonb
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_number   bigint;
  v_total    int;
begin
  if coalesce(length(btrim(p_name)), 0) < 2 then
    raise exception 'invalid_name';
  end if;
  if coalesce(length(btrim(p_phone)), 0) < 6 then
    raise exception 'invalid_phone';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_order';
  end if;

  insert into public.orders (customer_name, phone, email, comment, total)
  values (btrim(p_name), btrim(p_phone), nullif(btrim(p_email), ''),
          nullif(btrim(p_comment), ''), 0)
  returning id, number into v_order_id, v_number;

  insert into public.order_items (order_id, product_id, product_name, price, quantity)
  select v_order_id, p.id, p.name, p.price, it.quantity
  from (
    select (i ->> 'id')::uuid as id,
           greatest(1, least(999, coalesce((i ->> 'quantity')::int, 1))) as quantity
    from jsonb_array_elements(p_items) as i
    where (i ->> 'id') is not null
  ) it
  join public.products p on p.id = it.id and p.is_active;

  if not exists (select 1 from public.order_items where order_id = v_order_id) then
    delete from public.orders where id = v_order_id;
    raise exception 'empty_order';
  end if;

  select coalesce(sum(coalesce(price, 0) * quantity), 0)
    into v_total
  from public.order_items
  where order_id = v_order_id;

  update public.orders set total = v_total where id = v_order_id;

  return v_number;
end $$;

revoke all on function public.create_order(text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, jsonb)
  to anon, authenticated;

-- =====================================================================
-- Хранилище картинок: публичный на чтение бакет `media`
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects
  for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');
