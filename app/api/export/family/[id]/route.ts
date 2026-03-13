import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildWorkbook, workbookToBuffer } from "@/lib/excel";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userClient = await createClient();
  const { data: userData } = await userClient.auth.getUser();
  if (!userData.user) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: family }, { data: history }] = await Promise.all([
    supabase.from("families").select("*").eq("id", id).single(),
    supabase
      .from("monthly_distributions")
      .select(`
        id, month, year, members_count_at_delivery, notes, created_at,
        monthly_distribution_items (*)
      `)
      .eq("family_id", id)
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
  ]);

  const rows = (history ?? []).flatMap((record: any) =>
    record.monthly_distribution_items.map((item: any) => ({
      family_code: family?.family_code,
      family_name: family?.family_name,
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

  const workbook = buildWorkbook({ family_history: rows });
  const buffer = workbookToBuffer(workbook);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="family-history.xlsx"`,
    },
  });
}
