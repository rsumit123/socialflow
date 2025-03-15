import axios from 'axios';

export const handleAuthErrors = (response, navigate) => {
    if (response.status === 401 || response.status === 403) {
    console.log("Auth token expired or invalid");
      // Remove the token from localStorage
      localStorage.removeItem('token');
      
      // Use setTimeout to prevent immediate navigation/flickering
      setTimeout(() => {
        // Navigate to login page
        navigate('/login', { replace: true });
      }, 100);
      return true; // Indicates that an auth error was handled
    }
    return false;
  };

// Setup a global interceptor for axios to handle auth errors
export const setupAxiosInterceptors = (navigate, logoutCallback) => {
  // Remove any existing interceptors
  if (axios.__authInterceptor !== undefined) {
    axios.interceptors.response.eject(axios.__authInterceptor);
  }
  
  // Add a response interceptor
  axios.__authInterceptor = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Check if the error is auth-related
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log("Global interceptor: Auth token expired or invalid");
        
        // Clear authentication state using the provided logout function
        if (typeof logoutCallback === 'function') {
          logoutCallback();
        } else {
          // Fallback to just clearing the token if no logout function provided
          localStorage.removeItem('token');
        }
        
        // Use setTimeout to prevent immediate navigation/flickering
        setTimeout(() => {
          // Navigate to login page
          navigate('/login', { replace: true });
        }, 100);
      }
      
      return Promise.reject(error);
    }
  );
};