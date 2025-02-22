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
  CardContent
} from '@mui/material';
import { 
  Chat, 
  EmojiPeople, 
  WorkOutline,
  Psychology,
  TrendingUp
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
      icon: <Psychology sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Practice Real Scenarios",
      description: "Experience lifelike conversations in a safe, judgment-free environment"
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: "Track Your Progress",
      description: "See your communication skills improve with detailed feedback and analytics"
    },
    {
      icon: <WorkOutline sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Professional Growth",
      description: "Master workplace communication and advance your career opportunities"
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          minHeight: '90vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          pt: isSmallScreen ? 4 : 0
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography
                  variant={isSmallScreen ? 'h3' : 'h2'}
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.2,
                    mb: 3,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Level Up Your Social Skills
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    mb: 4,
                    fontWeight: 500
                  }}
                >
                  Transform your communication abilities through immersive practice sessions. 
                  Build confidence, master social interactions, and unlock new opportunities.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleGetStarted}
                    sx={{
                      borderRadius: '30px',
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      fontWeight: 600,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                      }
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
                      borderRadius: '30px',
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
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
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: isSmallScreen ? '300px' : '500px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <EmojiPeople 
                  sx={{
                    fontSize: isSmallScreen ? '200px' : '300px',
                    color: theme.palette.primary.main,
                    opacity: 0.8,
                    position: 'absolute',
                    transform: 'rotate(-5deg)'
                  }}
                />
                <Chat 
                  sx={{
                    fontSize: isSmallScreen ? '150px' : '200px',
                    color: theme.palette.secondary.main,
                    opacity: 0.6,
                    position: 'absolute',
                    right: isSmallScreen ? '20%' : '15%',
                    top: '20%',
                    transform: 'rotate(15deg)'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  {feature.icon}
                  <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;