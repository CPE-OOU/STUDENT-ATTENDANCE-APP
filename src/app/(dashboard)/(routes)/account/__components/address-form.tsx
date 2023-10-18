'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  FailedServerResponsePayload,
  SuccessServerResponsePayload,
} from '@/lib/response';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { TypeOf, object, string } from 'zod';
import { Country, State } from 'country-state-city';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { CheckIcon } from 'lucide-react';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '@/components/ui/scroll-area';
export const addressFormSchema = object({
  address: string(),
  country: string().refine(
    (value) => Country.getCountryByCode(value) !== undefined,
    { message: 'Invalid country type' }
  ),
  state: string().optional().nullable().default(null),
  city: string().optional().nullable().default(null),
});

type AddressFormData = TypeOf<typeof addressFormSchema>;

interface AddressFormEditProps {
  address?: AddressFormData;
}

const countries = Country.getAllCountries();
export const AddressFormEdit: React.FC<AddressFormEditProps> = ({
  address,
}) => {
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      address: address?.address ?? '',
      country: address?.country ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
    },
  });

  const [submittingAddress, setSubmittingAddress] = useState(false);
  const isSubmitting = form.formState.isSubmitting || submittingAddress;
  const [openCountrySelect, setOpenCountrySelect] = useState(false);
  const [openStateSelect, setOpenStateSelect] = useState(false);

  const states = State.getStatesOfCountry(form.getValues('country'));
  async function submitUserAddress(address: AddressFormData) {
    try {
      setSubmittingAddress(true);
      const {
        data: { title, message },
      } = await axios.post<SuccessServerResponsePayload<AddressFormData>>(
        '/api/profile/address',
        address
      );
      toast.success(title, { description: message });
    } catch (e) {
      if (Object(e) === e) {
        if (e instanceof AxiosError && e.response) {
          const failedMessage = e.response.data as FailedServerResponsePayload;
          toast.error(failedMessage.title, {
            description: failedMessage.message,
          });
          return;
        }
      }

      toast.error('Address not submitted', {
        description: 'Encounter an error while submitting address',
      });
    } finally {
      setSubmittingAddress(false);
    }
  }

  useEffect(() => {
    if (form.getValues('country') === address?.country) {
      form.setValue('state', address?.state ?? '');
    } else {
      form.setValue('state', '');
    }
  }, [form.watch('country')]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitUserAddress)}>
        <div className="grid grid-cols-2 gap-6 px-2">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Country</FormLabel>
                <Popover
                  open={openCountrySelect}
                  onOpenChange={setOpenCountrySelect}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value
                          ? (() => {
                              const item = countries.find(
                                ({ isoCode }) => field.value === isoCode
                              )!;
                              return (
                                <span>
                                  <span className="mr-4">{item.flag}</span>
                                  {item.name}
                                </span>
                              );
                            })()
                          : 'Select language'}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-white">
                    <Command>
                      <CommandInput
                        placeholder="Search country by name..eg Nigeria"
                        className="h-9"
                      />
                      <CommandEmpty>No country selected.</CommandEmpty>
                      <CommandGroup className="bg-white">
                        <ScrollArea className="h-72">
                          {countries.map(({ name, flag, isoCode }) => (
                            <CommandItem
                              value={name}
                              key={isoCode}
                              onSelect={() => {
                                form.setValue('country', isoCode);
                                setOpenCountrySelect(false);
                              }}
                            >
                              <span className="mr-2">{flag}</span>
                              {name}
                              <CheckIcon
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  name === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>State</FormLabel>
                <Popover
                  open={!!states?.length && openStateSelect}
                  onOpenChange={setOpenStateSelect}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? field.value : 'Select Your State'}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-white">
                    <Command>
                      <CommandInput
                        placeholder={`Search for State...e.g ${
                          states[0] ?? 'Lagos'
                        }`}
                        className="h-9"
                      />
                      <CommandEmpty>No State selected.</CommandEmpty>
                      <CommandGroup className="bg-white">
                        <ScrollArea className="h-72">
                          {states?.map(({ name }) => (
                            <CommandItem
                              value={name}
                              key={name}
                              onSelect={() => {
                                form.setValue('state', name);
                                setOpenStateSelect(false);
                              }}
                            >
                              {name}
                              <CheckIcon
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  name === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="inline-block">
                <FormLabel className="mb-4">City</FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    className="bg-[#F7F7F7] rounded-[8px] 
                    h-[56px] pl-[24px] py-[20px] text-[14px] font-normal
                    "
                    placeholder="Enter your firstName"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="inline-block">
                <FormLabel className="mb-4">Address</FormLabel>
                <FormControl>
                  <Input
                    className="bg-[#F7F7F7] rounded-[8px] 
                   h-[56px] pl-[24px] py-[20px] text-[14px] font-normal  
                   "
                    disabled={isSubmitting}
                    placeholder="Enter your lastName"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-center mt-8">
          <Button
            variant="primary"
            className="w-52"
            type="submit"
            disabled={submittingAddress}
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};
