import api from './api';
import { Contact, ContactsResponse, ContactWithNotes, ApiResponse } from '../types';

export interface CreateContactData {
  name: string;
  address?: string;
  phone?: string;
  tags: string[];
}

export const contactService = {
  getContacts: async (page = 1, limit = 10, search?: string, tags?: string): Promise<ContactsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (tags) params.append('tags', tags);

    const response = await api.get(`/contacts?${params.toString()}`);
    return response.data;
  },

  getContact: async (id: string): Promise<ApiResponse<ContactWithNotes>> => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  createContact: async (contactData: CreateContactData): Promise<ApiResponse<Contact>> => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },

  updateContact: async (id: string, contactData: CreateContactData): Promise<ApiResponse<Contact>> => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },

  deleteContact: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },

  searchContacts: async (query: string): Promise<ApiResponse<Contact[]>> => {
    const response = await api.get(`/contacts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};