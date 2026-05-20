interface StatusBadgeProps {
  status: string;
  variant?: 'outline' | 'filled';
  className?: string;
}

export function StatusBadge({ status, variant = 'outline', className = '' }: StatusBadgeProps) {
  const getStyles = () => {
    const upperStatus = status.toUpperCase();

    if (variant === 'filled') {
      const filled = {
        CONFIRMED: 'bg-[#2E7D52] text-white border-[#2E7D52]',
        SUSPENDED: 'bg-[#C0392B] text-white border-[#C0392B]',
        MISMATCH: 'bg-[#C0392B] text-white border-[#C0392B]',
        PENDING: 'bg-[#6B7280] text-white border-[#6B7280]',
      };
      return filled[upperStatus as keyof typeof filled] || 'bg-[#6B7280] text-white border-[#6B7280]';
    }

    const outline = {
      CLEAN: 'border-[#2E7D52] text-[#2E7D52]',
      WATCHLIST: 'border-[#E8A020] text-[#E8A020]',
      SUSPENDED: 'border-[#C0392B] text-[#C0392B]',
      PENDING: 'border-[#6B7280] text-[#6B7280]',
    };
    return outline[upperStatus as keyof typeof outline] || 'border-[#6B7280] text-[#6B7280]';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()} ${className}`}>
      {status}
    </span>
  );
}
