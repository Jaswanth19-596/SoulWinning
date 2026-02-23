/**
 * Seed Script — Adds 100 prospects, 100 riders, 150 workers to BUS1 ("Route 1")
 *
 * Usage:  node client/src/scripts/seedTestData.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, writeBatch, doc } from 'firebase/firestore';
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

// ─── Data Pools ──────────────────────────────────────────────
const FIRST_NAMES_MALE = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
  'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
  'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott',
  'Brandon', 'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Frank', 'Alexander',
  'Patrick', 'Jack', 'Dennis', 'Jerry',
];

const FIRST_NAMES_FEMALE = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan',
  'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra',
  'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol',
  'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura',
  'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela',
  'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine', 'Christine', 'Debra',
  'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
  'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans',
  'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
];

const STREETS = [
  'Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Pine Rd',
  'Washington Blvd', 'Lake Shore Dr', 'Highland Ave', 'Park Place',
  'Church St', 'Spring St', 'Valley Rd', 'Sunset Blvd', 'River Rd',
  'Forest Ave', 'Meadow Ln', 'Hill St', 'Lincoln Ave', 'Franklin St',
  'Jefferson Ave', 'Madison Dr', 'Monroe St', 'Jackson Blvd', 'Adams St',
  'Birch Ct', 'Walnut Ave', 'Chestnut St', 'Willow Way', 'Poplar Dr',
  'Dogwood Ln', 'Magnolia Blvd', 'Hickory St', 'Sycamore Rd', 'Ash Ave',
];

const CITIES = ['Hammond', 'East Chicago', 'Gary', 'Munster', 'Highland', 'Griffith', 'Whiting', 'Calumet City'];
const STATES = ['IN', 'IL'];
const SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E'];
const INTEREST_LEVELS = ['very', 'somewhat', 'neutral'];
const STATUSES = ['active'];
const NOTES_POOL = [
  'Seemed very interested in learning more about the Bible.',
  'Family was home, spoke with the mother.',
  'Not home — left a flyer on the door.',
  'Had a great conversation about faith.',
  'Invited to Sunday service, seemed excited.',
  'Kids were playing outside, talked to the father.',
  'Asked about Bible study options.',
  'Mentioned they used to attend church years ago.',
  'Very friendly, offered us water.',
  'Said they would think about it and let us know.',
  'Prayed together on the porch.',
  'Has health concerns, asked for prayer.',
  'Recently moved to the area, looking for a church.',
  'Speaks Spanish primarily, will need bilingual worker.',
  'Single parent, could use help with kids on Sunday.',
  'Already attends another church but open to visiting.',
  'Elderly couple, very welcoming.',
  'Teenager answered the door, parents not home.',
  'Asked about transportation to church.',
  'Was doing yard work, chatted briefly.',
];

// ─── Helpers ──────────────────────────────────────────────
const BUS_ROUTE = 'Route 1';

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randomPhone() {
  return `(${randInt(200, 999)}) ${randInt(200, 999)}-${String(randInt(1000, 9999))}`;
}

function randomAddress() {
  return {
    street: `${randInt(100, 9999)} ${rand(STREETS)}`,
    city: rand(CITIES),
    state: rand(STATES),
    zip: String(randInt(46300, 46499)),
  };
}

function randomName() {
  const isMale = Math.random() > 0.5;
  const first = isMale ? rand(FIRST_NAMES_MALE) : rand(FIRST_NAMES_FEMALE);
  const last = rand(LAST_NAMES);
  return { name: `${first} ${last}`, gender: isMale ? 'male' : 'female' };
}

function randomBirthday() {
  // Random month/day for birthday (YYYY-MM-DD format, year 1960-2015)
  const year = randInt(1960, 2015);
  const month = String(randInt(1, 12)).padStart(2, '0');
  const day = String(randInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function randomDatePast(daysBack = 90) {
  const d = new Date();
  d.setDate(d.getDate() - randInt(1, daysBack));
  return d.toISOString().split('T')[0];
}

function randomEmail(name) {
  const clean = name.toLowerCase().replace(/\s/g, '.');
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
  return `${clean}${randInt(1, 99)}@${rand(domains)}`;
}

// ─── Batch Writer (Firestore limit: 500 ops per batch) ───
async function batchWrite(collectionName, docs) {
  const BATCH_SIZE = 400; // safe under 500 limit
  let written = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + BATCH_SIZE);

    for (const data of chunk) {
      const ref = doc(collection(db, collectionName));
      batch.set(ref, data);
    }

    await batch.commit();
    written += chunk.length;
    console.log(`  ✅ ${collectionName}: ${written}/${docs.length} written`);
  }
}

// ─── Generate Prospects ──────────────────────────────────
function generateProspects(count) {
  const now = new Date().toISOString();
  return Array.from({ length: count }, () => {
    const { name, gender } = randomName();
    return {
      name,
      gender,
      phone: randomPhone(),
      email: Math.random() > 0.6 ? randomEmail(name) : undefined,
      address: randomAddress(),
      date_contacted: randomDatePast(60),
      interest_level: rand(INTEREST_LEVELS),
      notes: rand(NOTES_POOL),
      weekly_notes: [],
      status: 'active',
      day_type: 'sunday',
      bus_route: BUS_ROUTE,
      created_at: now,
      updated_at: now,
    };
  }).map(stripUndefined);
}

// ─── Generate Riders ──────────────────────────────────────
function generateRiders(count) {
  const now = new Date().toISOString();
  return Array.from({ length: count }, () => {
    const { name, gender } = randomName();
    const hasEmergency = Math.random() > 0.5;
    const { name: emergName } = randomName();

    // Generate some visit history (0-8 visits)
    const visitCount = randInt(0, 8);
    const visit_history = Array.from({ length: visitCount }, () => {
      const date = randomDatePast(56); // last 8 weeks
      return { date, visited: true, timestamp: new Date().toISOString() };
    }).sort((a, b) => b.date.localeCompare(a.date));

    // Generate some points history
    const points_history = visit_history
      .filter(() => Math.random() > 0.3)
      .map(v => ({
        date: v.date,
        amount: 30,
        reason: Math.random() > 0.5 ? 'morning' : 'evening',
        timestamp: v.timestamp,
      }));

    const totalPoints = points_history.reduce((sum, p) => sum + p.amount, 0);

    return {
      name,
      gender,
      phone: randomPhone(),
      email: Math.random() > 0.7 ? randomEmail(name) : undefined,
      address: randomAddress(),
      emergency_contact: hasEmergency ? emergName : undefined,
      emergency_phone: hasEmergency ? randomPhone() : undefined,
      bus_route: BUS_ROUTE,
      source: Math.random() > 0.5 ? 'prospect' : 'manual',
      day_type: 'sunday',
      visit_history,
      last_visited: visit_history.length > 0 ? visit_history[0].date : undefined,
      last_rode: visit_history.length > 0 ? visit_history[0].date : undefined,
      notes: Math.random() > 0.5 ? rand(NOTES_POOL) : undefined,
      weekly_notes: [],
      status: 'active',
      birthday: Math.random() > 0.3 ? randomBirthday() : undefined,
      points: totalPoints,
      points_history,
      salvation_date: Math.random() > 0.8 ? randomDatePast(180) : undefined,
      baptism_date: Math.random() > 0.9 ? randomDatePast(120) : undefined,
      created_at: now,
      updated_at: now,
    };
  }).map(stripUndefined);
}

// ─── Generate Workers ──────────────────────────────────────
function generateWorkers(count) {
  const now = new Date().toISOString();
  return Array.from({ length: count }, () => {
    const { name, gender } = randomName();

    // Generate attendance history (0-10 entries)
    const attendCount = randInt(0, 10);
    const attendance_log = Array.from({ length: attendCount }, () => {
      const date = randomDatePast(70);
      return { date, present: true, timestamp: new Date().toISOString() };
    }).sort((a, b) => b.date.localeCompare(a.date));

    return {
      name,
      gender,
      phone: randomPhone(),
      email: Math.random() > 0.6 ? randomEmail(name) : undefined,
      assigned_section: rand(SECTIONS),
      bus_route: BUS_ROUTE,
      day_type: 'sunday',
      attendance_log,
      status: 'active',
      birthday: Math.random() > 0.4 ? randomBirthday() : undefined,
      created_at: now,
      updated_at: now,
    };
  }).map(stripUndefined);
}

// ─── Strip undefined fields (Firestore rejects them) ─────
function stripUndefined(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = stripUndefined(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// ─── Main ──────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding test data for Route 1 (BUS1)...\n');

  const prospects = generateProspects(100);
  console.log(`📋 Generated 100 prospects`);

  const riders = generateRiders(100);
  console.log(`🚌 Generated 100 riders`);

  const workers = generateWorkers(150);
  console.log(`👷 Generated 150 workers\n`);

  console.log('Writing to Firestore...\n');

  await batchWrite('prospects', prospects);
  await batchWrite('riders', riders);
  await batchWrite('workers', workers);

  console.log('\n✅ Done! 100 prospects + 100 riders + 150 workers seeded to Route 1.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
