import axios from "axios";

// Types for map location data

export type Latlng = [number, number];
export interface Territory {
  id: string;
  name: string;
  center: {
    type: "Point";
    coordinates: Latlng;
  };
  geometry: any,
  projects?: any[],
}

// Create an Axios instance with a base URL and common settings
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Set base URL from environment variables
  timeout: 120000, // Set timeout for API requests
});

// Add request interceptor to dynamically set headers
apiClient.interceptors.request.use((config: any) => {
  const authToken = localStorage.getItem("auth_token");
  if (authToken) {
    // Remove any surrounding quotes and trim whitespace
    const token = authToken.replace(/^"|"$/g, "").trim();
    config.headers = {
      ...config.headers,
      Authorization: token,
    };
  }
  return config;
});

// Handle responses and errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response; // Pass through the response
  },
  (error) => {
    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.message || "An unexpected error occurred";
    // Check for 401 (Unauthorized) or 403 (Forbidden) status codes
    if (status === 401 || status === 403) {
      // Remove auth token from localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.clear();
      // Navigate to the root page ("/")
      window.location.href = "/";
    }
    return Promise.reject(new Error(errorMessage));
  }
);

// Map related API endpoints
export const getMapLocations = async (): Promise<Territory[]> => {
  const response = await apiClient.get("/api/v1/geodata/territories");
  return response.data;
};

export const getTerritoryByLatLng = async (
  lng: number,
  lat: number
): Promise<any> => {
  try {
    const response = await apiClient.get(
      `/api/v1/geodata/territory?lng=${lng}&lat=${lat}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching territory by lat/lng:", error);
    return null;
  }
};

export const searchTerritory = async (
  query: string
): Promise<any> => {
  try {
    const response = await apiClient.get(
      `/api/v1/geodata/territory/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching territory by name:", error);
    return null;
  }
};


export const getNewsByTerritory = async (territoryId: string): Promise<any[]> => {
  const response = await apiClient.get(`/api/v1/news/${territoryId}`);
  return response.data; 
}

export const getUnderServedAreas = async (): Promise<any[]> => {
  const response = await apiClient.get("/api/v1/geodata/analytics/underserved");
  return response.data; 
}


export default apiClient;
