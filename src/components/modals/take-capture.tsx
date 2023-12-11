'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useModal } from '@/hooks/use-modal';
import { useCallback, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useMount } from '@/hooks/use-mouted';
import { Separator } from '../ui/separator';
import Webcam from 'react-webcam';
import { Button } from '../ui/button';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { base64ToBlob, cn, decodeBase64ToFile } from '@/lib/utils';
import { useAction } from 'next-safe-action/hook';
import { updateCapture } from '@/actions/capture';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const videoConstraints = {
  width: 540,
  facingMode: 'environment',
};

export const TakeCaptureModal = () => {
  const { type, opened, onClose } = useModal();
  const { execute, status } = useAction(updateCapture, {
    onSuccess: () => {
      toast.success('Capture', {
        description: 'Student capture is updated successfully',
      });
      onClose();
    },
    onError: () => {
      toast.success('Capture', {
        description: 'An error occurred while updating student capture',
      });
    },
  });

  const mounted = useMount();

  const modalData = useModal(({ data }) => data);

  const webcamRef = useRef<Webcam | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setUrl(imageSrc);
  }, [webcamRef]);

  async function uploadCapture() {
    if (url) {
      const { id, firstName, lastName } = modalData?.user!;
      const fileName = `${firstName}-${lastName}-${new Date().toISOString()}`;
      const file = new File([await base64ToBlob(url)], fileName);
      const { data } = await supabase.storage
        .from('images')
        .upload(
          `user/${id}/captures/${firstName}-${lastName}-${new Date().toISOString()}.jpeg`,
          file
        );
      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(`profile/${fileName}`);
      await execute({ captureUrl: publicUrl, userId: id });
    }
  }

  if (!(mounted && modalData?.user && type === 'take-capture')) return null;
  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-white text-black p-0 overflow-hidden pt-8 rounded-[4px!important] pb-8"
        style={{ borderRadius: 'none' }}
      >
        <DialogHeader className=" px-6">
          <DialogTitle className="text-2xl text-left font-bold leading-[160%] tracking-wide">
            Take Capture
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-left">
            Changes made to your profile are visible to anyone viewing your
            profile
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="px-6 rounded-sm overflow-hidden space-y-6">
          {url ? (
            <div className="relative w-[462px] h-[346px]">
              <Image src={url} alt="Screenshot" fill />
            </div>
          ) : (
            <Webcam
              ref={webcamRef}
              audio={false}
              disablePictureInPicture
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
          )}
          <div className="flex items-center justify-center mb-12">
            {!url ? (
              <Button onClick={capturePhoto}>Capture</Button>
            ) : (
              <div className="flex items-center gap-x-2">
                <Button variant="outline" onClick={() => setUrl(null)}>
                  Retake
                </Button>
                <Button onClick={uploadCapture} className="items-center">
                  Upload
                  <Loader2
                    className={cn(
                      'w-5 h-5 animate-spin hidden ml-2',
                      status === 'executing' && 'block'
                    )}
                  />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
