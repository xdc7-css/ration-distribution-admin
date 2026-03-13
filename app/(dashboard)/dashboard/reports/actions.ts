"use server";

import { createClient } from "@/lib/supabase/server";
import { buildFamilyReportWorkbook, workbookToBuffer } from "@/lib/excel-reports";

export async function exportFamilyReportAction(familyId: string) {
  const supabase = await createClient();

  const { data: family, error: familyError } = await supabase
    .from("families")
    .select("id, family_code, family_name, area, phone, members_count")
    .eq("id", familyId)
    .single();

  if (familyError || !family) {
    throw new Error("تعذر تحميل بيانات العائلة");
  }

  const { data: distributions, error: distributionsError } = await supabase
    .from("monthly_distributions")
    .select(`
      id,
      month,
      year,
      delivered_at,
      members_count_at_delivery,
      notes,
      monthly_distribution_items (
        id,
        item_name_snapshot,
        unit_snapshot,
        delivered_quantity
      )
    `)
    .eq("family_id", familyId)
    .order("year", { ascending: true })
    .order("month", { ascending: true });

  if (distributionsError) {
    throw new Error("تعذر تحميل سجل التوزيع الخاص بالعائلة");
  }

  const rows = (distributions ?? []).map((d: any) => ({
    month: d.month,
    year: d.year,
    delivered_at: d.delivered_at,
    members_count_at_delivery: d.members_count_at_delivery,
    notes: d.notes,
    items: (d.monthly_distribution_items ?? []).map((i: any) => ({
      item_name: i.item_name_snapshot,
      unit: i.unit_snapshot,
      delivered_quantity: Number(i.delivered_quantity ?? 0),
    })),
  }));

  const workbook = await buildFamilyReportWorkbook({
    family: {
      family_code: family.family_code,
      family_name: family.family_name,
      area: family.area,
      phone: family.phone,
      members_count: family.members_count,
    },
    rows,
    reportTitle: `سجل العائلة - ${family.family_name}`,
  });

  const buffer = await workbookToBuffer(workbook);

  return {
    fileName: `سجل عائلة - ${family.family_name}.xlsx`,
    buffer: buffer.toString("base64"),
  };
}