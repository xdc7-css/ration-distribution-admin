"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Item } from "@/lib/types";
import { upsertItemAction } from "@/server/item-actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState = { error: "", success: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit">{pending ? "جارٍ الحفظ..." : "حفظ المادة"}</Button>;
}

export function ItemForm({ item }: { item?: Partial<Item> }) {
  const [state, formAction] = useActionState(upsertItemAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item?.id ? "تعديل المادة" : "إضافة مادة"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" defaultValue={item?.id} />

          <div>
            <label className="mb-2 block text-sm font-medium">اسم المادة</label>
            <Input name="name" defaultValue={item?.name} required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">الوحدة</label>
            <Input name="unit" defaultValue={item?.unit} required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">الكمية الافتراضية</label>
            <Input
              name="default_quantity"
              type="number"
              step="0.01"
              min={0}
              defaultValue={item?.default_quantity ?? 0}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">نوع الحساب</label>
            <Select
              name="calculation_type"
              defaultValue={item?.calculation_type ?? "per_person"}
            >
              <option value="per_person">لكل فرد</option>
              <option value="per_family">لكل عائلة</option>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-8">
            <input
              id="item_active"
              name="is_active"
              type="checkbox"
              defaultChecked={item?.is_active ?? true}
              className="size-4"
            />
            <label htmlFor="item_active" className="text-sm font-medium">
              فعالة
            </label>
          </div>

          {state.error ? (
            <p className="text-sm text-red-600 md:col-span-2">{state.error}</p>
          ) : null}

          {state.success ? (
            <p className="text-sm text-emerald-600 md:col-span-2">{state.success}</p>
          ) : null}

          <div className="md:col-span-2">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}