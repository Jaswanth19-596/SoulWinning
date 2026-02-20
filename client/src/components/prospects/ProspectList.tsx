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
import { prospectService } from '../../services/prospectService';
import { Prospect, InterestLevel } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';
import { useDebounce } from '../../utils/debounce';

const interestColors: Record<InterestLevel, string> = {
  very: 'bg-green-500/10 text-green-500 border-green-500/20',
  somewhat: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const interestLabels: Record<InterestLevel, string> = {
  very: '🔥 Very',
  somewhat: '🤔 Ok',
  neutral: '😐 Meh',
};

const interestDot: Record<InterestLevel, string> = {
  very: 'bg-green-500',
  somewhat: 'bg-amber-500',
  neutral: 'bg-gray-400',
};

const avatarColors = [
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-indigo-500 to-blue-600',
];

const ProspectList: React.FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterInterest, setFilterInterest] = useState<InterestLevel | ''>('');
  const { session } = useAuth();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 300);

  const loadProspects = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      const data = await prospectService.getProspects(session.bus_route, 'sunday');
      setProspects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load prospects');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  const filtered = useMemo(() => {
    let result = prospects;
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.phone?.toLowerCase().includes(term) ||
          p.address?.street?.toLowerCase().includes(term)
      );
    }
    if (filterInterest) {
      result = result.filter((p) => p.interest_level === filterInterest);
    }
    return result;
  }, [debouncedSearch, filterInterest, prospects]);

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
          <h2 className="text-2xl font-bold">⛪ Prospects</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} people</p>
        </div>
        <Button
          onClick={() => navigate('/prospects/new')}
          className="bg-gradient-to-r from-primary to-purple-600"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterInterest}
          onChange={(e) => setFilterInterest(e.target.value as InterestLevel | '')}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All</option>
          <option value="very">🔥 Very</option>
          <option value="somewhat">🤔 Somewhat</option>
          <option value="neutral">😐 Neutral</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-semibold text-lg">No Prospects Yet</h3>
          <p className="text-muted-foreground mt-1">Start adding people you meet during outreach</p>
          <Button onClick={() => navigate('/prospects/new')} className="mt-4">
            <Plus className="w-4 h-4 mr-1" /> Add First Prospect
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((prospect, i) => (
              <motion.div
                key={prospect.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className="p-3 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                  onClick={() => navigate(`/prospects/${prospect.id}`)}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar with interest dot */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{getInitials(prospect.name)}</span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${interestDot[prospect.interest_level]} border-2 border-background`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm truncate leading-tight">{prospect.name}</h3>
                        {prospect.status === 'converted' && (
                          <span className="text-[9px] bg-green-500/10 text-green-500 px-1 py-0.5 rounded font-bold">✓</span>
                        )}
                      </div>

                      {prospect.address?.street && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{prospect.address.street}</span>
                        </p>
                      )}
                    </div>

                    {prospect.phone && (
                      <a
                        href={`tel:${prospect.phone}`}
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

export default ProspectList;

