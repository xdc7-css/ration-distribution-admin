import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/server/auth-actions";

export function Header() {
  return (
    <header className="glass mb-6 flex items-center justify-between rounded-3xl border border-white/60 p-4 shadow-glass">
      <div>
        <h1 className="text-xl font-bold">لوحة الإدارة</h1>
        <p className="text-sm text-muted-foreground">إدارة العوائل والمواد والتوزيع الشهري</p>
      </div>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" className="gap-2">
          <LogOut className="size-4" />
          تسجيل الخروج
        </Button>
      </form>
    </header>
  );
}
