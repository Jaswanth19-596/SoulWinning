import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { workerService } from '../../services/workerService';
import { Worker } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';
import { useDebounce } from '../../utils/debounce';

const avatarColors = [
  'from-blue-500 to-cyan-600',
  'from-indigo-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];

const WorkerList: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { session } = useAuth();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 300);

  const loadWorkers = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      const data = await workerService.getWorkers(session.bus_route, 'sunday');
      setWorkers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return workers;
    const term = debouncedSearch.toLowerCase();
    return workers.filter(
      (w) =>
        w.name.toLowerCase().includes(term) ||
        w.phone?.toLowerCase().includes(term) ||
        w.assigned_section.toLowerCase().includes(term)
    );
  }, [debouncedSearch, workers]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">👷 Workers</h2>
          <p className="text-sm text-muted-foreground">{workers.length} workers</p>
        </div>
        <Button
          onClick={() => navigate('/workers/new')}
          className="bg-gradient-to-r from-primary to-purple-600"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search workers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-3">👷</div>
          <h3 className="font-semibold text-lg">No Workers Yet</h3>
          <p className="text-muted-foreground mt-1">Add your team members</p>
          <Button onClick={() => navigate('/workers/new')} className="mt-4">
            <Plus className="w-4 h-4 mr-1" /> Add First Worker
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((worker, i) => (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className="p-3 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                  onClick={() => navigate(`/workers/${worker.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-bold">{getInitials(worker.name)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate leading-tight">{worker.name}</h3>
                      <Badge variant="secondary" className="text-[10px] mt-1 px-1.5 py-0">
                        {worker.assigned_section}
                      </Badge>
                    </div>

                    {worker.phone && (
                      <a
                        href={`tel:${worker.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default WorkerList;

