import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { workerService } from '../../services/workerService';
import { Worker } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';

const WorkerList: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filtered, setFiltered] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { session } = useAuth();
  const { dayType } = useApp();
  const navigate = useNavigate();

  const loadWorkers = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      const data = await workerService.getWorkers(session.bus_route, dayType);
      setWorkers(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  }, [session, dayType]);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  useEffect(() => {
    let result = workers;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.phone?.toLowerCase().includes(term) ||
          w.assigned_section.toLowerCase().includes(term)
      );
    }
    setFiltered(result);
  }, [search, workers]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">👷 Workers</h2>
          <p className="text-sm text-muted-foreground">
            {workers.length} workers
          </p>
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
        <AnimatePresence mode="popLayout">
          {filtered.map((worker, i) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className="p-4 cursor-pointer hover:border-primary/30 transition-all group"
                onClick={() => navigate(`/workers/${worker.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{worker.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {worker.assigned_section}
                      </Badge>
                    </div>
                    {worker.phone && (
                      <a
                        href={`tel:${worker.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-primary flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" /> {worker.phone}
                      </a>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default WorkerList;
