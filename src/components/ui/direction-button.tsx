import Image from 'next/image';

export const DirectionButton = () => {
  return (
    <div className="inline-flex isolate">
      <button
        className="flex items-center justify-center h-[47px] w-[47px] 
                    rounded-full bg-[#CCEABB]"
      >
        <span className="w-[24px] h-[24px] inline-block relative">
          <Image src="/images/frame.svg" alt="chevron right" fill />
        </span>
      </button>
      <span className="inline-block h-[47px] w-[47px] rounded-full bg-white relative  z-[-1] inset-0 translate-x-[-50%]"></span>
    </div>
  );
};
