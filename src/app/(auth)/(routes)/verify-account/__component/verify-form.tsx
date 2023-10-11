'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGlobalState } from '@/hooks/use-global-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ZodString, object, string } from 'zod';
import { useEffect, useRef } from 'react';

import { ResendCode } from './resend-count';
import { useForceUpdate } from '@/hooks/use-force-update';
import { useVerifyAccountMutation } from '@/mutations/use-verify-account';
import { useRouter } from 'next/navigation';
type AuthCodeBox = { [K in `code-${number}`]: ZodString };

function generateCodeBoxDefaults<T>(length: number, fn: () => T) {
  return Object.fromEntries(
    Array.from({ length }, (_, i) => [`code-${i + 1}`, fn()])
  );
}

export const VerifyAccountForm = () => {
  const { accountVerifyTokenLength = 4 } = useGlobalState(
    ({ accountVerifyTokenLength }) => ({
      accountVerifyTokenLength,
    })
  );

  const forceUpdate = useForceUpdate();

  const inputRefs = useRef<Record<`code-${number}`, HTMLInputElement | null>>(
    {}
  );

  const formSchema = object<AuthCodeBox>(
    generateCodeBoxDefaults(accountVerifyTokenLength, () => string())
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: generateCodeBoxDefaults(accountVerifyTokenLength, () => ''),
  });

  const { mutate, isLoading, isSuccess } = useVerifyAccountMutation();
  const router = useRouter();
  const formData = form.getValues();
  const formDigitFields = Object.keys(formData).sort();
  const lastFilledDigitFieldIndex = formDigitFields.findLastIndex(
    (key) => formData[key]
  );

  const isSubmitting = isLoading || form.formState.isLoading;

  useEffect(() => {
    if (isSuccess) {
      router.push('/set-up');
    }
  }, [isSuccess]);

  return (
    <div className="w-[408px] h-[192px] ">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            mutate({
              token: Object.keys(data)
                .sort()
                .map((key) => data[key])
                .join(''),
            })
          )}
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
                        disabled={i < lastFilledDigitFieldIndex || isSubmitting}
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
                            form.setValue(`code-${i + 1}`, digit);
                          });

                          inputRefs.current[
                            digitKeyField.replace(
                              /\d+$/,
                              formDigitFields.length.toString()
                            ) as `code-${number}`
                          ]?.focus();
                          forceUpdate();
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
              disabled={isSubmitting || !form.formState.isValid}
            >
              Verify
            </Button>
          </div>
        </form>
      </Form>
      <div className="w-[274px]">
        <ResendCode />
      </div>
    </div>
  );
};
