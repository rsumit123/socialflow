import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthErrors } from '../Api';
import { 
  Box, 
  Grid, 
  Typography, 
  useTheme, 
  useMediaQuery,
  CircularProgress,
  Container,
  Button, 
  Modal, 
  Fade,
  Stack,
  Divider
} from '@mui/material';
import { 
  Lock, 
  Chat, 
  Assessment, 
  School,
  CelebrationOutlined, 
  ArrowForward,
  LocalFireDepartment
} from '@mui/icons-material';

const LockedModal = ({ open, onDismiss }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const handleIcebreaking = () => {
    navigate('/training/subcategories/4');
  };
  
  return (
    <Modal
      open={open}
      onClose={onDismiss}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1.5, sm: 2 },
        backdropFilter: 'blur(8px)'
      }}
    >
      <Fade in={open}>
        <Box 
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: { xs: '95%', sm: '450px' },
            maxWidth: '95vw',
            maxHeight: { xs: '90vh', sm: 'auto' },
            overflowY: { xs: 'auto', sm: 'visible' },
            borderRadius: { xs: '20px', sm: '24px' },
            position: 'relative',
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`
              : `linear-gradient(145deg, #ffffff 0%, ${theme.palette.background.paper} 100%)`,
            border: `1px solid ${theme.palette.primary.main}22`,
            boxShadow: `0 25px 50px -12px ${theme.palette.primary.main}44`,
            textAlign: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 20%, ${theme.palette.primary.main}22, transparent 30%), 
                           radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main}22, transparent 30%)`,
              backgroundSize: '120px 120px',
              opacity: 0.6,
              zIndex: 0,
              borderRadius: 'inherit',
            }
          }}
        >
          {/* Floating decorative elements */}
          <Box sx={{ 
            position: 'absolute', 
            top: '10%', 
            right: '10%', 
            width: '40px', 
            height: '40px',
            borderRadius: '50%',
            background: `${theme.palette.primary.main}22`,
            zIndex: 0,
            animation: 'float 8s infinite ease-in-out',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0) scale(1)' },
              '50%': { transform: 'translateY(-15px) scale(1.1)' },
            }
          }} />
          
          <Box sx={{ 
            position: 'absolute', 
            bottom: '15%', 
            left: '10%', 
            width: '25px', 
            height: '25px',
            borderRadius: '50%',
            background: `${theme.palette.secondary.main}22`,
            zIndex: 0,
            animation: 'float 6s infinite ease-in-out 1s',
          }} />
          
          {/* Header with celebration icon */}
          <Box 
            sx={{ 
              position: 'relative',
              zIndex: 1,
              pt: { xs: 4, sm: 5 },
              pb: { xs: 3, sm: 4 },
              px: { xs: 2.5, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Icon container with animated background */}
            <Box 
              sx={{ 
                mb: 3,
                width: { xs: '70px', sm: '80px' },
                height: { xs: '70px', sm: '80px' },
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}33)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: `0 15px 30px ${theme.palette.primary.main}33`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-5px',
                  left: '-5px',
                  right: '-5px',
                  bottom: '-5px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  opacity: 0.5,
                  zIndex: -1,
                  animation: 'pulse 3s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 0.5 },
                    '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                    '100%': { transform: 'scale(1)', opacity: 0.5 },
                  }
                }
              }}
            >
              <CelebrationOutlined 
                sx={{ 
                  fontSize: { xs: 35, sm: 40 }, 
                  color: theme.palette.primary.main,
                  animation: 'rotate 10s linear infinite',
                  '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  }
                }}
              />
            </Box>
            
            {/* Congratulations text */}
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              sx={{
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px',
              }}
            >
              You've Unlocked a New Journey!
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 3,
                lineHeight: 1.6,
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.95rem', sm: '1rem' },
                maxWidth: '90%',
                mx: 'auto'
              }}
            >
              Take your first step toward building meaningful connections with our interactive icebreaker exercises.
            </Typography>
          </Box>
          
          {/* Divider with animated gradient */}
          <Divider 
            sx={{ 
              opacity: 0.6,
              height: '2px',
              background: `linear-gradient(to right, transparent, ${theme.palette.primary.main}33, ${theme.palette.secondary.main}33, transparent)`,
              my: 0,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(to right, transparent, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, transparent)`,
                opacity: 0.3,
                animation: 'shimmer 3s infinite linear',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' },
                }
              }
            }} 
          />
          
          {/* Bottom section with button */}
          <Box 
            sx={{ 
              position: 'relative',
              zIndex: 1,
              p: { xs: 3, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Progress indicator */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 3,
              gap: 1
            }}>
              <Box sx={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: theme.palette.primary.main,
                opacity: 1
              }} />
              <Box sx={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: theme.palette.grey[400],
                opacity: 0.5
              }} />
              <Box sx={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: theme.palette.grey[400],
                opacity: 0.5
              }} />
            </Box>
            
            {/* Highlight text */}
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: theme.palette.primary.main,
                background: `${theme.palette.primary.main}11`,
                border: `1px solid ${theme.palette.primary.main}22`,
                borderRadius: '12px',
                py: 1.5,
                px: 3,
                width: 'fit-content',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <LocalFireDepartment fontSize="small" />
              Ready to break the ice?
            </Typography>
            
            {/* Button with animation */}
            <Button
              variant="contained"
              color="primary"
              size={isSmallScreen ? "medium" : "large"}
              onClick={handleIcebreaking}
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: '14px',
                px: { xs: 3, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 8px 20px ${theme.palette.primary.main}44`,
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: `0 12px 25px ${theme.palette.primary.main}66`,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                },
                transition: 'all 0.3s ease',
                animation: 'spotlight 2s infinite ease-in-out',
                '@keyframes spotlight': {
                  '0%': { boxShadow: `0 8px 20px ${theme.palette.primary.main}44` },
                  '50%': { boxShadow: `0 8px 25px ${theme.palette.primary.main}88` },
                  '100%': { boxShadow: `0 8px 20px ${theme.palette.primary.main}44` },
                },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Start Icebreaker Lessons
            </Button>
            
            {/* Skip option for mobile */}
            {isSmallScreen && (
              <Button
                variant="text"
                color="inherit"
                onClick={onDismiss}
                sx={{
                  mt: 2,
                  fontSize: '0.85rem',
                  color: theme.palette.text.secondary,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'transparent',
                    color: theme.palette.text.primary,
                  }
                }}
              >
                Maybe later
              </Button>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
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
      title: 'Chat & Check',
      icon: <Chat sx={{ fontSize: 40 }} />,
      description: 'Practice your communication skills -> Get Feedback -> Repeat',
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
