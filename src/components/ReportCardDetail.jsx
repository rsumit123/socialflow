// src/components/ReportCardDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

const ReportCardDetail = () => {
  const { user } = useAuth();
  const { session_id } = useParams();
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchReportCard = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/chat/sessions/${session_id}/report-card/`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setReportCard(response.data);
      } catch (error) {
        console.error('Error fetching report card:', error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error === 'Token has expired!'
        ) {
          // Handle token expiration (Assuming similar logic as Chat.jsx)
          // You might want to use a context or a global handler
          // For simplicity, we'll show a snackbar here
          setErrorMessage('Your session has expired. Please login again!');
          setOpenSnackbar(true);
        } else {
          setErrorMessage('Failed to load the report card.');
          setOpenSnackbar(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReportCard();
  }, [session_id, user.token]);

  // Prepare data for the Pie chart
  const pieData = reportCard
    ? {
        labels: ['Humor', 'Engagement', 'Empathy'],
        datasets: [
          {
            label: 'Scores',
            data: [
              reportCard.humor_score || 0,
              reportCard.engagement_score || 0,
              reportCard.empathy_score || 0,
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)', // Red
              'rgba(54, 162, 235, 0.6)', // Blue
              'rgba(255, 206, 86, 0.6)', // Yellow
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
          },
        ],
      }
    : {};

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!reportCard) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Report card not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 4,
        bgcolor: 'background.default',
        minHeight: 'calc(100vh - 64px)', // Adjust based on header height
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Detailed Report Card
      </Typography>

      <Paper
        elevation={3}
        sx={{
          padding: 3,
          marginBottom: 4,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Session Details
        </Typography>
        <Typography variant="body1">
          <strong>Session ID:</strong> {reportCard.session_id}
        </Typography>
        <Typography variant="body1">
          <strong>Created At:</strong> {new Date(reportCard.created_at).toLocaleString()}
        </Typography>
        {reportCard.custom_scenario && (
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            <strong>Scenario:</strong> {reportCard.custom_scenario}
          </Typography>
        )}
        {reportCard.feedback && (
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            <strong>Feedback:</strong> {reportCard.feedback}
          </Typography>
        )}
      </Paper>

      {/* Pie Chart */}
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Score Distribution
        </Typography>
        <Pie data={pieData} options={pieOptions} />
      </Paper>

      {/* Snackbar for Error Messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportCardDetail;
