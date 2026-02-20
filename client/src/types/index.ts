// =============================================
// Soul Winning & Bus Ministry Manager — Types
// =============================================

// Authentication & Access
export interface BusKey {
  id: string;
  code: string;
  role: 'worker' | 'captain';
  bus_route: string;
  section: string;
  label: string;
  created_at: string;
}

export interface AuthSession {
  keyId: string;
  code: string;
  role: 'worker' | 'captain';
  bus_route: string;
  section: string;
  label: string;
}

// People Records
export type DayType = 'saturday' | 'sunday';
export type InterestLevel = 'very' | 'somewhat' | 'neutral';
export type PersonStatus = 'active' | 'converted' | 'inactive';
export type Gender = 'male' | 'female';

export interface Address {
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
}

export interface Prospect {
  id: string;
  name: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  address: Address;
  date_contacted: string;
  interest_level: InterestLevel;
  notes?: string;
  status: PersonStatus;
  day_type: DayType;
  bus_route: string;
  created_at: string;
  updated_at: string;
}

export interface VisitLog {
  date: string;
  visited: boolean;
  timestamp: string;
}

export interface Rider {
  id: string;
  name: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  address: Address;
  emergency_contact?: string;
  emergency_phone?: string;
  bus_route: string;
  source?: 'prospect' | 'manual';
  day_type: DayType;
  visit_history: VisitLog[];
  last_visited?: string;
  last_rode?: string;
  notes?: string;
  status: PersonStatus;
  birthday?: string; // YYYY-MM-DD
  points: number;
  points_history: PointLog[];
  salvation_date?: string;
  baptism_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PointLog {
  date: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface AttendanceLog {
  date: string;
  present: boolean;
  timestamp: string;
}

export interface Worker {
  id: string;
  name: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  assigned_section: string;
  bus_route: string;
  day_type: DayType;
  attendance_log: AttendanceLog[];
  status: PersonStatus;
  birthday?: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

// Form Data Types
export type CreateProspectData = Omit<Prospect, 'id' | 'created_at' | 'updated_at'>;
export type CreateRiderData = Omit<Rider, 'id' | 'created_at' | 'updated_at' | 'visit_history' | 'last_visited' | 'last_rode' | 'points' | 'points_history'>;
export type CreateWorkerData = Omit<Worker, 'id' | 'created_at' | 'updated_at' | 'attendance_log' | 'points'>;

// Dashboard Stats
export interface DashboardStats {
  total_prospects: number;
  total_riders: number;
  total_workers: number;
  visited_today: number;
  rode_today: number;
  workers_present: number;
}