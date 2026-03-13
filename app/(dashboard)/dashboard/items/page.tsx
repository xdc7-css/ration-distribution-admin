import { getItems } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ItemsClientTable } from "@/components/items-client-table";
import { ItemForm } from "@/components/item-form";

function formatQuantity(value: number | string) {
  const num = Number(value);

  if (!Number.isFinite(num)) return String(value);
  if (Number.isInteger(num)) return num.toString();

  return num.toFixed(2).replace(/\.00$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

export default async function ItemsPage() {
  const items = await getItems();

  const normalizedItems = items.map((item: any) => ({
    ...item,
    default_quantity_formatted: formatQuantity(item.default_quantity),
  }));

  const activeItemsCount = items.filter((item: any) => item.is_active).length;
  const inactiveItemsCount = items.length - activeItemsCount;

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="space-y-6">
        <ItemForm />

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Card className="rounded-3xl border border-white/60 bg-white/75 shadow-sm backdrop-blur">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">إجمالي المواد</p>
              <p className="mt-2 text-2xl font-bold">{items.length}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-white/60 bg-white/75 shadow-sm backdrop-blur">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">المواد الفعالة</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{activeItemsCount}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-white/60 bg-white/75 shadow-sm backdrop-blur">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">المواد المجمدة</p>
              <p className="mt-2 text-2xl font-bold text-amber-600">{inactiveItemsCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-3xl border border-white/60 bg-white/75 shadow-sm backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">المواد</CardTitle>
          <CardDescription className="text-sm leading-6">
            تعريف المواد والكميات الافتراضية وآلية الاحتساب المستخدمة في التوزيع الشهري.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ItemsClientTable items={normalizedItems} />
        </CardContent>
      </Card>
    </div>
  );
}