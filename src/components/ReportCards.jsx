// src/components/ReportCards.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress,
  Button,
  CardActionArea, // Import CardActionArea
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Register Chart.js components
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ReportCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchReportCards = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/report-cards/`, {
          headers: {
            Authorization: `Bearer ${user.token}`, // Ensure user.token is correctly set
          },
        });
        setReportCards(response.data.report_cards); // Correctly accessing the array
      } catch (error) {
        console.error('Error fetching report cards:', error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error === 'Token has expired!'
        ) {
          // Handle token expiration (similar to Chat.jsx)
          // For simplicity, redirect to login with an alert
          setErrorMessage('Your session has expired. Please login again!');
          setOpenSnackbar(true);
        } else {
          setErrorMessage('Failed to load report cards.');
          setOpenSnackbar(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReportCards();
  }, [user]);

  // Prepare data for the Bar chart
  const chartData = {
    labels: reportCards.map((rc, index) => `Report ${index + 1}`),
    datasets: [
      {
        label: 'Total Score',
        data: reportCards.map((rc) => rc.total_score),
        backgroundColor: 'rgba(60, 179, 113, 0.6)', // Medium Sea Green
        borderColor: 'rgba(60, 179, 113, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const feedback = reportCards[context.dataIndex].feedback;
            return `Score: ${context.parsed.y}, Feedback: ${feedback}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Assuming the max score is 100
      },
    },
  };

  // Handle clicking on a report card
  const handleReportClick = (session_id) => {
    navigate(`/report-cards/${session_id}`);
  };

  return (
    <Box
      sx={{
        padding: 4,
        bgcolor: 'background.default',
        minHeight: 'calc(100vh - 64px)', // Adjust based on header height
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Your Report Cards
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : reportCards.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          No report cards available.
        </Typography>
      ) : (
        <>
          {/* Bar Chart */}
          <Paper elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
            <Typography variant="h6" gutterBottom>
              Total Scores Overview
            </Typography>
            <Bar data={chartData} options={chartOptions} />
          </Paper>

          {/* Individual Report Cards */}
          <Grid container spacing={2}>
            {reportCards.map((rc) => (
              <Grid item xs={12} sm={6} md={4} key={rc.session_id}>
                <Card
                  variant="outlined"
                  sx={{
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' },
                  }}
                >
                  <CardActionArea onClick={() => handleReportClick(rc.session_id)}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {rc.feedback ? 'Detailed Report' : 'Report Card'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Total Score:</strong> {rc.total_score} / 100
                      </Typography>
                      <Box sx={{ mt: 1, mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={rc.total_score || 0}
                          color={
                            rc.total_score >= 70
                              ? 'success'
                              : rc.total_score >= 40
                              ? 'warning'
                              : 'error'
                          }
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Feedback:</strong>{' '}
                        {rc.feedback
                          ? rc.feedback.length > 100
                            ? rc.feedback.substring(0, 100) + '...'
                            : rc.feedback
                          : 'No feedback provided.'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click to view details
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

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

export default ReportCards;
