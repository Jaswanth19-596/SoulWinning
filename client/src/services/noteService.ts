import api from './api';
import { Note, ApiResponse } from '../types';

export const noteService = {
  getNotes: async (contactId: string): Promise<ApiResponse<Note[]>> => {
    const response = await api.get(`/notes/contact/${contactId}`);
    return response.data;
  },

  createNote: async (contactId: string, content: string): Promise<ApiResponse<Note>> => {
    const response = await api.post(`/notes/contact/${contactId}`, { content });
    return response.data;
  },

  updateNote: async (id: string, content: string): Promise<ApiResponse<Note>> => {
    const response = await api.put(`/notes/${id}`, { content });
    return response.data;
  },

  deleteNote: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};