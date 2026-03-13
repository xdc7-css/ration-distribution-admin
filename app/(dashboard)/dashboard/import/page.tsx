import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportFamiliesClient } from "@/components/import-families-client";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border border-white/60 bg-white/75 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">استيراد العوائل من Excel</CardTitle>
          <CardDescription className="text-sm leading-6">
            ارفع ملف Excel يحتوي على بيانات العوائل، راجع المعاينة، ثم نفّذ الاستيراد إلى قاعدة البيانات.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ImportFamiliesClient />
        </CardContent>
      </Card>
    </div>
  );
}