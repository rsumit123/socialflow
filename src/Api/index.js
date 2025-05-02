import axios from 'axios';

// export const handleAuthErrors = (response, navigate, logoutAction) => {
//     if (response.status === 401 || response.status === 403) {
//     console.log("Auth token expired or invalid");
//       // Remove the token from localStorage
//       localStorage.removeItem('token');
//       if (logoutAction) {
//         logoutAction();
//         } else {
//               console.warn("handleAuthErrors: logoutAction was not provided!");
//         }
      
//       // Use setTimeout to prevent immediate navigation/flickering
//       setTimeout(() => {
//         // Navigate to login page
//         navigate('/login', { replace: true });
//       }, 100);
//       return true; // Indicates that an auth error was handled
//     }
//     return false;
//   };

export const handleAuthErrors = (response, navigate, logoutAction) => {
    if (response.status === 401 || response.status === 403) {
      console.log("Auth token expired or invalid. Logging out.");

      // 1. Clear local storage (optional but good practice)
      localStorage.removeItem('token');
      // You might want to clear other user-related storage too

      // 2. Update the application state IMMEDIATELY
      // This will set user to null/undefined, causing the useEffect condition to fail on next render
      if (logoutAction) {
           logoutAction();
      } else {
           console.warn("handleAuthErrors: logoutAction was not provided!");
      }


      // 3. Navigate AFTER state update has been initiated
      // The setTimeout is often unnecessary now, but keep if you perceive flicker
      // Using replace: true is good practice for login redirects
      navigate('/login', { replace: true });

      // 4. Signal that the error was handled to prevent further processing
      // Option A: Return true (as you did)
      // return true;

      // Option B (Slightly cleaner): Throw a specific error that the caller can catch
      // This prevents the rest of the try block in the caller from executing.
      throw new Error('Auth Error Handled');

    }
    return false; // Indicates that it wasn't an auth error handled by this function
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