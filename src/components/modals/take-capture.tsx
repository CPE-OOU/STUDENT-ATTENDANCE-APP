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

const videoConstraints = {
  width: 540,
  facingMode: 'environment',
};

export const TakeCaptureModal = () => {
  const { type, opened, onClose } = useModal();

  const mounted = useMount();

  const [serverUpdatingProfile, setServerUpdatingProfile] = useState(false);
  const router = useRouter();

  const openEditModal = useModal(({ onOpen }) => onOpen);

  const webcamRef = useRef<Webcam | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
    }
  }, [webcamRef]);

  const onUserMedia = (e: any) => {
    console.log(e);
  };

  function uploadCapture() {
    // supabase.storage.from()
  }

  if (!(mounted && type === 'take-capture')) return null;
  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-white text-black p-0 overflow-hidden pt-8 rounded-[4px!important]"
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
        {url ? (
          <div className="relative w-12 h-12">
            <Image src={url} alt="Screenshot" fill />
          </div>
        ) : (
          <Webcam
            ref={webcamRef}
            audio={true}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={onUserMedia}
          />
        )}
        {url ? (
          <Button onClick={capturePhoto}>Capture</Button>
        ) : (
          <div>
            <Button variant="outline" onClick={() => setUrl(null)}>
              Refresh
            </Button>
            <Button onClick={uploadCapture}>Upload</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
