export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API Response types
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface ApiError {
  message: string;
  status?: number;
}

// User types
interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
}

// Account types
interface Account {
  _id: string;
  name: string;
  category: string[];
  price: number;
  Discount?: number;
  stock?: number;
  duration: '1_month' | '3_months' | '6_months' | '1_year';
  thumbnail?: string;
  imagepreview?: string[];
  videopreview?: string[];
  policy?: string[];
  description?: string[];
  createdAt: string;
  updatedAt: string;
}

// Category types
interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// SourceCode types
interface SourceCode {
  _id: string;
  name: string;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  thumbnailImage?: string;
  videoPreview?: string[];
  videoTutorial?: string[];
  imagePreview?: string[];
  policy?: string[];
  description?: string[];
  sourceCodeFile: string;
  slug: string;
  isActive: boolean;
  downloadCount: number;
  viewCount: number;
  tags?: string[];
  category?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {};

  // Only set Content-Type if not FormData (let browser set it for FormData)
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Add authorization token if available (guard for SSR)
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  } catch (_) {
    // ignore
  }

  const config: RequestInit = {
    // ensure CORS
    mode: 'cors',
    // Using Authorization header, no cookies needed
    credentials: 'omit',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // If no content
    const contentType = response.headers.get('content-type') || '';
    let data: any = null;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType) {
      // attempt to parse text for better error messages
      const text = await response.text();
      try { data = JSON.parse(text); } catch { data = { message: text }; }
    }

    if (!response.ok) {
      const message = (data && data.message) ? data.message : `HTTP error! status: ${response.status}`;
      const err: ApiError = { message, status: response.status };
      throw err;
    }

    return (data as T);
  } catch (error: any) {
    // Network or HTTP errors
    const status = error?.status as number | undefined;
    const isExpectedSlug404 =
      status === 404 && (url.includes('/api/sourcecode/slug/') || url.includes('/api/category/slug/'));

    if (!isExpectedSlug404) {
      console.error('API call failed:', {
        endpoint: url,
        method: (config.method || 'GET'),
        error: error?.message || error,
      });
    }

    // Re-throw a normalized error
    if (error && typeof error === 'object' && 'message' in error) {
      throw error;
    }
    throw { message: 'Network error. Please try again.' } as ApiError;
  }
}

// Authentication API
export const authApi = {
  register: async (name: string, email: string, password: string): Promise<ApiResponse> => {
    return apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  verify: async (token: string): Promise<ApiResponse> => {
    return apiCall(`/api/auth/verify?token=${token}`, {
      method: 'GET',
    });
  },

  forgetPassword: async (email: string): Promise<ApiResponse> => {
    return apiCall('/api/auth/forgetpassword', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    return apiCall('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// Account API
export const accountApi = {
  getAll: async (page?: number, limit?: number, search?: string, category?: string): Promise<ApiResponse<{ accounts?: Account[]; items?: Account[]; count?: number; pagination?: any; total?: number; totalPages?: number }>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const queryString = params.toString();
    const url = `/api/account/getall${queryString ? `?${queryString}` : ''}`;
    return apiCall(url);
  },

  getById: async (id: string): Promise<ApiResponse<Account>> => {
    return apiCall(`/api/account/get/${id}`);
  },

  create: async (accountData: FormData): Promise<ApiResponse<Account>> => {
    return apiCall('/api/account/create', {
      method: 'POST',
      body: accountData,
    });
  },

  update: async (id: string, accountData: FormData): Promise<ApiResponse<Account>> => {
    return apiCall(`/api/account/update/${id}`, {
      method: 'PUT',
      body: accountData,
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiCall(`/api/account/delete/${id}`, {
      method: 'DELETE',
    });
  },
};

// File API
export const fileApi = {
  uploadSingle: async (file: File): Promise<ApiResponse<{ fileId: string; filename: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall('/api/files/upload/single', {
      method: 'POST',
      body: formData,
    });
  },

  uploadMultiple: async (files: File[]): Promise<ApiResponse<{ files: Array<{ fileId: string; filename: string }> }>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return apiCall('/api/files/upload/multiple', {
      method: 'POST',
      body: formData,
    });
  },

  getFile: async (id: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/api/files/${id}`);
    return response.blob();
  },

  getFileInfo: async (id: string): Promise<ApiResponse<{ filename: string; mimetype: string; size: number }>> => {
    return apiCall(`/api/files/info/${id}`);
  },

  deleteFile: async (id: string): Promise<ApiResponse> => {
    return apiCall(`/api/files/${id}`, {
      method: 'DELETE',
    });
  },

  getAllFiles: async (): Promise<ApiResponse<Array<{ _id: string; filename: string; mimetype: string; uploadDate: string }>>> => {
    return apiCall('/api/files');
  },
};

// User API
export const userApi = {
  getAll: async (page: number = 1, limit: number = 10, search?: string, role?: string): Promise<ApiResponse<{ users: User[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    const queryString = params.toString();
    const url = `/api/user/getall${queryString ? `?${queryString}` : ''}`;
    return apiCall(url);
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    return apiCall(`/api/user/get/${id}`);
  },

  update: async (id: string, userData: { name?: string; email?: string; role?: string; isVerified?: boolean }): Promise<ApiResponse<User>> => {
    return apiCall(`/api/user/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiCall(`/api/user/delete/${id}`, {
      method: 'DELETE',
    });
  },

  updatePassword: async (id: string, newPassword: string): Promise<ApiResponse> => {
    return apiCall(`/api/user/update-password/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  },
};

// Category API
export const categoryApi = {
  getAll: async (page?: number, limit?: number, search?: string, isActive?: boolean): Promise<ApiResponse<{ categories?: Category[]; items?: Category[]; count?: number; pagination?: any; total?: number; totalPages?: number }>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    const queryString = params.toString();
    return apiCall(
      `/api/category/getall${queryString ? `?${queryString}` : ''}`
    );
  },

  getActive: async (): Promise<ApiResponse<{ data: Category[]; count: number }>> => {
    return apiCall('/api/category/active');
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    return apiCall(`/api/category/get/${id}`);
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    return apiCall(`/api/category/slug/${slug}`);
  },

  create: async (categoryData: { name: string; description?: string; slug?: string; isActive?: boolean; sortOrder?: number }): Promise<ApiResponse<Category>> => {
    return apiCall('/api/category/create', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  update: async (id: string, categoryData: { name?: string; description?: string; slug?: string; isActive?: boolean; sortOrder?: number }): Promise<ApiResponse<Category>> => {
    return apiCall(`/api/category/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiCall(`/api/category/delete/${id}`, {
      method: 'DELETE',
    });
  },
};

// SourceCode API
export const sourceCodeApi = {
  getAll: async (page?: number, limit?: number, search?: string, category?: string, tags?: string, isActive?: boolean, createdBy?: string, sortBy?: string, sortOrder?: string): Promise<ApiResponse<{ data?: SourceCode[]; items?: SourceCode[]; count?: number; pagination?: any; total?: number; totalPages?: number }>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (tags) params.append('tags', tags);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    if (createdBy) params.append('createdBy', createdBy);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    
    const queryString = params.toString();
    return apiCall(
      `/api/sourcecode/getall${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: string): Promise<ApiResponse<SourceCode>> => {
    return apiCall(`/api/sourcecode/get/${id}`);
  },

  getBySlug: async (slug: string): Promise<ApiResponse<SourceCode>> => {
    return apiCall(`/api/sourcecode/slug/${slug}`);
  },

  create: async (sourceCodeData: FormData): Promise<ApiResponse<SourceCode>> => {
    return apiCall('/api/sourcecode/create', {
      method: 'POST',
      body: sourceCodeData,
    });
  },

  update: async (id: string, sourceCodeData: FormData): Promise<ApiResponse<SourceCode>> => {
    return apiCall(`/api/sourcecode/update/${id}`, {
      method: 'PUT',
      body: sourceCodeData,
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiCall(`/api/sourcecode/delete/${id}`, {
      method: 'DELETE',
    });
  },

  incrementView: async (id: string): Promise<ApiResponse> => {
    return apiCall(`/api/sourcecode/view/${id}`, {
      method: 'PATCH',
    });
  },

  incrementDownload: async (id: string): Promise<ApiResponse> => {
    return apiCall(`/api/sourcecode/download/${id}`, {
      method: 'PATCH',
    });
  },
};

// Export types
export type { User, Account, Category, SourceCode, ApiResponse, ApiError };