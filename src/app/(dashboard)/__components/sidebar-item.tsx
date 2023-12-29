'use client';
import { cn, routeIsActive } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  href,
  icon: Icon,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const pathActive = routeIsActive({
    currentRoute: href,
    activeRoute: pathname,
  });

  const onClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        `
        flex items-center gap-x-2 text-slate-500 text-base font-[500]
        transition-all hover:text-slate-600 hover:bg-[#CCEABB]
        rounded-lg
    `,
        pathActive && 'bg-[#CCEABB] text-slate-800 hover:bg-[#CCEABB]/40'
      )}
    >
      <div className="flex items-center gap-x-4 py-3 px-4">
        <Icon
          size={24}
          className={cn('text-slate-500', pathActive && 'text-slate-700')}
        />
        {label}
      </div>
    </button>
  );
};
