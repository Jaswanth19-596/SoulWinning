import React from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardProps {
  riders: { id: string; name: string; points?: number }[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ riders }) => {
  // Sort by points desc, take top 5
  const topRiders = [...riders]
    .filter(r => (r.points || 0) > 0)
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 5);

  if (topRiders.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-amber-200/20 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-amber-500 uppercase tracking-wider text-xs">Leaderboard</h3>
      </div>
      
      <div className="space-y-2">
        {topRiders.map((rider, index) => (
          <motion.div 
            key={rider.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between bg-background/60 backdrop-blur-sm p-2 rounded-lg border border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                  index === 1 ? 'bg-gray-100 text-gray-700' : 
                  index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'}
              `}>
                {index + 1}
              </div>
              <span className="font-medium text-sm">{rider.name}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
               <Star size={12} fill="currentColor" />
               {rider.points}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
