import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Plus,
  Check,
  Undo2,
  Trash2,
  Clock,
  User,
  Send,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { prayerService } from '../../services/prayerService';
import { PrayerRequest } from '../../types';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const PrayerRequests: React.FC = () => {
  const { session, isCaptain } = useAuth();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      const data = await prayerService.getRequests(session.bus_route);
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const openRequests = useMemo(() => requests.filter(r => !r.resolved), [requests]);
  const resolvedRequests = useMemo(() => requests.filter(r => r.resolved), [requests]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !session) return;
    try {
      setSubmitting(true);
      const req = await prayerService.addRequest(newText.trim(), session.bus_route, session.label);
      setRequests(prev => [req, ...prev]);
      setNewText('');
    } catch (err: any) {
      setError(err.message || 'Failed to add');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, resolved: boolean) => {
    // Optimistic update
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, resolved, resolved_at: resolved ? new Date().toISOString() : undefined } : r
    ));
    try {
      await prayerService.toggleResolved(id, resolved);
    } catch {
      // Revert on failure
      setRequests(prev => prev.map(r =>
        r.id === id ? { ...r, resolved: !resolved, resolved_at: undefined } : r
      ));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this prayer request?')) return;
    setRequests(prev => prev.filter(r => r.id !== id));
    try {
      await prayerService.deleteRequest(id);
    } catch {
      loadRequests(); // Revert
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-20">

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-200/30 px-4 py-2 rounded-full mb-3">
          <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
          <span className="text-sm font-bold text-rose-600 uppercase tracking-wider">Prayer Requests</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {openRequests.length} open • {resolvedRequests.length} answered
        </p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a prayer request..."
          className="flex-1 bg-background border border-border text-foreground h-11 rounded-xl px-4 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={submitting || !newText.trim()}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white disabled:opacity-40 hover:shadow-lg hover:shadow-rose-500/20 transition-all flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Open Requests */}
      {openRequests.length === 0 && resolvedRequests.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-15" />
          <p className="font-medium">No prayer requests yet</p>
          <p className="text-sm mt-1">Add one above to start the feed</p>
        </div>
      ) : (
        <>
          {openRequests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Open Requests
              </h3>
              <AnimatePresence mode="popLayout">
                {openRequests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-card border border-border rounded-xl p-4 group"
                  >
                    <p className="text-sm font-medium leading-relaxed">{req.text}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User size={11} /> {req.requested_by}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {timeAgo(req.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggle(req.id, true)}
                          className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                          title="Mark as answered"
                        >
                          <Check size={16} />
                        </button>
                        {isCaptain && (
                          <button
                            onClick={() => handleDelete(req.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Resolved Section */}
          {resolvedRequests.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowResolved(!showResolved)}
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1 hover:text-foreground transition-colors"
              >
                ✅ Answered ({resolvedRequests.length})
                <span className="text-[10px]">{showResolved ? '▾' : '▸'}</span>
              </button>

              <AnimatePresence>
                {showResolved && resolvedRequests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-card/50 border border-border/50 rounded-xl p-4 opacity-60 group">
                      <p className="text-sm line-through">{req.text}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User size={11} /> {req.requested_by}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {timeAgo(req.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggle(req.id, false)}
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                            title="Reopen"
                          >
                            <Undo2 size={14} />
                          </button>
                          {isCaptain && (
                            <button
                              onClick={() => handleDelete(req.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrayerRequests;
