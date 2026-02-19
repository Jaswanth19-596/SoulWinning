import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { prospectService } from '../../services/prospectService';
import { Prospect, InterestLevel } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';

const interestColors: Record<InterestLevel, string> = {
  very: 'bg-green-500/10 text-green-500 border-green-500/20',
  somewhat: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const interestLabels: Record<InterestLevel, string> = {
  very: 'Very Interested',
  somewhat: 'Somewhat',
  neutral: 'Neutral',
};

const ProspectList: React.FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filtered, setFiltered] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterInterest, setFilterInterest] = useState<InterestLevel | ''>('');
  const { session } = useAuth();
  const { dayType } = useApp();
  const navigate = useNavigate();

  const loadProspects = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      const data = await prospectService.getProspects(session.bus_route, dayType);
      setProspects(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load prospects');
    } finally {
      setLoading(false);
    }
  }, [session, dayType]);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  useEffect(() => {
    let result = prospects;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.phone?.toLowerCase().includes(term) ||
          p.address.street.toLowerCase().includes(term)
      );
    }
    if (filterInterest) {
      result = result.filter((p) => p.interest_level === filterInterest);
    }
    setFiltered(result);
  }, [search, filterInterest, prospects]);

  const formatAddress = (addr: Prospect['address']) => {
    const parts = [addr.street, addr.apt, addr.city, addr.state, addr.zip].filter(Boolean);
    return parts.join(', ');
  };

  const openMaps = (addr: Prospect['address']) => {
    const query = encodeURIComponent(formatAddress(addr));
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {dayType === 'saturday' ? '🚪' : '⛪'} Prospects
          </h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} people · {dayType === 'saturday' ? 'Soul Winning' : 'Sunday Outreach'}
          </p>
        </div>
        <Button
          onClick={() => navigate('/prospects/new')}
          className="bg-gradient-to-r from-primary to-purple-600"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Search & Filters */}
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
          <option value="">All Interest</option>
          <option value="very">Very Interested</option>
          <option value="somewhat">Somewhat</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-semibold text-lg">No Prospects Yet</h3>
          <p className="text-muted-foreground mt-1">
            Start adding people you meet during {dayType === 'saturday' ? 'soul winning' : 'Sunday outreach'}
          </p>
          <Button onClick={() => navigate('/prospects/new')} className="mt-4">
            <Plus className="w-4 h-4 mr-1" /> Add First Prospect
          </Button>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          {filtered.map((prospect, i) => (
            <motion.div
              key={prospect.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className="p-4 cursor-pointer hover:border-primary/30 transition-all group"
                onClick={() => navigate(`/prospects/${prospect.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{prospect.name}</h3>
                      <Badge className={`text-xs ${interestColors[prospect.interest_level]}`}>
                        {interestLabels[prospect.interest_level]}
                      </Badge>
                      {prospect.status === 'converted' && (
                        <Badge className="bg-green-500/10 text-green-500 text-xs">
                          <ArrowRightLeft className="w-3 h-3 mr-1" /> Converted
                        </Badge>
                      )}
                    </div>

                    {prospect.phone && (
                      <a
                        href={`tel:${prospect.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-primary flex items-center gap-1 mt-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {prospect.phone}
                      </a>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMaps(prospect.address);
                      }}
                      className="text-sm text-muted-foreground flex items-center gap-1 mt-1 hover:text-primary transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{formatAddress(prospect.address)}</span>
                    </button>

                    {prospect.notes && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{prospect.notes}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default ProspectList;
