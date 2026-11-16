-- 4.8.0 التنبيهات (Web Push)
-- المفاتيح تنولد داخل الـ Edge Function أول مرة وتنحفظ هنا، فما أحد يتعامل مع مفتاح سري بيده.

create table if not exists public.push_keys(id int primary key default 1 check (id = 1), pub text not null, priv text not null, created_at timestamptz default now());
alter table public.push_keys enable row level security;

create table if not exists public.push_subs(
  endpoint text primary key,
  device text not null,
  p256dh text not null,
  auth text not null,
  prefs jsonb not null default '{"weigh":true,"water":true,"food":true}',
  last_sent jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists push_subs_device on public.push_subs(device);
alter table public.push_subs enable row level security;

-- المفتاح العام فقط (يحتاجه الجوال عشان يشترك)
create or replace function public.push_pubkey() returns text
language sql security definer set search_path = public stable as $$ select pub from push_keys where id = 1 $$;
revoke all on function public.push_pubkey() from public;
grant execute on function public.push_pubkey() to anon, authenticated;

-- حفظ اشتراك الجهاز وتفضيلاته
create or replace function public.push_save(p_device text, p_endpoint text, p_p256dh text, p_auth text, p_prefs jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(length(p_device),0) not between 8 and 64 then return jsonb_build_object('err','bad'); end if;
  if p_endpoint is null or length(p_endpoint) > 800
     or p_endpoint !~ '^https://(fcm\.googleapis\.com|web\.push\.apple\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.notify\.windows\.com)/' then
    return jsonb_build_object('err','bad');
  end if;
  if coalesce(length(p_p256dh),0) not between 40 and 200 or coalesce(length(p_auth),0) not between 10 and 64 then return jsonb_build_object('err','bad'); end if;
  if not exists (select 1 from push_subs where endpoint = p_endpoint) and (select count(*) from push_subs) >= 20000 then return jsonb_build_object('err','full'); end if;
  delete from push_subs where device = p_device and endpoint <> p_endpoint;
  insert into push_subs(endpoint, device, p256dh, auth, prefs)
  values (p_endpoint, p_device, p_p256dh, p_auth, coalesce(p_prefs, '{"weigh":true,"water":true,"food":true}'))
  on conflict (endpoint) do update set device = excluded.device, p256dh = excluded.p256dh, auth = excluded.auth,
    prefs = excluded.prefs, updated_at = now();
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.push_save(text, text, text, text, jsonb) from public;
grant execute on function public.push_save(text, text, text, text, jsonb) to anon, authenticated;

create or replace function public.push_off(p_device text, p_endpoint text) returns void
language sql security definer set search_path = public as $$ delete from push_subs where endpoint = p_endpoint and device = p_device $$;
revoke all on function public.push_off(text, text) from public;
grant execute on function public.push_off(text, text) to anon, authenticated;

-- كل 15 دقيقة نصحي الـ Edge Function ترسل التنبيهات اللي جا وقتها
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('forma-push') where exists (select 1 from cron.job where jobname = 'forma-push');
select cron.schedule('forma-push', '*/15 * * * *', $c$
  select net.http_post(url := 'https://ywqguielxzzpqubgneoa.supabase.co/functions/v1/push-tick',
    headers := '{"Content-Type":"application/json"}'::jsonb, body := '{}'::jsonb)
$c$);
