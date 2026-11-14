-- 4.4.0 المرحلة 1: حماية البيانات
-- يشتغل مرة وحدة على القاعدة الحية. آمن لو انعاد (if not exists / create or replace).

-- 1) نسخ سابقة: كل ما تنكتب بيانات مستخدم فوق القديمة، القديمة تنحفظ هنا (آخر 30 نسخة لكل كود ونسخة)
create table if not exists public.user_data_hist(
  id bigserial primary key,
  hash text not null,
  slot text not null,
  data jsonb not null,
  ts bigint not null,
  saved_at timestamptz not null default now()
);
create index if not exists user_data_hist_k on public.user_data_hist(hash, slot, id desc);
alter table public.user_data_hist enable row level security;

create or replace function public._ud_hist() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.data is distinct from new.data then
    insert into user_data_hist(hash, slot, data, ts) values (old.hash, old.slot, old.data, old.ts);
    delete from user_data_hist h where h.hash = old.hash and h.slot = old.slot
      and h.id not in (select id from user_data_hist where hash = old.hash and slot = old.slot order by id desc limit 30);
  end if;
  return new;
end $$;
revoke all on function public._ud_hist() from public, anon, authenticated;
drop trigger if exists ud_hist on public.user_data;
create trigger ud_hist before update on public.user_data for each row execute function public._ud_hist();

-- نسخة أساس من البيانات الحالية قبل أي تعديل
insert into public.user_data_hist(hash, slot, data, ts)
select u.hash, u.slot, u.data, u.ts from public.user_data u
where not exists (select 1 from public.user_data_hist h where h.hash = u.hash and h.slot = u.slot);

-- 2) المزامنة: نسختين بس، حد 2 ميقا، والوقت ما يتعدى وقت السيرفر بأكثر من 5 دقايق
create or replace function public.sync_push(p_code text, p_device text, p_slot text, p_data jsonb, p_ts bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare h text := _lic_check(p_code, p_device); n int; t bigint;
begin
  if h is null then return jsonb_build_object('err','nolic'); end if;
  if p_slot is null or p_slot not in ('forma-v2','forma-jawad') or p_data is null or p_ts is null then return jsonb_build_object('err','bad'); end if;
  if octet_length(p_data::text) > 2000000 then return jsonb_build_object('err','big'); end if;
  t := least(p_ts, (extract(epoch from now()) * 1000)::bigint + 300000);
  insert into user_data(hash, slot, data, ts, updated_at) values (h, p_slot, p_data, t, now())
  on conflict (hash, slot) do update set data = excluded.data, ts = excluded.ts, updated_at = now()
   where user_data.ts <= excluded.ts;
  get diagnostics n = row_count;
  if n = 0 then return jsonb_build_object('stale', true); end if;
  return jsonb_build_object('ok', true, 'ts', t);
end $$;

-- أي وقت مستقبلي محفوظ من ساعة جهاز غلط يرجع لوقت السيرفر
update public.user_data set ts = (extract(epoch from now()) * 1000)::bigint
where ts > (extract(epoch from now()) * 1000)::bigint + 300000;

-- 3) العداد: مرحلة البداية (step)، وحد 3000 جهاز جديد باليوم عشان ما أحد يعبي الجدول
alter table public.usage add column if not exists step smallint not null default 0;
drop function if exists public.ping(text, boolean, boolean, boolean, boolean, boolean, text, text);
create or replace function public.ping(p_device text, p_lic boolean, p_prof boolean, p_food boolean, p_train boolean, p_pwa boolean, p_os text, p_ver text, p_step int default 0) returns void
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Riyadh')::date;
begin
  if coalesce(length(p_device),0) not between 8 and 64 then return; end if;
  if not exists (select 1 from usage where device = p_device and day = d)
     and (select count(*) from usage where day = d) >= 3000 then return; end if;
  insert into usage(device, day, lic, prof, food, train, pwa, os, ver, step)
  values (p_device, d, coalesce(p_lic,false), coalesce(p_prof,false), coalesce(p_food,false), coalesce(p_train,false), coalesce(p_pwa,false), left(p_os,12), left(p_ver,12), least(greatest(coalesce(p_step,0),0),5))
  on conflict (device, day) do update set
    lic = usage.lic or excluded.lic, prof = usage.prof or excluded.prof, food = usage.food or excluded.food,
    train = usage.train or excluded.train, pwa = usage.pwa or excluded.pwa, os = excluded.os, ver = excluded.ver,
    step = greatest(usage.step, excluded.step);
end $$;
revoke all on function public.ping(text, boolean, boolean, boolean, boolean, boolean, text, text, int) from public;
grant execute on function public.ping(text, boolean, boolean, boolean, boolean, boolean, text, text, int) to anon, authenticated;

create or replace function public.admin_funnel() returns jsonb
language sql security definer set search_path = public as $$
  with s as (select device, max(step) st, bool_or(prof) prof from usage group by device having max(step) > 0 or (bool_or(prof) and min(ver) >= '4.4'))
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

-- لوحة جواد: نفس الأرقام + مسار البداية، وتنظيف سجلات العداد الأقدم من 180 يوم
create or replace function public.admin_stats(p_code text, p_device text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare h text := _lic_check(p_code, p_device); t date := (now() at time zone 'Asia/Riyadh')::date; r jsonb;
begin
  if h is null or not exists(select 1 from licenses where hash = h and plan = 'admin') then return jsonb_build_object('err','no'); end if;
  delete from usage where day < t - 180;
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

-- 4) trial_start كان شغال بالقاعدة وناقص من الريبو (للتوثيق، نفس التعريف الحالي)
create or replace function public.trial_start(p_device text) returns bigint
language plpgsql security definer set search_path = public as $$
declare t timestamptz;
begin
  if coalesce(length(p_device),0) not between 8 and 64 then return null; end if;
  insert into trials(device) values (p_device) on conflict (device) do nothing;
  select started_at into t from trials where device = p_device;
  return (extract(epoch from t) * 1000)::bigint;
end $$;
