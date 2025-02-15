// src/components/LandingPage.jsx
import React from 'react';
import { Box, Typography, Button, Grid, useTheme, useMediaQuery } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        padding: theme.spacing(8, 2),
        backgroundColor: 'background.default',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography
            variant={isSmallScreen ? 'h4' : 'h3'}
            sx={{ fontWeight: 'bold' }}
          >
            Master the Art of Communicating
          </Typography>
          <Typography
            variant="h6"
            sx={{ mt: 2, color: 'text.secondary' }}
          >
            Engage in realistic social scenarios with AI-driven conversations to boost your confidence and communication skills.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 4 }}
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </Grid>
        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
          <ChatBubbleOutlineIcon
            sx={{
              fontSize: isSmallScreen ? 200 : 300,
              color: 'secondary.main',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LandingPage;
