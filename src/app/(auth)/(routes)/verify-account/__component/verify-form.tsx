'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGlobalState } from '@/hooks/use-global-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ZodString, object, string } from 'zod';
import { addMinutes, addSeconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMemo, useRef } from 'react';

import { useTimer } from 'react-timer-hook';
type AuthCodeBox = { [K in `code-${number}`]: ZodString };

function generateCodeBoxDefaults<T>(length: number, fn: () => T) {
  return Object.fromEntries(
    Array.from({ length }, (_, i) => [`code-${i + 1}`, fn()])
  );
}

export const VerifyAccountForm = () => {
  const {
    accountVerifyTokenLength = 4,
    tokenResendTrialTime: {
      type: tokenResendTimeType,
      value: tokenResendTimeValue,
    } = { type: 'm', value: 2 },
  } = useGlobalState(({ accountVerifyTokenLength, tokenResendTrialTime }) => ({
    accountVerifyTokenLength,
    tokenResendTrialTime,
  }));

  const inputRefs = useRef<Record<`code-${number}`, HTMLInputElement | null>>(
    {}
  );

  const formSchema = object<AuthCodeBox>(
    generateCodeBoxDefaults(accountVerifyTokenLength, () => string())
  );

  const startCount = useMemo(() => new Date(), []);
  const endRetryCode =
    tokenResendTimeType === 's'
      ? addSeconds(startCount, tokenResendTimeValue)
      : addMinutes(startCount, tokenResendTimeValue);

  const { minutes, seconds, isRunning, restart } = useTimer({
    expiryTimestamp: endRetryCode,
    autoStart: true,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: generateCodeBoxDefaults(accountVerifyTokenLength, () => ''),
  });

  const formData = form.getValues();
  const formDigitFields = Object.keys(formData).sort();
  const lastFilledDigitFieldIndex = formDigitFields.findLastIndex(
    (key) => formData[key]
  );

  return (
    <div className="w-[408px] h-[192px] ">
      <Form {...form}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="flex gap-x-8 justify-between mb-8">
            {Array.from(formDigitFields, (digitKeyField, i) => (
              <FormField
                name={digitKeyField}
                key={digitKeyField}
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-[56px] h-[56px] bg-[#f7f7f7] rounded-[8px]">
                    <FormControl
                      className="font-normal text-[#3f3f444c] text-[24px] 
                    tracking-[0] leading-[normal] whitespace-nowrap
                   "
                    >
                      <Input
                        className="w-full h-full text-center"
                        disabled={i < lastFilledDigitFieldIndex}
                        {...field}
                        ref={(el) => {
                          inputRefs.current[digitKeyField as `code-${number}`] =
                            el;
                        }}
                        contentEditable
                        onPaste={(event) => {
                          event.preventDefault();
                          if (i !== 0) return;
                          const content = event.clipboardData.getData('text');
                          const otpPattern = new RegExp(
                            String.raw`^(\d{${accountVerifyTokenLength}})\r?\n?$`
                          );

                          const [, otpMatch] = content.match(otpPattern) ?? [];
                          if (!otpMatch) return;

                          otpMatch.split(/\B/).forEach((digit, i) => {
                            console.log({ digit: i + 1 });
                            form.setValue(`code-${i + 1}`, digit);
                          });

                          (event.target as HTMLInputElement).blur();
                        }}
                        onKeyUp={(event) => {
                          event.stopPropagation();

                          const key = event.key.toLowerCase();

                          switch (key) {
                            case 'backspace': {
                              if (
                                field.value &&
                                lastFilledDigitFieldIndex === i
                              ) {
                                field.onChange('');
                              }

                              inputRefs.current[
                                digitKeyField.replace(/\d+$/, (digit) =>
                                  (Number(digit) - 1).toString()
                                ) as `code-${number}`
                              ]?.focus();

                              break;
                            }

                            case 'enter': {
                              inputRefs.current[
                                digitKeyField.replace(/\d+$/, (digit) =>
                                  (Number(digit) + 1).toString()
                                ) as `code-${number}`
                              ]?.focus();
                            }
                          }
                        }}
                        onChange={(event) => {
                          if (
                            (i > 0 && !form.getValues()[`code-${i}`]) ||
                            !event.target.value
                          ) {
                            return;
                          }

                          field.onChange(event);
                          inputRefs.current[
                            digitKeyField.replace(/\d+$/, (digit) =>
                              (Number(digit) + 1).toString()
                            ) as `code-${number}`
                          ]?.focus();
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className="flex flex-col gap-y-6">
            <Button
              variant="primary"
              className="w-full h-[56px] bg-[#fdcb9e] rounded-[8px] font-semibold text-[#3f3f44] 
                      text-[16px] text-center tracking-[0] leading-[normal] whitespace-nowrap"
            >
              Verify
            </Button>
            <div className="w-[274px]">
              <p className="font-normal text-transparent text-[16px] tracking-[0] leading-[24px] whitespace-nowrap">
                <span className="font-medium text-[#3f3f44]">
                  Didn't receive code?{' '}
                </span>
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
                  className={cn(
                    'font-medium text-slate-400',
                    !isRunning && 'opacity-0'
                  )}
                >
                  {`${minutes}:${seconds.toString().padStart(2, '0')}`}
                </span>
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
