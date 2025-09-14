import api from './api';

interface PrayerWallItem {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  tags: string[];
  prayerRequest?: string;
  userId: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

interface PrayerComment {
  _id: string;
  content: string;
  reaction: 'praying' | 'amen' | 'heart';
  contactId: string;
  userId: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const prayerWallService = {
  // Get prayer wall items
  async getPrayerWallItems(page: number = 1, limit: number = 10): Promise<PaginatedResponse<PrayerWallItem>> {
    const response = await api.get(`/prayer-wall?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get comments for a prayer item
  async getPrayerItemComments(contactId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<PrayerComment>> {
    const response = await api.get(`/prayer-wall/${contactId}/comments?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Add comment to prayer item
  async addPrayerComment(contactId: string, content: string, reaction: 'praying' | 'amen' | 'heart' = 'praying'): Promise<ApiResponse<PrayerComment>> {
    const response = await api.post(`/prayer-wall/${contactId}/comments`, {
      content,
      reaction
    });
    return response.data;
  },

  // Update prayer comment
  async updatePrayerComment(commentId: string, content: string, reaction: 'praying' | 'amen' | 'heart'): Promise<ApiResponse<PrayerComment>> {
    const response = await api.put(`/prayer-wall/comments/${commentId}`, {
      content,
      reaction
    });
    return response.data;
  },

  // Delete prayer comment
  async deletePrayerComment(commentId: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/prayer-wall/comments/${commentId}`);
    return response.data;
  },

  // Toggle contact sharing to prayer list
  async togglePrayerListSharing(contactId: string, sharedToPrayerList: boolean, prayerRequest?: string): Promise<ApiResponse<any>> {
    const response = await api.patch(`/prayer-wall/contacts/${contactId}/toggle`, {
      sharedToPrayerList,
      prayerRequest
    });
    return response.data;
  }
};

export type { PrayerWallItem, PrayerComment };