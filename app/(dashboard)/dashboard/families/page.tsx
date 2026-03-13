import Link from "next/link";
import { Plus, Pencil, Snowflake, Trash2 } from "lucide-react";
import { getFamilies } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { deleteFamilyAction, toggleFamilyStatusAction } from "./actions";

export default async function FamiliesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Number(params.page ?? 1);
  const result = await getFamilies(q, page, 12);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>إدارة العوائل</CardTitle>
            <CardDescription>إضافة وتعديل وتجميد العوائل مع بحث سريع</CardDescription>
          </div>

          <Link
            href="/dashboard/families/new"
            className={buttonVariants({ className: "inline-flex gap-2" })}
          >
            <Plus className="ml-2 size-4" />
            إضافة عائلة
          </Link>
        </CardHeader>

        <CardContent>
          <form className="mb-4">
            <Input name="q" defaultValue={q} placeholder="ابحث برمز أو اسم العائلة" />
          </form>

          {result.data.length === 0 ? (
            <EmptyState
              title="لا توجد نتائج"
              description="جرّب تغيير عبارة البحث أو إضافة عائلة جديدة"
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border bg-white/50">
              <Table>
                <THead>
                  <TR>
                    <TH>الرمز</TH>
                    <TH>اسم العائلة</TH>
                    <TH>الأفراد</TH>
                    <TH>المنطقة</TH>
                    <TH>الحالة</TH>
                    <TH>الإجراءات</TH>
                  </TR>
                </THead>

                <TBody>
                  {result.data.map((family) => (
                    <TR key={family.id}>
                      <TD>{family.family_code}</TD>
                      <TD className="font-medium">{family.family_name}</TD>
                      <TD>{family.members_count}</TD>
                      <TD>{family.area ?? "-"}</TD>
                      <TD>
                        <Badge
                          className={
                            family.is_active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          }
                        >
                          {family.is_active ? "فعالة" : "مجمّدة"}
                        </Badge>
                      </TD>

                      <TD>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/dashboard/families/${family.id}`}
                            className="inline-flex h-10 items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                            تعديل
                          </Link>

                          <form action={toggleFamilyStatusAction}>
                            <input type="hidden" name="id" value={family.id} />
                            <input
                              type="hidden"
                              name="next_status"
                              value={family.is_active ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="inline-flex h-10 items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                            >
                              <Snowflake className="h-4 w-4" />
                              {family.is_active ? "تجميد" : "تفعيل"}
                            </button>
                          </form>

                          <form action={deleteFamilyAction}>
                            <input type="hidden" name="id" value={family.id} />
                            <button
                              type="submit"
                              className="inline-flex h-10 items-center justify-center gap-1 rounded-2xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              حذف
                            </button>
                          </form>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}