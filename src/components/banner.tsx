import Image from 'next/image';
import { DirectionButton } from './ui/direction-button';

interface BannerProps {
  title: string;
  description: string;
}

export const Banner: React.FC<BannerProps> = ({ title, description }) => {
  return (
    <div className="h-full bg-black rounded-2xl">
      <div className="flex h-full w-full pl-[76px] pr-8 py-[36px] flex-col justify-between">
        <div className="w-[108px] h-[47px] relative">
          <Image src="/images/guru.svg" alt="logo" fill />
        </div>
        <div className="flex flex-col w-full">
          <div className="">
            <h3 className="text-white text-2xl font-semibold leading-4 mb-[17px]">
              {title}
            </h3>
            <p className="max-w-[315px] leading-6 text-sm text-white">
              {description}
            </p>
          </div>

          <div className="ml-auto translate-y-[-50%]">
            <DirectionButton />
          </div>
        </div>
      </div>
    </div>
  );
};
