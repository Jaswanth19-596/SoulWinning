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
import { Worker, CreateWorkerData, DayType, AttendanceLog } from '../types';

export const workerService = {
  async getWorkers(busRoute: string, dayType: DayType): Promise<Worker[]> {
    const q = query(
      collection(db, 'workers'),
      where('bus_route', '==', busRoute),
      where('day_type', '==', dayType),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Worker[];
  },

  async getWorker(id: string): Promise<Worker> {
    const docSnap = await getDoc(doc(db, 'workers', id));
    if (!docSnap.exists()) throw new Error('Worker not found');
    return { id: docSnap.id, ...docSnap.data() } as Worker;
  },

  async createWorker(data: CreateWorkerData): Promise<Worker> {
    const now = new Date().toISOString();
    const workerData = {
      ...data,
      attendance_log: [],
      created_at: now,
      updated_at: now,
    };
    const docRef = await addDoc(collection(db, 'workers'), workerData);
    return { id: docRef.id, ...workerData } as Worker;
  },

  async updateWorker(id: string, data: Partial<Worker>): Promise<void> {
    const { id: _, ...updateData } = data as any;
    
    // Sanitize
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    await updateDoc(doc(db, 'workers', id), {
      ...updateData,
      updated_at: new Date().toISOString(),
    });
  },

  async deleteWorker(id: string): Promise<void> {
    await deleteDoc(doc(db, 'workers', id));
  },

  async logAttendance(id: string, date?: string): Promise<void> {
    const worker = await this.getWorker(id);
    const attendDate = date || new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const existingIndex = (worker.attendance_log || []).findIndex(
      (a) => a.date === attendDate
    );

    let updatedLog = [...(worker.attendance_log || [])];
    if (existingIndex >= 0) {
      updatedLog.splice(existingIndex, 1);
    } else {
      updatedLog.push({ date: attendDate, present: true, timestamp: now });
    }

    updatedLog.sort((a, b) => b.date.localeCompare(a.date));

    await updateDoc(doc(db, 'workers', id), {
      attendance_log: updatedLog,
      updated_at: now,
    });
  },
};
