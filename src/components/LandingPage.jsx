import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  useTheme, 
  useMediaQuery,
  Container,
  Card,
  CardContent,
  Stack,
  Chip
} from '@mui/material';
import { 
  Chat, 
  EmojiPeople, 
  WorkOutline,
  Psychology,
  TrendingUp,
  ArrowForward,
  Lightbulb,
  SentimentSatisfiedAlt,
  LocalCafe
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/platform');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <Psychology sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: "Real Convos, Zero Judgment",
      description: "Practice authentic interactions in a safe space where mistakes are just learning steps"
    },
    {
      icon: <TrendingUp sx={{ fontSize: 50, color: theme.palette.secondary.main }} />,
      title: "See Your Growth",
      description: "Watch your skills level up with personalized feedback and visual progress tracking"
    },
    {
      icon: <WorkOutline sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: "Career Supercharge",
      description: "Boost your professional presence and unlock new opportunities with better communication"
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section with Animated Background */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          // pt: isSmallScreen ? 4 : 0,
          pt: { xs: 4, md: 8 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 30% 70%, ${theme.palette.primary.main}22, transparent 25%), 
                         radial-gradient(circle at 70% 30%, ${theme.palette.secondary.main}22, transparent 25%)`,
            backgroundSize: '60px 60px',
            animation: 'fadeInOut 15s infinite alternate',
            opacity: 0.5,
          },
          '@keyframes fadeInOut': {
            '0%': { opacity: 0.3 },
            '100%': { opacity: 0.7 },
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Chip 
                  label="LEVEL UP NOW" 
                  color="primary" 
                  size="medium" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 'bold', 
                    borderRadius: '12px', 
                    fontSize: '0.9rem',
                    background: theme.palette.primary.main + '33',
                    color: theme.palette.primary.main,
                    border: '1px solid ' + theme.palette.primary.main + '44',
                  }} 
                />
                <Typography
                  variant={isSmallScreen ? 'h3' : 'h1'}
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 2,
                    letterSpacing: '-0.5px',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Social Skills?<br/>
                  <span style={{ opacity: 0.8 }}>Yeah, We Got You.</span>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    mb: 4,
                    fontWeight: 400,
                    maxWidth: '90%'
                  }}
                >
                  Upgrade your communication game through immersive practice that actually works.
                  Build real confidence, crush social anxiety, and unlock your potential.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 2 } }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowForward />}
                    sx={{
                      borderRadius: '14px',
                      px: 4,
                      py: 1.8,
                      fontSize: '1rem',
                      textTransform: 'none',
                      fontWeight: 600,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: '0 8px 20px ' + theme.palette.primary.main + '44',
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 12px 25px ' + theme.palette.primary.main + '66'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Start Your Journey
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/about')}
                    sx={{
                      borderRadius: '14px',
                      px: 4,
                      py: 1.8,
                      fontSize: '1rem',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        transform: 'translateY(-3px) scale(1.02)',
                        background: theme.palette.background.paper + '88'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
                
                {/* Value Props instead of stats */}
                <Stack 
                  direction="row" 
                  spacing={2} 
                  sx={{ 
                    mt: 5, 
                    flexWrap: 'wrap', 
                    gap: 2,
                    '& > div': {
                      backdropFilter: 'blur(10px)',
                      background: theme.palette.background.paper + '66',
                      border: '1px solid ' + theme.palette.primary.main + '22',
                      borderRadius: '12px',
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }
                  }}
                >
                  <Box>
                    <Lightbulb sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Personalized Learning</Typography>
                  </Box>
                  <Box>
                    <SentimentSatisfiedAlt sx={{ color: theme.palette.secondary.main }} />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Anxiety-Free Zone</Typography>
                  </Box>
                  <Box>
                    <LocalCafe sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Practice Anytime</Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
            <Grid 
              item 
              xs={12} 
              md={6} 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {/* Creative interactive illustration */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: isSmallScreen ? '350px' : '500px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  perspective: '1000px',
                }}
              >
                {/* Floating conversation bubbles */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: isSmallScreen ? '60px' : '80px',
                    height: isSmallScreen ? '60px' : '80px',
                    borderRadius: '50%',
                    background: theme.palette.primary.main + '22',
                    border: `1px solid ${theme.palette.primary.main}44`,
                    left: isSmallScreen ? '15%' : '20%',
                    top: '15%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    animation: 'floatBubble1 5s ease-in-out infinite',
                    '@keyframes floatBubble1': {
                      '0%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-15px)' },
                      '100%': { transform: 'translateY(0px)' },
                    },
                    boxShadow: `0 10px 20px ${theme.palette.primary.main}22`,
                  }}
                >
                  <Chat sx={{ color: theme.palette.primary.main, fontSize: isSmallScreen ? '30px' : '40px' }} />
                </Box>
                
                <Box
                  sx={{
                    position: 'absolute',
                    width: isSmallScreen ? '50px' : '70px',
                    height: isSmallScreen ? '50px' : '70px',
                    borderRadius: '50%',
                    background: theme.palette.secondary.main + '22',
                    border: `1px solid ${theme.palette.secondary.main}44`,
                    right: isSmallScreen ? '20%' : '15%',
                    top: '25%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    animation: 'floatBubble2 6s ease-in-out infinite 1s',
                    '@keyframes floatBubble2': {
                      '0%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-20px)' },
                      '100%': { transform: 'translateY(0px)' },
                    },
                    boxShadow: `0 10px 20px ${theme.palette.secondary.main}22`,
                  }}
                >
                  <Chat sx={{ color: theme.palette.secondary.main, fontSize: isSmallScreen ? '25px' : '35px' }} />
                </Box>
                
                {/* Main character */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: isSmallScreen ? '220px' : '300px',
                    height: isSmallScreen ? '220px' : '300px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}33)`,
                    border: `2px solid ${theme.palette.primary.main}33`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: `0 20px 50px ${theme.palette.primary.main}33`,
                    animation: 'pulse 6s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' },
                      '100%': { transform: 'scale(1)' },
                    },
                    zIndex: 2,
                  }}
                >
                  <EmojiPeople 
                    sx={{
                      fontSize: isSmallScreen ? '140px' : '200px',
                      color: theme.palette.primary.main,
                      animation: 'wave 3s ease-in-out infinite',
                      '@keyframes wave': {
                        '0%': { transform: 'rotate(0deg)' },
                        '15%': { transform: 'rotate(15deg)' },
                        '30%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(0deg)' },
                      },
                      transformOrigin: 'bottom center',
                    }}
                  />
                </Box>
                
                {/* Dynamic curved line connecting elements */}
                <Box
                  component="svg"
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                  }}
                  viewBox="0 0 400 400"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 90,100 Q 150,50 200,200 Q 250,350 310,150"
                    fill="none"
                    stroke={`${theme.palette.primary.main}66`}
                    strokeWidth="3"
                    strokeDasharray="8,12"
                    strokeLinecap="round"
                  />
                  <circle cx="90" cy="100" r="5" fill={theme.palette.primary.main} />
                  <circle cx="310" cy="150" r="5" fill={theme.palette.secondary.main} />
                </Box>
                
                {/* Additional floating elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: isSmallScreen ? '100px' : '140px',
                    height: isSmallScreen ? '100px' : '140px',
                    bottom: '10%',
                    right: isSmallScreen ? '15%' : '10%',
                    borderRadius: '24px',
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.secondary.main}44`,
                    boxShadow: `0 15px 30px ${theme.palette.secondary.main}22`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    p: 2,
                    animation: 'floatCard 7s ease-in-out infinite',
                    '@keyframes floatCard': {
                      '0%': { transform: 'translateY(0px) rotate(0deg)' },
                      '50%': { transform: 'translateY(-15px) rotate(5deg)' },
                      '100%': { transform: 'translateY(0px) rotate(0deg)' },
                    },
                  }}
                >
                  <SentimentSatisfiedAlt 
                    sx={{ 
                      fontSize: isSmallScreen ? '40px' : '60px', 
                      color: theme.palette.secondary.main, 
                      mb: 1 
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 'bold',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Confidence Boost
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section with Cards */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
          <Chip 
            label="OUR FEATURES" 
            color="secondary" 
            size="medium" 
            sx={{ 
              mb: 2, 
              fontWeight: 'bold', 
              borderRadius: '12px', 
              fontSize: '0.9rem',
              background: theme.palette.secondary.main + '22',
              color: theme.palette.secondary.main,
              border: '1px solid ' + theme.palette.secondary.main + '44',
            }} 
          />
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              fontWeight: 800,
              letterSpacing: '-0.5px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            What Makes Us Different
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '700px',
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            Tools and techniques that actually help you level up your social game
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: `0 20px 40px ${theme.palette.primary.main}22`,
                  },
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                  border: `1px solid ${theme.palette.primary.main}11`,
                  overflow: 'visible',
                  position: 'relative',
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '-30px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    background: theme.palette.background.paper,
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: `0 10px 20px ${theme.palette.primary.main}22`,
                    border: `1px solid ${theme.palette.primary.main}22`,
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent sx={{ p: 4, textAlign: 'center', pt: 6, mt: 2 }}>
                  <Typography variant="h5" sx={{ mt: 1, mb: 2, fontWeight: 700 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Call to Action */}
        <Box 
          sx={{ 
            mt: { xs: 8, md: 12 }, 
            p: { xs: 4, md: 6 },
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}11, ${theme.palette.secondary.main}22)`,
            border: `1px solid ${theme.palette.primary.main}22`,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 30% 30%, ${theme.palette.primary.main}22, transparent 20%), 
                           radial-gradient(circle at 70% 70%, ${theme.palette.secondary.main}22, transparent 20%)`,
              backgroundSize: '30px 30px',
              opacity: 0.4,
            },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
            }}
          >
            Ready to transform your social skills?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              mb: 4,
              maxWidth: '700px',
              mx: 'auto',
              position: 'relative',
            }}
          >
            Be one of the first to experience a new way of building confidence
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGetStarted}
            endIcon={<ArrowForward />}
            sx={{
              borderRadius: '14px',
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              textTransform: 'none',
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: '0 8px 20px ' + theme.palette.primary.main + '44',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 12px 25px ' + theme.palette.primary.main + '66'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Get Started Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;