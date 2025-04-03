import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";

interface WalletConnectButtonProps {
  fullWidth?: boolean;
}

export default function WalletConnectButton({ fullWidth = false }: WalletConnectButtonProps) {
  const { isConnected, connect, disconnect, address } = useWallet();

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <Button 
      variant="default" 
      className={`flex items-center ${fullWidth ? 'w-full' : ''}`}
      onClick={handleClick}
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
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <span>{isConnected ? 'Wallet Connected' : 'Connect Wallet'}</span>
    </Button>
  );
}
