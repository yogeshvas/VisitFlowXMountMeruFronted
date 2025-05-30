// TODO fix this clutter

import { axiosInstance } from "./api";

// Types
interface ClientOnboardingData {
  clientName: string;
  email: string;
  phoneNumber: string;
  comment: string;
  doc1: File;
  doc2?: File; // Optional
}

interface ClientUpdateData {
  clientId: string;
  clientName?: string;
  email?: string;
  phoneNumber?: string;
  comment?: string;
  doc1?: File;
  doc2?: File;
}

interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
}

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
}

interface StatusUpdateData {
  clientId: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
}

interface ClientOnboarding {
  _id: string;
  clientName: string;
  email: string;
  phoneNumber: string;
  comment: string;
  doc1: string;
  doc2?: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  clients: ClientOnboarding[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}


// Create a new client onboarding
export const onboardClient = async({clientName, email, phoneNumber, comment, doc1, doc2}: ClientOnboardingData) => {
  const formData = new FormData();
  formData.append('clientName', clientName);
  formData.append('email', email);
  formData.append('phoneNumber', phoneNumber);
  formData.append('comment', comment || '');
  formData.append('doc1', doc1);
  
  // Only append doc2 if it exists
  if (doc2) {
    formData.append('doc2', doc2);
  }
  
  const response = await axiosInstance.post('/onboard', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data as ClientOnboarding;
};

// Get all client onboardings (admin only)
export const getAllClientOnboardings = async(params: PaginationParams = {}) => {
  const { page = 1, limit = 10, status } = params;
  
  let url = `/onboard/all?page=${page}&limit=${limit}`;
  if (status) {
    url += `&status=${status}`;
  }
  
  const response = await axiosInstance.get(url);
  return response.data ;
};


// Search clients
export const searchClients = async(params: SearchParams) => {
  const { query, page = 1, limit = 10, status } = params;
  
  let url = `/onboard/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
  if (status) {
    url += `&status=${status}`;
  }
  
  const response = await axiosInstance.get(url);
  return response.data ;
};



// Update client status (admin only)
export const updateClientStatus = async({clientId, status, comment}: StatusUpdateData) => {
  const response = await axiosInstance.patch(`/onboard/${clientId}/status`, {
    status,
    comment
  });
  
  return response.data as ClientOnboarding;
};

// Get client by ID
export const getClientById = async(clientId: string) => {
  const response = await axiosInstance.get(`/onboard/${clientId}`);
  return response.data as ClientOnboarding;
};




// Get my clients
export const getMyClients = async(params: PaginationParams = {}) => {
  const { page = 1, limit = 10, status } = params;
  
  let url = `/onboard/my-clients?page=${page}&limit=${limit}`;
  if (status) {
    url += `&status=${status}`;
  }
  
  const response = await axiosInstance.get(url);
  return response.data;
};





// Update client
export const updateClient = async({clientId, clientName, email, phoneNumber, comment, doc1, doc2}: ClientUpdateData) => {
  const formData = new FormData();
  
  // Only append fields that are provided
  if (clientName) formData.append('clientName', clientName);
  if (email) formData.append('email', email);
  if (phoneNumber) formData.append('phoneNumber', phoneNumber);
  if (comment !== undefined) formData.append('comment', comment);
  if (doc1) formData.append('doc1', doc1);
  if (doc2) formData.append('doc2', doc2);
  
  const response = await axiosInstance.put(`/onboard/${clientId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data as ClientOnboarding;
};



// Delete client
export const deleteClient = async(clientId: string) => {
  const response = await axiosInstance.delete(`/onboard/${clientId}`);
  return response.data;
};


