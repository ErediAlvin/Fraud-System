import { Bell } from 'lucide-react';

interface HeaderProps {
  breadcrumbs?: string[];
}

export function Header({ breadcrumbs = ['Dashboard'] }: HeaderProps) {
  return (
    <header className="bg-white border-b border-[#DDE1E7] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              {index > 0 && <span className="mx-2">/</span>}
              <span className={index === breadcrumbs.length - 1 ? 'text-[#1C1C1E] font-medium' : ''}>
                {crumb}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-[#F4F6F9] rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-[#6B7280]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#C0392B] rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
