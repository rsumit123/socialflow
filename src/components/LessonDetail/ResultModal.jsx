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






/* ResultModal Component */
const ResultModal = React.forwardRef((props, ref) => {
    const { theme, result, retryChallenge, isSmallScreen } = props;
    return (
      <Paper
        ref={ref}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isSmallScreen ? '90%' : 500,
          bgcolor: 'background.paper',
          borderRadius: '20px',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {result?.completed ? (
            <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />
          ) : (
            <Warning sx={{ fontSize: 60, color: 'warning.main' }} />
          )}
        </Box>
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>
          {result?.completed ? 'Well Done!' : 'Almost There!'}
        </Typography>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 3 }}>
          Your Score: {result?.score}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
          {result?.feedback}
        </Typography>
        {result?.completed ? (
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'success.main' }}>
            Redirecting to next lesson...
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={retryChallenge}
              sx={{
                borderRadius: '30px',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Try Again
            </Button>
          </Box>
        )}
      </Paper>
    );
  });
  
  export default ResultModal;