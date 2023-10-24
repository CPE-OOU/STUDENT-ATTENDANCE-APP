import { Button } from '@/components/ui/button';
import { useGlobalState } from '@/hooks/use-global-state';
import { cn } from '@/lib/utils';
import { VerifyAccountSearchParams } from '@/lib/validations/params';
import { useResendAuthToken } from '@/queries/use-resend-auth';
import { useEffect } from 'react';

import { useTimer } from 'react-timer-hook';
import { toast } from 'sonner';

interface ResendCodeProps {
  retryAfter?: Date | string | undefined;
  stopTimer?: boolean;
  type: VerifyAccountSearchParams['type'];
}

export function ResendCode({
  stopTimer = false,
  retryAfter,
  type,
}: ResendCodeProps) {
  const { setAccountVerifyTokenLength } = useGlobalState(
    ({ setAccountVerifyTokenLength }) => ({
      setAccountVerifyTokenLength,
    })
  );

  const { isLoading, mutateAsync } = useResendAuthToken();
  const now = new Date();
  const expiresTime = retryAfter ? new Date(retryAfter) : now;

  const { minutes, seconds, isRunning, restart } = useTimer({
    expiryTimestamp: retryAfter ? new Date(retryAfter) : now,
    autoStart: stopTimer !== true || (expiresTime === now && false),
  });

  useEffect(() => {
    if (!retryAfter) return;
    restart(new Date(retryAfter), stopTimer);
  }, [retryAfter, stopTimer]);
  return (
    <p className="font-normal text-transparent text-[16px] tracking-[0] leading-[24px] whitespace-nowrap">
      <span className="font-medium text-[#3f3f44]">Didn't receive code? </span>
      <Button
        variant="ghost"
        disabled={isRunning || isLoading}
        className={cn(
          'font-semibold text-[#fdcb9e] underline',
          isRunning && 'disabled:opacity-70'
        )}
        onClick={async (event) => {
          event.preventDefault();
          if (isRunning) return;

          const { formFieldLength, retryAfter } = await mutateAsync({
            type,
          });

          toast.success('Token resend', {
            description: 'A new token as being forwarded to your email',
          });
          setAccountVerifyTokenLength(formFieldLength);
          restart(new Date(retryAfter));
        }}
      >
        Resend now
      </Button>
      <span
        className={cn('font-medium text-slate-400', !isRunning && 'hidden')}
      >
        {`${minutes}:${seconds.toString().padStart(2, '0')}`}
      </span>
    </p>
  );
}
