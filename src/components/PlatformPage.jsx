import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthErrors } from '../Api';
import { useQuery } from '@tanstack/react-query';
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
  Divider,
  Paper,
  Avatar,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Lock, 
  Chat, 
  Assessment, 
  School,
  CelebrationOutlined, 
  ArrowForward,
  LocalFireDepartment,
  Psychology,
  EmojiPeople,
  Lightbulb,
  SelfImprovement,
  Groups,
  RecordVoiceOver,
  Stars,
  Info
} from '@mui/icons-material';

const LockedModal = ({ open, onDismiss }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const handleStartScenarios = () => {
    navigate('/all-scenarios');
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
              Ready to Practice?
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
              Jump into our featured scenarios to practice your social skills in a variety of situations.
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
              onClick={handleStartScenarios}
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
              Explore Featured Scenarios
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

// Creative Loading Component
const CreativeLoading = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [loadingText, setLoadingText] = useState('Analyzing your social profile');
  
  useEffect(() => {
    const phrases = [
      'Analyzing your social profile',
      'Curating personalized training modules',
      'Preparing conversation scenarios',
      'Optimizing your learning path',
      'Finalizing your custom training plan'
    ];
    
    let currentPhrase = 0;
    
    const intervalId = setInterval(() => {
      currentPhrase = (currentPhrase + 1) % phrases.length;
      setLoadingText(phrases[currentPhrase]);
      setLoadingPhase(currentPhrase);
    }, 2200);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Icons for each loading phase
  const phaseIcons = [
    <Psychology key="psychology" sx={{ fontSize: { xs: 36, sm: 48 }, color: theme.palette.primary.main }} />,
    <SelfImprovement key="improvement" sx={{ fontSize: { xs: 36, sm: 48 }, color: theme.palette.secondary.main }} />,
    <RecordVoiceOver key="voice" sx={{ fontSize: { xs: 36, sm: 48 }, color: theme.palette.primary.main }} />,
    <Lightbulb key="lightbulb" sx={{ fontSize: { xs: 36, sm: 48 }, color: theme.palette.secondary.main }} />,
    <Groups key="groups" sx={{ fontSize: { xs: 36, sm: 48 }, color: theme.palette.primary.main }} />
  ];
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        background: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        p: 3
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
          opacity: 0.5
        }}
      >
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: { xs: '60px', sm: '80px', md: '100px' },
              height: { xs: '60px', sm: '80px', md: '100px' },
              borderRadius: '50%',
              background: i % 2 === 0 
                ? `radial-gradient(circle, ${theme.palette.primary.main}22, ${theme.palette.primary.main}11)`
                : `radial-gradient(circle, ${theme.palette.secondary.main}22, ${theme.palette.secondary.main}11)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float${i} ${10 + i * 2}s infinite ease-in-out`,
              '@keyframes float0': {
                '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                '50%': { transform: 'translate(30px, -30px) scale(1.1)' }
              },
              '@keyframes float1': {
                '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                '50%': { transform: 'translate(-40px, 20px) scale(1.15)' }
              },
              '@keyframes float2': {
                '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                '50%': { transform: 'translate(20px, 40px) scale(1.05)' }
              },
              '@keyframes float3': {
                '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                '50%': { transform: 'translate(-30px, -20px) scale(1.1)' }
              },
              '@keyframes float4': {
                '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                '50%': { transform: 'translate(40px, 30px) scale(1.2)' }
              },
              '@keyframes float5': {
                '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                '50%': { transform: 'translate(-20px, 40px) scale(1.1)' }
              }
            }}
          />
        ))}
      </Box>
      
      {/* Main content */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: '24px',
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(145deg, #ffffff 0%, ${theme.palette.background.paper} 100%)`,
          maxWidth: '500px',
          width: '100%',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          boxShadow: `0 20px 80px -10px ${theme.palette.primary.main}44`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant={isSmallScreen ? 'h5' : 'h4'}
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 1,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            SocialFlow
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Your personalized social skills journey
          </Typography>
        </Box>
        
        {/* Icon container with animation */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 4,
            position: 'relative'
          }}
        >
          <Box
            sx={{
              width: { xs: '100px', sm: '120px' },
              height: { xs: '100px', sm: '120px' },
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}33)`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          >
            {/* Rotating circle around icon */}
            <Box
              sx={{
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                right: '-10px',
                bottom: '-10px',
                borderRadius: '50%',
                border: `2px dashed ${theme.palette.primary.main}44`,
                animation: 'spin 10s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            />
            
            {/* Animated dots around the circle */}
            {[...Array(5)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: i % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 72}deg) translateX(60px) rotate(-${i * 72}deg)`,
                  animation: `blink 1.5s infinite ease-in-out ${i * 0.3}s`,
                  '@keyframes blink': {
                    '0%, 100%': { opacity: 0.4, transform: `rotate(${i * 72}deg) translateX(60px) rotate(-${i * 72}deg) scale(1)` },
                    '50%': { opacity: 1, transform: `rotate(${i * 72}deg) translateX(60px) rotate(-${i * 72}deg) scale(1.3)` }
                  }
                }}
              />
            ))}
            
            {/* Current phase icon with fade transition */}
            <Fade in={true} key={loadingPhase} timeout={500}>
              <Box>{phaseIcons[loadingPhase]}</Box>
            </Fade>
          </Box>
        </Box>
        
        {/* Loading text with fade transition */}
        <Fade in={true} key={loadingText} timeout={500}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                minHeight: '32px'
              }}
            >
              {loadingText}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              This may take a few moments
            </Typography>
          </Box>
        </Fade>
        
        {/* Progress indicator */}
        <Box sx={{ px: 4 }}>
          <Box
            sx={{
              height: '6px',
              borderRadius: '3px',
              background: theme.palette.grey[200],
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '30%',
                borderRadius: '3px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                animation: 'progress 2.2s infinite ease-in-out',
                '@keyframes progress': {
                  '0%': { left: '-30%', width: '30%' },
                  '50%': { left: '30%', width: '40%' },
                  '100%': { left: '100%', width: '30%' }
                }
              }}
            />
          </Box>
        </Box>
        
        {/* Testimonial/tip */}
        <Box
          sx={{
            mt: 4,
            p: 2,
            borderRadius: '12px',
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Lightbulb fontSize="small" color="primary" />
            "Effective communication is 20% what you know and 80% how you feel about what you know."
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

const PlatformPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  const fetchTrainingStatus = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/course_content/training_plan_status/`,
      {
        headers: { Authorization: `Bearer ${user?.token}` },
      }
    );
    if (handleAuthErrors(response, navigate, logout)) throw new Error("Failed to fetch training status");
    return response.json();
  };

  const { data: trainingStatus, isLoading } = useQuery({
    queryKey: ['trainingPlanStatus', user?.token],
    queryFn: fetchTrainingStatus,
    enabled: !!user?.token,
  });
  
  useEffect(() => {
    if (trainingStatus?.new_user && !sessionStorage.getItem('newUserModalDismissed')) {
      setShowLockedModal(true);
    }
  }, [trainingStatus]);

  const handleDismissModal = () => {
    setShowLockedModal(false);
    sessionStorage.setItem('newUserModalDismissed', 'true');
  };

  const modules = [
    {
      title: 'Quick Bites',
      icon: <Stars sx={{ fontSize: 40 }} />,
      description: 'Test your social skills in 90 seconds',
      detailedDescription: 'Jump directly into a variety of practice scenarios. Perfect for quick skill building sessions when you have limited time. Each scenario is designed to be completed in under 2 minutes.',
      path: '/all-scenarios',
      locked: false,
      isFeatured: true,
    },
    {
      title: 'Mission Control',
      icon: <LocalFireDepartment sx={{ fontSize: 40 }} />,
      description: 'Complete conversation missions with specific objectives.',
      detailedDescription: 'Master targeted communication skills through goal-oriented practice sessions. Each mission focuses on specific social situations with clear objectives and real-time AI coaching feedback.',
      path: '/goal-objectives',
      locked: false,
      isNew: true,
    },
    {
      title: 'Dynamic Dialogues',
      icon: <Chat sx={{ fontSize: 40 }} />,
      description: 'Practice conversations with AI personas and improve your communication skills.',
      detailedDescription: 'Engage in free-flowing conversations with diverse AI personalities. Build confidence through natural dialogue practice without pressure or judgment.',
      path: '/bots',
      locked: false,
    },
    {
      title: 'Progress Tracker',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      description: 'Review your performance and track your progress',
      detailedDescription: 'Monitor your communication skill development with detailed analytics, performance metrics, and personalized insights to guide your learning journey.',
      path: '/report-cards',
      locked: false,
    },
  ];

  const handleModuleClick = (path, locked) => {
    if (!locked) {
      navigate(path);
    }
  };

  const handleInfoClick = (index, event) => {
    event.stopPropagation(); // Prevent card click
    setExpandedCard(expandedCard === index ? null : index);
  };

  if (isLoading) {
    return <CreativeLoading />;
  }

  return (
    <>
      <LockedModal open={showLockedModal} onDismiss={handleDismissModal} />

      <Box sx={{ flexGrow: 1, backgroundColor: theme.palette.background.default }}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '100vh',
            py: { xs: 4, md: 8 },
            background: `
              radial-gradient(circle at 20% 50%, ${theme.palette.primary.main}15 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${theme.palette.secondary.main}15 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, ${theme.palette.primary.main}10 0%, transparent 50%),
              linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)
            `,
            animation: 'backgroundShift 20s ease-in-out infinite',
            '@keyframes backgroundShift': {
              '0%, 100%': { 
                background: `
                  radial-gradient(circle at 20% 50%, ${theme.palette.primary.main}15 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, ${theme.palette.secondary.main}15 0%, transparent 50%),
                  radial-gradient(circle at 40% 80%, ${theme.palette.primary.main}10 0%, transparent 50%),
                  linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)
                `
              },
              '50%': { 
                background: `
                  radial-gradient(circle at 80% 30%, ${theme.palette.primary.main}20 0%, transparent 50%),
                  radial-gradient(circle at 20% 70%, ${theme.palette.secondary.main}20 0%, transparent 50%),
                  radial-gradient(circle at 60% 10%, ${theme.palette.primary.main}15 0%, transparent 50%),
                  linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)
                `
              },
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: `
                conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${theme.palette.primary.main}05 60deg, transparent 120deg),
                conic-gradient(from 180deg at 20% 80%, transparent 0deg, ${theme.palette.secondary.main}08 90deg, transparent 180deg)
              `,
              opacity: 0.6,
              animation: 'rotate 60s linear infinite',
              '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: `
                radial-gradient(circle at 10% 20%, ${theme.palette.primary.main}08 0%, transparent 30%),
                radial-gradient(circle at 90% 80%, ${theme.palette.secondary.main}08 0%, transparent 30%),
                radial-gradient(circle at 50% 50%, ${theme.palette.primary.main}05 0%, transparent 40%)
              `,
              opacity: 0.4,
              animation: 'float 15s ease-in-out infinite alternate',
              '@keyframes float': {
                '0%': { transform: 'translateY(0px) scale(1)' },
                '100%': { transform: 'translateY(-20px) scale(1.02)' },
              },
            },
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 }, position: 'relative', zIndex: 2 }}>
              {/* Floating decorative elements */}
              <Box sx={{ 
                position: 'absolute', 
                top: '-20px', 
                left: '10%', 
                width: '60px', 
                height: '60px',
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}30)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.primary.main}30`,
                animation: 'floatBubble 8s ease-in-out infinite',
                '@keyframes floatBubble': {
                  '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                  '50%': { transform: 'translateY(-30px) rotate(180deg)' },
                },
                display: { xs: 'none', md: 'block' }
              }} />
              
              <Box sx={{ 
                position: 'absolute', 
                top: '10px', 
                right: '15%', 
                width: '40px', 
                height: '40px',
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${theme.palette.secondary.main}25, ${theme.palette.primary.main}35)`,
                backdropFilter: 'blur(15px)',
                border: `1px solid ${theme.palette.secondary.main}40`,
                animation: 'floatBubble 6s ease-in-out infinite 2s',
                display: { xs: 'none', md: 'block' }
              }} />
              
              <Typography
                variant={isSmallScreen ? 'h4' : 'h3'}
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 4s ease-in-out infinite',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  textShadow: `0 4px 20px ${theme.palette.primary.main}30`,
                  '@keyframes gradientShift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                  },
                }}
              >
                {user?.first_name 
                  ? `Ready to practice, ${user.first_name}?` 
                  : 'What would you like to practice today?'
                }
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  maxWidth: '700px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  background: `linear-gradient(45deg, ${theme.palette.text.secondary}, ${theme.palette.text.primary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  opacity: 0.9,
                }}
              >
                🚀 Choose your learning path and start building your communication skills
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center" sx={{ position: 'relative', zIndex: 2 }}>
              {modules.map((module, index) => {
                const featuredStyles = module.isFeatured ? {
                  animation: 'pulse-glow 3s infinite alternate, float 6s ease-in-out infinite',
                  '@keyframes pulse-glow': {
                    'from': {
                      boxShadow: `0 20px 40px -10px ${theme.palette.primary.main}40, 0 10px 25px -5px ${theme.palette.primary.main}30`,
                    },
                    'to': {
                      boxShadow: `0 25px 50px -10px ${theme.palette.secondary.main}50, 0 15px 35px -5px ${theme.palette.secondary.main}40`,
                    },
                  },
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                  },
                } : {};

                return (
                  <Grid 
                    item 
                    xs={12} 
                    sm={6} 
                    md={6} 
                    lg={3} 
                    key={index}
                    sx={{
                      animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                      '@keyframes slideInUp': {
                        'from': { 
                          opacity: 0, 
                          transform: 'translateY(50px)' 
                        },
                        'to': { 
                          opacity: 1, 
                          transform: 'translateY(0)' 
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: '24px',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: module.locked ? 'not-allowed' : 'pointer',
                        position: 'relative',
                        background: `
                          linear-gradient(135deg, 
                            ${theme.palette.background.paper}95 0%, 
                            ${theme.palette.background.default}90 100%
                          )
                        `,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${theme.palette.primary.main}20`,
                        boxShadow: `0 8px 32px -8px ${theme.palette.primary.main}20`,
                        overflow: 'hidden',
                        '&:hover': {
                          transform: module.locked ? 'none' : 'translateY(-20px) scale(1.02)',
                          boxShadow: module.locked
                            ? `0 8px 32px -8px ${theme.palette.primary.main}20`
                            : module.isFeatured
                            ? `0 30px 60px -10px ${theme.palette.secondary.main}60, 0 20px 40px -5px ${theme.palette.secondary.main}40`
                            : `0 25px 50px -10px ${theme.palette.primary.main}40, 0 15px 30px -5px ${theme.palette.primary.main}30`,
                          '& .card-icon': {
                            transform: 'scale(1.1) rotate(5deg)',
                          },
                          '& .card-glow': {
                            opacity: 1,
                          },
                        },
                        height: '100%',
                        p: { xs: 3, md: 4 },
                        textAlign: 'center',
                        ...featuredStyles,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          borderRadius: 'inherit',
                          zIndex: 0,
                        },
                        '&:hover::before': {
                          opacity: 1,
                        },
                      }}
                      onClick={() => handleModuleClick(module.path, module.locked)}
                    >
                      {/* Animated glow effect */}
                      <Box
                        className="card-glow"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '200%',
                          height: '200%',
                          background: `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`,
                          transform: 'translate(-50%, -50%)',
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                          zIndex: 0,
                          animation: 'pulse 4s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
                            '50%': { transform: 'translate(-50%, -50%) scale(1.1)' },
                          },
                        }}
                      />
                      
                      {module.isFeatured && (
                        <Chip
                          icon={<Stars sx={{ color: 'white !important' }}/>}
                          label="Recommended"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            color: 'white',
                            fontWeight: 700,
                            boxShadow: `0 6px 20px ${theme.palette.primary.main}40`,
                            animation: 'sparkle 2s ease-in-out infinite',
                            '@keyframes sparkle': {
                              '0%, 100%': { transform: 'scale(1)' },
                              '50%': { transform: 'scale(1.05)' },
                            },
                          }}
                        />
                      )}
                      {module.isNew && (
                        <Chip
                          label="NEW"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 3,
                            background: `linear-gradient(45deg, #FF6B6B, #FF8E53)`,
                            color: 'white',
                            fontWeight: 700,
                            boxShadow: '0 6px 20px rgba(255, 107, 107, 0.5)',
                            animation: 'pulse-new 1.5s infinite',
                            '@keyframes pulse-new': {
                              '0%': { transform: 'scale(1)' },
                              '50%': { transform: 'scale(1.08)' },
                              '100%': { transform: 'scale(1)' },
                            }
                          }}
                        />
                      )}
                                            {/* Info icon with mobile-friendly click support */}
                      {isSmallScreen ? (
                        <IconButton
                          size="small"
                          onClick={(e) => handleInfoClick(index, e)}
                          sx={{
                            position: 'absolute',
                            top: module.isFeatured || module.isNew ? 60 : 16,
                            right: 16,
                            zIndex: 3,
                            backgroundColor: expandedCard === index 
                              ? `${theme.palette.primary.main}f0` 
                              : `${theme.palette.background.paper}90`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.palette.primary.main}40`,
                            color: expandedCard === index ? 'white' : theme.palette.primary.main,
                            width: 32,
                            height: 32,
                            '&:active': {
                              transform: 'scale(0.95)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Info sx={{ fontSize: 18 }} />
                        </IconButton>
                      ) : (
                        <Tooltip
                          title={module.detailedDescription}
                          placement="top"
                          arrow
                          sx={{
                            '& .MuiTooltip-tooltip': {
                              maxWidth: 300,
                              fontSize: '0.875rem',
                              lineHeight: 1.4,
                              backgroundColor: `${theme.palette.background.paper}f0`,
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${theme.palette.primary.main}30`,
                            }
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: module.isFeatured || module.isNew ? 60 : 16,
                              right: 16,
                              zIndex: 3,
                              backgroundColor: `${theme.palette.background.paper}90`,
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${theme.palette.primary.main}40`,
                              color: theme.palette.primary.main,
                              width: 32,
                              height: 32,
                              '&:hover': {
                                backgroundColor: `${theme.palette.primary.main}f0`,
                                color: 'white',
                                transform: 'scale(1.15)',
                                boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <Info sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {/* Icon + Lock overlay if locked */}
                                              <Box
                          sx={{
                            mb: 3,
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: { xs: 70, md: 80 },
                            height: { xs: 70, md: 80 },
                            zIndex: 1,
                          }}
                        >
                          <Box
                            className="card-icon"
                            sx={{
                              transition: 'all 0.3s ease',
                              color: module.locked ? 'text.disabled' : theme.palette.primary.main,
                              filter: module.locked ? 'grayscale(100%)' : 'none',
                            }}
                          >
                            {module.icon}
                          </Box>
                                                  {module.locked && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                backdropFilter: 'blur(5px)',
                                borderRadius: '50%',
                                width: 45,
                                height: 45,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2,
                              }}
                            >
                              <Lock sx={{ color: 'white', fontSize: 20 }} />
                            </Box>
                          )}
                      </Box>

                                              <Typography
                          variant={isSmallScreen ? "h6" : "h5"}
                          sx={{
                            fontWeight: 800,
                            mb: 2.5,
                            color: module.locked ? 'text.disabled' : 'text.primary',
                            letterSpacing: '-0.01em',
                            position: 'relative',
                            zIndex: 1,
                          }}
                        >
                          {module.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: module.locked ? 'text.disabled' : 'text.secondary',
                            lineHeight: 1.6,
                            fontSize: { xs: '0.95rem', md: '1rem' },
                            fontWeight: 500,
                            position: 'relative',
                            zIndex: 1,
                          }}
                        >
                          {module.description}
                        </Typography>
                        
                        {/* Expanded description for mobile */}
                        {isSmallScreen && expandedCard === index && (
                          <Box
                            sx={{
                              mt: 2,
                              p: 2,
                              borderRadius: '12px',
                              backgroundColor: `${theme.palette.primary.main}10`,
                              border: `1px solid ${theme.palette.primary.main}30`,
                              animation: 'slideDown 0.3s ease-out',
                              '@keyframes slideDown': {
                                'from': { 
                                  opacity: 0, 
                                  transform: 'translateY(-10px)' 
                                },
                                'to': { 
                                  opacity: 1, 
                                  transform: 'translateY(0)' 
                                },
                              },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                lineHeight: 1.5,
                                fontSize: '0.9rem',
                              }}
                            >
                              {module.detailedDescription}
                            </Typography>
                          </Box>
                        )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default PlatformPage;
