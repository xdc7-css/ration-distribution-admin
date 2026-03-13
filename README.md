# نظام توزيع المواد الغذائية

تطبيق إداري خاص لإدارة توزيع المواد الغذائية على العوائل باستخدام **Next.js App Router + TypeScript + Tailwind CSS + Supabase + SheetJS**.

## المزايا

- تسجيل دخول إداري فقط عبر Supabase Auth
- واجهة عربية RTL بتصميم حديث وناعم
- إدارة العوائل والمواد
- توزيع شهري مع حساب تلقائي للمواد
- حفظ السجلات كـ historical snapshots
- تقارير شهرية وسجل لكل عائلة
- تصدير Excel كامل أو جزئي عبر SheetJS
- بنية جاهزة للتطوير والإطلاق على Vercel

## المتطلبات

- Node.js 20+
- مشروع Supabase
- Vercel أو أي بيئة Node حديثة

## الإعداد المحلي

1. انسخ الملف:

```bash
cp .env.example .env.local
```

2. أضف قيم Supabase داخل `.env.local`.

3. ثبّت الحزم:

```bash
npm install
```

4. نفّذ SQL داخل Supabase SQL Editor:

- `supabase/schema.sql`
- `supabase/seed.sql`

5. أنشئ مستخدم admin من Supabase Auth > Users.

6. عطّل التسجيل العام من:

Authentication → Providers / Settings → Disable signup.

7. شغّل المشروع:

```bash
npm run dev
```

## هيكل المجلدات

```text
app/
  (auth)/login
  (dashboard)/dashboard
  api/export
components/
lib/
server/
supabase/
```

## ملاحظات معمارية

- قاعدة البيانات هي المصدر الأساسي للحقيقة.
- Excel للتصدير والنسخ الاحتياطي والاستيراد الاختياري.
- `members_count_at_delivery` يتم حفظه داخل السجل الشهري للحفاظ على التاريخ.
- التعديل على سجل الشهر نفسه يتم عبر `upsert` منطقي على `(family_id, month, year)`.
- تم فصل التصدير داخل API routes لتسهيل إضافة scheduled backups لاحقاً.

## النشر على Vercel

1. ارفع المشروع إلى GitHub.
2. اربطه مع Vercel.
3. أضف متغيرات البيئة نفسها في Vercel.
4. تأكد من تشغيل SQL على Supabase قبل أول تشغيل.
5. نفّذ Build Command الافتراضي:

```bash
npm run build
```

## تحسينات مقترحة لاحقاً

- استيراد Excel للعوائل والمواد
- صلاحيات متعددة للأدمن
- طباعة وصل تسليم
- Dashboard charts
- جدولة نسخ احتياطية إلى Supabase Storage أو S3
