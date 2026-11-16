-- 4.6.0 عضوية المؤسسين: أول 100 كود يتفعّل ياخذ خطة founder مع رقمه
-- آمن لو انعاد.

-- أي كود يتفعّل وخطته basic، يصير founder لين يكتمل 100
create or replace function public._founder_on_activate() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.activated_at is null and new.activated_at is not null and new.plan = 'basic'
     and (select count(*) from licenses where plan = 'founder') < 100 then
    new.plan := 'founder';
  end if;
  return new;
end $$;
revoke all on function public._founder_on_activate() from public, anon, authenticated;
drop trigger if exists founder_on_activate on public.licenses;
create trigger founder_on_activate before update on public.licenses for each row execute function public._founder_on_activate();

-- اللي تفعّلوا قبل اليوم مؤسسين بعد
update public.licenses set plan = 'founder' where plan = 'basic' and activated_at is not null;

-- كم مقعد باقي (للإعلان داخل التطبيق)
create or replace function public.founders_left() returns int
language sql security definer set search_path = public stable as $$
  select greatest(0, 100 - (select count(*) from licenses where plan = 'founder'))::int
$$;
revoke all on function public.founders_left() from public;
grant execute on function public.founders_left() to anon, authenticated;

-- خطة الكود ورقم المؤسس (حسب ترتيب التفعيل)
create or replace function public.lic_info(p_code text, p_device text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare h text := _lic_check(p_code, p_device); pl text; t timestamptz; n int;
begin
  if h is null then return jsonb_build_object('err','nolic'); end if;
  select plan, activated_at into pl, t from licenses where hash = h;
  if pl = 'founder' then
    select count(*) into n from licenses where plan = 'founder' and activated_at <= t;
  end if;
  return jsonb_build_object('plan', pl, 'n', n);
end $$;
revoke all on function public.lic_info(text, text) from public;
grant execute on function public.lic_info(text, text) to anon, authenticated;
