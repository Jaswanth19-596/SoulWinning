import {
  collection,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { AuthSession, BusKey } from '../types';

const SESSION_KEY = 'soul_winning_session';

export const authService = {
  async login(code: string): Promise<AuthSession> {
    // Look up the access code in Firestore
    const q = query(collection(db, 'bus_keys'), where('code', '==', code.trim().toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Invalid access code. Please check with your bus captain.');
    }

    const keyDoc = snapshot.docs[0];
    const keyData = keyDoc.data() as Omit<BusKey, 'id'>;

    const session: AuthSession = {
      keyId: keyDoc.id,
      code: keyData.code,
      role: keyData.role,
      bus_route: keyData.bus_route,
      section: keyData.section,
      label: keyData.label,
    };

    // Persist session
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  getSession(): AuthSession | null {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthSession;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  isCaptain(): boolean {
    const session = this.getSession();
    return session?.role === 'captain';
  },
};