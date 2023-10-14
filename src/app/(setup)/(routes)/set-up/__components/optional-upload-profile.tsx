'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import {
  FailedServerResponsePayload,
  SuccessServerResponsePayload,
} from '@/lib/response';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SetupComponentFnProps, useExternalSetupState } from './setup-client';
import {
  SetupChooseAccountTypeFormData,
  UserAsLecturerFormData,
  UserAsStudentFormData,
  userAsLecturerFormSchema,
  userAsStudentFormSchema,
} from '../__validator/set-up-validator';
import { useSetupProfile } from '@/mutations/use-update-profile';
import { useRouter } from 'next/navigation';
import { SafeParseSuccess } from 'zod';

interface OptionalUploadProfileProps extends SetupComponentFnProps {}

export const OptionalUploadProfile: React.FC<OptionalUploadProfileProps> = ({
  stepOption,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [removedImages, setRemoveImages] = useState<string[]>([]);
  const [skippedUpload, setSkippedUpload] = useState(false);
  const { getStepData, setStepState, setStepCompleted, data } =
    useExternalSetupState();
  const [uploading, setUploading] = useState(false);
  const [url, setURL] = useState<string | null>(
    (getStepData(stepOption.step) as { url?: string })?.url ?? null
  );

  const { isLoading: serverUpdatingProfile, mutateAsync: setupUserProfile } =
    useSetupProfile();
  const [triggerServerSync, setTriggerServerSync] = useState(false);
  const router = useRouter();

  const uploadImage = async (file: File, abort?: AbortController) => {
    if (!file) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.set('file', file);

      const url = new URL(`${window.location.origin}/api/upload/images`);
      if (removedImages.length) {
        url.searchParams.set('removed', removedImages.join(','));
      }

      const res = await fetch(url, {
        method: 'POST',
        body: data,
        signal: abort?.signal ?? null,
      });

      if (!res.ok) {
        const { title, message }: FailedServerResponsePayload =
          await res.json();
        toast.error(title, { description: message });
      } else {
        const {
          data: { url },
          title,
          message,
        }: SuccessServerResponsePayload<{ url: string }> = await res.json();
        setURL(url);
        setFile(null);
        toast.success(title, { description: message });
      }
    } catch (e: any) {
      console.log(e);
      toast.error('Upload failed', {
        description:
          'failed image upload can be a result of network down connection or invalid image selected',
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setURL(url);
      const abort = new AbortController();
      uploadImage(file, abort);
      return () => {
        abort.abort();
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  function stepFormCompleted() {
    if (!data) return false;
    return Object.keys(data).every((key) => data[key].completed);
  }

  async function submitProfileUpdate() {
    try {
      const formData = {
        type: (getStepData(1) as SetupChooseAccountTypeFormData).type,
        profileInfo: Object.assign({}, getStepData(2), getStepData(3)),
      };
      console.log(formData);
      const [sanitizedFormData] = [
        userAsStudentFormSchema,
        userAsLecturerFormSchema,
      ]
        .map((schema) => schema.safeParse(formData))
        .filter((result) => result.success)
        .map(
          (result) =>
            (
              result as SafeParseSuccess<
                UserAsLecturerFormData | UserAsStudentFormData
              >
            ).data
        );

      if (!sanitizedFormData) {
        throw new Error('Invalid form data');
      }

      await setupUserProfile(sanitizedFormData);
      router.push('/dashboard');
    } catch (e) {
      console.log(e);
      toast.error('An error occurred while updating profile details');
    }
  }

  useEffect(() => {
    if (triggerServerSync && stepFormCompleted()) {
      submitProfileUpdate();
    }
  }, [triggerServerSync]);

  useEffect(() => {
    setStepState(stepOption.step, { url });
    if (skippedUpload) {
      setStepCompleted(stepOption.step, { completed: true });
      return;
    }
    setStepCompleted(stepOption.step, { completed: /^http/.test(url ?? '') });
  }, [url, skippedUpload]);

  const disableAction =
    serverUpdatingProfile || uploading || !stepFormCompleted();

  return (
    <div>
      <div>
        <div>
          <div className="flex justify-center items-center">
            <Avatar className="block w-[160px] h-[160px] rounded-full">
              <AvatarImage
                className="block"
                src={url ?? undefined}
                alt="profile"
              />
              <AvatarFallback>
                <div className="relative w-full h-full">
                  <Image
                    src="/icons/profile.svg"
                    alt="profile"
                    fill
                    className="object-fill block"
                  />
                </div>
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col items-center gap-y-4">
            <Input
              type={file ? 'button' : 'file'}
              multiple={false}
              className="hidden"
              id="upload-profile-image"
              onClick={(e) => {
                if ((e.target as HTMLInputElement).type === 'button' && file) {
                  uploadImage(file);
                }
              }}
              onChange={(e) => {
                let includeFile = !!e.target.files?.length;
                if (!includeFile) return;
                if (url && !/^blob:http/.test(url)) {
                  setRemoveImages((prev) => [...prev, url]);
                }
                if ((e.target as HTMLInputElement).type === 'file') {
                  setFile(e.target.files![0]);
                }
              }}
            />
            <Button
              type="button"
              variant="default"
              disabled={disableAction}
              className="w-[108px] h-[38px] bg-[#3F3F44]  p-0
                       text-white hover:bg-[#3F3F44] "
            >
              <label
                htmlFor="upload-profile-image"
                className="block w-full h-full px-4 py-3 cursor-pointer"
              >
                Upload
              </label>
            </Button>
          </div>
        </div>

        <div className="flex gap-x-4 w-[460px] mt-14">
          <Button
            disabled={uploading}
            className="bg-transparent  border-2 border-[#FDCB9E] flex-grow hover:bg-transparent"
            type="button"
            onClick={() => setSkippedUpload(true)}
          >
            Skip
          </Button>
          <Button
            disabled={skippedUpload !== true && disableAction}
            variant="primary"
            className="flex-grow"
            type="button"
            onClick={(event) => {
              if (disableAction) return;
              event.preventDefault();
              setTriggerServerSync(true);
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
