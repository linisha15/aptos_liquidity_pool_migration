import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LoadingOverlayProps {
  isOpen: boolean;
  message: string;
}

export function LoadingOverlay({ isOpen, message }: LoadingOverlayProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-card shadow-lg max-w-sm text-center border-border">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <h3 className="text-white font-medium">{message}</h3>
        <p className="text-muted-foreground text-sm mt-2">Please wait while we process your transaction on the blockchain.</p>
      </DialogContent>
    </Dialog>
  );
}
