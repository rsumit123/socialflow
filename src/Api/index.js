export const handleAuthErrors = (response, navigate) => {
    if (response.status === 401 || response.status === 403) {
    console.log("Handle Auth Errors")
      // Remove the token from localStorage
      localStorage.removeItem('token');
      // Redirect the user to the login page
      navigate('/login');
      return false; // Indicates that an auth error was handled
    }
    return true;
  };