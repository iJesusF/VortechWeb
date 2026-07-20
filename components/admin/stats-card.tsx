import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

export function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-1 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="grid size-12 place-items-center rounded-xl border border-cyanx/20 bg-cyanx/10">
          <Icon className="size-6 text-cyanx" />
        </div>
      </div>
    </div>
  );
}
