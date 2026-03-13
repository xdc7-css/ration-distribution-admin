"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { monthlyDistributionSchema } from "@/lib/validations";
import { searchFamilies } from "@/lib/db";

type DistributionActionResult = {
  error: string;
  success: string;
};

export async function searchFamiliesApi(query: string) {
  return searchFamilies(query);
}

export async function saveDistributionAction(
  payload: unknown
): Promise<DistributionActionResult> {
  try {
    const supabase = await createClient();
    const values = monthlyDistributionSchema.parse(payload);

    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("id, members_count")
      .eq("id", values.family_id)
      .single();

    if (familyError) {
      return { error: familyError.message, success: "" };
    }

    const { data: existing, error: existingError } = await supabase
      .from("monthly_distributions")
      .select("id")
      .eq("family_id", values.family_id)
      .eq("month", values.month)
      .eq("year", values.year)
      .maybeSingle();

    if (existingError) {
      return { error: existingError.message, success: "" };
    }

    let distributionId = existing?.id as string | undefined;
    const membersCountAtDelivery = Number(
      values.members_count_at_delivery || family.members_count
    );

    if (distributionId) {
      const { error: updateError } = await supabase
        .from("monthly_distributions")
        .update({
          notes: values.notes ?? null,
          members_count_at_delivery: membersCountAtDelivery,
          delivered_at: new Date().toISOString(),
        })
        .eq("id", distributionId);

      if (updateError) {
        return { error: updateError.message, success: "" };
      }

      const { error: deleteItemsError } = await supabase
        .from("monthly_distribution_items")
        .delete()
        .eq("monthly_distribution_id", distributionId);

      if (deleteItemsError) {
        return { error: deleteItemsError.message, success: "" };
      }
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("monthly_distributions")
        .insert({
          family_id: values.family_id,
          month: values.month,
          year: values.year,
          members_count_at_delivery: membersCountAtDelivery,
          notes: values.notes ?? null,
          delivered_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError) {
        return { error: insertError.message, success: "" };
      }

      distributionId = inserted.id;
    }

    const itemIds = values.items.map((item) => item.item_id);

    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select("id, name, unit, calculation_type, default_quantity")
      .in("id", itemIds);

    if (itemsError) {
      return { error: itemsError.message, success: "" };
    }

    const itemMap = new Map(items.map((item) => [item.id, item]));

    const rows = values.items.map((item) => {
      const source = itemMap.get(item.item_id);

      if (!source) {
        throw new Error("بعض المواد غير موجودة أو تم حذفها، حدّث الصفحة ثم أعد المحاولة");
      }

      return {
        monthly_distribution_id: distributionId,
        item_id: item.item_id,
        item_name_snapshot: source.name,
        unit_snapshot: source.unit,
        calculation_type_snapshot: source.calculation_type,
        default_quantity_snapshot: Number(source.default_quantity),
        suggested_quantity: Number(item.calculated_quantity),
        delivered_quantity: Number(item.delivered_quantity),
      };
    });

    const { error: itemsInsertError } = await supabase
      .from("monthly_distribution_items")
      .insert(rows);

    if (itemsInsertError) {
      return { error: itemsInsertError.message, success: "" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/distribution");
    revalidatePath("/dashboard/reports");

    return {
      error: "",
      success: existing
        ? "تم تحديث سجل التوزيع بنجاح"
        : "تم حفظ سجل التوزيع بنجاح",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ غير متوقع أثناء حفظ سجل التوزيع",
      success: "",
    };
  }
}
