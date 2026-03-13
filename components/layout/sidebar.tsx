"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";

import {
  Boxes,
  ClipboardList,
  Home,
  Package,
  ShieldCheck,
  Users,
  FileSpreadsheet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const links: { href: Route; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "لوحة التحكم", icon: Home },
  { href: "/dashboard/families", label: "العوائل", icon: Users },
  { href: "/dashboard/items", label: "المواد", icon: Package },
  { href: "/dashboard/distribution", label: "التوزيع الشهري", icon: ClipboardList },
  { href: "/dashboard/reports", label: "التقارير", icon: FileSpreadsheet },
  { href: "/dashboard/backups", label: "النسخ الاحتياطي", icon: Boxes },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col rounded-3xl border border-white/60 p-4 shadow-glass lg:flex">

      <div className="mb-8 flex items-center gap-3 rounded-2xl bg-white/70 p-4">

        <div className="rounded-2xl bg-primary/10 p-2">
          <Image
            src="/icon.png"
            alt="logo"
            width={85}
            height={85}
          />
        </div>

        <div>
          <p className="font-semibold">{APP_NAME}</p>
          <p className="text-xs text-muted-foreground">
            إدارة داخلية خاصة
          </p>
        </div>

      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          const active =
            pathname === link.href ||
            pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active
                  ? "bg-primary text-white shadow-soft"
                  : "hover:bg-white/70"
              )}
            >
              <Icon className="size-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}