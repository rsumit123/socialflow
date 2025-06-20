import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Fade,
} from '@mui/material';
import { Psychology } from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import DynamicDialogueCard from './DynamicDialogueCard';

const DynamicDialoguesTab = ({ 
  reportCards, 
  loadingReports, 
  onReportClick 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Charts data for Dynamic Dialogues
  const dynamicDialoguesChartData = {
    labels: reportCards.map((rc, index) => `Session ${index + 1}`),
    datasets: [
      {
        label: 'Total Score',
        data: reportCards.map((rc) => rc.total_score),
        backgroundColor: `${theme.palette.primary.main}80`,
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <Fade in timeout={500}>
      <Box>
        {loadingReports ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : reportCards.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Psychology sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              No Dynamic Dialogue Reports Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Start practicing with dynamic dialogues to see your progress reports here!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/justchat')}
              sx={{
                borderRadius: '25px',
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Start Dynamic Dialogue
            </Button>
          </Box>
        ) : (
          <>
            {/* Bar Chart */}
            <Paper elevation={3} sx={{ padding: 3, marginBottom: 4, borderRadius: '16px' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Performance Overview
              </Typography>
              <Bar data={dynamicDialoguesChartData} options={chartOptions} />
            </Paper>

            {/* Individual Progress Reports */}
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Your Reports
            </Typography>
            <Grid container spacing={3}>
              {reportCards.map((rc, index) => (
                <DynamicDialogueCard
                  key={rc.session_id}
                  reportCard={rc}
                  index={index}
                  onReportClick={onReportClick}
                />
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Fade>
  );
};

export default DynamicDialoguesTab; 