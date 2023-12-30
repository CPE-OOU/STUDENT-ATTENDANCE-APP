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
import { CheckCircle, Loader2 } from 'lucide-react';
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { FailedServerResponsePayload } from '@/lib/response';
//<CheckCircle />

const videoConstraints = {
  width: 540,
  facingMode: 'environment',
};

export const TakeStudentAttendance = () => {
  const { type, opened, onClose } = useModal();

  const mounted = useMount();

  const [attendee, setAttendee] = useState<{
    fullName: string;
    email: string;
    attendeeId: string;
    level: string;
    department: string;
  } | null>(null);
  const [attendanceApprove, setAttendanceApprove] = useState(false);
  const [attendanceDisapprove, setAttendanceDisapprove] = useState(false);

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

  const {
    execute: executeVerifyEmail,
    status: verifyEmailStatus,
    reset,
  } = useAction(verifyStudentDetail, {
    onSuccess: (data) => {
      if (data.length === 0) {
        toast.error('Student Record', {
          description: 'User not a student taking this course',
        });
      } else {
        const [attendee] = data;
        setAttendee({
          fullName: `${attendee.user.firstName} ${attendee.user.lastName}`,
          email: attendee.user.email,
          attendeeId: attendee.student_attendees.id,
          level: attendee.students.level,
          department: attendee.students.department,
        });
        toast.success('Student Record', { description: 'User record found' });
      }
    },
  });

  useEffect(() => {
    if (!opened) {
      reset();
      setUrl(null);
      setAttendee(null);
      setAttendanceApprove(false);
    }
  }, [opened]);

  const [serverVerifyingId, setServerVerifyingId] = useState(false);

  useEffect(() => {
    if (attendanceDisapprove) {
      setTimeout(() => {
        setAttendanceDisapprove(false);
        setUrl(null);
      }, 2000);
    }
  }, [attendanceDisapprove]);

  async function verifyUserId() {
    try {
      setServerVerifyingId(true);
      if (url) {
        const { attendeeId, email, fullName } = attendee!;
        const fileName = `${fullName}-${email}-${new Date().toISOString()}`;
        const file = new File([await base64ToBlob(url)], fileName);
        const { data } = await supabase.storage
          .from('images')
          .upload(
            `user/verify/${attendeeId}/captures/${email}-${new Date().toISOString()}.jpeg`,
            file
          );
        const {
          data: { publicUrl },
        } = supabase.storage.from('images').getPublicUrl(data?.path!);
        const { id } = modalData?.takeAttendanceData!;
        const response = await fetch(`/api/attendance/${id}`, {
          method: 'POST',
          body: JSON.stringify({
            captureImgUrl: publicUrl,
            attendeeId,
          }),
        });

        if (response.ok) {
          toast.success('Approved', {
            description: 'Student attendance verified',
          });
        } else {
          const payload: FailedServerResponsePayload = await response.json();
          toast.success(payload.title, { description: payload.message });
        }
      }
    } catch (e) {
      setAttendanceDisapprove(true);
      toast.success('Error', {
        description: 'An error occur while taking ur attendance verification',
      });
    } finally {
      setServerVerifyingId(false);
    }
  }

  if (
    !(mounted && modalData?.takeAttendanceData && type === 'take-attendance')
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
        <div className="rounded-sm overflow-hidden space-y-6 pb-8">
          {attendee ? (
            <div className="px-6 rounded-sm overflow-hidden space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-x-8">
                  <h5 className="text-sm uppercase leading-[160%] font-semibold text-neutral-700">
                    Student Name
                  </h5>
                  <p className="text-lg font-semibold  leading-[120%]">
                    {attendee.fullName}
                  </p>
                </div>
                <div className="flex items-center gap-x-8">
                  <h5 className="text-sm uppercase leading-[160%] font-semibold text-neutral-700">
                    Student Department
                  </h5>
                  <p className="text-lg font-semibold  leading-[120%]">
                    {attendee.department}
                  </p>
                </div>
                <div className="flex items-center gap-x-8">
                  <h5 className="text-sm uppercase leading-[160%] font-semibold text-neutral-700">
                    Student Level
                  </h5>
                  <p className="text-lg font-semibold  leading-[120%]">
                    {attendee.level}
                  </p>
                </div>
              </div>
              {attendanceApprove ? (
                <div className="h-[324px] flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600 fill-green-600" />
                </div>
              ) : (
                <>
                  {url ? (
                    <div
                      className={cn(
                        'relative w-[462px] h-[346px]',
                        attendanceDisapprove && 'border-rose-700 border-2'
                      )}
                    >
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
                        <Button onClick={verifyUserId} className="items-center">
                          Verify
                          <Loader2
                            className={cn(
                              'w-5 h-5 animate-spin hidden ml-2',
                              serverVerifyingId && 'block'
                            )}
                          />
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(({ email }) => {
                  const { takeAttendanceData } = modalData;
                  executeVerifyEmail({
                    email,
                    courseId: takeAttendanceData?.courseId!,
                  });
                })}
                className="px-6"
              >
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
                <div className="my-6">
                  <Button
                    variant="primary"
                    type="submit"
                    className="px-6 py-3 ml-auto rounded-none"
                  >
                    Check
                    <Loader2
                      className={cn(
                        'w-5 h-5 animate-spin hidden ml-2',
                        verifyEmailStatus === 'executing' && 'block'
                      )}
                    />
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
