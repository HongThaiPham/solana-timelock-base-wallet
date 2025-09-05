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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import Image from 'next/image';
import { useAccount } from '@getpara/react-sdk';
import { ConnectButton } from '../connect-button';
import useUserTokens from '@/hooks/useUserTokens';

// Form validation schema
const lockSplSchema = z
  .object({
    tokenMint: z.string().min(1, 'Please select a token'),
    amount: z
      .number()
      .min(0.000001, 'Amount must be greater than 0')
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

type LockSplFormData = z.infer<typeof lockSplSchema>;

const LockSplTab = () => {
  const { isConnected } = useAccount();
  const { data: userTokens, isLoading: isLoadingTokens } = useUserTokens();
  // TODO: Add your SPL lock hook here
  // const { mutateAsync, isPending } = useInitSplLock();

  const form = useForm<LockSplFormData>({
    resolver: zodResolver(lockSplSchema),
    defaultValues: {
      tokenMint: '',
      date: new Date(), // Default to today's date
      time: (() => {
        // Default to current time + 5 minutes to ensure it's in the future
        const futureTime = new Date(Date.now() + 5 * 60 * 1000);
        return futureTime.toLocaleTimeString('en-GB', {
          hour12: false,
        });
      })(),
    },
    mode: 'onChange', // Validate on change to provide immediate feedback
  });

  const selectedTokenMint = form.watch('tokenMint');
  const selectedToken = userTokens?.find(
    (token) => token.mint === selectedTokenMint
  );

  const onSubmit = async (data: LockSplFormData) => {
    if (!selectedToken) return;

    // convert datetime to timestamp and handle SPL locking logic
    const unlockTimestamp = new Date(data.date);
    const [hours, minutes, seconds] = data.time.split(':').map(Number);
    unlockTimestamp.setHours(hours, minutes, seconds, 0);

    const params = {
      tokenMint: data.tokenMint,
      amount: BigInt(data.amount * Math.pow(10, selectedToken.decimals)), // Convert to token's smallest unit
      unlockTime: BigInt(Math.floor(unlockTimestamp.getTime() / 1000)), // Unix timestamp in seconds
    };

    console.log('SPL Lock params:', params);
    // TODO: Implement SPL lock logic
    // await mutateAsync(params);
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
        <CardTitle>Lock SPL Token</CardTitle>
        <CardDescription>
          Deposit SPL tokens into a secure time-locked account.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <CardContent className='space-y-6'>
            {/* Token Selection Section */}
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='tokenMint'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-base font-semibold'>
                      Select Token
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoadingTokens}
                      >
                        <SelectTrigger className='h-12'>
                          <SelectValue
                            placeholder={
                              isLoadingTokens
                                ? 'Loading tokens...'
                                : 'Select a token from your wallet'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {userTokens?.map((token) => (
                            <SelectItem key={token.mint} value={token.mint}>
                              <div className='flex items-center gap-3'>
                                {token.logoURI ? (
                                  <Image
                                    src={token.logoURI}
                                    alt={token.symbol || 'Token'}
                                    className='size-5 rounded-full'
                                    width={20}
                                    height={20}
                                  />
                                ) : (
                                  <div className='size-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-xs font-semibold text-white'>
                                    {token.symbol?.charAt(0) || 'T'}
                                  </div>
                                )}
                                <div className='flex flex-col'>
                                  <span className='font-medium'>
                                    {token.symbol}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    Balance: {token.uiAmount.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                          {userTokens?.length === 0 && (
                            <SelectItem value='no-tokens' disabled>
                              No tokens found in your wallet
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className='text-sm'>
                      {userTokens?.length === 0
                        ? 'You need some SPL tokens in your wallet to create a lock.'
                        : `Found ${userTokens?.length || 0} token(s) in your wallet`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                          {selectedToken ? (
                            selectedToken.logoURI ? (
                              <Image
                                src={selectedToken.logoURI}
                                alt={selectedToken.symbol || 'Token'}
                                className='size-5 mr-3 flex-shrink-0 rounded-full'
                                width={20}
                                height={20}
                              />
                            ) : (
                              <div className='size-5 mr-3 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-xs font-semibold text-white'>
                                {selectedToken.symbol?.charAt(0) || 'T'}
                              </div>
                            )
                          ) : (
                            <div className='size-5 mr-3 flex-shrink-0 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600'>
                              ?
                            </div>
                          )}
                          <Input
                            type='number'
                            placeholder='Enter amount'
                            min='0.000001'
                            step='any'
                            className='border-none shadow-none p-0 text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0'
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            disabled={!selectedToken}
                          />
                          <span className='ml-2 text-sm font-medium text-muted-foreground'>
                            {selectedToken?.symbol || 'TOKEN'}
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className='text-sm'>
                      {selectedToken
                        ? `Available balance: ${selectedToken.uiAmount.toLocaleString()} ${selectedToken.symbol}`
                        : 'Select a token first'}
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
                      Your {selectedToken?.symbol || 'tokens'} will be locked
                      until:{' '}
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
                    'Your tokens will be locked until the specified date and time'
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
                disabled={!form.formState.isValid || !selectedToken}
                // disabled={!form.formState.isValid || isPending}
              >
                {/* {isPending ? (
                  <>
                    <Loader2 className='animate-spin' />
                    <span className='ml-2'>Creating SPL Lock...</span>
                  </>
                ) : ( */}
                🔒 Create SPL Token Lock
                {/* )} */}
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

export default LockSplTab;
