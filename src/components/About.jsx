import React from 'react';
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
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  School,
  EmojiEvents,
  Schedule,
  Security
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LearnMore = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const methodologySteps = [
    {
      icon: <Psychology sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Practice-Based Learning",
      description: "Engage in realistic scenarios crafted by communication experts. Our platform provides immediate, constructive feedback to help you improve with each interaction."
    },
    {
      icon: <School sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: "Structured Progression",
      description: "Follow a carefully designed curriculum that builds your skills systematically. Start with basics and advance to complex social situations as you grow more confident."
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Performance Analytics",
      description: "Track your progress with detailed metrics and insights. Understand your strengths and areas for improvement through comprehensive performance reports."
    }
  ];

  const benefits = [
    {
      icon: <EmojiEvents sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: "Build Confidence",
      description: "Practice in a safe environment where mistakes become learning opportunities. Develop the confidence to handle any social situation effectively."
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Learn at Your Pace",
      description: "Access the platform anytime, anywhere. Practice as much as you need, with no pressure or judgment, until you feel ready for real-world interactions."
    },
    {
      icon: <Security sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: "Private and Secure",
      description: "Your journey is personal. Our platform ensures complete privacy, allowing you to focus entirely on your growth and development."
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant={isSmallScreen ? 'h3' : 'h2'}
            sx={{
              fontWeight: 800,
              textAlign: 'center',
              mb: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Transform Your Communication Skills
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
              mb: 6,
              color: 'text.secondary',
              lineHeight: 1.6
            }}
          >
            Our platform combines expert-designed scenarios with personalized feedback to help you master social interactions and advance your personal and professional life.
          </Typography>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Our Mission
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
              We understand that strong social skills are crucial for success in today's interconnected world. However, many talented individuals find themselves held back by communication challenges, whether in professional settings or personal relationships.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
              Our platform bridges this gap by providing a structured, engaging environment where you can practice and refine your communication skills. Through carefully crafted scenarios and personalized guidance, we help you build the confidence and competence needed to thrive in any social situation.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                background: theme.palette.background.paper,
                borderRadius: '20px',
                p: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Key Platform Features
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
                • Realistic conversation simulations
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
                • Immediate, constructive feedback
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
                • Progressive skill development
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
                • Performance analytics and insights
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                • Personalized learning paths
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Methodology Section */}
      <Box sx={{ backgroundColor: theme.palette.background.paper, py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontWeight: 700
            }}
          >
            Our Methodology
          </Typography>
          <Grid container spacing={4}>
            {methodologySteps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '20px',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    {step.icon}
                    <Typography variant="h5" sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontWeight: 700
          }}
        >
          Benefits
        </Typography>
        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  {benefit.icon}
                  <Typography variant="h5" sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          py: 8,
          mt: 4
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              color: 'white',
              fontWeight: 700,
              mb: 3
            }}
          >
            Ready to Transform Your Social Skills?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 4
            }}
          >
            Join thousands of others who have already begun their journey to better communication.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                borderRadius: '30px',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LearnMore;