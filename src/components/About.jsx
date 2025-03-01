import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Button,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  School,
  EmojiEvents,
  Schedule,
  Security,
  KeyboardArrowDown
} from '@mui/icons-material';

const AboutUs = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Track scroll for animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const methodologySteps = [
    {
      icon: <Psychology sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: "Practice-Based Learning",
      description: "Engage in realistic scenarios crafted by communication experts. Our platform provides immediate, constructive feedback to help you improve with each interaction."
    },
    {
      icon: <School sx={{ fontSize: 50, color: theme.palette.secondary.main }} />,
      title: "Structured Progression",
      description: "Follow a carefully designed curriculum that builds your skills systematically. Start with basics and advance to complex social situations as you grow more confident."
    },
    {
      icon: <TrendingUp sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: "Performance Analytics",
      description: "Track your progress with detailed metrics and insights. Understand your strengths and areas for improvement through comprehensive performance reports."
    }
  ];

  const benefits = [
    {
      icon: <EmojiEvents sx={{ fontSize: 50, color: theme.palette.secondary.main }} />,
      title: "Build Confidence",
      description: "Practice in a safe environment where mistakes become learning opportunities. Develop the confidence to handle any social situation effectively."
    },
    {
      icon: <Schedule sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: "Learn at Your Pace",
      description: "Access the platform anytime, anywhere. Practice as much as you need, with no pressure or judgment, until you feel ready for real-world interactions."
    },
    {
      icon: <Security sx={{ fontSize: 50, color: theme.palette.secondary.main }} />,
      title: "Private and Secure",
      description: "Your journey is personal. Our platform ensures complete privacy, allowing you to focus entirely on your growth and development."
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden', position: 'relative' }}>
      {/* Hero Section - Reimagined with more dynamic elements */}
      <Box
        sx={{
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          position: 'relative',
          pt: 8,
          pb: 12,
        }}
      >
        <Container maxWidth="lg">
          <Fade in={true} timeout={1000}>
            <Typography
              variant={isSmallScreen ? 'h3' : 'h1'}
              sx={{
                fontWeight: 900,
                textAlign: 'center',
                mb: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px',
                textTransform: 'uppercase',
              }}
            >
              Level Up Your Social Skills
            </Typography>
          </Fade>
          
          <Fade in={true} timeout={1500}>
            <Typography
              variant={isSmallScreen ? 'h6' : 'h5'}
              sx={{
                textAlign: 'center',
                maxWidth: '800px',
                mx: 'auto',
                mb: 6,
                color: 'text.secondary',
                lineHeight: 1.8,
                fontWeight: 400,
              }}
            >
              Our platform combines expert-designed scenarios with personalized feedback to help you master social interactions and advance your personal and professional life.
            </Typography>
          </Fade>

          {/* Animated scroll indicator */}
          <Box sx={{ textAlign: 'center', mt: 8, animation: 'bounce 2s infinite' }}>
            <KeyboardArrowDown sx={{ 
              fontSize: 40, 
              color: theme.palette.text.secondary,
              '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                '40%': { transform: 'translateY(-20px)' },
                '60%': { transform: 'translateY(-10px)' }
              }
            }} />
          </Box>
        </Container>
      </Box>

      {/* Mission Section - With split design and gradient card */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 } }}>
        <Grid container spacing={6} alignItems="center" direction={isMediumScreen ? 'column-reverse' : 'row'}>
          <Grid item xs={12} md={6}>
            <Fade in={scrollPosition > 100} timeout={1000}>
              <Box>
                <Typography 
                  variant={isSmallScreen ? 'h4' : 'h3'} 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 3,
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-10px',
                      left: '0',
                      width: '60px',
                      height: '4px',
                      background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      borderRadius: '2px'
                    }
                  }}
                >
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.8 }}>
                  We understand that strong social skills are crucial for success in today's interconnected world. However, many talented individuals find themselves held back by communication challenges, whether in professional settings or personal relationships.
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.8 }}>
                  Our platform bridges this gap by providing a structured, engaging environment where you can practice and refine your communication skills. Through carefully crafted scenarios and personalized guidance, we help you build the confidence and competence needed to thrive in any social situation.
                </Typography>
              </Box>
            </Fade>
          </Grid>
          <Grid item xs={12} md={6}>
            <Zoom in={scrollPosition > 100} timeout={1000}>
              <Box
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                  borderRadius: '24px',
                  p: { xs: 3, md: 5 },
                  boxShadow: '0 20px 80px rgba(0,0,0,0.12)',
                  border: `1px solid rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.1)`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant={isSmallScreen ? 'h5' : 'h4'} sx={{ fontWeight: 800, mb: 4 }}>
                  Key Platform Features
                </Typography>
                {[
                  'Realistic conversation simulations',
                  'Immediate, constructive feedback',
                  'Progressive skill development',
                  'Performance analytics and insights',
                  'Personalized learning paths'
                ].map((feature, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    transform: `translateX(${scrollPosition > 150 ? '0' : '50px'})`,
                    opacity: scrollPosition > 150 ? 1 : 0,
                    transition: `all 0.5s ${index * 0.1}s ease-out`
                  }}>
                    <Box 
                      sx={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
                        mr: 2 
                      }} 
                    />
                    <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Zoom>
          </Grid>
        </Grid>
      </Container>

      {/* Methodology Section - Modern cards with hover effects */}
      <Box 
        sx={{ 
          backgroundColor: theme.palette.background.paper, 
          py: { xs: 6, md: 12 },
          clipPath: 'polygon(0 5%, 100% 0, 100% 95%, 0 100%)',
          mt: -4,
          mb: -4,
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography
            variant={isSmallScreen ? 'h4' : 'h3'}
            sx={{
              textAlign: 'center',
              mb: { xs: 5, md: 8 },
              fontWeight: 800,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Our Methodology
          </Typography>
          <Grid container spacing={4}>
            {methodologySteps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Zoom in={scrollPosition > 300} style={{ transitionDelay: `${index * 150}ms` }}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.5s ease',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: `0 20px 40px rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.2)`,
                        '&:before': {
                          opacity: 1,
                        }
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: index % 2 === 0 
                          ? `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
                          : `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                        opacity: 0.5,
                        transition: 'opacity 0.3s ease',
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                      <Box 
                        sx={{ 
                          mb: 3,
                          p: 2,
                          width: '80px',
                          height: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '20px',
                          background: 'rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, letterSpacing: '-0.5px' }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        {step.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section - Interactive cards */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 } }}>
        <Typography
          variant={isSmallScreen ? 'h4' : 'h3'}
          sx={{
            textAlign: 'center',
            mb: { xs: 5, md: 8 },
            fontWeight: 800,
            background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade 
                in={scrollPosition > 600} 
                timeout={1000}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '24px',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.1)`,
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                      '& .benefit-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                      }
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box 
                      className="benefit-icon"
                      sx={{ 
                        transition: 'transform 0.5s ease',
                        transform: 'scale(1) rotate(0deg)',
                      }}
                    >
                      {benefit.icon}
                    </Box>
                    <Typography variant="h5" sx={{ 
                      mt: 3, 
                      mb: 2, 
                      fontWeight: 700,
                      letterSpacing: '-0.5px',
                      position: 'relative',
                      display: 'inline-block',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-8px',
                        left: '0',
                        width: '40px',
                        height: '3px',
                        background: index % 2 === 0 ? theme.palette.secondary.main : theme.palette.primary.main,
                        borderRadius: '3px'
                      }
                    }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, mt: 3 }}>
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section - Made more engaging */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          py: { xs: 8, md: 12 },
          mt: 4,
          borderRadius: { xs: '40px 40px 0 0', md: '80px 80px 0 0' },
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(60px)',
          },
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: '-10%',
            right: '5%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            filter: 'blur(40px)',
          }
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
              position: 'relative',
              zIndex: 2,
              py: { xs: 2, md: 4 }
            }}
          >
            <Zoom in={scrollPosition > 800} timeout={800}>
              <Typography
                variant={isSmallScreen ? 'h4' : 'h2'}
                sx={{
                  color: 'white',
                  fontWeight: 900,
                  mb: 3,
                  textTransform: 'uppercase',
                  letterSpacing: '-1px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                Ready to Level Up?
              </Typography>
            </Zoom>
            
            <Fade in={scrollPosition > 800} timeout={1200}>
              <Typography
                variant={isSmallScreen ? 'body1' : 'h6'}
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 6,
                  maxWidth: '700px',
                  mx: 'auto',
                  lineHeight: 1.8
                }}
              >
                Join thousands of others who have already begun their journey to better communication and start transforming your social skills today.
              </Typography>
            </Fade>
            
            <Zoom in={scrollPosition > 800} timeout={1500}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  borderRadius: '30px',
                  px: { xs: 4, md: 6 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  textTransform: 'none',
                  fontWeight: 800,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                  }
                }}
              >
                Get Started Now
              </Button>
            </Zoom>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUs;