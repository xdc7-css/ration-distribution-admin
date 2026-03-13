import Link from "next/link";
import { ArrowRight, Download, Package2, Phone, Users } from "lucide-react";
import { getFamilyById, getFamilyHistory } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FamilyForm } from "@/components/family-form";
import { EmptyState } from "@/components/empty-state";
import { formatNumber, monthOptions } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default async function FamilyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const family = await getFamilyById(id);
  const history = await getFamilyHistory(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard/families"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowRight className="h-4 w-4" />
          رجوع إلى العوائل
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <FamilyForm family={family} />

        <Card className="border-slate-200 bg-white/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {family.family_name}
                  </CardTitle>

                  <Badge
                    className={
                      family.is_active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                    }
                  >
                    {family.is_active ? "فعالة" : "مجمّدة"}
                  </Badge>
                </div>

                <CardDescription className="text-sm leading-6">
                  <span className="font-medium text-slate-700">{family.family_code}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span>{family.area ?? "بدون منطقة"}</span>
                </CardDescription>
              </div>

              <Link
                href={`/api/export/family/${id}`}
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "inline-flex h-11 items-center gap-2 rounded-2xl border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm",
                })}
              >
                <Download className="h-4 w-4" />
                تصدير تقرير العائلة
              </Link>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-slate-500">
                  <Users className="h-4 w-4" />
                  <p className="text-xs font-medium">الأفراد</p>
                </div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {family.members_count}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-slate-500">
                  <Phone className="h-4 w-4" />
                  <p className="text-xs font-medium">الهاتف</p>
                </div>
                <p className="text-xl font-semibold text-slate-900">
                  {family.phone ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-slate-500">
                  <Package2 className="h-4 w-4" />
                  <p className="text-xs font-medium">عدد مرات التسليم</p>
                </div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {history.length}
                </p>
              </div>
            </div>

            {family.notes ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-slate-500">ملاحظات</p>
                <p className="mt-3 leading-8 text-slate-800">{family.notes}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5">
                <p className="text-sm text-slate-500">لا توجد ملاحظات لهذه العائلة.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-5">
          <CardTitle className="text-2xl font-bold">سجل التسليم الشهري</CardTitle>
          <CardDescription>
            جميع السجلات محفوظة كسجل تاريخي ثابت ويمكن الرجوع إليها لاحقاً
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {history.length === 0 ? (
            <EmptyState
              title="لا يوجد سجل تسليم"
              description="لم يتم تسجيل أي تسليم لهذه العائلة بعد"
            />
          ) : (
            history.map((record: any) => (
              <div
                key={record.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-900">
                      {monthOptions[record.month - 1]} {record.year}
                    </p>
                    <p className="text-sm text-slate-500">
                      عدد الأفراد وقت التسليم: {record.members_count_at_delivery}
                    </p>
                  </div>

                  <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                    {record.monthly_distribution_items.length} مواد
                  </Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {record.monthly_distribution_items.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white"
                    >
                      <p className="mb-3 text-base font-semibold text-slate-900">
                        {item.item_name_snapshot}
                      </p>

                      <div className="space-y-1.5">
                        <p className="text-sm text-slate-600">
                          المسلّم:{" "}
                          <span className="font-semibold text-slate-900">
                            {formatNumber(item.delivered_quantity)} {item.unit_snapshot}
                          </span>
                        </p>

                        <p className="text-sm text-slate-600">
                          المحسوب:{" "}
                          <span className="font-semibold text-slate-900">
                            {formatNumber(item.calculated_quantity)} {item.unit_snapshot}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}