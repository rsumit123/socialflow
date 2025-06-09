import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Container,
  Divider,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { 
  ArrowBack,
  School,
  Category,
  AutoAwesome,
  ArrowForward,
  AcUnit,
  SentimentVerySatisfied,
  FavoriteBorder,
  Groups,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { handleAuthErrors } from '../Api';

const AllLessons = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchUnlockedLessons = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/course_content/unlocked-lessons/`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );
    if (handleAuthErrors(response, navigate)) throw new Error("Failed to fetch unlocked lessons");
    const data = await response.json();
    return data;
  };

  const { data: lessons = [], isLoading, isError, error } = useQuery({
    queryKey: ['unlockedLessons'],
    queryFn: fetchUnlockedLessons,
    enabled: !!user.token,
  });

  const getCategoryVisuals = (categoryName = '') => {
    const lowerName = categoryName.toLowerCase();

    switch (true) {
      case lowerName.includes('icebreaker'):
        return {
          icon: <AcUnit sx={{ fontSize: 40 }} />,
          color: theme.palette.info.main,
          gradient: `linear-gradient(135deg, ${theme.palette.info.light}1A, ${theme.palette.background.paper} 70%)`
        };
      case lowerName.includes('humor'):
        return {
          icon: <SentimentVerySatisfied sx={{ fontSize: 40 }} />,
          color: theme.palette.warning.main,
          gradient: `linear-gradient(135deg, ${theme.palette.warning.light}1A, ${theme.palette.background.paper} 70%)`
        };
      case lowerName.includes('empathy'):
        return {
          icon: <FavoriteBorder sx={{ fontSize: 40 }} />,
          color: theme.palette.error.main,
          gradient: `linear-gradient(135deg, ${theme.palette.error.light}1A, ${theme.palette.background.paper} 70%)`
        };
      case lowerName.includes('engagement'):
        return {
          icon: <Groups sx={{ fontSize: 40 }} />,
          color: theme.palette.success.main,
          gradient: `linear-gradient(135deg, ${theme.palette.success.light}1A, ${theme.palette.background.paper} 70%)`
        };
      default:
        return {
          icon: <School sx={{ fontSize: 40 }} />,
          color: theme.palette.grey[500],
          gradient: `linear-gradient(135deg, ${theme.palette.grey[300]}1A, ${theme.palette.background.paper} 70%)`
        };
    }
  };

  if (isError) {
    console.error('Error fetching lessons:', error);
    return <Typography>Error loading lessons.</Typography>;
  }

  const handleLessonClick = (lessonId) => {
    navigate(`/training/lessondetail/${lessonId}`);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 6, position: 'relative' }}>
        <IconButton
          onClick={() => navigate('/platform')}
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

        <Box sx={{ textAlign: 'center', mb: 6, mt: { xs: 6, sm: 4 } }}>
          <Typography
            variant={isSmallScreen ? 'h4' : 'h3'}
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Featured Scenarios
          </Typography>
          <Divider 
            sx={{ 
              width: '80px', 
              mx: 'auto', 
              mb: 3, 
              borderColor: theme.palette.primary.main,
              borderWidth: 2
            }} 
          />
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '700px', 
              mx: 'auto',
              px: 2, 
              fontWeight: 400
            }}
          >
            Jump into any of these unlocked scenarios to practice your skills.
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
            <CircularProgress />
          </Box>
        ) : lessons.length === 0 ? (
          <Typography sx={{ textAlign: 'center' }}>No unlocked lessons available yet. Complete some introductory modules to unlock more scenarios!</Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {lessons.map((lesson) => {
              const categoryName = lesson.subcategory?.category?.name || '';
              const { icon, color, gradient } = getCategoryVisuals(categoryName);
              
              return (
              <Grid item xs={12} sm={6} md={4} key={lesson.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 10px 25px ${color}33`
                    },
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: gradient,
                    border: `1px solid ${color}44`,
                  }}
                  onClick={() => handleLessonClick(lesson.id)}
                >
                  <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <Chip 
                      label={lesson.subcategory_name} 
                      icon={<Category fontSize="small"/>}
                      size="small"
                      sx={{ 
                        mb: 2, 
                        fontWeight: 600,
                        backgroundColor: color,
                        color: 'white'
                      }} 
                    />
                    <Box 
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: color,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                        boxShadow: theme.shadows[3]
                      }}
                    >
                      {icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: 'text.secondary'
                      }}
                    >
                      {categoryName}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        textAlign: 'center',
                        color: 'text.primary'
                      }}
                    >
                      {lesson.title}
                    </Typography>
                    <Box 
                      sx={{ 
                        mt: 'auto', 
                        px: 2,
                        py: 1,
                        borderRadius: '20px',
                        background: theme.palette.action.hover,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: theme.palette.action.selected
                        }
                      }}
                    >
                      <Typography variant="button" sx={{ fontWeight: 500 }}>
                        Start Lesson
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )})}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default AllLessons; 