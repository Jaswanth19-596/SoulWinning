// Firestore Seed Script — Run once to create initial bus keys
// Usage: Copy this content into the browser console on any page where the Firebase SDK is loaded,
// or run via: node --require ts-node/register scripts/seed.ts

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export async function seedBusKeys() {
  const busKeys = [
    {
      code: 'BUS1',
      role: 'captain',
      bus_route: 'Route 1',
      section: 'Main',
      label: 'Bus 1 Captain',
    },
    {
      code: 'BUS1W',
      role: 'worker',
      bus_route: 'Route 1',
      section: 'Main',
      label: 'Bus 1 Worker',
    },
    {
      code: 'BUS2',
      role: 'captain',
      bus_route: 'Route 2',
      section: 'North',
      label: 'Bus 2 Captain',
    },
    {
      code: 'BUS2W',
      role: 'worker',
      bus_route: 'Route 2',
      section: 'North',
      label: 'Bus 2 Worker',
    },
    {
      code: 'BUS3',
      role: 'captain',
      bus_route: 'Route 3',
      section: 'North',
      label: 'Bus 3 Captain',
    },
    {
      code: 'BUS3W',
      role: 'worker',
      bus_route: 'Route 3',
      section: 'North',
      label: 'Bus 3 Worker',
    },
  ];

  for (const key of busKeys) {
    // Check if key already exists
    const existing = await getDocs(
      query(collection(db, 'bus_keys'), where('code', '==', key.code))
    );
    if (existing.empty) {
      await addDoc(collection(db, 'bus_keys'), {
        ...key,
        created_at: new Date().toISOString(),
      });
      console.log(`✅ Created key: ${key.code} (${key.label})`);
    } else {
      console.log(`⏭️ Key ${key.code} already exists`);
    }
  }

  console.log('🎉 Seed complete!');
}
