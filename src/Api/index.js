export const handleAuthErrors = (response, navigate) => {
    if (response.status === 401 || response.status === 403) {
      // Remove the token from localStorage
      localStorage.removeItem('token');
      // Redirect the user to the login page
      navigate('/login');
      return true; // Indicates that an auth error was handled
    }
    return false;
  };