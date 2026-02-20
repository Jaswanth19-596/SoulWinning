import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { riderService } from '../../services/riderService';
import { Rider } from '../../types';

function isBirthdayNear(dateStr?: string): { near: boolean; display: string; daysAway: number } {
  if (!dateStr) return { near: false, display: '', daysAway: 999 };
  const bday = new Date(dateStr);
  const today = new Date();
  const thisYear = new Date(today.getFullYear(), bday.getUTCMonth(), bday.getUTCDate());

  let diff = Math.ceil((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  // If birthday already passed this year, check next year
  if (diff < 0) {
    const nextYear = new Date(today.getFullYear() + 1, bday.getUTCMonth(), bday.getUTCDate());
    diff = Math.ceil((nextYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  const near = diff >= 0 && diff <= 7;
  const display = thisYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { near, display, daysAway: diff };
}

interface BirthdayRider {
  name: string;
  display: string;
  daysAway: number;
}

const BirthdayBanner: React.FC = () => {
  const { session } = useAuth();
  const [birthdayRiders, setBirthdayRiders] = useState<BirthdayRider[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!session) return;
    // Check sessionStorage for dismissal
    if (sessionStorage.getItem('bday-banner-dismissed') === 'true') {
      setDismissed(true);
      return;
    }

    riderService.getRiders(session.bus_route, 'sunday').then((riders) => {
      const upcoming = riders
        .map(r => {
          const result = isBirthdayNear(r.birthday);
          return result.near ? { name: r.name, display: result.display, daysAway: result.daysAway } : null;
        })
        .filter(Boolean) as BirthdayRider[];

      upcoming.sort((a, b) => a.daysAway - b.daysAway);
      setBirthdayRiders(upcoming);
    }).catch(() => {});
  }, [session]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('bday-banner-dismissed', 'true');
  };

  if (dismissed || birthdayRiders.length === 0) return null;

  const preview = birthdayRiders.slice(0, 2);
  const hasMore = birthdayRiders.length > 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-4 bg-gradient-to-r from-pink-500/10 to-amber-500/10 border border-pink-200/30 dark:border-pink-800/30 rounded-xl p-3 relative"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors text-muted-foreground"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-amber-400 flex items-center justify-center flex-shrink-0">
            <Cake className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">
              🎂 {birthdayRiders.length} birthday{birthdayRiders.length > 1 ? 's' : ''} this week!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(expanded ? birthdayRiders : preview)
                .map(r => `${r.name} (${r.daysAway === 0 ? 'Today!' : r.display})`)
                .join(' • ')}
            </p>

            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary font-medium mt-1 flex items-center gap-0.5 hover:underline"
              >
                {expanded ? 'Show less' : `+${birthdayRiders.length - 2} more`}
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(BirthdayBanner);
