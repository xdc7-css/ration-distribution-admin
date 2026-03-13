import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildWorkbook, workbookToBuffer } from "@/lib/excel";

export async function GET(request: NextRequest) {
  const userClient = await createClient();
  const { data: userData } = await userClient.auth.getUser();
  if (!userData.user) return new NextResponse("Unauthorized", { status: 401 });
  const month = Number(request.nextUrl.searchParams.get("month"));
  const year = Number(request.nextUrl.searchParams.get("year"));
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("monthly_distributions")
    .select(`
      id, month, year, members_count_at_delivery, notes, created_at,
      families (family_code, family_name, area),
      monthly_distribution_items (*)
    `)
    .eq("month", month)
    .eq("year", year)
    .order("created_at", { ascending: false });

  const rows = (data ?? []).flatMap((record: any) =>
    record.monthly_distribution_items.map((item: any) => ({
      family_code: record.families.family_code,
      family_name: record.families.family_name,
      area: record.families.area,
      month: record.month,
      year: record.year,
      members_count_at_delivery: record.members_count_at_delivery,
      item_name: item.item_name_snapshot,
      unit: item.unit_snapshot,
      calculated_quantity: item.calculated_quantity,
      delivered_quantity: item.delivered_quantity,
      notes: record.notes,
      created_at: record.created_at,
    }))
  );

  const workbook = buildWorkbook({ monthly_report: rows });
  const buffer = workbookToBuffer(workbook);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="monthly-report-${year}-${month}.xlsx"`,
    },
  });
}
