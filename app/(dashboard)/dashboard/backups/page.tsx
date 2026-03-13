import Link from "next/link";
import { ArchiveRestore, CalendarDays, Download, FileSpreadsheet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function BackupOption({
  title,
  description,
  href,
  buttonLabel,
  icon: Icon,
  variant = "default",
  disabled = false,
}: {
  title: string;
  description: string;
  href?: string;
  buttonLabel?: string;
  icon: React.ElementType;
  variant?: "default" | "outline" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="size-5" />
        </div>
      </div>

      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {disabled ? (
        <div className="mt-5 rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm font-medium text-primary/80">
          قريبًا
        </div>
      ) : (
        <Link
          href={href as any}
          className={buttonVariants({
            variant,
            className: "mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl",
          })}
        >
          <Download className="size-4" />
          {buttonLabel}
        </Link>
      )}
    </div>
  );
}

export default function BackupsPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border border-white/60 bg-white/75 shadow-sm backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">النسخ الاحتياطي والتصدير</CardTitle>
          <CardDescription className="text-sm leading-6">
            تصدير كامل أو شهري لبيانات النظام بصيغة Excel، مع بنية جاهزة للتوسعة لاحقًا
            لإضافة الاستيراد والنسخ الاحتياطي المجدول.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <BackupOption
            title="تصدير كامل"
            description="يشمل جميع بيانات العوائل والمواد وسجلات التوزيع في ملف واحد منظم لغايات الأرشفة والنسخ الاحتياطي."
            href="/api/export/all"
            buttonLabel="تنزيل الملف"
            icon={ArchiveRestore}
            variant="default"
          />

          <BackupOption
            title="تصدير الشهر الحالي"
            description={`إنشاء نسخة شهرية سريعة لسجلات التوزيع الخاصة بشهر ${month} / ${year} للمراجعة أو الأرشفة.`}
            href={`/api/export/monthly?month=${month}&year=${year}`}
            buttonLabel="تنزيل التقرير"
            icon={CalendarDays}
            variant="outline"
          />

          <BackupOption
            title="استيراد البيانات"
            description="رفع ملف Excel واستيراد بيانات العوائل إلى النظام بشكل مباشر مع فحص أولي للحقول."
            href="/dashboard/import"
            buttonLabel="فتح صفحة الاستيراد"
            icon={FileSpreadsheet}
            variant="outline"
          />
        </CardContent>
      </Card>
    </div>
  );
}