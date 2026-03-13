import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-xl border bg-white/80 px-3 py-2 text-sm shadow-sm outline-none ring-ring focus:ring-2",
        className
      )}
      {...props}
    />
  );
}
