'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDownIcon, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import Image from 'next/image';
import { useAccount } from '@getpara/react-sdk';
import { ConnectButton } from '../connect-button';
import useInitSolLock from '@/hooks/useInitSolLock';

// Form validation schema
const lockSolSchema = z
  .object({
    amount: z
      .number()
      .min(0.001, 'Minimum amount is 0.001 SOL')
      .positive('Amount must be positive'),
    date: z.date(),
    time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
      message: 'Time must be in HH:MM:SS format',
    }),
  })
  .refine(
    (data) => {
      // Combine date and time to create full datetime
      const selectedDate = new Date(data.date);
      const [hours, minutes, seconds] = data.time.split(':').map(Number);
      selectedDate.setHours(hours, minutes, seconds, 0);

      // Convert to unix timestamp and compare with current time
      const selectedTimestamp = Math.floor(selectedDate.getTime() / 1000);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      return selectedTimestamp > currentTimestamp;
    },
    {
      message: 'The selected date and time must be in the future',
      path: ['date'], // Show error on date field
    }
  );

type LockSolFormData = z.infer<typeof lockSolSchema>;

const LockSolTab = () => {
  const { isConnected } = useAccount();
  const { mutateAsync, isPending } = useInitSolLock();

  const form = useForm<LockSolFormData>({
    resolver: zodResolver(lockSolSchema),
    defaultValues: {
      amount: 0.001,
      date: new Date(), // Default to today's date
      time: (() => {
        // Default to current time + 5 minutes to ensure it's in the future
        const futureTime = new Date(Date.now() + 5 * 60 * 1000);
        return futureTime.toLocaleTimeString('en-GB', {
          hour12: false,
        });
      })(),
    },
    mode: 'onBlur', // Validate on change to provide immediate feedback
  });

  const onSubmit = async (data: LockSolFormData) => {
    // convert datetime to timestamp and handle SOL locking logic
    const unlockTimestamp = new Date(data.date);
    const [hours, minutes, seconds] = data.time.split(':').map(Number);
    unlockTimestamp.setHours(hours, minutes, seconds, 0);

    const params = {
      amount: BigInt(data.amount * 1e9), // Convert SOL to lamports
      unlockTime: BigInt(Math.floor(unlockTimestamp.getTime() / 1000)), // Unix timestamp in seconds
    };

    await mutateAsync(params);
  };

  // Helper function to get the combined datetime for display
  const getUnlockDateTime = () => {
    const date = form.watch('date');
    const time = form.watch('time');

    if (!date || !time) return null;

    const unlockDateTime = new Date(date);
    const [hours, minutes, seconds] = time.split(':').map(Number);
    unlockDateTime.setHours(hours, minutes, seconds, 0);

    return unlockDateTime;
  };

  const unlockDateTime = getUnlockDateTime();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lock SOL</CardTitle>
        <CardDescription>
          Deposit SOL into a secure time-locked account.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <CardContent className='space-y-6'>
            {/* Amount Section */}
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-base font-semibold'>
                      Amount
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <div className='flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-ring'>
                          <Image
                            src='/sol.svg'
                            alt='SOL'
                            className='size-5 mr-3 flex-shrink-0'
                            width={20}
                            height={20}
                          />
                          <Input
                            type='number'
                            placeholder='Enter amount'
                            min='0.001'
                            step='0.001'
                            className='border-none shadow-none p-0 text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0'
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                          <span className='ml-2 text-sm font-medium text-muted-foreground'>
                            SOL
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className='text-sm'>
                      Minimum amount: 0.001 SOL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Time Section */}
            <div className='space-y-4'>
              <div className='border-t pt-4'>
                <h3 className='text-base font-semibold mb-4'>
                  Unlock Schedule
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant='outline'
                                className='w-full justify-between font-normal h-10'
                              >
                                {field.value
                                  ? field.value.toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'Select date'}
                                <ChevronDownIcon className='size-4' />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-auto overflow-hidden p-0'
                              align='start'
                            >
                              <Calendar
                                mode='single'
                                selected={field.value}
                                captionLayout='dropdown'
                                onSelect={(date) => {
                                  field.onChange(date);
                                }}
                                disabled={(date) => {
                                  // Disable dates before today
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date < today;
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='time'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input
                            type='time'
                            step='1'
                            className='h-10'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormDescription className='text-sm mt-2'>
                  {unlockDateTime ? (
                    <span>
                      Your SOL will be locked until:{' '}
                      <strong className='text-foreground'>
                        {unlockDateTime.toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </strong>{' '}
                      (Unix: {Math.floor(unlockDateTime.getTime() / 1000)})
                    </span>
                  ) : (
                    'Your SOL will be locked until the specified date and time'
                  )}
                </FormDescription>
              </div>
            </div>
          </CardContent>
          <CardFooter className='pt-6'>
            {isConnected ? (
              <Button
                type='submit'
                className='w-full h-12 text-base font-semibold'
                disabled={!form.formState.isValid || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className='animate-spin' />
                    <span className='ml-2'>Creating SOL Lock...</span>
                  </>
                ) : (
                  '🔒 Create SOL Lock'
                )}
              </Button>
            ) : (
              <ConnectButton
                className='w-full h-12 text-base'
                label='Connect Wallet to Continue'
              />
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default LockSolTab;
