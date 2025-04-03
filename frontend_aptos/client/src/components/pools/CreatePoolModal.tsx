import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { apiRequest } from "@/lib/queryClient";
import { createLiquidityPool } from "@/lib/aptos";
import { formatAddress } from "@/lib/utils";
import PoolParty, { triggerPoolParty } from "./PoolParty";

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  showLoading: (message: string) => void;
  hideLoading: () => void;
}

const formSchema = z.object({
  initialLiquidity: z.coerce.number()
    .positive("Initial liquidity must be greater than 0")
    .min(0.01, "Minimum initial liquidity is 0.01 APT"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePoolModal({ 
  isOpen, 
  onClose,
  showLoading,
  hideLoading
}: CreatePoolModalProps) {
  const { address, balance } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [poolPartyTrigger, setPoolPartyTrigger] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialLiquidity: 0,
    },
  });

  // Create pool mutation
  const createPool = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!address) throw new Error("Wallet not connected");
      
      showLoading("Creating Liquidity Pool");
      
      try {
        // Call the Aptos blockchain to create pool
        const { poolAddress } = await createLiquidityPool(data.initialLiquidity);
        
        // Create the pool in our backend
        const response = await apiRequest('POST', '/api/pools', {
          address: poolAddress,
          owner: address,
          totalLiquidity: Math.floor(data.initialLiquidity * 100), // Store as integer (cents)
        });
        
        // Create transaction record
        await apiRequest('POST', '/api/transactions', {
          type: 'create_pool',
          fromAddress: address,
          toAddress: poolAddress,
          amount: Math.floor(data.initialLiquidity * 100), // Store as integer (cents)
          status: 'completed',
        });
        
        return await response.json();
      } catch (error) {
        console.error("Failed to create pool:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pools'] });
      queryClient.invalidateQueries({ queryKey: [`/api/pools/owner/${address}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      // Trigger the Pool Party animation
      triggerPoolParty(setPoolPartyTrigger, "confetti", "Pool Party! New Pool Created! 🎉");
      
      toast({
        title: "Pool Created",
        description: "Your new liquidity pool has been created successfully.",
      });
      
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create pool: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      hideLoading();
    }
  });

  const onSubmit = (data: FormValues) => {
    if (data.initialLiquidity > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough APT to create this pool.",
        variant: "destructive",
      });
      return;
    }
    
    createPool.mutate(data);
  };

  return (
    <div>
      <PoolParty 
        trigger={poolPartyTrigger} 
        type="confetti" 
        message="Pool Party! New Pool Created! 🎉"
        duration={5000}
      />
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card text-white border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Liquidity Pool</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new liquidity pool with initial APT amount.
            </DialogDescription>
          </DialogHeader>
        
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="initialLiquidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Liquidity Amount</FormLabel>
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
              
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground text-sm">Available Balance</span>
                  <span className="text-white text-sm">{balance.toFixed(2)} APT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Pool Owner</span>
                  <span className="text-white text-sm font-mono">{formatAddress(address || '')}</span>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex items-center"
                  disabled={createPool.isPending}
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
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Create Pool
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
