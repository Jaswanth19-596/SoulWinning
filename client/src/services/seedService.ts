import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const DEFAULT_KEYS = [
  { code: 'BUS1', role: 'captain', bus_route: 'Route 1', section: 'Main', label: 'Bus 1 Captain' },
  { code: 'BUS1W', role: 'worker', bus_route: 'Route 1', section: 'Main', label: 'Bus 1 Worker' },
  { code: 'BUS2', role: 'captain', bus_route: 'Route 2', section: 'North', label: 'Bus 2 Captain' },
  { code: 'BUS2W', role: 'worker', bus_route: 'Route 2', section: 'North', label: 'Bus 2 Worker' },
];

export const seedService = {
  async seed() {
    try {
      const keysRef = collection(db, 'bus_keys');
      const snapshot = await getDocs(keysRef);
      
      if (snapshot.empty) {
        console.log('Seeding bus keys...');
        for (const key of DEFAULT_KEYS) {
          await addDoc(keysRef, {
            ...key,
            created_at: new Date().toISOString(),
          });
        }
        console.log('✅ Bus keys seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }
};
