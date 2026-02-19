import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  Check,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { riderService } from '../../services/riderService';
import { Rider } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';

const RiderList: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [filtered, setFiltered] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { session } = useAuth();
  const { dayType } = useApp();
  const navigate = useNavigate();

  const loadRiders = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      const data = await riderService.getRiders(session.bus_route, dayType);
      setRiders(data || []);
      setFiltered(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load riders');
    } finally {
      setLoading(false);
    }
  }, [session, dayType]);

  useEffect(() => {
    loadRiders();
  }, [loadRiders]);

  useEffect(() => {
    let result = riders;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.phone?.toLowerCase().includes(term) ||
          r.address.street.toLowerCase().includes(term)
      );
    }
    setFiltered(result);
  }, [search, riders]);

  const formatAddress = (addr: Rider['address']) => {
    const parts = [addr.street, addr.apt, addr.city, addr.state, addr.zip].filter(Boolean);
    return parts.join(', ');
  };

  const openMaps = (addr: Rider['address']) => {
    const query = encodeURIComponent(formatAddress(addr));
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {dayType === 'saturday' ? '🏃' : '🚌'} Riders
          </h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} riders
          </p>
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
          <p className="text-muted-foreground mt-1">
            Add riders or convert prospects to build your route
          </p>
          <Button onClick={() => navigate('/riders/new')} className="mt-4">
            <Plus className="w-4 h-4 mr-1" /> Add First Rider
          </Button>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          {filtered.map((rider, i) => (
            <motion.div
              key={rider.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className="p-4 cursor-pointer hover:border-primary/30 transition-all group"
                onClick={() => navigate(`/riders/${rider.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{rider.name}</h3>

                    {rider.phone && (
                      <a
                        href={`tel:${rider.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-primary flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" /> {rider.phone}
                      </a>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMaps(rider.address);
                      }}
                      className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{formatAddress(rider.address)}</span>
                    </button>

                    {rider.last_visited && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        Last: {new Date(rider.last_visited).toLocaleDateString()}
                      </span>
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

export default RiderList;
