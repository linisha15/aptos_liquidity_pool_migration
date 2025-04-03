import { useState } from "react";
import WalletConnectButton from "@/components/WalletConnectButton";
import AccountOverview from "@/components/AccountOverview";
import NavigationTabs from "@/components/NavigationTabs";
import PoolsList from "@/components/pools/PoolsList";
import MigrationForm from "@/components/migrate/MigrationForm";
import TransactionHistory from "@/components/history/TransactionHistory";
import CreatePoolModal from "@/components/pools/CreatePoolModal";
import PoolDetailsModal from "@/components/pools/PoolDetailsModal";
import { useWallet } from "@/hooks/use-wallet";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export type TabType = "pools" | "migrate" | "history";

export default function Home() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>("pools");
  const [isCreatePoolModalOpen, setIsCreatePoolModalOpen] = useState(false);
  const [selectedPoolAddress, setSelectedPoolAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Handle showing pool details modal
  const handleViewPoolDetails = (poolAddress: string) => {
    setSelectedPoolAddress(poolAddress);
  };

  // Handle closing pool details modal
  const handleClosePoolDetails = () => {
    setSelectedPoolAddress(null);
  };

  // Handle showing loading overlay
  const showLoading = (message: string) => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  // Handle hiding loading overlay
  const hideLoading = () => {
    setIsLoading(false);
  };

  return (
    <div className="bg-background text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header */}
        <header className="py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h20"></path>
                  <path d="M5 5h14"></path>
                  <path d="M9 19h6"></path>
                </svg>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-white">Aptos Liquidity Migration Tool</h1>
            </div>
            
            <WalletConnectButton />
          </div>
        </header>

        {isConnected ? (
          <main className="mt-8">
            <AccountOverview />
            
            <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "pools" && (
              <PoolsList
                onCreatePool={() => setIsCreatePoolModalOpen(true)}
                onViewPool={handleViewPoolDetails}
                showLoading={showLoading}
                hideLoading={hideLoading}
              />
            )}
            
            {activeTab === "migrate" && (
              <MigrationForm 
                showLoading={showLoading}
                hideLoading={hideLoading}
              />
            )}
            
            {activeTab === "history" && (
              <TransactionHistory />
            )}
            
            {/* Modals */}
            <CreatePoolModal 
              isOpen={isCreatePoolModalOpen} 
              onClose={() => setIsCreatePoolModalOpen(false)}
              showLoading={showLoading}
              hideLoading={hideLoading}
            />
            
            {selectedPoolAddress && (
              <PoolDetailsModal 
                poolAddress={selectedPoolAddress}
                onClose={handleClosePoolDetails}
                onMigrate={() => {
                  handleClosePoolDetails();
                  setActiveTab("migrate");
                }}
                showLoading={showLoading}
                hideLoading={hideLoading}
              />
            )}
          </main>
        ) : (
          <div className="mt-12 text-center">
            <div className="bg-card rounded-xl p-8 shadow-lg max-w-md mx-auto">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">Connect your Aptos wallet to access the liquidity migration tools.</p>
              <WalletConnectButton fullWidth />
              <div className="mt-4 text-muted-foreground text-sm">
                <p>New to Aptos? <a href="https://petra.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get an Aptos wallet</a></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay isOpen={isLoading} message={loadingMessage} />
    </div>
  );
}
