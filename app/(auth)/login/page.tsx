import { ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { loginAction } from "@/server/auth-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 rounded-3xl bg-primary/10 p-4 text-primary"><ShieldCheck className="size-8" /></div>
          <CardTitle className="text-2xl">{APP_NAME}</CardTitle>
          <CardDescription>تسجيل دخول خاص بالإدارة فقط</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">البريد الإلكتروني</label>
              <Input type="email" name="email" required placeholder="admin@example.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">كلمة المرور</label>
              <Input type="password" name="password" required />
            </div>
            <Button className="w-full" type="submit">تسجيل الدخول</Button>
            <p className="text-center text-xs text-muted-foreground">تم تعطيل التسجيل العام. أنشئ المستخدم الأول من Supabase Auth.</p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
