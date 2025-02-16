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
      navigate('/chat');
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
            sx={{ fontWeight: 'bold', lineHeight: 1.2 }}
          >
            Master the Art of Communicating
          </Typography>
          <Typography
            variant="h6"
            sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.5 }}
          >
            Dive into realistic social scenarios with immersive, interactive conversations designed to boost your confidence and enhance your communication skills.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              mt: 4,
              borderRadius: '20px',
              paddingX: theme.spacing(4),
              paddingY: theme.spacing(1.5),
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
              },
            }}
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
              opacity: 0.8,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LandingPage;
