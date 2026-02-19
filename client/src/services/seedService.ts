import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const DEFAULT_KEYS = [
  { code: 'BUS1', role: 'captain', bus_route: 'Route 1', section: 'Main', label: 'Bus 1 Captain' },
  { code: 'BUS1W', role: 'worker', bus_route: 'Route 1', section: 'Main', label: 'Bus 1 Worker' },
  { code: 'BUS2', role: 'captain', bus_route: 'Route 2', section: 'North', label: 'Bus 2 Captain' },
  { code: 'BUS2W', role: 'worker', bus_route: 'Route 2', section: 'North', label: 'Bus 2 Worker' },
  { code: 'BUS3', role: 'captain', bus_route: 'Route 3', section: 'South', label: 'Bus 3 Captain' },
  { code: 'BUS3W', role: 'worker', bus_route: 'Route 3', section: 'South', label: 'Bus 3 Worker' },
];

export const seedService = {
  async seed() {
    try {
      const keysRef = collection(db, 'bus_keys');
      const snapshot = await getDocs(keysRef);
      const existingCodes = new Set(snapshot.docs.map(doc => doc.data().code));
      
      console.log('Checking bus keys...');
      for (const key of DEFAULT_KEYS) {
        if (!existingCodes.has(key.code)) {
          console.log(`Seeding key: ${key.code}`);
          await addDoc(keysRef, {
            ...key,
            created_at: new Date().toISOString(),
          });
          console.log(`✅ Created key: ${key.code}`);
        }
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }
};
