import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PrayerRequest } from '../types';

export const prayerService = {
  /**
   * Get prayer requests for a bus route (open + recently resolved).
   */
  async getRequests(busRoute: string): Promise<PrayerRequest[]> {
    const q = query(
      collection(db, 'prayer_requests'),
      where('bus_route', '==', busRoute),
      orderBy('created_at', 'desc'),
      firestoreLimit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as PrayerRequest[];
  },

  /**
   * Add a new prayer request.
   */
  async addRequest(text: string, busRoute: string, requestedBy: string): Promise<PrayerRequest> {
    const docRef = doc(collection(db, 'prayer_requests'));
    const now = new Date().toISOString();
    const data = {
      text: text.trim(),
      requested_by: requestedBy,
      bus_route: busRoute,
      resolved: false,
      created_at: now,
    };
    await setDoc(docRef, data);
    return { id: docRef.id, ...data };
  },

  /**
   * Toggle a prayer request's resolved status.
   */
  async toggleResolved(id: string, resolved: boolean): Promise<void> {
    const docRef = doc(db, 'prayer_requests', id);
    await updateDoc(docRef, {
      resolved,
      resolved_at: resolved ? new Date().toISOString() : null,
    });
  },

  /**
   * Delete a prayer request (captain only).
   */
  async deleteRequest(id: string): Promise<void> {
    await deleteDoc(doc(db, 'prayer_requests', id));
  },
};
