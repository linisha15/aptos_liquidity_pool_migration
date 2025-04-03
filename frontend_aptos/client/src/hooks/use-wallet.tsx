import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "./use-toast";
import * as AptosClient from "../lib/aptos";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const defaultContext: WalletContextType = {
  isConnected: false,
  address: null,
  balance: 0,
  connect: async () => {},
  disconnect: async () => {},
};

const WalletContext = createContext<WalletContextType>(defaultContext);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const { toast } = useToast();

  // On mount, check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (AptosClient.isWalletConnected()) {
        try {
          setIsConnected(true);
          setAddress(AptosClient.getWalletAddress());
          const walletBalance = await AptosClient.getWalletBalance();
          setBalance(walletBalance);
        } catch (error) {
          console.error("Failed to initialize wallet:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Connect wallet
  const connect = async () => {
    try {
      const { address: walletAddress, balance: walletBalance } = await AptosClient.connectWallet();
      setIsConnected(true);
      setAddress(walletAddress);
      setBalance(walletBalance);
      
      toast({
        title: "Wallet Connected",
        description: "Your Aptos wallet has been connected successfully.",
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      await AptosClient.disconnectWallet();
      setIsConnected(false);
      setAddress(null);
      setBalance(0);
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, balance, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  return useContext(WalletContext);
}