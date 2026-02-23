/**
 * Fix seeded prospects: delete the ones with day_type='saturday' and re-add with day_type='sunday'
 *
 * Usage:  node client/src/scripts/fixProspects.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load env vars from client/.env
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error('❌ Missing Firebase config. Make sure client/.env exists with REACT_APP_FIREBASE_* vars.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log('🔧 Fixing prospects: changing day_type from saturday → sunday...\n');

  // Find all prospects on Route 1 with day_type='saturday'
  const q = query(
    collection(db, 'prospects'),
    where('bus_route', '==', 'Route 1'),
    where('day_type', '==', 'saturday')
  );
  const snapshot = await getDocs(q);
  console.log(`Found ${snapshot.size} prospects with day_type='saturday'`);

  if (snapshot.size === 0) {
    console.log('Nothing to fix!');
    process.exit(0);
  }

  // Update in batches of 400
  const BATCH_SIZE = 400;
  const docs = snapshot.docs;
  let updated = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + BATCH_SIZE);

    for (const docSnap of chunk) {
      batch.update(docSnap.ref, { day_type: 'sunday' });
    }

    await batch.commit();
    updated += chunk.length;
    console.log(`  ✅ Updated ${updated}/${docs.length}`);
  }

  console.log(`\n✅ Done! ${updated} prospects updated to day_type='sunday'.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Fix failed:', err);
  process.exit(1);
});
