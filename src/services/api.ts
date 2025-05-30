/** @format */

import axios from "axios";
import Cookies from "js-cookie";
// const BASE_URL = "https://mountmerubackend.onrender.com/api";
const BASE_URL = "http://localhost:8000/api";
// const BASE_URL = "https://visitflow-prod-backend.onrender.com/api";
// const BASE_URL = "http://10.0.0.1:3000/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("refreshToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if the error response status is 401 or 403
    if (error.response?.status === 401 || error.response?.status === 403) {
      try {
        // Call logout function
        await logout();
        // Clear tokens from storage
        localStorage.removeItem("refreshToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login";
      } catch (logoutError) {
        console.error("Logout failed:", logoutError);
      }
    }

    // Always reject the error so the calling code can handle it
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const get_dashboard_data = async () => {
  try {
    const response = await axiosInstance.get("/user/dashboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching clinet data", error);
    throw error;
  }
};

export const get_my_profile = async () => {
  try {
    const response = await axiosInstance.get("/user/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching clinet data", error);
    throw error;
  }
};

export const change_password = async (
  oldPassword: string,
  newPassword: string
) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error changing password", error);
    throw error;
  }
};

export const add_client = async (
  company_name: string,
  contact_person: string,
  contact_email: string,
  contact_phone: string,
  category: string,
  best_for: any,
  no_of_employees: string,
  comment: string,
  location: any,
  address: string,
  fleet_size: string
) => {
  const response = await axiosInstance.post("/client", {
    company_name,
    contact_person,
    contact_email,
    contact_phone,
    category,
    best_for,
    no_of_employees,
    comment,
    location,
    address,
    fleet_size,
  });
  return response.data;
};

export const get_nearby_clients = async (
  user_lat: number,
  user_lng: number,
  range: number
) => {
  const response = await axiosInstance.get(
    `/client/client-near-me?user_lat=${user_lat}&user_lng=${user_lng}&range=${range}`
  );
  return response.data;
};

export const get_client_by_id = async (id: string) => {
  const response = await axiosInstance.get(`/client/${id}`);
  return response.data;
};

export const get_user_by_id = async (id: string) => {
  const response = await axiosInstance.get(`/user/${id}`);
  return response.data;
};

export const get_all_clients = async (page = 1, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(
      `/client/all?page=${page}&limit=${pageSize}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

export const search_client = async (query: string) => {
  const response = await axiosInstance.get(`/client/search?q=${query}`);
  return response.data;
};

export const edit_client_details = async (
  id: string,
  company_name: string,
  address: string,
  contact_person: string,
  contact_email: string,
  contact_phone: string,
  category: string,
  status: string,
  best_for: string,
  no_of_employees: string,
  comment: string,
  location: any
) => {
  try {
    const response = await axiosInstance.patch(`/client/${id}`, {
      company_name,
      address,
      contact_person,
      contact_email,
      contact_phone,
      category,
      status,
      best_for,
      no_of_employees,
      comment,
      location,
    });
    return response.data;
  } catch (error) {
    console.error("Error editing client details:", error);
    throw error;
  }
};

export const add_visit = async (
  client_id: string,
  visit_conclusion: string,
  user_lat: number,
  user_lng: number,
  status: string,
  followup_date: string
) => {
  const response = await axiosInstance.post("/visit", {
    client_id,
    visit_conclusion,
    user_lat,
    user_lng,
    status,
    followup_date,
  });
  return response.data;
};

export const get_my_client = async () => {
  try {
    const response = await axiosInstance.get("/user/my-client");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const start = async (lat: string, lng: string) => {
  try {
    const response = await axiosInstance.post("/daily/start", { lat, lng });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const end = async (lat: string, lng: string) => {
  try {
    const response = await axiosInstance.post("/daily/end", { lat, lng });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getStatus = async () => {
  try {
    const response = await axiosInstance.get("/daily/status");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDailyRecord = async () => {
  try {
    const response = await axiosInstance.get("/daily");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllManagers = async () => {
  try {
    const response = await axiosInstance.get("/user/get-all-managers");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addSalesReprentative = async ({
  name,
  email,
  managerId,
}: {
  name: string;
  email: string;
  managerId: string;
}) => {
  try {
    const response = await axiosInstance.post("/auth/register", {
      name,
      email,
      managerId,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addStartOfTheMonthWith = async ({
  name,
  tagline,
  imageFile,
}: {
  name: string;
  tagline: string;
  imageFile: File;
}) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("tagline", tagline);
    formData.append("image", imageFile);

    const response = await axiosInstance.post("/star", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding star of the month:", error);
    throw error;
  }
};

export const getStarOfTheMonth = async () => {
  try {
    const response = await axiosInstance.get("/star");
    return response.data;
  } catch (error) {
    console.error("Error fetching star of the month:", error);
    throw error;
  }
};

export const updateStarOfTheMonth = async ({
  name,
  tagline,
  imageFile,
  id,
}: {
  name: string;
  tagline: string;
  imageFile: File;
  id: string;
}) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("tagline", tagline);
    formData.append("image", imageFile);

    const response = await axiosInstance.put(`/star/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating star of the month:", error);
    throw error;
  }
};

export const getReportBasedOnTimeStamp = async (
  startDate: string,
  endDate: string
) => {
  try {
    const response = await axiosInstance.post("/daily/generate-report", {
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUser = async (query: string) => {
  try {
    const response = await axiosInstance.get(`/user/search?search=${query}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const assignTask = async (
  userId: string,
  type: string,
  clientId: string,
  task: string,
  description: string,
  date: string,
  time: string,
  product: string
) => {
  try {
    const response = await axiosInstance.post("/tasks", {
      userId,
      type,
      clientId,
      task,
      description,
      date,
      time,
      product,
    });
    return response.data;
  } catch (error) {
    console.error("Error assigning task:", error);
    throw error;
  }
};

export const getMyTasks = async (startDate: string, endDate: string) => {
  try {
    const response = await axiosInstance.get(
      `/tasks/my-tasks?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching my tasks:", error);
    throw error;
  }
};

export const changeTaskStatus = async (taskId: string, status: string) => {
  try {
    const response = await axiosInstance.patch(
      `/tasks/change-status/${taskId}`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing task status:", error);
    throw error;
  }
};

export const getUserProfile = async (
  email: string,
  startDate: string,
  endDate: string
) => {
  const response = await axiosInstance.get(
    `/admin/user?email=${email}&startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
};

export const getUserVisits = async (
  email: string,
  startDate: string,
  endDate: string
) => {
  const response = await axiosInstance.get(
    `/admin/get-user-visits?email=${email}&startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
};

export const getUserAttendance = async (
  email: string,
  startDate: string,
  endDate: string
) => {
  const response = await axiosInstance.get(
    `/admin/user-attendance?email=${email}&startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
};

export const getUserForReview = async (id: string) => {
  const response = await axiosInstance.get(`/user/find-user-for-review/${id}`);

  return response.data;
};
