// src/components/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, TextField, Button, Typography, Box, 
  CircularProgress, Paper, Divider, InputAdornment, IconButton,
  useMediaQuery, useTheme, Alert, Snackbar, Collapse
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // New state for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
  });
  
  // New state for form validation
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', confirmPassword: '' };
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await register(email, password);
      
      // Check if registration was successful based on the response
      if (response && response.status === 201) {
        setNotification({
          open: true,
          message: 'Registration successful! Redirecting to login...',
          severity: 'success'
        });
        
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Handle other successful responses that might not be 201
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      // Extract error message from API response if available
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response) {
        try {
          const errorData = await error.response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the JSON, use the default message
        }
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <Container 
      component="main" 
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        justifyContent: 'center',
        py: isMobile ? 4 : 8
      }}
    >
      {/* Snackbar for notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '1.25rem'
            }
          }}
          icon={notification.severity === 'success' ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Paper 
        elevation={3}
        sx={{
          p: isMobile ? 3 : 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          width: '100%',
          my: 'auto'
        }}
      >
        <PersonAddAltIcon 
          color="primary" 
          sx={{ 
            fontSize: isMobile ? 40 : 48,
            mb: 1.5
          }} 
        />
        
        <Typography 
          component="h1" 
          variant="h4" 
          fontWeight="bold" 
          color="primary"
          sx={{ mb: 1.5, fontSize: isMobile ? '1.75rem' : '2.125rem' }}
        >
          Create Your Account
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Join SocialFlow and connect with your friends
        </Typography>

        <Box component="form" noValidate sx={{ width: '100%' }} onSubmit={handleRegister}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color={errors.email ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color={errors.password ? "error" : "action"} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color={errors.confirmPassword ? "error" : "action"} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body1">
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  color: (theme) => theme.palette.primary.main
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;