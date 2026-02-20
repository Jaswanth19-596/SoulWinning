import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Phone,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { riderService } from '../../services/riderService';
import { Rider } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';
import { useDebounce } from '../../utils/debounce';

const avatarColors = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-600',
];

const RiderList: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { session } = useAuth();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 300);

  const loadRiders = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      const data = await riderService.getRiders(session.bus_route, 'sunday');
      setRiders(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load riders');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadRiders();
  }, [loadRiders]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return riders;
    const term = debouncedSearch.toLowerCase();
    return riders.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.phone?.toLowerCase().includes(term) ||
        r.address?.street?.toLowerCase().includes(term)
    );
  }, [debouncedSearch, riders]);

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
          <h2 className="text-2xl font-bold">🚌 Riders</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} riders</p>
        </div>
        <Button
          onClick={() => navigate('/riders/new')}
          className="bg-gradient-to-r from-primary to-purple-600"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search riders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-3">🚌</div>
          <h3 className="font-semibold text-lg">No Riders Yet</h3>
          <p className="text-muted-foreground mt-1">Add riders or convert prospects to build your route</p>
          <Button onClick={() => navigate('/riders/new')} className="mt-4">
            <Plus className="w-4 h-4 mr-1" /> Add First Rider
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((rider, i) => (
              <motion.div
                key={rider.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className="p-3 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                  onClick={() => navigate(`/riders/${rider.id}`)}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-bold">{getInitials(rider.name)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate leading-tight">{rider.name}</h3>

                      {rider.address?.street && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{rider.address.street}</span>
                        </p>
                      )}
                    </div>

                    {rider.phone && (
                      <a
                        href={`tel:${rider.phone}`}
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

export default RiderList;

