-- تقارير الأعطال وإحصائيات الاستخدام لتطبيق فورما (مجهولة).
-- التطبيق يكتب بس عن طريق log_events و log_error. ما أحد يقدر يقرا الجداول غير لوحة Supabase (service_role).
-- ما فيه اسم ولا إيميل ولا حساب: رقم عشوائي للجهاز (install) ونسخة التطبيق ونوع الجهاز.

create table if not exists public.app_events (
  id bigserial primary key,
  at timestamptz not null default now(),
  install text not null,
  platform text,
  ver text,
  name text not null,
  props jsonb not null default '{}'::jsonb
);
create index if not exists app_events_install_at on public.app_events (install, at);
create index if not exists app_events_name_at on public.app_events (name, at);

create table if not exists public.app_errors (
  id bigserial primary key,
  at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  install text not null,
  platform text,
  ver text,
  kind text,
  message text not null,
  stack text,
  count int not null default 1
);
create index if not exists app_errors_install_at on public.app_errors (install, at);

alter table public.app_events enable row level security;
alter table public.app_errors enable row level security;
revoke all on public.app_events, public.app_errors from anon, authenticated;

-- أحداث الاستخدام: دفعة لين 50 حدث، وحد 500 حدث لكل جهاز باليوم
create or replace function public.log_events(p_install text, p_platform text, p_ver text, p_events jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  e jsonb;
  n int;
  t timestamptz;
begin
  if p_install is null or p_install !~ '^[0-9a-f]{16}$' then return; end if;
  if p_platform not in ('ios', 'android', 'web') then return; end if;
  if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) > 50 then return; end if;
  select count(*) into n from app_events where install = p_install and at > now() - interval '1 day';
  if n >= 500 then return; end if;
  for e in select * from jsonb_array_elements(p_events) loop
    continue when jsonb_typeof(e) <> 'object' or coalesce(e->>'n', '') !~ '^[a-z_]{2,40}$';
    continue when jsonb_typeof(coalesce(e->'p', '{}'::jsonb)) <> 'object' or length(coalesce(e->'p', '{}'::jsonb)::text) > 500;
    begin
      t := to_timestamp((e->>'t')::double precision / 1000);
    exception when others then
      t := now();
    end;
    t := least(now(), greatest(now() - interval '7 days', coalesce(t, now())));
    insert into app_events (at, install, platform, ver, name, props)
    values (t, p_install, p_platform, left(p_ver, 20), e->>'n', coalesce(e->'p', '{}'::jsonb));
  end loop;
end $$;

-- الأعطال: نفس الرسالة من نفس الجهاز خلال يوم تزيد العداد بدل سطر جديد. وحد 50 عطل لكل جهاز باليوم
create or replace function public.log_error(p_install text, p_platform text, p_ver text, p_kind text, p_message text, p_stack text)
returns void language plpgsql security definer set search_path = public as $$
declare
  n int;
  rid bigint;
begin
  if p_install is null or p_install !~ '^[0-9a-f]{16}$' then return; end if;
  if p_platform not in ('ios', 'android', 'web') then return; end if;
  if coalesce(p_message, '') = '' then return; end if;
  select id into rid from app_errors
   where install = p_install and message = left(p_message, 2000) and last_at > now() - interval '1 day'
   order by id desc limit 1;
  if rid is not null then
    update app_errors set count = count + 1, last_at = now() where id = rid;
    return;
  end if;
  select count(*) into n from app_errors where install = p_install and at > now() - interval '1 day';
  if n >= 50 then return; end if;
  insert into app_errors (install, platform, ver, kind, message, stack)
  values (p_install, p_platform, left(p_ver, 20), left(p_kind, 20), left(p_message, 2000), left(p_stack, 8000));
end $$;

revoke all on function public.log_events(text, text, text, jsonb) from public;
revoke all on function public.log_error(text, text, text, text, text, text) from public;
grant execute on function public.log_events(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.log_error(text, text, text, text, text, text) to anon, authenticated;

-- ===== للوحة (تقراها من Supabase بس) =====
-- كل يوم: كم جهاز فتح التطبيق، وكم حدث من كل نوع
create or replace view public.app_daily with (security_invoker = true) as
select date_trunc('day', at)::date as day,
       count(distinct install) as devices,
       count(*) filter (where name = 'app_open') as opens,
       count(*) filter (where name = 'onboarding_done') as new_users,
       count(*) filter (where name = 'food_add') as food_adds,
       count(*) filter (where name = 'workout_done') as workouts,
       count(*) filter (where name = 'purchase_done') as purchases
from public.app_events
group by 1
order by 1 desc;

-- الأعطال الأكثر تكرار آخر 14 يوم
create or replace view public.app_top_errors with (security_invoker = true) as
select message, kind, max(ver) as last_ver, sum(count) as times, count(distinct install) as devices, max(last_at) as last_seen
from public.app_errors
where at > now() - interval '14 days'
group by message, kind
order by times desc;

-- كم مستخدم يرجع: من سوّى البداية، كم منهم فتح التطبيق بعد يوم وبعد 7 أيام
create or replace view public.app_retention with (security_invoker = true) as
with s as (
  select install, min(at)::date as d0 from public.app_events where name = 'onboarding_done' group by install
)
select s.d0 as start_day,
       count(*) as users,
       count(*) filter (where exists (select 1 from public.app_events e where e.install = s.install and e.at::date = s.d0 + 1)) as day1,
       count(*) filter (where exists (select 1 from public.app_events e where e.install = s.install and e.at::date between s.d0 + 6 and s.d0 + 8)) as day7
from s
group by s.d0
order by s.d0 desc;

revoke all on public.app_daily, public.app_top_errors, public.app_retention from anon, authenticated;
