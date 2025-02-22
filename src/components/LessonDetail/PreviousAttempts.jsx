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




/* PreviousAttempts Component */
const PreviousAttempts = React.memo(({ attemptsLoading, previousAttempts }) => {
    return (
      <Card sx={{ mt: 4, borderRadius: '15px' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <History color="primary" />
            <Typography variant="h6">Previous Attempts</Typography>
          </Box>
          {attemptsLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 100,
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : (
            previousAttempts.map((attempt, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: '10px',
                  mb: 1,
                  bgcolor: 'background.default',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {attempt.completed ? (
                    <CheckCircle sx={{ color: 'success.main' }} />
                  ) : (
                    <TrendingUp color="primary" />
                  )}
                  <Box>
                    <Typography variant="body1">Score: {attempt.score}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(attempt.attempted_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '50%' }}>
                  {attempt.feedback}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    );
  });
  
  export default PreviousAttempts;