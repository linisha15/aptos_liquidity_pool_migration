import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { Transaction } from "@shared/schema";
import { formatAddress } from "@/lib/utils";

export default function TransactionHistory() {
  const { address } = useWallet();
  
  // Fetch transaction history
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/${address}`],
    enabled: !!address,
  });

  // Helper function to render transaction type icons
  const getTransactionTypeInfo = (type: string) => {
    switch (type) {
      case 'create_pool':
        return {
          icon: (
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          ),
          label: 'Create Pool'
        };
      case 'migrate_liquidity':
        return {
          icon: (
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
              <path d="M3 6h18"></path>
              <path d="M3 12h18"></path>
              <path d="M3 18h18"></path>
            </svg>
          ),
          label: 'Migrate'
        };
      case 'add_liquidity':
        return {
          icon: (
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          ),
          label: 'Add Liquidity'
        };
      default:
        return {
          icon: (
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
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          ),
          label: 'Transaction'
        };
    }
  };

  // Helper function to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-500">
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-500">
            Failed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-500">
            Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-500">
            {status}
          </span>
        );
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Transaction History</h2>
        <p className="text-muted-foreground">Your recent liquidity pool operations</p>
      </div>

      <Card className="bg-card rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">From</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">To</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center">
                    <div className="flex justify-center">
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
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center">
                    <div className="mx-auto w-12 h-12 bg-background rounded-full flex items-center justify-center mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <p className="text-muted-foreground">No transactions found</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const { icon, label } = getTransactionTypeInfo(tx.type);
                  return (
                    <tr key={tx.id} className="bg-card hover:bg-card/80">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 text-primary">
                            {icon}
                          </span>
                          <span className="text-sm text-white">{label}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-white">
                        {(tx.amount / 100).toFixed(2)} APT
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                        {formatAddress(tx.fromAddress)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                        {formatAddress(tx.toAddress)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStatusBadge(tx.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
