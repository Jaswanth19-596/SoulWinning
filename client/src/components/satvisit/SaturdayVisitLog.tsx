import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Circle,
  Users,
  Phone,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { riderService } from '../../services/riderService';
import { prospectService } from '../../services/prospectService';
import { Rider, Prospect } from '../../types';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';
import CustomCalendar from '../ui/CustomCalendar';

interface VisitPerson {
  id: string;
  name: string;
  type: 'rider' | 'prospect';
  phone?: string;
  address?: string;
  visited: boolean;
}

const SaturdayVisitLog: React.FC = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<string | null>(null);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Load riders and prospects
  const loadData = useCallback(async () => {
    if (!session?.bus_route) return;
    try {
      setLoading(true);
      setError(null);
      const [r, p] = await Promise.all([
        riderService.getRiders(session.bus_route, 'sunday'),
        prospectService.getProspects(session.bus_route, 'sunday'),
      ]);
      setRiders(r);
      setProspects(p);

      // Build visited set from rider visit history for this date
      const visited = new Set<string>();
      r.forEach((rider) => {
        if ((rider.visit_history || []).some((v) => v.date === selectedDate)) {
          visited.add(rider.id);
        }
      });
      setVisitedIds(visited);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [session?.bus_route, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleVisit = async (personId: string, type: 'rider' | 'prospect') => {
    if (!isToday) return;
    setToggling(personId);

    try {
      if (type === 'rider') {
        await riderService.logVisit(personId, selectedDate);
      }
      // For prospects, we don't have a visit log mechanism in the service,
      // so we'll just track it locally for now
      setVisitedIds((prev) => {
        const next = new Set(prev);
        if (next.has(personId)) {
          next.delete(personId);
        } else {
          next.add(personId);
        }
        return next;
      });
    } catch (err) {
      console.error('Toggle visit error:', err);
    } finally {
      setToggling(null);
    }
  };

  const navigateDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const displayDate = new Date(selectedDate + 'T12:00:00');

  const formatAddress = (addr?: { street?: string; city?: string; state?: string }) => {
    if (!addr) return '';
    return [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
  };

  // Combine riders and prospects into a unified list
  const people = useMemo((): VisitPerson[] => {
    const riderPeople: VisitPerson[] = riders.map((r) => ({
      id: r.id,
      name: r.name,
      type: 'rider' as const,
      phone: r.phone,
      address: formatAddress(r.address),
      visited: visitedIds.has(r.id),
    }));

    const prospectPeople: VisitPerson[] = prospects.map((p) => ({
      id: p.id,
      name: p.name,
      type: 'prospect' as const,
      phone: p.phone,
      address: formatAddress(p.address),
      visited: visitedIds.has(p.id),
    }));

    return [...riderPeople, ...prospectPeople]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((p) =>
        search ? p.name.toLowerCase().includes(search.toLowerCase()) : true
      );
  }, [riders, prospects, visitedIds, search]);

  const visitedCount = people.filter((p) => p.visited).length;

  const handleQuickText = (phone?: string, name?: string) => {
    if (!phone) return;
    const msg = `Hi ${name?.split(' ')[0] || 'there'}! We stopped by to check on you today. Hope you're doing well! 🙏`;
    window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`, '_self');
  };

  const openMaps = (address?: string) => {
    if (!address) return;
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  };

  const renderSection = (title: string, entries: VisitPerson[]) => {
    if (entries.length === 0) return null;
    const sectionVisited = entries.filter((p) => p.visited).length;
    return (
      <div className="mb-6">
        {/* Section Header */}
        <div className="flex items-center justify-between px-4 h-10 mb-2 border-l-4 border-orange-500 bg-orange-500/5 rounded-r-lg">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {title}
          </h3>
          <span className="text-xs font-bold text-foreground bg-background px-2 py-0.5 rounded-full border border-border">
            {sectionVisited}/{entries.length}
          </span>
        </div>

        {/* List */}
        <div className="divide-y divide-border/40">
          {entries.map((person) => (
            <div
              key={person.id}
              className={`group flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-all duration-200 rounded-lg ${
                person.visited ? 'bg-green-500/5' : ''
              }`}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-sm font-medium truncate ${
                      person.visited ? 'text-green-600 line-through opacity-70' : 'text-foreground'
                    }`}
                  >
                    {person.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      person.type === 'rider'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-purple-500/10 text-purple-600'
                    }`}
                  >
                    {person.type === 'rider' ? 'Rider' : 'Prospect'}
                  </span>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-3 mt-1">
                  {person.address && (
                    <button
                      onClick={() => openMaps(person.address)}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MapPin size={10} />
                      <span className="truncate max-w-[150px]">{person.address}</span>
                    </button>
                  )}
                  {person.phone && (
                    <button
                      onClick={() => handleQuickText(person.phone, person.name)}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors bg-muted/30 px-2 py-0.5 rounded-full"
                    >
                      <MessageCircle size={10} />
                      <span>Text</span>
                    </button>
                  )}
                  {person.phone && (
                    <a
                      href={`tel:${person.phone}`}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors bg-muted/30 px-2 py-0.5 rounded-full"
                    >
                      <Phone size={10} />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Visit Toggle */}
              <button
                onClick={() => handleToggleVisit(person.id, person.type)}
                disabled={!isToday || toggling === person.id}
                className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                  !isToday
                    ? 'opacity-50 cursor-not-allowed'
                    : person.visited
                    ? 'text-green-500 hover:text-green-600'
                    : 'text-muted-foreground hover:text-green-500'
                }`}
              >
                {person.visited ? (
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                  >
                    <CheckCircle2 size={28} className="fill-green-500 text-white" />
                  </motion.div>
                ) : (
                  <Circle size={28} strokeWidth={1.5} />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const riderList = people.filter((p) => p.type === 'rider');
  const prospectList = people.filter((p) => p.type === 'prospect');

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      {/* Header Stats */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Stats */}
        <div className="p-4 flex items-center justify-center gap-6 border-b border-border">
          <div className="text-center">
            <span className="text-3xl font-bold text-orange-500">{visitedCount}</span>
            <span className="text-3xl font-bold text-muted-foreground/30">/{people.length}</span>
            <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
              Visited
            </p>
          </div>
          {/* Progress bar */}
          <div className="flex-1 max-w-[200px]">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: people.length > 0 ? `${(visitedCount / people.length) * 100}%` : '0%',
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              {people.length > 0
                ? `${Math.round((visitedCount / people.length) * 100)}% complete`
                : 'No people to visit'}
            </p>
          </div>
        </div>

        {/* Date Nav Row */}
        <div className="flex items-center justify-between p-2 bg-muted/20">
          <button
            onClick={() => navigateDate(-7)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => setShowCalendar(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <Calendar size={16} className="text-muted-foreground" />
            <span className="font-semibold text-sm">
              {displayDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {isToday && (
              <span className="ml-1 text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                TODAY
              </span>
            )}
          </button>

          <button
            onClick={() => navigateDate(7)}
            disabled={isToday}
            className={`p-2 transition-colors ${
              !isToday
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-muted-foreground/30 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter names..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-background border border-border text-foreground h-10 rounded-lg pl-9 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
        />
      </div>

      {/* Lists */}
      <div className="space-y-6">
        {renderSection('Riders', riderList)}
        {renderSection('Prospects', prospectList)}

        {people.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p>No people to visit.</p>
            <p className="text-sm mt-1">Add riders or prospects first.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCalendar && (
          <CustomCalendar
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SaturdayVisitLog;
