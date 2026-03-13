"use client";

import { useMemo, useState } from "react";
import { Edit3, Search, Snowflake, Trash2 } from "lucide-react";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ItemForm } from "@/components/item-form";
import { deleteItemAction, toggleItemActiveAction } from "@/server/item-actions";

type ItemRow = {
  id: string;
  name: string;
  unit: string;
  default_quantity: number;
  default_quantity_formatted?: string;
  calculation_type: "per_person" | "per_family";
  is_active: boolean;
};

export function ItemsClientTable({ items }: { items: ItemRow[] }) {
  const [query, setQuery] = useState("");
  const [editingItem, setEditingItem] = useState<ItemRow | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q) ||
        (item.calculation_type === "per_person" ? "لكل فرد" : "لكل عائلة").includes(q)
      );
    });
  }, [items, query]);

  async function handleDelete(item: ItemRow) {
    const ok = window.confirm(`هل تريد حذف المادة "${item.name}" نهائياً؟`);
    if (!ok) return;

    setLoadingId(item.id);
    try {
      await deleteItemAction(item.id);
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  }

  async function handleToggle(item: ItemRow) {
    const actionLabel = item.is_active ? "تجميد" : "تفعيل";
    const ok = window.confirm(`هل تريد ${actionLabel} المادة "${item.name}"؟`);
    if (!ok) return;

    setLoadingId(item.id);
    try {
      await toggleItemActiveAction(item.id, !item.is_active);
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم المادة أو الوحدة..."
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pr-10 pl-4 text-sm outline-none transition focus:border-primary"
          />
        </div>

        {editingItem ? (
          <div className="w-full rounded-3xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">تعديل المادة: {editingItem.name}</p>
              <Button variant="ghost" onClick={() => setEditingItem(null)}>
                إلغاء
              </Button>
            </div>
            <ItemForm item={editingItem} />
          </div>
        ) : null}
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 p-8 text-center">
          <div>
            <p className="text-base font-semibold">لا توجد نتائج مطابقة</p>
            <p className="mt-2 text-sm text-muted-foreground">
              جرّب البحث باسم مختلف أو أفرغ حقل البحث.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/60">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR className="bg-slate-50/80">
                  <TH>المادة</TH>
                  <TH>الوحدة</TH>
                  <TH>الكمية الافتراضية</TH>
                  <TH>آلية الاحتساب</TH>
                  <TH>الحالة</TH>
                  <TH className="text-left">الإجراءات</TH>
                </TR>
              </THead>

              <TBody>
                {filteredItems.map((item) => {
                  const busy = loadingId === item.id;

                  return (
                    <TR key={item.id} className="transition hover:bg-slate-50/70">
                      <TD className="font-medium">{item.name}</TD>
                      <TD>{item.unit}</TD>
                      <TD>{item.default_quantity_formatted ?? item.default_quantity}</TD>
                      <TD>{item.calculation_type === "per_person" ? "لكل فرد" : "لكل عائلة"}</TD>
                      <TD>
                        <Badge
                          className={
                            item.is_active
                              ? "border-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "border-0 bg-amber-100 text-amber-700 hover:bg-amber-100"
                          }
                        >
                          {item.is_active ? "فعالة" : "مجمّدة"}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => setEditingItem(item)}
                          >
                            <Edit3 className="size-4" />
                            تعديل
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            disabled={busy}
                            onClick={() => handleToggle(item)}
                          >
                            <Snowflake className="size-4" />
                            {item.is_active ? "تجميد" : "تفعيل"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-red-600 hover:text-red-700"
                            disabled={busy}
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="size-4" />
                            حذف
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}