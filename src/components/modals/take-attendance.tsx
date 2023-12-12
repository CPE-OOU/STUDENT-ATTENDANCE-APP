'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useModal } from '@/hooks/use-modal';

import { useMount } from '@/hooks/use-mouted';
import { Separator } from '../ui/separator';

import { useAction } from 'next-safe-action/hook';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendanceSchema } from '@/lib/validations/attendance';
import { TypeOf, object, string } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { createAttendance, verifyStudentDetail } from '@/actions/attendance';
import { base64ToBlob, cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 540,
  facingMode: 'environment',
};

export const CreateStudentAttendance = () => {
  const { type, opened, onClose } = useModal();

  const mounted = useMount();

  const [attendee] = useState<{ email: string; attendeeId: string } | null>(
    null
  );

  const modalData = useModal(({ data }) => data);
  const formSchema = object({ email: string().email() });
  const form = useForm<TypeOf<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const webcamRef = useRef<Webcam | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setUrl(imageSrc);
  }, [webcamRef]);

  const { execute, status } = useAction(verifyStudentDetail);

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
    }
  }

  if (
    !(
      mounted &&
      modalData?.createAttendanceData &&
      type === 'create-attendance'
    )
  ) {
    return null;
  }

  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-white text-black p-0 overflow-hidden pt-8 rounded-[4px!important]"
        style={{ borderRadius: 'none' }}
      >
        <DialogHeader className=" px-6">
          <DialogTitle className="text-2xl text-left font-bold leading-[160%] tracking-wide">
            Take Capturing
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-left">
            Changes made to your profile are visible to anyone viewing your
            profile
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="px-6 rounded-sm overflow-hidden space-y-6"></div>
        {attendee ? (
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
        ) : (
          <Form {...form}>
            <form>
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-epilogue font-semibold text-base text-neutral-80">
                      Enter your email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? undefined}
                        type="text"
                        placeholder="Enter your email"
                        className="placeholder:text-neutral-40 font-medium rounded-none px-4 py-3"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                variant="primary"
                type="submit"
                className="px-6 py-3 ml-auto rounded-none"
              >
                Check
                <Loader2
                  className={cn(
                    'w-5 h-5 animate-spin hidden ml-2',
                    status === 'executing' && 'block'
                  )}
                />
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
