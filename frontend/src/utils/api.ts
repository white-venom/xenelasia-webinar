const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const getHeaders = (isMultipart = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiRequest = async (path: string, options: RequestInit = {}, isMultipart = false) => {
  try {
    const headers = getHeaders(isMultipart);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    return data;
  } catch (error: any) {
    console.error(`API Error on ${path}:`, error);
    throw error;
  }
};

// Auth
export const authApi = {
  register: (body: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => apiRequest('/auth/profile'),
  updateProfile: (body: any) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  getUsers: (search?: string) => apiRequest(`/auth/users${search ? `?search=${search}` : ''}`),
};

// Webinars
export const webinarApi = {
  getAll: (search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/webinars${query}`);
  },
  getById: (id: string) => apiRequest(`/webinars/${id}`),
  create: (body: any) => apiRequest('/webinars', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: any) => apiRequest(`/webinars/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => apiRequest(`/webinars/${id}`, { method: 'DELETE' }),
};

// Registrations
export const registrationApi = {
  register: (webinarId: string) => apiRequest('/registrations', { method: 'POST', body: JSON.stringify({ webinar_id: webinarId }) }),
  getMy: () => apiRequest('/registrations/my'),
  getAll: () => apiRequest('/registrations'),
  updateStatus: (id: string, status: string) => apiRequest(`/registrations/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// Blogs
export const blogApi = {
  getAll: (search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/blogs${query}`);
  },
  getById: (id: string) => apiRequest(`/blogs/${id}`),
  create: (body: any) => apiRequest('/blogs', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: any) => apiRequest(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => apiRequest(`/blogs/${id}`, { method: 'DELETE' }),
};

// Analytics
export const analyticsApi = {
  getDashboard: () => apiRequest('/analytics/dashboard'),
  getRegistrations: () => apiRequest('/analytics/registrations'),
};

// Emails
export const emailApi = {
  broadcast: (body: { subject: string; message: string }) => apiRequest('/emails/announcement', { method: 'POST', body: JSON.stringify(body) }),
  sendReminder: (webinarId: string) => apiRequest(`/emails/reminder/${webinarId}`, { method: 'POST' }),
};

// Chatbot
export const chatbotApi = {
  sendMessage: (message: string) => apiRequest('/chatbot', { method: 'POST', body: JSON.stringify({ message }) }),
};

// Certificates
export const certificateApi = {
  getMy: () => apiRequest('/certificates/my'),
  getById: (id: string) => apiRequest(`/certificates/${id}`),
  issue: (userId: string, webinarId: string) => apiRequest('/certificates/issue', { method: 'POST', body: JSON.stringify({ user_id: userId, webinar_id: webinarId }) }),
};

// Notifications
export const notificationApi = {
  getMy: () => apiRequest('/notifications'),
  delete: (id: string) => apiRequest(`/notifications/${id}`, { method: 'DELETE' }),
};
