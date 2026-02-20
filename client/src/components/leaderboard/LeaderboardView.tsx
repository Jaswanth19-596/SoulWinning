import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Crown,
  Flame,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { riderService } from '../../services/riderService';
import { Rider, PointLog } from '../../types';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';

type TimeFilter = 'week' | 'month' | 'all';

// ─── Helpers ────────────────────────────────────────────────

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split('T')[0];
}

function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

function computeStreak(history: PointLog[]): number {
  if (!history || history.length === 0) return 0;
  const weekSet = new Set<string>();
  history.filter(p => p.amount > 0).forEach(p => {
    const d = new Date(p.date + 'T12:00:00');
    const diff = d.getDate() - d.getDay();
    weekSet.add(new Date(d.getFullYear(), d.getMonth(), diff).toISOString().split('T')[0]);
  });
  if (weekSet.size === 0) return 0;
  const weeks = Array.from(weekSet).sort((a, b) => b.localeCompare(a));
  let streak = 1;
  for (let i = 1; i < weeks.length; i++) {
    const prev = new Date(weeks[i - 1] + 'T12:00:00');
    const curr = new Date(weeks[i] + 'T12:00:00');
    if (Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)) === 7) {
      streak++;
    } else break;
  }
  return streak;
}

function getCutoff(filter: TimeFilter): string {
  if (filter === 'all') return '0000';
  return filter === 'week' ? getWeekStart() : getMonthStart();
}

function filterPoints(history: PointLog[], filter: TimeFilter): number {
  const cutoff = getCutoff(filter);
  return history.filter(p => p.date >= cutoff).reduce((sum, p) => sum + p.amount, 0);
}

function countPeriodRides(history: PointLog[], period: string, filter: TimeFilter): number {
  const cutoff = getCutoff(filter);
  return history.filter(p => p.amount > 0 && p.reason.includes(`(${period})`) && p.date >= cutoff).length;
}

// ─── Component ──────────────────────────────────────────────

interface RankedRider {
  id: string;
  name: string;
  filteredPoints: number;
  morningRides: number;
  eveningRides: number;
  streak: number;
}

const LeaderboardView: React.FC = () => {
  const { session } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TimeFilter>('all');

  const loadRiders = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      const data = await riderService.getRiders(session.bus_route, 'sunday');
      setRiders(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { loadRiders(); }, [loadRiders]);

  const ranked: RankedRider[] = useMemo(() => {
    return riders
      .map(r => ({
        id: r.id,
        name: r.name,
        filteredPoints: filterPoints(r.points_history || [], filter),
        morningRides: countPeriodRides(r.points_history || [], 'morning', filter),
        eveningRides: countPeriodRides(r.points_history || [], 'evening', filter),
        streak: computeStreak(r.points_history || []),
      }))
      .sort((a, b) => b.filteredPoints - a.filteredPoints);
  }, [riders, filter]);

  const hasPoints = ranked.some(r => r.filteredPoints > 0);
  const top3 = ranked.slice(0, 3);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const filterLabels: Record<TimeFilter, string> = {
    week: 'This Week',
    month: 'This Month',
    all: 'All Time',
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-200/30 px-4 py-2 rounded-full mb-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">Leaderboard</span>
        </div>
        <h2 className="text-2xl font-bold">Rider Rankings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          30 pts per morning ride • 30 pts per evening ride
        </p>
      </div>

      {/* Time Filter */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
        {(['week', 'month', 'all'] as TimeFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              filter === f
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {!hasPoints ? (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-15" />
          <p className="font-medium">No points earned {filter !== 'all' ? filterLabels[filter].toLowerCase() : 'yet'}</p>
          <p className="text-sm mt-1">Morning & evening church rides earn 30 points each!</p>
        </div>
      ) : (
        <>
          {/* 🏆 Podium — Top 3 */}
          <div className="grid grid-cols-3 gap-2 items-end">
            {/* 2nd Place */}
            {top3[1] ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-b from-gray-100/80 to-gray-50/40 dark:from-gray-800/60 dark:to-gray-900/30 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-3 text-center"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-gray-600 dark:text-gray-300">2</span>
                </div>
                <p className="font-semibold text-sm truncate">{top3[1].name}</p>
                <div className="flex items-center justify-center gap-1 text-gray-500 font-bold mt-1">
                  <Star size={12} fill="currentColor" /> {top3[1].filteredPoints}
                </div>
              </motion.div>
            ) : <div />}

            {/* 1st Place */}
            {top3[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-amber-100/80 to-yellow-50/40 dark:from-amber-900/40 dark:to-yellow-900/20 border-2 border-amber-300/50 dark:border-amber-700/50 rounded-xl p-4 text-center -mt-4 shadow-lg shadow-amber-500/10"
              >
                <Crown className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-2 shadow-lg shadow-amber-500/20">
                  <span className="text-2xl font-black text-white">1</span>
                </div>
                <p className="font-bold text-base truncate">{top3[0].name}</p>
                <div className="flex items-center justify-center gap-1 text-amber-600 font-bold text-lg mt-1">
                  <Star size={14} fill="currentColor" /> {top3[0].filteredPoints}
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3[2] ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-b from-orange-100/60 to-orange-50/30 dark:from-orange-900/30 dark:to-orange-950/20 border border-orange-200/50 dark:border-orange-800/50 rounded-xl p-3 text-center"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-orange-700 dark:text-orange-200">3</span>
                </div>
                <p className="font-semibold text-sm truncate">{top3[2].name}</p>
                <div className="flex items-center justify-center gap-1 text-orange-500 font-bold mt-1">
                  <Star size={12} fill="currentColor" /> {top3[2].filteredPoints}
                </div>
              </motion.div>
            ) : <div />}
          </div>

          {/* Simple Rankings Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20">
              <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                <span className="col-span-1">#</span>
                <span className="col-span-4">Rider</span>
                <span className="col-span-2 text-center">
                  <Sun size={10} className="inline mr-0.5" />AM
                </span>
                <span className="col-span-2 text-center">
                  <Moon size={10} className="inline mr-0.5" />PM
                </span>
                <span className="col-span-1 text-center">
                  <Flame size={10} className="inline" />
                </span>
                <span className="col-span-2 text-right">Pts</span>
              </div>
            </div>

            <div className="divide-y divide-border/40">
              {ranked.filter(r => r.filteredPoints > 0 || filter === 'all').map((rider, idx) => (
                <motion.div
                  key={rider.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="grid grid-cols-12 items-center">
                    <span className={`col-span-1 text-sm font-bold ${
                      idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-500' : 'text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </span>

                    <span className="col-span-4 text-sm font-medium truncate">{rider.name}</span>

                    <span className="col-span-2 text-center text-sm text-amber-600 font-semibold">
                      {rider.morningRides || '—'}
                    </span>

                    <span className="col-span-2 text-center text-sm text-indigo-500 font-semibold">
                      {rider.eveningRides || '—'}
                    </span>

                    <span className={`col-span-1 text-center text-sm font-bold ${
                      rider.streak >= 3 ? 'text-orange-500' : rider.streak >= 2 ? 'text-amber-600' : 'text-muted-foreground'
                    }`}>
                      {rider.streak > 0 ? rider.streak : '—'}
                    </span>

                    <span className="col-span-2 text-right font-bold text-sm">
                      {rider.filteredPoints}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{ranked.filter(r => r.filteredPoints > 0).length}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Active Riders</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" fill="currentColor" />
              <p className="text-lg font-bold">{ranked.reduce((sum, r) => sum + r.filteredPoints, 0)}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Points</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{Math.max(...ranked.map(r => r.streak), 0)}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Best Streak</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardView;
