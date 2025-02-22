import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  useTheme, 
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock, LockOpen, Chat, Assessment, School } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthErrors } from '../Api';

const PlatformPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [trainingLocked, setTrainingLocked] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTrainingStatus = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/course_content/training_plan_status/`,
          {
            headers: { Authorization: `Bearer ${user?.token}` }, // Ensure token exists
          }
        );

        console.log(response);

        handleAuthErrors(response, navigate);

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setTrainingLocked(data.is_locked);
      } catch (error) {
        console.error("Error checking training status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      checkTrainingStatus();
    }
    
  }, []);

  const modules = [
    {
      title: 'Evaluate',
      icon: <Chat sx={{ fontSize: 40 }} />,
      description: 'Practice your communication skills in real-time scenarios',
      path: '/chat',
      locked: false
    },
    {
      title: 'Report Cards',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      description: 'Review your performance and track your progress',
      path: '/report-cards',
      locked: false
    },
    {
      title: 'Training Plan',
      icon: <School sx={{ fontSize: 40 }} />,
      description: 'Access structured learning modules and exercises',
      path: '/training/1',
      locked: trainingLocked
    }
  ];

  const handleModuleClick = (path, locked) => {
    if (!locked) {
      navigate(path);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: theme.spacing(4, 2),
        minHeight: '80vh',
        backgroundColor: 'background.default'
      }}
    >
      <Typography
        variant={isSmallScreen ? 'h4' : 'h3'}
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Welcome to SocialFlow!
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {modules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: module.locked ? 'not-allowed' : 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: module.locked ? 'none' : 'translateY(-8px)',
                  boxShadow: module.locked ? 4 : 8
                },
                position: 'relative',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              }}
              onClick={() => handleModuleClick(module.path, module.locked)}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                    color: module.locked ? 'text.disabled' : 'secondary.main'
                  }}
                >
                  {module.icon}
                  {module.locked && (
                    <Lock
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: 'text.disabled'
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    color: module.locked ? 'text.disabled' : 'text.primary'
                  }}
                >
                  {module.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: module.locked ? 'text.disabled' : 'text.secondary'
                  }}
                >
                  {module.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlatformPage;