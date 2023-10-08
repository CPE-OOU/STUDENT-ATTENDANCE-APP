import { Button } from '@/components/ui/button';
import { useGlobalState } from '@/hooks/use-global-state';
import { cn } from '@/lib/utils';
import { addMinutes, addSeconds } from 'date-fns';
import { useMemo } from 'react';
import { useTimer } from 'react-timer-hook';

export function ResendCode() {
  const {
    tokenResendTrialTime: {
      type: tokenResendTimeType,
      value: tokenResendTimeValue,
    } = { type: 'm', value: 2 },
  } = useGlobalState(({ tokenResendTrialTime }) => ({
    tokenResendTrialTime,
  }));

  const startCount = useMemo(() => new Date(), []);
  const endRetryCode =
    tokenResendTimeType === 's'
      ? addSeconds(startCount, tokenResendTimeValue)
      : addMinutes(startCount, tokenResendTimeValue);

  const { minutes, seconds, isRunning, restart } = useTimer({
    expiryTimestamp: endRetryCode,
    autoStart: true,
  });

  return (
    <p className="font-normal text-transparent text-[16px] tracking-[0] leading-[24px] whitespace-nowrap">
      <span className="font-medium text-[#3f3f44]">Didn't receive code? </span>
      <Button
        variant="ghost"
        disabled={isRunning}
        className={cn(
          'font-semibold text-[#fdcb9e] underline',
          isRunning && 'disabled:opacity-70'
        )}
        onClick={async () => {
          if (isRunning) return;
          restart(addMinutes(new Date(), 2));
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
