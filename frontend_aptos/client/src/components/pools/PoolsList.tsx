import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/use-wallet";
import { LiquidityPool } from "@shared/schema";
import { formatAddress } from "@/lib/utils";

interface PoolsListProps {
  onCreatePool: () => void;
  onViewPool: (poolAddress: string) => void;
  showLoading: (message: string) => void;
  hideLoading: () => void;
}

export default function PoolsList({ 
  onCreatePool, 
  onViewPool,
  showLoading,
  hideLoading 
}: PoolsListProps) {
  const { address } = useWallet();
  
  // Fetch all pools
  const { data: allPools = [] } = useQuery<LiquidityPool[]>({
    queryKey: ['/api/pools'],
  });
  
  // Fetch user's pools
  const { data: userPools = [], isLoading } = useQuery<LiquidityPool[]>({
    queryKey: [`/api/pools/owner/${address}`],
    enabled: !!address,
  });

  // Get max liquidity for progress bar calculation
  const maxLiquidity = Math.max(
    ...allPools.map(pool => pool.totalLiquidity),
    1 // Prevent division by zero
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Your Liquidity Pools</h2>
        <Button 
          onClick={onCreatePool}
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
          Create New Pool
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="bg-card rounded-xl shadow-lg border border-border">
              <CardContent className="p-6">
                <div className="h-[150px] flex items-center justify-center">
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
              </CardContent>
            </Card>
          ))
        ) : userPools.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-card rounded-xl p-8 shadow-lg border border-border text-center">
              <div className="mx-auto w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="M22 12V8c0-1.1-.9-2-2-2h-4"></path>
                  <path d="M18 12V6c0-1.1-.9-2-2-2h-4"></path>
                  <path d="M14 12V4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Liquidity Pools Found</h3>
              <p className="text-muted-foreground mb-6">You haven't created any liquidity pools yet.</p>
              <Button onClick={onCreatePool}>
                Create Your First Pool
              </Button>
            </Card>
          </div>
        ) : (
          userPools.map((pool) => (
            <Card 
              key={pool.address} 
              className="bg-card rounded-xl shadow-lg border border-border hover:border-primary transition-colors duration-200"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Pool</h3>
                    <p className="text-muted-foreground text-sm mt-1 font-mono">
                      {formatAddress(pool.address)}
                    </p>
                  </div>
                  <div className="bg-background py-1 px-3 rounded-full">
                    <span className="text-xs font-medium text-primary">Owner</span>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground text-sm">Total Liquidity</span>
                    <span className="text-white font-medium">{pool.totalLiquidity.toFixed(2)} APT</span>
                  </div>
                  <Progress 
                    value={(pool.totalLiquidity / maxLiquidity) * 100} 
                    className="h-2 mt-2"
                  />
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => onViewPool(pool.address)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
