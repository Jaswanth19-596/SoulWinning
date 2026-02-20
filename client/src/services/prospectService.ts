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
import { Prospect, CreateProspectData, DayType, WeeklyNote } from '../types';

export const prospectService = {
  async getProspects(busRoute: string, dayType: DayType): Promise<Prospect[]> {
    const q = query(
      collection(db, 'prospects'),
      where('bus_route', '==', busRoute),
      where('day_type', '==', dayType),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p: any) => p.status !== 'converted') as Prospect[];
  },

  async getProspect(id: string): Promise<Prospect> {
    const docSnap = await getDoc(doc(db, 'prospects', id));
    if (!docSnap.exists()) throw new Error('Prospect not found');
    return { id: docSnap.id, ...docSnap.data() } as Prospect;
  },

  async createProspect(data: CreateProspectData): Promise<Prospect> {
    const now = new Date().toISOString();
    const prospectData: Record<string, any> = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    // Strip undefined values — Firestore rejects them
    Object.keys(prospectData).forEach(key => {
      if (prospectData[key] === undefined) delete prospectData[key];
      if (key === 'address' && typeof prospectData[key] === 'object') {
        Object.keys(prospectData[key]).forEach(k => {
          if (prospectData[key][k] === undefined) delete prospectData[key][k];
        });
      }
    });
    const docRef = await addDoc(collection(db, 'prospects'), prospectData);
    return { id: docRef.id, ...prospectData, created_at: now, updated_at: now } as Prospect;
  },

  async updateProspect(id: string, data: Partial<Prospect>): Promise<void> {
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

    await updateDoc(doc(db, 'prospects', id), {
      ...cleanData,
      updated_at: new Date().toISOString(),
    });
  },

  async deleteProspect(id: string): Promise<void> {
    await deleteDoc(doc(db, 'prospects', id));
  },

  async searchProspects(busRoute: string, dayType: DayType, searchTerm: string): Promise<Prospect[]> {
    const all = await this.getProspects(busRoute, dayType);
    const term = searchTerm.toLowerCase();
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.phone?.toLowerCase().includes(term) ||
        p.address?.street?.toLowerCase().includes(term) ||
        (p.notes || '').toLowerCase().includes(term)
    );
  },

  async addNote(prospectId: string, text: string): Promise<WeeklyNote> {
    const note: WeeklyNote = {
      id: crypto.randomUUID(),
      text: text.trim(),
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'prospects', prospectId), {
      weekly_notes: arrayUnion(note),
      updated_at: new Date().toISOString(),
    });
    return note;
  },

  async deleteNote(prospectId: string, noteId: string): Promise<void> {
    const ref = doc(db, 'prospects', prospectId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Prospect not found');
    const data = snap.data();
    const notes = (data.weekly_notes || []).filter((n: WeeklyNote) => n.id !== noteId);
    await updateDoc(ref, {
      weekly_notes: notes,
      updated_at: new Date().toISOString(),
    });
  },
};
