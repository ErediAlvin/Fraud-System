import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  sparklineData?: number[];
  variant?: 'default' | 'critical' | 'warning';
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  sparklineData,
  variant = 'default'
}: StatCardProps) {
  const borderColors = {
    default: 'border-[#DDE1E7]',
    critical: 'border-[#C0392B]',
    warning: 'border-[#E8A020]',
  };

  const trendColor = trend?.direction === 'up' ? 'text-[#2E7D52]' : 'text-[#C0392B]';
  const TrendIcon = trend?.direction === 'up' ? ArrowUp : ArrowDown;

  return (
    <div className={`bg-white rounded-lg border ${borderColors[variant]} p-5`}>
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className="p-2 rounded-md bg-[#F4F6F9]">
            <Icon className="w-5 h-5 text-[#6B7280]" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold text-[#1C1C1E]">{value}</p>
        <p className="text-xs text-[#6B7280] uppercase tracking-wide">{label}</p>
      </div>

      {trend && (
        <div className={`flex items-center gap-1 mt-2 ${trendColor} text-sm`}>
          <TrendIcon className="w-4 h-4" />
          <span>{Math.abs(trend.value)}% vs yesterday</span>
        </div>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 h-10 flex items-end gap-0.5">
          {sparklineData.map((val, i) => (
            <div
              key={i}
              className="flex-1 bg-[#2471A3] rounded-sm opacity-60"
              style={{ height: `${(val / Math.max(...sparklineData)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
