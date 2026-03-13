insert into public.items (name, unit, default_quantity, calculation_type)
values
  ('طحين', 'كغم', 9, 'per_person'),
  ('سكر', 'كغم', 3, 'per_person'),
  ('عدس', 'كغم', 0.5, 'per_person'),
  ('حمص', 'كغم', 0.5, 'per_person'),
  ('رز', 'كغم', 6, 'per_person'),
  ('زيت', 'قنينة', 1, 'per_person'),
  ('معجون طماطم', 'علبة', 1, 'per_person'),
  ('فاصوليا', 'كغم', 0.5, 'per_family')
on conflict (name) do nothing;

insert into public.families (family_code, family_name, members_count, phone, area, notes)
values
  ('FAM-1001', 'عائلة أحمد', 6, '07700000001', 'الفيصلية', 'بيانات تجريبية'),
  ('FAM-1002', 'عائلة علي', 4, '07700000002', 'المهندسين', null),
  ('FAM-1003', 'عائلة كريم', 8, '07700000003', 'الحي الصناعي', 'تحتاج متابعة شهرية')
on conflict (family_code) do nothing;
