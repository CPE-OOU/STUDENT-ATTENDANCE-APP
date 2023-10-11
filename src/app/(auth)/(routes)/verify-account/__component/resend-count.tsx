import { Button } from '@/components/ui/button';
import { useGlobalState } from '@/hooks/use-global-state';
import { cn } from '@/lib/utils';
import { useResendAuthToken } from '@/queries/use-resend-auth';
import { addMinutes, addSeconds } from 'date-fns';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useTimer } from 'react-timer-hook';
import { toast } from 'sonner';

export function ResendCode() {
  const {
    setAccountVerifyTokenLength,
    tokenResendTrialTime: {
      type: tokenResendTimeType,
      value: tokenResendTimeValue,
    } = { type: 'm', value: 0 },
  } = useGlobalState(
    ({ tokenResendTrialTime, setAccountVerifyTokenLength }) => ({
      tokenResendTrialTime,
      setAccountVerifyTokenLength,
    })
  );

  const { mode, type = 'account-verify' } = usePathname() as {
    mode?: 'request';
    type?: 'account-verify' | 'reset-password';
  };

  const startCount = useMemo(() => new Date(), []);
  const endRetryCode =
    tokenResendTimeType === 's'
      ? addSeconds(startCount, tokenResendTimeValue)
      : addMinutes(startCount, tokenResendTimeValue);

  const { isLoading, mutateAsync } = useResendAuthToken();
  const router = useRouter();
  const { minutes, seconds, isRunning, restart } = useTimer({
    expiryTimestamp: endRetryCode,
    autoStart: mode !== 'request',
  });

  useEffect(() => {
    if (mode === 'request') {
      mutateAsync({ type })
        .then(({ formFieldLength, retryAfter }) => {
          setAccountVerifyTokenLength(formFieldLength);
          restart(new Date(retryAfter));
          const url = new URL(window.location.href);
          url.searchParams.delete('mode');
          router.replace(url.toString());
        })
        .catch(() => {
          toast.error('Sorry an error occur while requesting OTP');
          setTimeout(() => {
            router.refresh();
          }, 2000);
        });
    }
  }, []);

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
            type: 'account-verify',
          });
          setAccountVerifyTokenLength(formFieldLength);
          restart(new Date(retryAfter));
        }}
      >
        Resend now
      </Button>
      <span
        className={cn('font-medium text-slate-400', !isRunning && 'opacity-0')}
      >
        {`${minutes}:${seconds.toString().padStart(2, '0')}`}
      </span>
    </p>
  );
}
