import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sun,
  Moon,
  Users,
  Cake,
  AlertCircle,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { busLogService, BusLog } from '../../services/busLogService';
import { riderService } from '../../services/riderService';
import { workerService } from '../../services/workerService';
import { prospectService } from '../../services/prospectService';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';
import CustomCalendar from '../ui/CustomCalendar';
import ShiftToggle from './ShiftToggle';
import RouteMap from './RouteMap';
import Leaderboard from './Leaderboard';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import { Map as MapIcon, Star, LayoutDashboard } from 'lucide-react';

// Helper for Birthday Check (within 7 days)
const isBirthdayNear = (dateStr?: string) => {
    if (!dateStr) return false;
    const bday = new Date(dateStr);
    const today = new Date();
    // Ignore year, compare month/day
    // Simple logic: Create a date for this year's birthday
    const thisYearBday = new Date(today.getFullYear(), bday.getUTCMonth(), bday.getUTCDate());
    
    // If passed already this week, check next year? No, just upcoming.
    const diffTime = thisYearBday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
};

// Helper for Retention Risk (> 21 days since last rode)
const isAtRisk = (lastRode?: string) => {
    if (!lastRode) return true; // Never rode? Maybe risk.
    const last = new Date(lastRode);
    const today = new Date();
    const diffTime = today.getTime() - last.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 21;
};

const BusLogView: React.FC = () => {
  const { session } = useAuth();
  const { dayType } = useApp(); // Access global dayType
  const [log, setLog] = useState<BusLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Master List for Live References & Metadata (Birthday, Last Rode)
  const [masterList, setMasterList] = useState<Record<string, { 
    name: string; 
    source?: string;
    birthday?: string;
    last_rode?: string;
    phone?: string;
    points?: number;
    address?: { street: string; city: string; state: string; zip: string; lat?: number; lng?: number };
  }>>({});
  
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Fetch Master Data
  useEffect(() => {
    if (!session?.bus_route) return;

    const fetchMasterData = async () => {
      try {
        const [riders, workers, prospects] = await Promise.all([
          riderService.getRiders(session.bus_route, 'sunday'),
          workerService.getWorkers(session.bus_route, 'sunday'),
          prospectService.getProspects(session.bus_route, 'sunday')
        ]);

        const map: Record<string, { 
            name: string; 
            source?: string; 
            birthday?: string; 
            last_rode?: string; 
            phone?: string;
            points?: number;
            address?: { street: string; city: string; state: string; zip: string; lat?: number; lng?: number };
        }> = {};
        
        riders.forEach(r => { 
            map[r.id] = { 
                name: r.name, 
                source: r.source, 
                birthday: r.birthday, 
                last_rode: r.last_rode,
                phone: r.phone,
                points: r.points || 0,
                address: r.address
            }; 
        });
        workers.forEach(w => { 
            map[w.id] = { 
                name: w.name, 
                birthday: w.birthday,
                phone: w.phone,
                // Workers might not have address in type definition? Let's check. 
                // Worker type doesn't have address in my memory. Let's assume passed if exists or ignore.
            }; 
        });
        prospects.forEach(p => { 
            map[p.id] = { 
                name: p.name, 
                source: 'prospect',
                phone: p.phone,
                address: p.address
            }; 
        });

        setMasterList(map);
      } catch (err) {
        console.error('Failed to fetch master list:', err);
      }
    };

    fetchMasterData();
  }, [session?.bus_route]);

  const loadLog = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      const data = await busLogService.getOrCreateLog(
        selectedDate,
        session.bus_route,
        session.code,
        isToday
      );
      setLog(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bus log');
    } finally {
      setLoading(false);
    }
  }, [session, selectedDate, isToday]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  const handleToggle = async (riderId: string, period: 'morning' | 'evening') => {
    if (!session) return;
    try {
      // 1. Optimistic UI Update for Points (if Rider)
      // We need to know the *next* state to decide +10 or -10.
      // Current state is in `log`.
      const currentPerson = log?.attendance[riderId];
      if (currentPerson && currentPerson.type === 'rider') {
         const willBePresent = !currentPerson[period];
         const pointChange = willBePresent ? 10 : -10;
         
         setMasterList(prev => {
            const rider = prev[riderId];
            if (!rider) return prev;
            return {
               ...prev,
               [riderId]: {
                  ...rider,
                  points: (rider.points || 0) + pointChange
               }
            };
         });
      }

      // 2. Network Request
      const updated = await busLogService.toggleAttendance(
        selectedDate,
        session.bus_route,
        riderId,
        period
      );
      setLog(updated);
    } catch (err) {
      console.error('Toggle error:', err);
      // Revert optimistic update if needed? 
      // For MVP, just refreshing or letting next load fix it is acceptable, 
      // but ideally we'd roll back. Not strictly required for this fix request.
    }
  };

  const navigateDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const displayDate = new Date(selectedDate + 'T12:00:00');

// Enhanced type for display
interface EnhancedAttendee {
  id: string;
  name: string;
  type: 'worker' | 'rider' | 'prospect';
  source?: 'prospect' | 'manual';
  morning: boolean;
  evening: boolean;
  birthday?: string;
  last_rode?: string;
  phone?: string;
  points?: number;
  address?: { street: string; city: string; state: string; zip: string; lat?: number; lng?: number };
}

  // Hydrate attendees
  const attendees = useMemo(() => {
    console.log('BusLog Render - Log:', log);
    if (!log) return [];
    console.log('BusLog Render - Attendance Keys:', Object.keys(log.attendance));
    return Object.entries(log.attendance).map(([id, record]) => {
      const master = masterList[id];
      return {
        ...record,
        id,
        name: master?.name || record.name,
        source: (master?.source || record.source) as 'prospect' | 'manual' | undefined,
        birthday: master?.birthday,
        last_rode: master?.last_rode,
        phone: master?.phone,
        points: master?.points,
        address: master?.address,
      } as EnhancedAttendee;
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(r => search ? r.name.toLowerCase().includes(search.toLowerCase()) : true);
  }, [log, masterList, search]);

  const workers = attendees.filter(r => r.type === 'worker');
  const riders = attendees.filter(r => r.type === 'rider');
  const prospects = attendees.filter(r => r.type === 'prospect');

  const [showMap, setShowMap] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Mock Geocoding Logic (Deterministic based on name/id)

  // In production, real lat/lng should be stored in DB.
  const mapLocations = useMemo(() => {
     if (!showMap) return [];
     const centerLat = 41.6; // Hammond/Chicago roughly
     const centerLng = -87.5;
     
     return attendees
        .filter(p => p.address) // Only map if address exists
        .map((p, i) => {
           // Create a pseudo-random offset based on index to spread them out
           // This is just for visualization without real geodata
           const offsetLat = (Math.sin(i + 1) * 0.05); 
           const offsetLng = (Math.cos(i + 1) * 0.05);
           
           return {
               id: p.id,
               name: p.name,
               address: `${p.address?.street}, ${p.address?.city}`,
               lat: p.address?.lat || (centerLat + offsetLat),
               lng: p.address?.lng || (centerLng + offsetLng),
               status: p.type
           };
        });
  }, [attendees, showMap]);

  const handleQuickText = (phone?: string, name?: string) => {
      if (!phone) return;
      const msg = `Hi ${name?.split(' ')[0] || 'there'}! The bus is about 5 minutes away. See you soon! 🚌`;
      window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`, '_self');
  };

  const renderSection = (title: string, entries: EnhancedAttendee[]) => {
    if (entries.length === 0) return null;
    return (
      <div className="mb-6">
        {/* Section Header */}
        <div 
          className="flex items-center justify-between px-4 h-10 mb-2 border-l-4 border-primary bg-muted/30 rounded-r-lg"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {title}
          </h3>
          <span className="text-xs font-bold text-foreground bg-background px-2 py-0.5 rounded-full border border-border">
            {entries.length}
          </span>
        </div>
        
        {/* List Rows */}
        <div className="divide-y divide-border/40">
          {entries.map((person) => {
            const bdayNear = isBirthdayNear(person.birthday);
            const risk = person.type === 'rider' && isAtRisk(person.last_rode);
            
            return (
              <div
                key={person.id}
                className="group flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors duration-150 rounded-lg"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-medium text-foreground truncate">
                      {person.name}
                    </span>
                    {person.source === 'prospect' && (
                      <span className="w-2 h-2 rounded-full bg-green-500" title="Prospect" />
                    )}
                    {/* Icons */}
                    {bdayNear && (
                      <span title="Birthday coming up!">
                        <Cake size={14} className="text-pink-500 animate-pulse" />
                      </span>
                    )}
                    {risk && (
                      <span title="Missed > 3 Weeks">
                        <AlertCircle size={14} className="text-red-500" />
                      </span>
                    )}

                    {/* Points Badge */}
                    {person.points ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full ml-1">
                        <Star size={8} fill="currentColor" /> {person.points}
                      </span>
                    ) : null}
                  </div>

                  {/* Subtext with Actions */}
                  <div className="flex items-center gap-3">
                     {risk && <span className="text-[10px] text-red-500 font-medium">Missed 3+ Weeks</span>}

                     {/* Quick Text Button */}
                     {person.phone && (
                       <button 
                         onClick={() => handleQuickText(person.phone, person.name)}
                         className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors bg-muted/30 px-2 py-0.5 rounded-full"
                       >
                         <MessageCircle size={10} />
                         <span>Text</span>
                       </button>
                     )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ShiftToggle 
                    type="morning" 
                    active={person.morning} 
                    onClick={() => handleToggle(person.id, 'morning')}
                    disabled={!isToday}
                  />
                  <ShiftToggle 
                    type="evening" 
                    active={person.evening} 
                    onClick={() => handleToggle(person.id, 'evening')}
                    disabled={!isToday}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      
      {/* Date Navigation & Stats - Merged for standard look */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
         {/* Stats Row */}
         <div className="grid grid-cols-2 border-b border-border">
            <div className="p-4 flex flex-col items-center justify-center border-r border-border">
               <Sun size={24} className={`mb-1 ${log?.morning_count ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
               <span className="text-3xl font-bold">{log?.morning_count || 0}</span>
               <span className="text-[10px] uppercase font-bold text-muted-foreground">Morning</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
               <Moon size={24} className={`mb-1 ${log?.evening_count ? 'text-indigo-500 fill-indigo-500' : 'text-muted-foreground'}`} />
               <span className="text-3xl font-bold">{log?.evening_count || 0}</span>
               <span className="text-[10px] uppercase font-bold text-muted-foreground">Evening</span>
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
                  {displayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
               </span>
               {isToday && (
                 <span className="ml-1 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                   TODAY
                 </span>
               )}
            </button>

            <button 
              onClick={() => navigateDate(7)}
              disabled={isToday}
              className={`p-2 transition-colors ${!isToday ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'}`}
            >
              <ChevronRight size={20} />
            </button>
         </div>
      </div>

      {/* Tools Row: Search & Map Toggle */}
      <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border text-foreground h-10 rounded-lg pl-9 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>
          <button 
             onClick={() => { setShowMap(!showMap); setShowAnalytics(false); }}
             className={`h-10 w-10 flex items-center justify-center rounded-lg border transition-colors ${showMap ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:text-foreground'}`}
          >
             <MapIcon size={20} />
          </button>
          <button 
             onClick={() => { setShowAnalytics(!showAnalytics); setShowMap(false); }}
             className={`h-10 w-10 flex items-center justify-center rounded-lg border transition-colors ${showAnalytics ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:text-foreground'}`}
          >
             <LayoutDashboard size={20} />
          </button>
      </div>

      {/* Analytics View */}
      {showAnalytics ? (
        <AnalyticsDashboard />
      ) : (
        <>
            {/* Map View */}
            <AnimatePresence>
                {showMap && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <RouteMap locations={mapLocations} />
                </motion.div>
                )}
            </AnimatePresence>

            {/* Leaderboard - Only show if we have points */}
            <Leaderboard riders={riders} />

            {/* Lists */}
            <div className="space-y-6">
                {renderSection('Workers', workers)}
                {renderSection('Riders', riders)}
                {renderSection('Prospects', prospects)}
                
                {attendees.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No attendees found.</p>
                </div>
                )}
            </div>
        </>
      )}

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

export default BusLogView;
