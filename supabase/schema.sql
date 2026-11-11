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

-- ===== الاستخدام (لوحة جواد) =====
-- سطر لكل جهاز في اليوم. بدون اسم ولا بيانات شخصية: رقم جهاز عشوائي وكم علامة.
alter table public.licenses add column if not exists plan text not null default 'basic';
create table if not exists public.usage(
  device text not null,
  day date not null,
  lic boolean not null default false,     -- مفعّل بكود
  prof boolean not null default false,    -- كمّل التسجيل
  food boolean not null default false,    -- سجّل أكل اليوم
  train boolean not null default false,   -- تمرّن اليوم
  pwa boolean not null default false,     -- فاتح من الشاشة الرئيسية
  os text,
  ver text,
  primary key(device, day)
);
create index if not exists usage_day on public.usage(day);
alter table public.usage enable row level security;

create or replace function public.ping(p_device text, p_lic boolean, p_prof boolean, p_food boolean, p_train boolean, p_pwa boolean, p_os text, p_ver text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(length(p_device),0) not between 8 and 64 then return; end if;
  insert into usage(device, day, lic, prof, food, train, pwa, os, ver)
  values (p_device, (now() at time zone 'Asia/Riyadh')::date, coalesce(p_lic,false), coalesce(p_prof,false), coalesce(p_food,false), coalesce(p_train,false), coalesce(p_pwa,false), left(p_os,12), left(p_ver,12))
  on conflict (device, day) do update set
    lic = usage.lic or excluded.lic, prof = usage.prof or excluded.prof, food = usage.food or excluded.food,
    train = usage.train or excluded.train, pwa = usage.pwa or excluded.pwa, os = excluded.os, ver = excluded.ver;
end $$;

-- للكود اللي خطته admin فقط

-- 4.3.3: مرحلة البداية (1 شاشة التثبيت، 2-4 خطوات التسجيل، 5 خلص، 0 نسخة قديمة)
alter table public.usage add column if not exists step smallint not null default 0;
drop function if exists public.ping(text, boolean, boolean, boolean, boolean, boolean, text, text);
create or replace function public.ping(p_device text, p_lic boolean, p_prof boolean, p_food boolean, p_train boolean, p_pwa boolean, p_os text, p_ver text, p_step int default 0) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(length(p_device),0) not between 8 and 64 then return; end if;
  insert into usage(device, day, lic, prof, food, train, pwa, os, ver, step)
  values (p_device, (now() at time zone 'Asia/Riyadh')::date, coalesce(p_lic,false), coalesce(p_prof,false), coalesce(p_food,false), coalesce(p_train,false), coalesce(p_pwa,false), left(p_os,12), left(p_ver,12), least(greatest(coalesce(p_step,0),0),5))
  on conflict (device, day) do update set
    lic = usage.lic or excluded.lic, prof = usage.prof or excluded.prof, food = usage.food or excluded.food,
    train = usage.train or excluded.train, pwa = usage.pwa or excluded.pwa, os = excluded.os, ver = excluded.ver,
    step = greatest(usage.step, excluded.step);
end $$;
revoke all on function public.ping(text, boolean, boolean, boolean, boolean, boolean, text, text, int) from public;
grant execute on function public.ping(text, boolean, boolean, boolean, boolean, boolean, text, text, int) to anon, authenticated;
create or replace function public.admin_funnel() returns jsonb
language sql security definer set search_path = public as $$
  with s as (select device, max(step) st, bool_or(prof) prof from usage group by device having max(step) > 0 or (bool_or(prof) and min(ver) >= '4.3.3'))
  select jsonb_build_object(
    'f_base', count(*),
    'f_install', count(*) filter (where st = 1 and not prof),
    'f_s1', count(*) filter (where st >= 2 or prof),
    'f_s2', count(*) filter (where st >= 3 or prof),
    'f_s3', count(*) filter (where st >= 4 or prof),
    'f_done', count(*) filter (where st >= 5 or prof))
  from s
$$;
revoke all on function public.admin_funnel() from public, anon, authenticated;

create or replace function public.admin_stats(p_code text, p_device text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare h text := _lic_check(p_code, p_device); t date := (now() at time zone 'Asia/Riyadh')::date; r jsonb;
begin
  if h is null or not exists(select 1 from licenses where hash = h and plan = 'admin') then return jsonb_build_object('err','no'); end if;
  with f as (select device, min(day) d0, max(day) d1, bool_or(lic) lic, bool_or(prof) prof, bool_or(food) food, bool_or(train) train,
                    bool_or(not lic) was_free, count(*) n from usage group by device),
  d as (select g::date as day from generate_series(t - 13, t, interval '1 day') g),
  per as (select d.day,
            count(u.device) act, count(u.device) filter (where u.lic) licd,
            count(u.device) filter (where u.food) food, count(u.device) filter (where u.train) train,
            (select count(*) from f where f.d0 = d.day) newd
          from d left join usage u on u.day = d.day group by d.day order by d.day)
  select jsonb_build_object(
    'today', t,
    'days', (select jsonb_agg(to_jsonb(per)) from per),
    'devices', (select count(*) from f),
    'onboarded', (select count(*) from f where prof),
    'used_food', (select count(*) from f where food),
    'used_train', (select count(*) from f where train),
    'wau', (select count(distinct device) from usage where day > t - 7),
    'ret_base', (select count(*) from f where d0 < t),
    'ret_back', (select count(*) from f where d0 < t and d1 > d0),
    'free_devices', (select count(*) from f where was_free),
    'converted', (select count(*) from f where was_free and lic),
    'ios', (select count(distinct device) from usage where os = 'ios'),
    'android', (select count(distinct device) from usage where os = 'android'),
    'pwa', (select count(distinct device) from usage where pwa),
    'codes_active', (select count(*) from licenses where activated_at is not null),
    'codes_7d', (select count(*) from licenses where activated_at > now() - interval '7 days')
  ) into r;
  return r || public.admin_funnel();
end $$;
revoke all on function public.admin_stats(text, text) from public;
grant execute on function public.admin_stats(text, text) to anon, authenticated;
