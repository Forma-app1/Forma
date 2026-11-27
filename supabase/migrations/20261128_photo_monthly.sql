-- FORMA: حد شهري لتصوير الأكل لحسابات التطبيق (فوق الحد اليومي).
-- 'limit' = خلص حد اليوم، 'month' = خلص حد الشهر.

drop function if exists public.acc_photo_allow(uuid, int);

create or replace function public.acc_photo_allow(p_user uuid, p_max int default 8, p_month int default 30) returns text
language plpgsql security definer set search_path = public as $$
declare
  c int;
  m int;
  d date := (now() at time zone 'Asia/Riyadh')::date;
begin
  if p_user is null or public._acc_plan(p_user) is null then return 'nolic'; end if;
  select coalesce(sum(n), 0) into m from photo_usage
   where hash = 'acc:' || p_user and day >= date_trunc('month', d)::date;
  if m >= p_month then return 'month'; end if;
  insert into photo_usage(hash, day, n) values ('acc:' || p_user, d, 1)
  on conflict (hash, day) do update set n = photo_usage.n + 1
  returning n into c;
  if c > p_max then return 'limit'; end if;
  return 'ok';
end $$;
revoke all on function public.acc_photo_allow(uuid, int, int) from public, anon, authenticated;
grant execute on function public.acc_photo_allow(uuid, int, int) to service_role;
