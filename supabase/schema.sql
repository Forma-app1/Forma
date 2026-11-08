-- FORMA: قاعدة البيانات في Supabase
-- كل الوصول من التطبيق يمر عبر دوال RPC. الجداول نفسها مقفلة (RLS بدون سياسات).

-- ===== الأكواد =====
create table if not exists public.licenses(
  hash text primary key,                 -- sha256('forma-2026' || الكود بدون FM والشرطات)
  devices text[] not null default '{}',  -- الأجهزة المفعلة (حدها 2)
  activated_at timestamptz,
  seen jsonb not null default '{}'::jsonb -- آخر ظهور لكل جهاز (ثواني epoch)
);
alter table public.licenses add column if not exists seen jsonb not null default '{}'::jsonb;
alter table public.licenses enable row level security;

-- يحوّل الكود لهاش، أو null لو شكله غلط
create or replace function public._lic_hash(p_code text) returns text
language plpgsql immutable set search_path = public as $$
declare c text := upper(regexp_replace(coalesce(p_code,''), '[^A-Za-z0-9]', '', 'g'));
begin
  if left(c,2) = 'FM' and length(c) = 12 then c := substr(c,3); end if;
  if length(c) <> 10 then return null; end if;
  return encode(sha256(convert_to('forma-2026' || c, 'UTF8')), 'hex');
end $$;

-- يتأكد إن الجهاز مفعل على الكود، ويسجل آخر ظهور. يرجع الهاش أو null
create or replace function public._lic_check(p_code text, p_device text) returns text
language plpgsql security definer set search_path = public as $$
declare h text := _lic_hash(p_code);
begin
  if h is null or coalesce(length(p_device),0) not between 8 and 64 then return null; end if;
  update licenses set seen = seen || jsonb_build_object(p_device, extract(epoch from now())::bigint)
   where hash = h and p_device = any(devices);
  if not found then return null; end if;
  return h;
end $$;

-- التفعيل: جهازين بحد أقصى. جهاز ما ظهر 30 يوم يفسح مكانه لجهاز جديد (تغيير الجوال)
create or replace function public.activate(p_code text, p_device text) returns text
language plpgsql security definer set search_path = public as $$
declare
  h text := _lic_hash(p_code);
  d text[]; s jsonb; act timestamptz; keep text[] := '{}'; x text; last bigint;
begin
  if h is null or coalesce(length(p_device),0) not between 8 and 64 then return 'invalid'; end if;
  select devices, seen, activated_at into d, s, act from licenses where hash = h for update;
  if not found then return 'invalid'; end if;
  if p_device = any(d) then
    update licenses set seen = seen || jsonb_build_object(p_device, extract(epoch from now())::bigint) where hash = h;
    return 'ok';
  end if;
  if cardinality(d) >= 2 then
    foreach x in array d loop
      last := coalesce((s->>x)::bigint, extract(epoch from coalesce(act, now()))::bigint);
      if last > extract(epoch from now() - interval '30 days') then keep := array_append(keep, x); end if;
    end loop;
    if cardinality(keep) >= 2 then return 'used'; end if;
    d := keep;
  end if;
  update licenses set devices = array_append(d, p_device), activated_at = coalesce(activated_at, now()),
    seen = seen || jsonb_build_object(p_device, extract(epoch from now())::bigint)
   where hash = h;
  return 'ok';
end $$;

-- ===== المزامنة: نسخة من بيانات المستخدم مربوطة بالكود =====
-- slot يفرق بين نسخ التطبيق (العامة forma-v2، ونسخة جواد forma-jawad)
create table if not exists public.user_data(
  hash text not null references public.licenses(hash) on delete cascade,
  slot text not null,
  data jsonb not null,
  ts bigint not null,                    -- وقت آخر تعديل في الجهاز (ms)
  updated_at timestamptz not null default now(),
  primary key(hash, slot)
);
alter table public.user_data enable row level security;

create or replace function public.sync_pull(p_code text, p_device text, p_slot text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare h text := _lic_check(p_code, p_device); r record;
begin
  if h is null then return jsonb_build_object('err','nolic'); end if;
  select data, ts into r from user_data where hash = h and slot = p_slot;
  if not found then return jsonb_build_object('empty', true); end if;
  return jsonb_build_object('data', r.data, 'ts', r.ts);
end $$;

create or replace function public.sync_push(p_code text, p_device text, p_slot text, p_data jsonb, p_ts bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare h text := _lic_check(p_code, p_device); n int;
begin
  if h is null then return jsonb_build_object('err','nolic'); end if;
  if p_slot is null or length(p_slot) > 40 or p_data is null or p_ts is null then return jsonb_build_object('err','bad'); end if;
  if octet_length(p_data::text) > 4000000 then return jsonb_build_object('err','big'); end if;
  insert into user_data(hash, slot, data, ts, updated_at) values (h, p_slot, p_data, p_ts, now())
  on conflict (hash, slot) do update set data = excluded.data, ts = excluded.ts, updated_at = now()
   where user_data.ts <= excluded.ts;
  get diagnostics n = row_count;
  if n = 0 then return jsonb_build_object('stale', true); end if;
  return jsonb_build_object('ok', true);
end $$;

-- ===== تصوير الأكل: حد يومي لكل كود =====
create table if not exists public.photo_usage(
  hash text not null,
  day date not null,
  n int not null default 0,
  primary key(hash, day)
);
alter table public.photo_usage enable row level security;

-- تستدعيها دالة food-photo فقط (service_role). ترجع ok أو limit أو nolic
create or replace function public.photo_allow(p_code text, p_device text, p_max int default 8) returns text
language plpgsql security definer set search_path = public as $$
declare h text := _lic_check(p_code, p_device); c int;
begin
  if h is null then return 'nolic'; end if;
  insert into photo_usage(hash, day, n) values (h, (now() at time zone 'Asia/Riyadh')::date, 1)
  on conflict (hash, day) do update set n = photo_usage.n + 1
  returning n into c;
  if c > p_max then return 'limit'; end if;
  return 'ok';
end $$;

-- الصلاحيات
revoke all on function public._lic_hash(text) from public, anon, authenticated;
revoke all on function public._lic_check(text, text) from public, anon, authenticated;
revoke all on function public.photo_allow(text, text, int) from public, anon, authenticated;
grant execute on function public.photo_allow(text, text, int) to service_role;
revoke all on function public.activate(text, text) from public;
revoke all on function public.sync_pull(text, text, text) from public;
revoke all on function public.sync_push(text, text, text, jsonb, bigint) from public;
grant execute on function public.activate(text, text) to anon, authenticated;
grant execute on function public.sync_pull(text, text, text) to anon, authenticated;
grant execute on function public.sync_push(text, text, text, jsonb, bigint) to anon, authenticated;
