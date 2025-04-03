import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { LiquidityPool } from "@shared/schema";
import { formatAddress } from "@/lib/utils";

interface PoolDetailsModalProps {
  poolAddress: string;
  onClose: () => void;
  onMigrate: () => void;
  showLoading: (message: string) => void;
  hideLoading: () => void;
}

export default function PoolDetailsModal({ 
  poolAddress, 
  onClose,
  onMigrate,
  showLoading,
  hideLoading
}: PoolDetailsModalProps) {
  const { address } = useWallet();
  const { toast } = useToast();
  
  // Fetch pool details
  const { data: pool, isLoading } = useQuery<LiquidityPool>({
    queryKey: [`/api/pools/${poolAddress}`],
    enabled: !!poolAddress,
  });
  
  // Fetch all pools for max liquidity calculation
  const { data: allPools = [] } = useQuery<LiquidityPool[]>({
    queryKey: ['/api/pools'],
  });
  
  // Calculate max liquidity for progress bar
  const maxLiquidity = Math.max(
    ...allPools.map(p => p.totalLiquidity),
    1 // Prevent division by zero
  );
  
  // Determine if current user is the pool owner
  const isOwner = pool?.owner === address;
  
  // Copy address functionality
  const copyAddress = (textToCopy: string, type: 'pool' | 'owner') => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Address Copied",
      description: `${type === 'pool' ? 'Pool' : 'Owner'} address copied to clipboard.`,
    });
  };
  
  // Add liquidity handler
  const handleAddLiquidity = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Add liquidity feature will be available in the next update.",
    });
  };

  return (
    <Dialog open={!!poolAddress} onOpenChange={onClose}>
      <DialogContent className="bg-card text-white border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pool Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg
              className="animate-spin -ml-1 mr-3 h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : pool ? (
          <>
            <div className="bg-background rounded-lg p-4 border border-border mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground text-sm">Pool Address</span>
                  <div className="flex items-center mt-1">
                    <span className="text-white text-sm font-mono">
                      {formatAddress(pool.address)}
                    </span>
                    <button
                      className="ml-2 text-muted-foreground hover:text-white transition-colors"
                      onClick={() => copyAddress(pool.address, 'pool')}
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
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Owner</span>
                  <div className="flex items-center mt-1">
                    <span className="text-white text-sm font-mono">
                      {formatAddress(pool.owner)}
                    </span>
                    <button
                      className="ml-2 text-muted-foreground hover:text-white transition-colors"
                      onClick={() => copyAddress(pool.owner, 'owner')}
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
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground text-sm">Total Liquidity</span>
                <span className="text-white font-medium">{(pool.totalLiquidity / 100).toFixed(2)} APT</span>
              </div>
              <Progress 
                value={(pool.totalLiquidity / maxLiquidity) * 100} 
                className="h-2"
              />
            </div>
            
            {isOwner && (
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleAddLiquidity}
                  className="flex items-center"
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
                  Add Liquidity
                </Button>
                <Button
                  onClick={onMigrate}
                  className="flex items-center"
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
                  Migrate
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Pool not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
