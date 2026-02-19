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
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Rider, CreateRiderData, DayType } from '../types';

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
    const riderData = {
      ...data,
      visit_history: [],
      points: 0,
      points_history: [],
      created_at: now,
      updated_at: now,
    };
    const docRef = await addDoc(collection(db, 'riders'), riderData);
    return { id: docRef.id, ...riderData } as Rider;
  },

  async updateRider(id: string, data: Partial<Rider>): Promise<void> {
    const { id: _, ...updateData } = data as any;
    
    // Sanitize undefined values for Firestore
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(doc(db, 'riders', id), {
      ...updateData,
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
        r.address.street.toLowerCase().includes(term)
    );
  },
};
