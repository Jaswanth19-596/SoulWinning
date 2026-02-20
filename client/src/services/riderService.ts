import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Rider, CreateRiderData, DayType, WeeklyNote } from '../types';

export const riderService = {
  async getRiders(busRoute: string, dayType: DayType): Promise<Rider[]> {
    const q = query(
      collection(db, 'riders'),
      where('bus_route', '==', busRoute),
      where('day_type', '==', dayType),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Rider[];
  },

  async getRider(id: string): Promise<Rider> {
    const docSnap = await getDoc(doc(db, 'riders', id));
    if (!docSnap.exists()) throw new Error('Rider not found');
    return { id: docSnap.id, ...docSnap.data() } as Rider;
  },

  async createRider(data: CreateRiderData): Promise<Rider> {
    const now = new Date().toISOString();
    const riderData: Record<string, any> = {
      ...data,
      visit_history: [],
      points: 0,
      points_history: [],
      created_at: now,
      updated_at: now,
    };
    // Strip undefined values — Firestore rejects them
    Object.keys(riderData).forEach(key => {
      if (riderData[key] === undefined) delete riderData[key];
      if (key === 'address' && typeof riderData[key] === 'object') {
        Object.keys(riderData[key]).forEach(k => {
          if (riderData[key][k] === undefined) delete riderData[key][k];
        });
      }
    });
    const docRef = await addDoc(collection(db, 'riders'), riderData);
    return { id: docRef.id, ...riderData } as Rider;
  },

  async updateRider(id: string, data: Partial<Rider>): Promise<void> {
    const { id: _, ...updateData } = data as any;
    
    // Sanitize: recursively remove undefined values (Firestore rejects them)
    const stripUndefined = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (Array.isArray(obj)) return obj.map(stripUndefined);
      if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const [k, v] of Object.entries(obj)) {
          if (v !== undefined) {
            cleaned[k] = typeof v === 'object' && v !== null ? stripUndefined(v) : v;
          }
        }
        return cleaned;
      }
      return obj;
    };
    const cleanData = stripUndefined(updateData);

    await updateDoc(doc(db, 'riders', id), {
      ...cleanData,
      updated_at: new Date().toISOString(),
    });
  },

  async deleteRider(id: string): Promise<void> {
    await deleteDoc(doc(db, 'riders', id));
  },

  async logVisit(id: string, date?: string): Promise<void> {
    const rider = await this.getRider(id);
    const visitDate = date || new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if already visited on this date
    const existingIndex = (rider.visit_history || []).findIndex(
      (v) => v.date === visitDate
    );

    let updatedHistory = [...(rider.visit_history || [])];
    if (existingIndex >= 0) {
      // Toggle off
      updatedHistory.splice(existingIndex, 1);
    } else {
      // Toggle on
      updatedHistory.push({
        date: visitDate,
        visited: true,
        timestamp: now,
      });
    }

    // Sort by date desc
    updatedHistory.sort((a, b) => b.date.localeCompare(a.date));

    await updateDoc(doc(db, 'riders', id), {
      visit_history: updatedHistory,
      last_visited: updatedHistory.length > 0 ? updatedHistory[0].date : null,
      updated_at: now,
    });
  },

  async logRide(id: string, date?: string): Promise<void> {
    const rideDate = date || new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const rider = await this.getRider(id);

    // Use visit_history for rides too — "visited" means "rode the bus" on Sunday
    const existingIndex = (rider.visit_history || []).findIndex(
      (v) => v.date === rideDate
    );

    let updatedHistory = [...(rider.visit_history || [])];
    if (existingIndex >= 0) {
      updatedHistory.splice(existingIndex, 1);
    } else {
      updatedHistory.push({ date: rideDate, visited: true, timestamp: now });
    }

    updatedHistory.sort((a, b) => b.date.localeCompare(a.date));

    await updateDoc(doc(db, 'riders', id), {
      visit_history: updatedHistory,
      last_rode: updatedHistory.length > 0 ? updatedHistory[0].date : null,
      updated_at: now,
    });
  },

  async searchRiders(busRoute: string, dayType: DayType, searchTerm: string): Promise<Rider[]> {
    const all = await this.getRiders(busRoute, dayType);
    const term = searchTerm.toLowerCase();
    return all.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.phone?.toLowerCase().includes(term) ||
        r.address?.street?.toLowerCase().includes(term)
    );
  },

  async addNote(riderId: string, text: string): Promise<WeeklyNote> {
    const note: WeeklyNote = {
      id: crypto.randomUUID(),
      text: text.trim(),
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'riders', riderId), {
      weekly_notes: arrayUnion(note),
      updated_at: new Date().toISOString(),
    });
    return note;
  },

  async deleteNote(riderId: string, noteId: string): Promise<void> {
    const ref = doc(db, 'riders', riderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Rider not found');
    const data = snap.data();
    const notes = (data.weekly_notes || []).filter((n: WeeklyNote) => n.id !== noteId);
    await updateDoc(ref, {
      weekly_notes: notes,
      updated_at: new Date().toISOString(),
    });
  },
};
