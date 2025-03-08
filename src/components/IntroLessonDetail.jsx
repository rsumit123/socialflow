import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
  CircularProgress,
  Fade,
  Chip,
  Button
} from '@mui/material';
import {
  ArrowBack,
  School,
  MenuBook,
  Lightbulb,
  Flag,
  KeyboardArrowRight
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthErrors } from '../Api';

const IntroLessonDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subcategoryId } = useParams();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const fetchSubcategoryInfo = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/course_content/subcategories/${subcategoryId}/`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        handleAuthErrors(response, navigate);
        const data = await response.json();
        setSubcategory(data);
      } catch (error) {
        console.error('Error fetching subcategory info:', error);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchSubcategoryInfo();
  }, [subcategoryId, user.token, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      
      const progress = Math.min(Math.round((scrollTop / documentHeight) * 100), 100);
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <CircularProgress color="primary" size={60} thickness={4} />
      </Box>
    );
  }

  if (!subcategory) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          p: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Subcategory information not found. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        position: 'relative'
      }}
    >
      {/* Reading progress indicator */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          zIndex: 1100,
          background: theme.palette.grey[300],
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${readingProgress}%`,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            transition: 'width 0.2s ease-out'
          }
        }}
      />

      <Container 
        maxWidth="md" 
        sx={{ 
          flexGrow: 1,
          py: 6,
          position: 'relative'
        }}
      >
        <IconButton
          onClick={() => navigate(`/training/lessons/${subcategoryId}`)}
          sx={{
            position: 'absolute',
            top: theme.spacing(1),
            left: { xs: theme.spacing(0), sm: theme.spacing(1) },
            backgroundColor: theme.palette.background.paper,
            boxShadow: 2,
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
              transform: 'scale(1.1)'
            },
            zIndex: 2
          }}
          aria-label="go back"
        >
          <ArrowBack />
        </IconButton>

        <Box sx={{ mt: { xs: 8, sm: 6 }, mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Breadcrumbs 
            aria-label="breadcrumb" 
            sx={{ 
              justifyContent: 'center', 
              display: 'flex',
              p: 1.5,
              borderRadius: '30px',
              backgroundColor: theme.palette.background.paper,
              boxShadow: 1
            }}
          >
            <Link
              color="inherit"
              sx={{ 
                cursor: 'pointer',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
              onClick={() => navigate('/training/1')}
            >
              <School fontSize="small" />
              Categories
            </Link>
            <Link
              color="inherit"
              sx={{ 
                cursor: 'pointer',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center' 
              }}
              onClick={() => navigate(`/training/subcategories/${subcategory.category.id}`)}
            >
              {subcategory.category.name}
            </Link>
            <Link
              color="inherit"
              sx={{ 
                cursor: 'pointer',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center' 
              }}
              onClick={() => navigate(`/training/lessons/${subcategoryId}`)}
            >
              {subcategory.name}
            </Link>
            <Typography 
              color="text.primary" 
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Introduction
            </Typography>
          </Breadcrumbs>
        </Box>

        <Fade in={true} timeout={500}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`
                : `linear-gradient(145deg, #ffffff 0%, ${theme.palette.background.paper} 100%)`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: { xs: 3, sm: 5 },
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
                  background: `radial-gradient(circle at 20% 20%, ${theme.palette.primary.main}11, transparent 30%), 
                               radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main}11, transparent 30%)`,
                  backgroundSize: '120px 120px',
                  opacity: 0.6,
                  zIndex: 0,
                }
              }}
            >
              <Chip 
                label="Introduction" 
                color="primary" 
                size="small"
                icon={<MenuBook fontSize="small" />}
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  px: 1
                }} 
              />
              
              <Typography
                variant={isSmallScreen ? 'h4' : 'h3'}
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                Learn about {subcategory.name}
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 3
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: theme.palette.primary.main,
                    background: `${theme.palette.primary.main}11`,
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5
                  }}
                >
                  <Lightbulb fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    Objective: {subcategory.objective}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: theme.palette.secondary.main,
                    background: `${theme.palette.secondary.main}11`,
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5
                  }}
                >
                  <Flag fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    Category: {subcategory.category.name}
                  </Typography>
                </Box>
              </Box>
              
              <Divider 
                sx={{ 
                  width: '80px', 
                  mx: 'auto', 
                  mb: 4, 
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2
                }} 
              />
              
              <Typography 
                variant="subtitle1" 
                color="text.secondary" 
                sx={{ 
                  maxWidth: '700px', 
                  mx: 'auto',
                  fontWeight: 500,
                  fontStyle: 'italic',
                  mb: 2
                }}
              >
                {subcategory.description}
              </Typography>
            </Box>
            
            {/* Content */}
            <Box
              sx={{
                p: { xs: 3, sm: 5 },
                pt: 0
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: '16px',
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.02)',
                  mb: 4
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    color: theme.palette.text.primary,
                    whiteSpace: 'pre-line',
                    '& p': {
                      mb: 2
                    }
                  }}
                >
                  {subcategory.intro}
                </Typography>
              </Paper>
              
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  mb: 2
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<KeyboardArrowRight />}
                  onClick={() => navigate(`/training/lessons/${subcategoryId}`)}
                  sx={{
                    borderRadius: '14px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 8px 20px ${theme.palette.primary.main}44`,
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 12px 25px ${theme.palette.primary.main}66`,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Continue to Lessons
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default IntroLessonDetail; 