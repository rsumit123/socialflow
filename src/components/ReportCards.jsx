// src/components/ReportCards.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { 
  School,
  Psychology,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { handleAuthErrors } from '../Api';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@mui/material/styles';
import ScenarioProgressTab from './ReportCards/ScenarioProgressTab';
import DynamicDialoguesTab from './ReportCards/DynamicDialoguesTab';

// Register Chart.js components
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, PointElement, LineElement);

const ReportCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Fetch Dynamic Dialogues Progress Reports
  const fetchReportCards = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/report/report-cards/`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return response.data.report_cards;
    } catch (error) {
      console.error('Error fetching progress reports:', error);
      if (error.response && handleAuthErrors(error.response, navigate)) {
        setErrorMessage('Your session has expired. Please login again!');
      } else {
        setErrorMessage('Failed to load progress reports.');
      }
      setOpenSnackbar(true);
      throw error;
    }
  };

  // Fetch Scenario Progress (Unlocked Lessons)
  const fetchScenarioProgress = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/course_content/unlocked-lessons/?limit=100&offset=0`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      if (handleAuthErrors(response, navigate)) throw new Error("Failed to fetch scenario progress");
      const data = await response.json();
      return data.lessons || [];
    } catch (error) {
      console.error('Error fetching scenario progress:', error);
      setErrorMessage('Failed to load scenario progress.');
      setOpenSnackbar(true);
      throw error;
    }
  };

  const { data: reportCards = [], isLoading: loadingReports } = useQuery({
    queryKey: ['reportCards', user.token],
    queryFn: fetchReportCards,
    enabled: !!user.token,
  });

  const { data: scenarios = [], isLoading: loadingScenarios } = useQuery({
    queryKey: ['scenarioProgress', user.token],
    queryFn: fetchScenarioProgress,
    enabled: !!user.token,
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleReportClick = (session_id) => {
    navigate(`/report-cards/${session_id}`);
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/training/lessondetail/${lessonId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Progress Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Track your learning journey across scenarios and dynamic dialogues
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            '& .MuiTab-root': {
              minHeight: isMobile ? 56 : 64,
              textTransform: 'none',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              fontWeight: 600,
              px: isMobile ? 1 : 4,
              minWidth: isMobile ? 'auto' : 160,
            },
          }}
        >
          <Tab 
            icon={<School sx={{ fontSize: isMobile ? 20 : 24 }} />} 
            label={isMobile ? "Scenarios" : "Scenario Progress"}
            iconPosition={isMobile ? "top" : "start"}
            sx={{ 
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 0.5 : 1,
            }}
          />
          <Tab 
            icon={<Psychology sx={{ fontSize: isMobile ? 20 : 24 }} />} 
            label={isMobile ? "Dialogues" : "Dynamic Dialogues"}
            iconPosition={isMobile ? "top" : "start"}
            sx={{ 
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 0.5 : 1,
            }}
          />
        </Tabs>
      </Box>

      {/* Scenario Progress Tab */}
      {tabValue === 0 && (
        <ScenarioProgressTab
          scenarios={scenarios}
          loadingScenarios={loadingScenarios}
          onLessonClick={handleLessonClick}
        />
      )}

      {/* Dynamic Dialogues Tab */}
      {tabValue === 1 && (
        <DynamicDialoguesTab
          reportCards={reportCards}
          loadingReports={loadingReports}
          onReportClick={handleReportClick}
        />
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
    </Container>
  );
};

export default ReportCards;

