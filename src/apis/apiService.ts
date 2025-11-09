import axios from "axios";

// Get API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  console.error("VITE_API_URL is not defined. Please check your .env file.");
}

// Create an Axios instance with a base URL and common settings
const apiClient = axios.create({
  baseURL: apiUrl, // Set base URL from environment variables
  timeout: 120000, // Set timeout for API requests
  withCredentials: false, // Disable credentials (not needed when using Authorization header)
  headers: {
    "Content-Type": "application/json",
  },
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
    let errorMessage = error.response?.data?.message;

    // If no response received (network error, etc.)
    if (!error.response) {
      if (!apiUrl) {
        errorMessage =
          "API URL is not configured. Please check your environment variables.";
      } else {
        errorMessage =
          "Network error. Please check your internet connection and API server.";
      }
    }

    // Fallback error message
    if (!errorMessage) {
      errorMessage = "An unexpected error occurred";
    }

    // Check for 401 (Unauthorized) or 403 (Forbidden) status codes
    if (status === 401 || status === 403) {
      // Remove auth token from localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("admin_data");
      localStorage.removeItem("userInfo");
      localStorage.clear();
      // Navigate to the login page
      window.location.href = "/login";
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
