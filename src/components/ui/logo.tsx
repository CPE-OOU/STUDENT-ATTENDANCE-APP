import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className }) => (
  <div className={cn('w-[108px] h-[47px] relative', className)}>
    <Image
      alt="logo"
      src="/icons/logo.svg"
      fill
      className="inline-block object-contain"
    />
  </div>
);
