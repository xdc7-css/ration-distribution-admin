"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

type ItemState = {
  error: string;
  success: string;
};

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function upsertItemAction(
  prevState: ItemState,
  formData: FormData
): Promise<ItemState> {
  try {
    const id = String(formData.get("id") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const unit = String(formData.get("unit") ?? "").trim();
    const defaultQuantity = Number(formData.get("default_quantity") ?? 0);
    const calculationType = String(formData.get("calculation_type") ?? "").trim();
    const isActive = formData.get("is_active") === "on";

    if (!name || !unit || !calculationType) {
      return { error: "يرجى ملء جميع الحقول المطلوبة", success: "" };
    }

    if (!["per_person", "per_family"].includes(calculationType)) {
      return { error: "نوع الاحتساب غير صالح", success: "" };
    }

    if (!Number.isFinite(defaultQuantity) || defaultQuantity < 0) {
      return { error: "الكمية الافتراضية غير صالحة", success: "" };
    }

    const supabase = getSupabaseAdmin();

    const { data: existingItem, error: existingError } = await supabase
      .from("items")
      .select("id, name")
      .ilike("name", name)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return { error: existingError.message, success: "" };
    }

    if (existingItem && existingItem.id !== id) {
      return { error: "اسم المادة موجود مسبقاً", success: "" };
    }

    const payload = {
      name,
      unit,
      default_quantity: defaultQuantity,
      calculation_type: calculationType,
      is_active: isActive,
    };

    const query = id
      ? supabase.from("items").update(payload).eq("id", id)
      : supabase.from("items").insert(payload);

    const { error } = await query;

    if (error) {
      return { error: error.message, success: "" };
    }

    revalidatePath("/dashboard/items");
    revalidatePath("/dashboard/distribution");

    return {
      error: "",
      success: id ? "تم تحديث المادة بنجاح" : "تمت إضافة المادة بنجاح",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
      success: "",
    };
  }
}

export async function toggleItemActiveAction(id: string, nextValue: boolean) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("items")
    .update({ is_active: nextValue })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/items");
  revalidatePath("/dashboard/distribution");
}

export async function deleteItemAction(id: string) {
  const supabase = getSupabaseAdmin();

  const { error: distributionItemsError } = await supabase
    .from("monthly_distribution_items")
    .delete()
    .eq("item_id", id);

  if (distributionItemsError) {
    throw new Error(distributionItemsError.message);
  }

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/items");
  revalidatePath("/dashboard/distribution");
}