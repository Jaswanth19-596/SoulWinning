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
import { Prospect, CreateProspectData, DayType } from '../types';

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
    const docRef = await addDoc(collection(db, 'prospects'), {
      ...data,
      created_at: now,
      updated_at: now,
    });
    return { id: docRef.id, ...data, created_at: now, updated_at: now } as Prospect;
  },

  async updateProspect(id: string, data: Partial<Prospect>): Promise<void> {
    const { id: _, ...updateData } = data as any;
    
    // Sanitize
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    await updateDoc(doc(db, 'prospects', id), {
      ...updateData,
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
        p.address.street.toLowerCase().includes(term) ||
        p.notes.toLowerCase().includes(term)
    );
  },
};
