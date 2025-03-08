import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  useTheme, 
  useMediaQuery,
  CircularProgress,
  Container
} from '@mui/material';
import { Lock, Chat, Assessment, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthErrors } from '../Api';

// A separate modal component that appears when training is locked.
const LockedModal = ({ open, onDismiss }) => {
    const theme = useTheme();
    const navigate = useNavigate();
  
    // Evaluate remains the same.
    const handleEvaluate = () => {
      navigate('/bots');
    };
  
    // New Icebreaking button navigates to "/training/subcategories/4"
    const handleIcebreaking = () => {
      navigate('/training/subcategories/4');
    };
  
    return open ? (
      <Box
        sx={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={onDismiss}  // Clicking outside also closes the modal
      >
        <Box
          onClick={(e) => e.stopPropagation()} // Prevent click-through close
          sx={{
            width: { xs: '80%', sm: '400px' },
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            boxShadow: 24,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome to SocialFlow
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            To help us create customized training plans for you, please choose one of the options below:
            complete your assessment in <strong>Evaluate</strong>, or jump straight into your  <strong>Training Plan.</strong>.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Typography
              variant="button"
              onClick={handleEvaluate}
              sx={{
                cursor: 'pointer',
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                textDecoration: 'underline',
                '&:hover': { color: theme.palette.secondary.main }
              }}
            >
              Go to Evaluate
            </Typography>
            <Typography
              variant="button"
              onClick={handleIcebreaking}
              sx={{
                cursor: 'pointer',
                color: theme.palette.secondary.main,
                fontWeight: 'bold',
                textDecoration: 'underline',
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Icebreak
            </Typography>
          </Box>
        </Box>
      </Box>
    ) : null;
  };
  
const PlatformPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [trainingLocked, setTrainingLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // When this is true, we highlight the "Evaluate" module
  const [highlightEvaluate, setHighlightEvaluate] = useState(false);

  // Controls the modal
  const [showLockedModal, setShowLockedModal] = useState(false);

  useEffect(() => {
    const checkTrainingStatus = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/course_content/training_plan_status/`,
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );

        // If auth error occurred, stop further processing.
        if (handleAuthErrors(response, navigate)) return;

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setTrainingLocked(data.new_user);

        // If locked, show modal
        if (data.new_user) {
          setShowLockedModal(true);
        }
      } catch (error) {
        console.error("Error checking training status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      checkTrainingStatus();
    } else {
      setLoading(false);
    }
  }, [navigate, user?.token]);

  // Called when the modal is dismissed by clicking outside or "Maybe Later"
  const handleDismissModal = () => {
    setShowLockedModal(false);
    // highlight the Evaluate module so user sees it
    setHighlightEvaluate(true);
  };

  const modules = [
    {
      title: 'Evaluate',
      icon: <Chat sx={{ fontSize: 40 }} />,
      description: 'Practice your communication skills in real-time scenarios',
      path: '/bots',
      locked: false,
    },
    {
      title: 'Report Cards',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      description: 'Review your performance and track your progress',
      path: '/report-cards',
      locked: false,
    },
    {
      title: 'Training Plan',
      icon: <School sx={{ fontSize: 40 }} />,
      description: 'Access structured learning modules and exercises',
      path: '/training/1',
      locked: false,
    },
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
    <>
      <LockedModal open={showLockedModal} onDismiss={handleDismissModal} />

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '80vh',
          py: { xs: 6, md: 10 },
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(circle at 30% 70%, ${theme.palette.primary.main}22, transparent 25%), 
                         radial-gradient(circle at 70% 30%, ${theme.palette.secondary.main}22, transparent 25%)`,
            backgroundSize: '60px 60px',
            opacity: 0.3,
          },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant={isSmallScreen ? 'h4' : 'h3'}
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 4,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome to SocialFlow!
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {modules.map((module, index) => {
              // If highlightEvaluate is true, add a special highlight style to the Evaluate module
              const isEvaluate = module.title === 'Evaluate';
              const highlightStyle = highlightEvaluate && isEvaluate ? {
                animation: 'highlightPulse 1.5s infinite alternate',
                border: `2px solid ${theme.palette.secondary.main}aa`,
              } : {};

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                    sx={{
                      borderRadius: '20px',
                      transition: 'all 0.3s ease',
                      cursor: module.locked ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                      border: `1px solid ${theme.palette.primary.main}11`,
                      boxShadow: 4,
                      '&:hover': {
                        transform: module.locked ? 'none' : 'translateY(-12px)',
                        boxShadow: module.locked
                          ? 4
                          : `0 20px 40px ${theme.palette.primary.main}22`,
                      },
                      height: '100%',
                      p: 4,
                      textAlign: 'center',
                      '@keyframes highlightPulse': {
                        '0%': { boxShadow: `0 0 0 0 ${theme.palette.secondary.main}` },
                        '100%': { boxShadow: `0 0 10px 6px ${theme.palette.secondary.main}44` },
                      },
                      ...highlightStyle,
                    }}
                    onClick={() => handleModuleClick(module.path, module.locked)}
                  >
                    {/* Icon + Lock overlay if locked */}
                    <Box
                      sx={{
                        mb: 2,
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                      }}
                    >
                      {module.icon}
                      {module.locked && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Lock sx={{ color: 'white' }} />
                        </Box>
                      )}
                    </Box>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 'bold',
                        mb: 2,
                        color: module.locked ? 'text.disabled' : 'text.primary',
                      }}
                    >
                      {module.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: module.locked ? 'text.disabled' : 'text.secondary',
                      }}
                    >
                      {module.description}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default PlatformPage;
