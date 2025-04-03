import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactConfetti from "react-confetti";
import { useToast } from "@/hooks/use-toast";

// Types for animations
type AnimationType = "confetti" | "pulse" | "bounce" | "spin" | "shake";

// Interface for Pool Party props
interface PoolPartyProps {
  trigger: boolean;
  type?: AnimationType;
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

/**
 * PoolParty Component - Provides celebratory animations for pool interactions
 */
export default function PoolParty({
  trigger,
  type = "confetti",
  message = "Pool Party! 🎉",
  duration = 3000,
  onComplete
}: PoolPartyProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { toast } = useToast();
  
  // Set dimensions for confetti
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Update dimensions on window resize
      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };
      
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);
  
  // Show animation when triggered
  useEffect(() => {
    if (trigger) {
      setShowAnimation(true);
      toast({
        title: "Pool Party!",
        description: message,
        variant: "default",
      });
      
      // Hide animation after duration
      const timer = setTimeout(() => {
        setShowAnimation(false);
        if (onComplete) onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, duration, message, onComplete, toast]);
  
  // Animation variants for different types
  const getAnimationProps = () => {
    switch (type) {
      case "pulse":
        return {
          animate: {
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
            transition: { repeat: Infinity, duration: 0.8 }
          }
        };
      case "bounce":
        return {
          animate: {
            y: [0, -20, 0],
            transition: { repeat: Infinity, duration: 0.5 }
          }
        };
      case "spin":
        return {
          animate: {
            rotate: [0, 360],
            transition: { repeat: Infinity, duration: 1 }
          }
        };
      case "shake":
        return {
          animate: {
            x: [0, -10, 10, -10, 10, 0],
            transition: { repeat: Infinity, duration: 0.5 }
          }
        };
      default:
        return {};
    }
  };
  
  return (
    <AnimatePresence>
      {showAnimation && (
        <>
          {/* Confetti Animation */}
          {type === "confetti" && (
            <ReactConfetti
              width={dimensions.width}
              height={dimensions.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.2}
            />
          )}
          
          {/* Celebratory Message */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-primary/20 backdrop-blur-sm text-white font-bold text-4xl p-8 rounded-2xl shadow-glow"
              {...getAnimationProps()}
            >
              {message}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper function to trigger Pool Party animations
export function triggerPoolParty(
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>,
  type: AnimationType = "confetti",
  message: string = "Pool Party! 🎉"
) {
  setTrigger(true);
  // Reset trigger after a short delay to allow for multiple triggers
  setTimeout(() => setTrigger(false), 300);
}