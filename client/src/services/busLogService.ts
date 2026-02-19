import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { riderService } from './riderService';
import { workerService } from './workerService';
import { prospectService } from './prospectService';

export interface AttendeeRecord {
  name: string;
  type: 'worker' | 'rider' | 'prospect';
  source?: 'prospect' | 'manual';
  morning: boolean;
  evening: boolean;
}

export interface BusLog {
  id: string;
  date: string;
  bus_route: string;
  attendance: Record<string, AttendeeRecord>;
  morning_count: number;
  evening_count: number;
  created_by: string;
  updated_at: string;
}

function makeDocId(date: string, busRoute: string) {
  return `${date}_${busRoute.replace(/\s+/g, '-')}`;
}

export const busLogService = {
  /**
   * Get or create a bus log for a given date and route.
   * If none exists and allowCreate is true, auto-populate.
   */
  async getOrCreateLog(date: string, busRoute: string, createdBy: string, allowCreate = true): Promise<BusLog | null> {
    const docId = makeDocId(date, busRoute);
    const docRef = doc(db, 'bus_logs', docId);
    const snap = await getDoc(docRef);

    // If viewing past/future date and no log exists, don't create unless specified
    if (!snap.exists() && !allowCreate) {
      return null;
    }

    // Get all current active people to sync
    const [riders, workers, prospects] = await Promise.all([
      riderService.getRiders(busRoute, 'sunday'),
      workerService.getWorkers(busRoute, 'sunday'),
      prospectService.getProspects(busRoute, 'sunday'),
    ]);

    const allAttendees: { id: string; name: string; type: 'worker' | 'rider' | 'prospect'; source?: string }[] = [
      ...workers.map((w) => ({ id: w.id, name: w.name, type: 'worker' as const })),
      ...riders.map((r) => ({ id: r.id, name: r.name, type: 'rider' as const, source: r.source })),
      ...prospects.map((p) => ({ id: p.id, name: p.name, type: 'prospect' as const })),
    ];

    if (snap.exists()) {
      const log = { id: snap.id, ...snap.data() } as BusLog;
      
      // Check for attendees missing from this log
      let changed = false;
      const attendance = { ...log.attendance };
      
      allAttendees.forEach(p => {
        const existing = attendance[p.id];
        if (!existing) {
          // Add new person
          attendance[p.id] = { name: p.name, type: p.type, morning: false, evening: false };
          changed = true;
        } else if (existing.type !== p.type || (p.type === 'rider' && p.source !== existing.source)) {
          // Fix missing/incorrect type or source
          const updatedRecord = { ...existing, type: p.type };
          if (p.source) {
             updatedRecord.source = p.source as any;
          } else {
             delete updatedRecord.source;
          }
          attendance[p.id] = updatedRecord;
          changed = true;
        }
      });

      // Remove stale prospects (those who were converted or deleted)
      const currentProspectIds = new Set(prospects.map(p => p.id));
      Object.keys(attendance).forEach(id => {
        const person = attendance[id];
        if (person.type === 'prospect' && !currentProspectIds.has(id)) {
          delete attendance[id];
          changed = true;
        }
      });

      if (changed) {
        await updateDoc(docRef, { attendance });
        log.attendance = attendance;
      }
      
      return log;
    }

    // Create new log
    const attendance: Record<string, AttendeeRecord> = {};
    allAttendees.forEach((p) => {
      attendance[p.id] = {
        name: p.name,
        type: p.type,
        morning: false,
        evening: false,
      };
    });

    const newLog: Omit<BusLog, 'id'> = {
      date,
      bus_route: busRoute,
      attendance,
      morning_count: 0,
      evening_count: 0,
      created_by: createdBy,
      updated_at: new Date().toISOString(),
    };

    await setDoc(docRef, newLog);
    return { id: docId, ...newLog };
  },

  /**
   * Toggle an attendee's presence for morning or evening.
   */
  async toggleAttendance(
    date: string,
    busRoute: string,
    personId: string,
    period: 'morning' | 'evening'
  ): Promise<BusLog> {
    const docId = makeDocId(date, busRoute);
    const docRef = doc(db, 'bus_logs', docId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) throw new Error('Bus log not found');

    const data = snap.data() as Omit<BusLog, 'id'>;
    const person = data.attendance[personId];
    if (!person) throw new Error('Person not in log');

    // Toggle
    person[period] = !person[period];
    const isPresent = person[period]; // Capture new state
    data.attendance[personId] = person;

    // Recount
    const entries = Object.values(data.attendance);
    data.morning_count = entries.filter((a) => a.morning).length;
    data.evening_count = entries.filter((a) => a.evening).length;
    data.updated_at = new Date().toISOString();

    await updateDoc(docRef, {
      attendance: data.attendance,
      morning_count: data.morning_count,
      evening_count: data.evening_count,
      updated_at: data.updated_at,
    });

    // SYNC TO RIDER RECORD FOR RETENTION & POINTS
    if (person.type === 'rider') {
      try {
        const riderRef = doc(db, 'riders', personId);
        const updates: any = { updated_at: new Date().toISOString() };
        
        // 1. Retention: Update last_rode if present
        if (isPresent) {
           updates.last_rode = date;
        }

        // 2. Gamification: Award/Revoke Points
        const pointAmount = isPresent ? 10 : -10;
        const reason = isPresent ? `Ride (${period}) - ${date}` : `Ride Cancelled (${period}) - ${date}`;
        
        const newLogEntry = {
            date: date,
            amount: pointAmount,
            reason: reason,
            timestamp: new Date().toISOString()
        };

        await updateDoc(riderRef, {
             ...updates,
             points: increment(pointAmount),
             points_history: arrayUnion(newLogEntry)
        });

      } catch (e) {
        console.error("Failed to sync rider data", e);
      }
    }

    return { id: docId, ...data };
  },

  /**
   * Get history of bus logs for a route (most recent first).
   */
  async getHistory(busRoute: string, limit = 20): Promise<BusLog[]> {
    const q = query(
      collection(db, 'bus_logs'),
      where('bus_route', '==', busRoute),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as BusLog[];
  },
};
