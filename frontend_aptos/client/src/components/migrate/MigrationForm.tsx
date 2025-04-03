import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { apiRequest } from "@/lib/queryClient";
import { migrateLiquidity } from "@/lib/aptos";
import { formatAddress } from "@/lib/utils";
import { LiquidityPool } from "@shared/schema";
import PoolParty, { triggerPoolParty } from "../pools/PoolParty";

interface MigrationFormProps {
  showLoading: (message: string) => void;
  hideLoading: () => void;
}

const formSchema = z.object({
  fromPool: z.string().min(1, "Source pool is required"),
  toPool: z.string().min(1, "Destination pool is required"),
  amount: z.coerce.number()
    .positive("Amount must be greater than 0")
    .min(0.01, "Minimum amount is 0.01 APT"),
}).refine(data => data.fromPool !== data.toPool, {
  message: "Source and destination pools must be different",
  path: ["toPool"],
});

type FormValues = z.infer<typeof formSchema>;

export default function MigrationForm({ 
  showLoading,
  hideLoading
}: MigrationFormProps) {
  const { address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [availableToMigrate, setAvailableToMigrate] = useState(0);
  const [poolPartyTrigger, setPoolPartyTrigger] = useState(false);

  // Fetch user's pools
  const { data: userPools = [] } = useQuery<LiquidityPool[]>({
    queryKey: [`/api/pools/owner/${address}`],
    enabled: !!address,
  });

  // Fetch all pools
  const { data: allPools = [] } = useQuery<LiquidityPool[]>({
    queryKey: ['/api/pools'],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromPool: "",
      toPool: "",
      amount: 0,
    },
  });

  // Watch form values to update summary
  const fromPool = form.watch("fromPool");
  const toPool = form.watch("toPool");
  const amount = form.watch("amount");

  // Update available amount when source pool changes
  useEffect(() => {
    if (fromPool) {
      const pool = userPools.find(p => p.address === fromPool);
      if (pool) {
        setAvailableToMigrate(pool.totalLiquidity / 100); // Convert from cents to APT
      }
    } else {
      setAvailableToMigrate(0);
    }
  }, [fromPool, userPools]);

  // Find selected pools
  const selectedFromPool = userPools.find(p => p.address === fromPool);
  const selectedToPool = allPools.find(p => p.address === toPool);

  // Migration mutation
  const migrate = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!address || !selectedFromPool || !selectedToPool) 
        throw new Error("Missing required data");
      
      showLoading("Migrating Liquidity");
      
      try {
        // Convert APT to cents for backend storage
        const amountInCents = Math.floor(data.amount * 100);
        
        // Call Aptos blockchain to migrate liquidity
        await migrateLiquidity(
          selectedFromPool.address,
          selectedToPool.address,
          data.amount
        );
        
        // Create transaction record in our backend
        await apiRequest('POST', '/api/transactions', {
          type: 'migrate_liquidity',
          fromAddress: selectedFromPool.address,
          toAddress: selectedToPool.address,
          amount: amountInCents,
          status: 'completed',
        });
        
        return { success: true };
      } catch (error) {
        console.error("Failed to migrate liquidity:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pools'] });
      queryClient.invalidateQueries({ queryKey: [`/api/pools/owner/${address}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      // Trigger Pool Party animation
      triggerPoolParty(setPoolPartyTrigger, "pulse", `Pool Party! ${amount} APT Successfully Migrated! 🎉`);
      
      toast({
        title: "Liquidity Migrated",
        description: `${amount} APT has been successfully migrated between pools.`,
      });
      
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to migrate liquidity: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      hideLoading();
    }
  });

  const onSubmit = (data: FormValues) => {
    if (data.amount > availableToMigrate) {
      toast({
        title: "Insufficient Liquidity",
        description: "You don't have enough liquidity in the source pool.",
        variant: "destructive",
      });
      return;
    }
    
    migrate.mutate(data);
  };

  return (
    <div>
      <PoolParty 
        trigger={poolPartyTrigger} 
        type="pulse" 
        message={`Pool Party! ${amount} APT Successfully Migrated! 🎉`}
        duration={5000}
      />
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Migrate Liquidity</h2>
        <p className="text-muted-foreground">Transfer liquidity from one pool to another</p>
      </div>

      <Card className="bg-card rounded-xl shadow-lg">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fromPool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Source Pool
                        <Tooltip content="Select the pool you want to migrate liquidity from.">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-1 text-muted-foreground"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </Tooltip>
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source pool" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userPools.length === 0 ? (
                            <SelectItem value="no-pools" disabled>
                              No pools available
                            </SelectItem>
                          ) : (
                            userPools.map((pool) => (
                              <SelectItem key={pool.address} value={pool.address}>
                                {formatAddress(pool.address)} ({(pool.totalLiquidity / 100).toFixed(2)} APT)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toPool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Destination Pool
                        <Tooltip content="Select the pool you want to migrate liquidity to.">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-1 text-muted-foreground"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </Tooltip>
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination pool" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allPools.length === 0 ? (
                            <SelectItem value="no-pools" disabled>
                              No pools available
                            </SelectItem>
                          ) : (
                            allPools
                              .filter(pool => pool.address !== fromPool) // Filter out the from pool
                              .map((pool) => (
                                <SelectItem key={pool.address} value={pool.address}>
                                  {formatAddress(pool.address)} ({(pool.totalLiquidity / 100).toFixed(2)} APT)
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Available to Migrate</FormLabel>
                  <div className="bg-background border border-border rounded-lg py-2 px-3 text-white">
                    <span>{availableToMigrate.toFixed(2)} APT</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Amount to Migrate
                        <Tooltip content="Enter the amount of liquidity you want to migrate.">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-1 text-muted-foreground"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            {...field}
                            className="pr-16"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-muted-foreground">APT</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6 bg-background rounded-lg p-4 border border-border">
                <h4 className="text-sm font-medium text-white mb-2">Migration Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">From</span>
                    <span className="text-white text-sm font-mono">
                      {selectedFromPool ? formatAddress(selectedFromPool.address) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">To</span>
                    <span className="text-white text-sm font-mono">
                      {selectedToPool ? formatAddress(selectedToPool.address) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Amount</span>
                    <span className="text-white text-sm">
                      {amount ? `${amount.toFixed(2)} APT` : '0.00 APT'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  className="flex items-center"
                  disabled={migrate.isPending || !fromPool || !toPool || !amount}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M3 12h18"></path>
                    <path d="M3 18h18"></path>
                  </svg>
                  Migrate Liquidity
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
