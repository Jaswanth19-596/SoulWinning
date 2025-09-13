export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  content: string;
  contactId: string;
  userId: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface ContactsResponse {
  success: boolean;
  data: Contact[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface ContactWithNotes {
  contact: Contact;
  notes: Note[];
}