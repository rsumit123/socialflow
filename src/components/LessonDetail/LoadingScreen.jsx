import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Modal,
  TextField,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  Timer,
  Send,
  CheckCircle,
  Warning,
  TrendingUp,
  History,
  Psychology,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';





/* LoadingScreen Component */
const LoadingScreen = ({ message }) => {
    const theme = useTheme();
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          p: 4,
        }}
      >
        <Psychology
          sx={{
            fontSize: 60,
            color: theme.palette.primary.main,
            animation: 'pulse 1.5s infinite',
          }}
        />
        <Typography
          variant="h5"
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
        >
          {message}
        </Typography>
        <CircularProgress size={30} />
      </Box>
    );
  };


  export default LoadingScreen;