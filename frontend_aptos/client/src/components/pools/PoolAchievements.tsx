import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Trophy, Star, TrendingUp, Activity } from "lucide-react";

// Define achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  progress?: number; // Progress percentage (0-100)
  reward?: string;
}

interface PoolAchievementsProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  onClaimReward?: (achievementId: string) => void;
}

export default function PoolAchievements({
  isOpen,
  onClose,
  achievements,
  onClaimReward
}: PoolAchievementsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-white border-border sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Trophy className="mr-2 text-primary" size={18} />
            Pool Party Achievements
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
          {achievements.map((achievement) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
              onClaim={
                achievement.isUnlocked && onClaimReward 
                  ? () => onClaimReward(achievement.id) 
                  : undefined
              }
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  onClaim?: () => void;
}

function AchievementCard({ achievement, onClaim }: AchievementCardProps) {
  const { name, description, icon, isUnlocked, progress = 0, reward } = achievement;
  
  // Animation variants
  const cardVariants = {
    locked: { filter: "grayscale(100%)", opacity: 0.6 },
    unlocked: { filter: "grayscale(0%)", opacity: 1 }
  };
  
  return (
    <motion.div
      className={`bg-background rounded-lg p-4 border ${
        isUnlocked ? "border-primary/30" : "border-border"
      } relative overflow-hidden`}
      initial={isUnlocked ? "unlocked" : "locked"}
      animate={isUnlocked ? "unlocked" : "locked"}
      variants={cardVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Badge for unlocked achievements */}
      {isUnlocked && (
        <motion.div 
          className="absolute -top-1 -right-1 bg-primary rounded-full p-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <BadgeCheck size={16} />
        </motion.div>
      )}
      
      <div className="flex items-start mb-3">
        <div className={`p-2 rounded-lg mr-3 ${isUnlocked ? "bg-primary/20" : "bg-background/20"}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      {/* Progress bar for achievements in progress */}
      {!isUnlocked && progress > 0 && (
        <div className="mt-2 mb-2">
          <div className="h-1.5 w-full bg-background-lighter rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">{`${progress}%`}</span>
            <span className="text-xs text-muted-foreground">100%</span>
          </div>
        </div>
      )}
      
      {/* Reward information */}
      {reward && (
        <div className="text-xs text-primary mt-2 flex items-center">
          <Star size={14} className="mr-1" />
          Reward: {reward}
        </div>
      )}
      
      {/* Claim button */}
      {isUnlocked && onClaim && (
        <Button 
          onClick={onClaim} 
          variant="secondary" 
          size="sm" 
          className="w-full mt-3"
        >
          Claim Reward
        </Button>
      )}
    </motion.div>
  );
}

// Sample achievements generator
export function generateSampleAchievements(poolCount: number, volume: number): Achievement[] {
  return [
    {
      id: "first_pool",
      name: "First Splash",
      description: "Create your first liquidity pool",
      icon: <TrendingUp size={18} className="text-primary" />,
      isUnlocked: poolCount >= 1,
      progress: poolCount >= 1 ? 100 : (poolCount * 100),
      reward: "Early Adopter Badge"
    },
    {
      id: "pool_master",
      name: "Pool Master",
      description: "Create 5 liquidity pools",
      icon: <Trophy size={18} className="text-primary" />,
      isUnlocked: poolCount >= 5,
      progress: poolCount >= 5 ? 100 : (poolCount / 5 * 100),
      reward: "Pool Master Badge"
    },
    {
      id: "volume_king",
      name: "Volume King",
      description: "Manage 100 APT in liquidity",
      icon: <Activity size={18} className="text-primary" />,
      isUnlocked: volume >= 10000, // 100 APT in cents
      progress: volume >= 10000 ? 100 : (volume / 10000 * 100),
      reward: "Volume King Badge"
    },
    {
      id: "whale_status",
      name: "Whale Status",
      description: "Migrate over 1000 APT",
      icon: <Star size={18} className="text-primary" />,
      isUnlocked: volume >= 100000, // 1000 APT in cents
      progress: volume >= 100000 ? 100 : (volume / 100000 * 100),
      reward: "Whale Status Badge"
    }
  ];
}