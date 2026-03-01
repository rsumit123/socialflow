// src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container, Typography, Box, Paper, Alert,
  useMediaQuery, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/platform');
    } catch (err) {
      console.error('Google login failed:', err);
      setError('Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or failed. Please try again.');
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
        <Typography
          component="h1"
          variant="h4"
          fontWeight="bold"
          color="primary"
          sx={{ mb: 2, fontSize: isMobile ? '1.75rem' : '2.125rem' }}
        >
          Welcome to SocialFlow
        </Typography>

        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Sign in to continue
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            size="large"
            width={isMobile ? 280 : 350}
            text="signin_with"
            shape="rectangular"
            theme="outline"
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
