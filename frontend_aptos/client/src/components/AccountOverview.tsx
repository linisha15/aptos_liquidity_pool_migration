import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { Tooltip } from "@/components/ui/tooltip";
import { formatAddress } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountOverview() {
  const { address, balance } = useWallet();
  const { toast } = useToast();

  // Fetch user's pools to count them and calculate total liquidity
  const { data: userPools = [] } = useQuery({
    queryKey: [`/api/pools/owner/${address}`],
    enabled: !!address,
  });

  // Calculate total liquidity across all user pools
  const totalLiquidity = userPools.reduce((sum, pool) => sum + pool.totalLiquidity, 0);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Account Overview</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage your liquidity pools and migrations</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-muted-foreground text-sm">Connected Address:</span>
            <div className="flex items-center mt-1">
              <span className="font-mono text-white bg-background py-1 px-2 rounded text-sm">
                {formatAddress(address || '')}
              </span>
              <button 
                className="ml-2 text-muted-foreground hover:text-white transition-colors"
                onClick={copyAddress}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Available Balance</span>
              <Tooltip content="Your available APT coin balance that can be used for pool creation or migration.">
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
                  className="text-muted-foreground"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </Tooltip>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 38 35"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.1707 14.4001H23.8294L19.0001 6.7334L14.1707 14.4001ZM23.8294 20.6001H14.1707L19.0001 28.2667L23.8294 20.6001Z"
                    fill="#8B5CF6"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold">{balance.toFixed(2)} APT</span>
            </div>
          </div>
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Your Pools</span>
              <Tooltip content="Number of liquidity pools you own.">
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
                  className="text-muted-foreground"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </Tooltip>
            </div>
            <div className="flex items-center">
              <div className="text-primary w-6 h-6 mr-2 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12V8c0-1.1-.9-2-2-2h-4"></path>
                  <path d="M18 12V6c0-1.1-.9-2-2-2h-4"></path>
                  <path d="M14 12V4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4"></path>
                </svg>
              </div>
              <span className="text-xl font-semibold">{userPools.length}</span>
            </div>
          </div>
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Total Liquidity</span>
              <Tooltip content="Sum of all liquidity in your pools.">
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
                  className="text-muted-foreground"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </Tooltip>
            </div>
            <div className="flex items-center">
              <div className="text-primary w-6 h-6 mr-2 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="8" r="6"></circle>
                  <circle cx="16" cy="16" r="6"></circle>
                </svg>
              </div>
              <span className="text-xl font-semibold">{totalLiquidity.toFixed(2)} APT</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
