import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold";

const variants: Record<BadgeVariant, string> = {
  default: "bg-stone-100 text-stone-700",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger:  "bg-red-50 text-red-700 border border-red-200",
  info:    "bg-blue-50 text-blue-700 border border-blue-200",
  gold:    "bg-gold-50 text-gold-700 border border-gold-200",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    PENDING:    "warning",
    PAID:       "info",
    PROCESSING: "info",
    SHIPPED:    "gold",
    DELIVERED:  "success",
    CANCELLED:  "danger",
  };
  return <Badge variant={map[status] ?? "default"}>{status}</Badge>;
}