import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authService = {
  authLogin: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  authRegister: (username: string, password: string) => api.post('/auth/register', { username, password }),
};

export const peerService = {
  fetchActivePeers: () => api.get('/peers/active'),
  registerPeer: (peerId: string) => api.post('/peers/register', {
    peerId,
    ipAddress: 'localhost',
    port: 3000,
    status: 'ACTIVE',
  }),
  deregisterPeer: (peerId: string) => api.delete(`/peers/${peerId}/deregister`),
};

export const networkService = {
  addContact: (username: string) => api.post(`/network/contacts/${username}`),
  createGroup: (groupName: string, usernames: string[]) => api.post('/network/groups', { groupName, usernames }),
  fetchContactPeers: () => api.get('/network/active'),
  fetchMyGroups: () => api.get('/network/groups/mine'),
  fetchGroupPeers: (groupId: number) => api.get(`/network/groups/${groupId}/active`),
};

export const userService = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id: number) => api.get(`/users/${id}`),
  createUser: (user: any) => api.post('/users', user),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

export const productService = {
  getAllProducts: () => api.get('/products'),
  getProductById: (id: number) => api.get(`/products/${id}`),
  createProduct: (product: any) => api.post('/products', product),
  deleteProduct: (id: number) => api.delete(`/products/${id}`),
};

export const fileTransferService = {
  initiateTransfer: (data: any) => api.post('/api/transfers/initiate', data),
  uploadChunk: (fileId: string, chunkNumber: number, totalChunks: number, file: File) => {
    const formData = new FormData();
    formData.append('fileId', fileId);
    formData.append('chunkNumber', chunkNumber.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('file', file);
    return api.post('/api/transfers/upload-chunk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  downloadFile: (fileId: string) => api.get(`/api/transfers/download/${fileId}`, { responseType: 'blob' }),
  acceptTransfer: (fileId: string) => api.post(`/api/transfers/${fileId}/accept`),
  rejectTransfer: (fileId: string) => api.post(`/api/transfers/${fileId}/reject`),
  getTransfersBySender: (peerId: string) => api.get(`/api/transfers/sender/${peerId}`),
  getTransfersByReceiver: (peerId: string) => api.get(`/api/transfers/receiver/${peerId}`),
  getTransferStatus: (fileId: string) => api.get(`/api/transfers/status/${fileId}`),
};
