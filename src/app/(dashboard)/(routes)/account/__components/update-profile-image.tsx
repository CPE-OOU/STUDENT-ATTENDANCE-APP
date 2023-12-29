'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SuccessServerResponsePayload } from '@/lib/response';
import { cn } from '@/lib/utils';
import { Camera, Loader } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface UpdateProfileImageProps {
  currentProfileImgUrl?: string | null;
}

//<Eye />
//<EyeOff />
//<LogOut />
export const UpdateProfileImage: React.FC<UpdateProfileImageProps> = ({
  currentProfileImgUrl,
}) => {
  const [profileImgUrl, setProfileImgUrl] = useState(currentProfileImgUrl);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function updateProfileImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    event.preventDefault();
    const [file] = event.target.files ?? [];
    if (!file) return;

    setUploading(true);
    const prevProfileImg = profileImgUrl;
    const newlyUploadingProfile = URL.createObjectURL(file);
    setProfileImgUrl(newlyUploadingProfile);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const response = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw await response.json();
      }

      const {
        data: { url },
        title,
        message,
      } = (await response.json()) as SuccessServerResponsePayload<{
        url: string;
      }>;

      toast.success(title, { description: message });
      router.refresh();
      setProfileImgUrl(url);
    } catch (e) {
      toast.error('Image upload failed', {
        description: 'We ran into an issue while uploading your image',
      });
      setProfileImgUrl(prevProfileImg);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(newlyUploadingProfile);
    }
  }

  return (
    <div
      className={cn(
        'w-[150px] h-[186px] relative bg-[#C4C4C4] rounded-lg',
        uploading && 'bg-blend-overlay'
      )}
    >
      <Avatar className="w-full h-full rounded-lg">
        <AvatarImage src={currentProfileImgUrl ?? undefined} alt="profile" />
        <AvatarFallback className="w-full h-full relative">
          <Image
            src="/icons/sample-profile.svg"
            fill
            className="object-cover"
            alt="profile"
          />
        </AvatarFallback>
      </Avatar>
      <div className="absolute left-[50%] bottom-0 translate-y-[50%] -translate-x-[50%]  z-10">
        <input
          hidden
          type="file"
          id="account-profile-image"
          onChange={updateProfileImage}
        />
        <Button
          variant="ghost"
          className="group w-12 h-12 p-0 disabled:opacity-1"
          disabled={uploading}
        >
          <label
            htmlFor="account-profile-image"
            className="group-disabled:opacity-[80%] bg-[#FDCB9E] rounded-full justify-center items-center w-full h-full flex"
          >
            <Camera className="w-6 h-6" />
          </label>
        </Button>
      </div>
      <div
        className={cn(
          'absolute inset-0 hidden  justify-center items-center',
          uploading && 'flex bg-black/40'
        )}
      >
        <div className={cn(uploading && 'animate-spin')}>
          <Loader className="w-6 h-6  text-[#fff] " />
        </div>
      </div>
    </div>
  );
};
