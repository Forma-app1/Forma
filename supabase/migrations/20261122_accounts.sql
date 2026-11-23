-- 5.0 تسجيل الدخول بحساب (أبل، قوقل، الإيميل) بدل الكود
-- يشتغل مرة وحدة على القاعدة الحية بعد 20261116_founders.sql. آمن لو انعاد.
--
-- الفكرة:
-- - الحساب من Supabase Auth (auth.users). الدخول نفسه يسويه Supabase، احنا ما نلمس كلمات مرور.
-- - العضوية تجي من جدول licenses: أي كود مربوط بالحساب (user_id) يعطيه خطته (founder أو basic أو admin).
--   الشراء من داخل التطبيق لاحقا يضيف سطر في licenses بنفس الطريقة، فمنطق المؤسسين يبقى واحد.
-- - البيانات في account_data مربوطة بالحساب بدل الكود، مع آخر 30 نسخة في account_data_hist.
-- - الأكواد القديمة تبقى شغالة على الأجهزة المفعلة، وصاحبها يربطها بحسابه مرة وحدة (acc_link).
-- - كل الدوال تقرأ الحساب من auth.uid() (التوكن)، فما أحد يقدر يطلب بيانات غيره.

-- ===== ربط الكود بالحساب =====
alter table public.licenses add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.licenses add column if not exists linked_at timestamptz;
create index if not exists licenses_user on public.licenses(user_id);

-- ===== أجهزة الحساب: حد 3 أجهزة نشطة خلال 30 يوم (يمنع مشاركة الحساب) =====
create table if not exists public.account_devices(
  user_id uuid not null references auth.users(id) on delete cascade,
  device text not null,
  seen_at timestamptz not null default now(),
  primary key(user_id, device)
);
alter table public.account_devices enable row level security;

-- محاولات ربط فاشلة (ضد تخمين الأكواد)
create table if not exists public.account_link_fails(
  user_id uuid not null,
  at timestamptz not null default now()
);
create index if not exists account_link_fails_u on public.account_link_fails(user_id, at);
alter table public.account_link_fails enable row level security;

-- ===== بيانات الحساب =====
create table if not exists public.account_data(
  user_id uuid not null references auth.users(id) on delete cascade,
  slot text not null,
  data jsonb not null,
  ts bigint not null,
  updated_at timestamptz not null default now(),
  primary key(user_id, slot)
);
alter table public.account_data enable row level security;

create table if not exists public.account_data_hist(
  id bigserial primary key,
  user_id uuid not null,
  slot text not null,
  data jsonb not null,
  ts bigint not null,
  saved_at timestamptz not null default now()
);
create index if not exists account_data_hist_k on public.account_data_hist(user_id, slot, id desc);
alter table public.account_data_hist enable row level security;

create or replace function public._ad_hist() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.data is distinct from new.data then
    insert into account_data_hist(user_id, slot, data, ts) values (old.user_id, old.slot, old.data, old.ts);
    delete from account_data_hist h where h.user_id = old.user_id and h.slot = old.slot
      and h.id not in (select id from account_data_hist where user_id = old.user_id and slot = old.slot order by id desc limit 30);
  end if;
  return new;
end $$;
revoke all on function public._ad_hist() from public, anon, authenticated;
drop trigger if exists ad_hist on public.account_data;
create trigger ad_hist before update on public.account_data for each row execute function public._ad_hist();

-- ===== المساعدات (داخلية) =====
-- أعلى خطة للحساب: admin ثم founder ثم basic، أو null لو ما عنده عضوية
create or replace function public._acc_plan(p_uid uuid) returns text
language sql security definer set search_path = public stable as $$
  select plan from licenses where user_id = p_uid
  order by case plan when 'admin' then 0 when 'founder' then 1 else 2 end limit 1
$$;
revoke all on function public._acc_plan(uuid) from public, anon, authenticated;

-- يسجل الجهاز ويتأكد من الحد. يرجع null لو تمام، أو سبب الرفض
create or replace function public._acc_device(p_uid uuid, p_device text) returns text
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(length(p_device),0) not between 8 and 64 then return 'bad'; end if;
  if not exists (select 1 from account_devices where user_id = p_uid and device = p_device)
     and (select count(*) from account_devices where user_id = p_uid and seen_at > now() - interval '30 days') >= 3 then
    return 'devices';
  end if;
  insert into account_devices(user_id, device) values (p_uid, p_device)
  on conflict (user_id, device) do update set seen_at = now();
  return null;
end $$;
revoke all on function public._acc_device(uuid, text) from public, anon, authenticated;

-- ===== الدوال اللي يناديها التطبيق (للمسجلين بس) =====

-- حالة الحساب: الخطة، رقم المؤسس، والإيميل
create or replace function public.acc_info(p_device text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); pl text; t timestamptz; n int; e text;
begin
  if u is null then return jsonb_build_object('err','auth'); end if;
  e := public._acc_device(u, p_device);
  if e is not null then return jsonb_build_object('err', e); end if;
  pl := public._acc_plan(u);
  if pl = 'founder' then
    select min(activated_at) into t from licenses where user_id = u and plan = 'founder';
    select count(*) into n from licenses where plan = 'founder' and activated_at <= t;
  end if;
  return jsonb_build_object('plan', coalesce(pl,'none'), 'n', n,
    'email', (select email from auth.users where id = u));
end $$;

-- ربط كود زد بالحساب. مرة وحدة لكل كود. لو الحساب ما عنده بيانات، تنتقل بيانات الكود له
-- يرجع: ok | invalid | taken (مربوط بحساب ثاني) | auth
create or replace function public.acc_link(p_code text, p_device text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); h text := public._lic_hash(p_code); owner uuid; moved int := 0; e text;
begin
  if u is null then return jsonb_build_object('err','auth'); end if;
  e := public._acc_device(u, p_device);
  if e is not null then return jsonb_build_object('err', e); end if;
  if h is null then return jsonb_build_object('err','invalid'); end if;
  -- حد بسيط ضد التخمين: 10 محاولات ربط فاشلة بالساعة لكل حساب
  if (select count(*) from account_link_fails where user_id = u and at > now() - interval '1 hour') >= 10 then
    return jsonb_build_object('err','slow');
  end if;
  select user_id into owner from licenses where hash = h for update;
  if not found then
    insert into account_link_fails(user_id) values (u);
    return jsonb_build_object('err','invalid');
  end if;
  if owner is not null and owner <> u then return jsonb_build_object('err','taken'); end if;
  update licenses set user_id = u, linked_at = coalesce(linked_at, now()),
    activated_at = coalesce(activated_at, now())   -- يشغّل منطق المؤسسين لو الكود جديد
   where hash = h;
  -- نقل البيانات: نسخ الكود تنتقل للحساب، والأحدث يفوز لو الحساب عنده نسخة
  insert into account_data(user_id, slot, data, ts, updated_at)
  select u, d.slot, d.data, d.ts, now() from user_data d where d.hash = h
  on conflict (user_id, slot) do update set data = excluded.data, ts = excluded.ts, updated_at = now()
   where account_data.ts < excluded.ts;
  get diagnostics moved = row_count;
  return jsonb_build_object('ok', true, 'moved', moved > 0, 'plan', public._acc_plan(u));
end $$;

-- المزامنة بالحساب (نفس قواعد المزامنة بالكود)
create or replace function public.acc_pull(p_device text, p_slot text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); r record; e text;
begin
  if u is null then return jsonb_build_object('err','auth'); end if;
  e := public._acc_device(u, p_device);
  if e is not null then return jsonb_build_object('err', e); end if;
  if public._acc_plan(u) is null then return jsonb_build_object('err','nolic'); end if;
  select data, ts into r from account_data where user_id = u and slot = p_slot;
  if not found then return jsonb_build_object('empty', true); end if;
  return jsonb_build_object('data', r.data, 'ts', r.ts);
end $$;

create or replace function public.acc_push(p_device text, p_slot text, p_data jsonb, p_ts bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); n int; t bigint; e text;
begin
  if u is null then return jsonb_build_object('err','auth'); end if;
  e := public._acc_device(u, p_device);
  if e is not null then return jsonb_build_object('err', e); end if;
  if public._acc_plan(u) is null then return jsonb_build_object('err','nolic'); end if;
  if p_slot is null or p_slot not in ('forma-v2','forma-jawad') or p_data is null or p_ts is null then return jsonb_build_object('err','bad'); end if;
  if octet_length(p_data::text) > 2000000 then return jsonb_build_object('err','big'); end if;
  t := least(p_ts, (extract(epoch from now()) * 1000)::bigint + 300000);
  insert into account_data(user_id, slot, data, ts, updated_at) values (u, p_slot, p_data, t, now())
  on conflict (user_id, slot) do update set data = excluded.data, ts = excluded.ts, updated_at = now()
   where account_data.ts <= excluded.ts;
  get diagnostics n = row_count;
  if n = 0 then return jsonb_build_object('stale', true); end if;
  return jsonb_build_object('ok', true, 'ts', t);
end $$;

-- خروج الجهاز: يفسح مكانه لجهاز ثاني
create or replace function public.acc_signout_device(p_device text) returns void
language sql security definer set search_path = public as $$
  delete from account_devices where user_id = auth.uid() and device = p_device
$$;

-- حذف الحساب (شرط أبل: المستخدم يقدر يحذف حسابه من داخل التطبيق)
-- يمسح البيانات والأجهزة والحساب. الكود المربوط يتفك ويقدر صاحبه يربطه من جديد.
create or replace function public.acc_delete() returns jsonb
language plpgsql security definer set search_path = public, auth as $$
declare u uuid := auth.uid();
begin
  if u is null then return jsonb_build_object('err','auth'); end if;
  update licenses set user_id = null where user_id = u;
  delete from account_data_hist where user_id = u;
  delete from account_link_fails where user_id = u;
  delete from auth.users where id = u;   -- account_data و account_devices تنحذف معه (cascade)
  return jsonb_build_object('ok', true);
end $$;

-- الصلاحيات: للمسجلين بس
revoke all on function public.acc_info(text) from public, anon;
revoke all on function public.acc_link(text, text) from public, anon;
revoke all on function public.acc_pull(text, text) from public, anon;
revoke all on function public.acc_push(text, text, jsonb, bigint) from public, anon;
revoke all on function public.acc_signout_device(text) from public, anon;
revoke all on function public.acc_delete() from public, anon;
grant execute on function public.acc_info(text) to authenticated;
grant execute on function public.acc_link(text, text) to authenticated;
grant execute on function public.acc_pull(text, text) to authenticated;
grant execute on function public.acc_push(text, text, jsonb, bigint) to authenticated;
grant execute on function public.acc_signout_device(text) to authenticated;
grant execute on function public.acc_delete() to authenticated;

-- ===== الشراء من أبل (التطبيق) =====
-- دالة الشراء iap-apple تتحقق من العملية عند أبل، بعدها تنادي هذي بصلاحية الخدمة.
-- الشراء ينحفظ كسطر في licenses (hash = 'apple:' + رقم العملية الأصلي)، فمنطق المؤسسين نفسه يشتغل.
alter table public.licenses add column if not exists source text not null default 'zid';

create or replace function public.iap_grant(p_user uuid, p_ref text, p_source text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare h text; owner uuid;
begin
  if p_user is null or coalesce(p_ref,'') = '' or p_source not in ('apple','google') then return jsonb_build_object('err','bad'); end if;
  h := p_source || ':' || p_ref;
  select user_id into owner from licenses where hash = h for update;
  if found and owner is not null and owner <> p_user then return jsonb_build_object('err','taken'); end if;
  if not found then insert into licenses(hash, source) values (h, p_source); end if;
  -- التحديث (مو الإدخال) هو اللي يشغّل منطق المؤسسين
  update licenses set user_id = p_user, linked_at = coalesce(linked_at, now()), activated_at = coalesce(activated_at, now()) where hash = h;
  return jsonb_build_object('ok', true, 'plan', public._acc_plan(p_user));
end $$;
revoke all on function public.iap_grant(uuid, text, text) from public, anon, authenticated;
grant execute on function public.iap_grant(uuid, text, text) to service_role;
