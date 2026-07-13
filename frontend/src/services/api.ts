const API_BASE_URL = 'http://localhost:5001/api/v1';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

interface RequestOptions extends RequestInit {
  body?: any;
}

export const apiRequest = async (endpoint: string, options: RequestOptions = {}): Promise<any> => {
  const token = getAuthToken();
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const createFoodApi = async (foodData: any) => {
  return apiRequest('/foods', {
    method: 'POST',
    body: foodData,
  });
};

export const getFoodsApi = async (filters: { category?: string; status?: string; createdBy?: string; reservedBy?: string } = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);
  if (filters.reservedBy) queryParams.append('reservedBy', filters.reservedBy);
  
  const queryStr = queryParams.toString();
  return apiRequest(`/foods${queryStr ? `?${queryStr}` : ''}`);
};

export const getFoodByIdApi = async (id: string) => {
  return apiRequest(`/foods/${id}`);
};

export const updateFoodApi = async (id: string, foodData: any) => {
  return apiRequest(`/foods/${id}`, {
    method: 'PUT',
    body: foodData,
  });
};

export const deleteFoodApi = async (id: string) => {
  return apiRequest(`/foods/${id}`, {
    method: 'DELETE',
  });
};

export const reserveFoodApi = async (id: string) => {
  return apiRequest(`/foods/${id}/reserve`, {
    method: 'PATCH',
  });
};

export const cancelReservationApi = async (id: string) => {
  return apiRequest(`/foods/${id}/cancel`, {
    method: 'PATCH',
  });
};

export const collectFoodApi = async (id: string) => {
  return apiRequest(`/foods/${id}/collect`, {
    method: 'PATCH',
  });
};
