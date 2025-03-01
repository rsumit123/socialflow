import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  IconButton,
  Backdrop,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Lock, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthErrors } from '../Api';

const Lessons = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subcategoryId } = useParams();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subcategoryInfo, setSubcategoryInfo] = useState({
    name: '',
    category: { name: '', id: '' }
  });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/course_content/lessons/?subcategory_id=${subcategoryId}`,{
            headers: { Authorization: `Bearer ${user.token}` },
          });

        handleAuthErrors(response, navigate);
        const data = await response.json();
        setLessons(data.sort((a, b) => a.order - b.order));
        if (data.length > 0) {
          setSubcategoryInfo(data[0].subcategory);
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [subcategoryId]);

  const handleLessonClick = (lesson) => {
    if (!lesson.is_locked) {
      // Handle lesson navigation or start lesson
      navigate(`/training/lessondetail/${lesson.id}`);
      console.log('Starting lesson:', lesson.id);
    }
  };

  if (loading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }}>
        <CircularProgress color="secondary" />
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        padding: theme.spacing(4, 2),
        minHeight: '80vh',
        backgroundColor: 'background.default',
        position: 'relative'
      }}
    >
      <IconButton
        onClick={() => navigate(`/training/subcategories/${subcategoryInfo.category.id}`)}
        sx={{
          position: 'absolute',
          top: theme.spacing(2),
          left: theme.spacing(2),
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <ArrowBack />
      </IconButton>

      <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ justifyContent: 'center', display: 'flex' }}>
          <Link
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/training/1')}
          >
            Categories
          </Link>
          <Link
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/training/subcategories/${subcategoryInfo.category.id}`)}
          >
            {subcategoryInfo.category.name}
          </Link>
          <Typography color="text.primary">{subcategoryInfo.name}</Typography>
        </Breadcrumbs>
      </Box>

      <Typography
        variant={isSmallScreen ? 'h4' : 'h3'}
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 6,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Available Lessons
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {lessons.map((lesson) => (
          <Grid item xs={12} sm={6} md={4} key={lesson.id}>
            <Card
              sx={{
                height: '100%',
                cursor: lesson.is_locked ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: lesson.is_locked ? 'none' : 'translateY(-8px)',
                  boxShadow: lesson.is_locked ? 4 : 8
                },
                position: 'relative',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${
                  lesson.is_locked ? '#f5f5f5' : theme.palette.background.paper
                } 0%, ${
                  lesson.is_locked ? '#e0e0e0' : theme.palette.background.default
                } 100%)`,
                overflow: 'hidden'
              }}
              onClick={() => handleLessonClick(lesson)}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    color: lesson.is_locked ? 'text.disabled' : 'text.primary'
                  }}
                >
                  {lesson.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.main,
                    mb: 2
                  }}
                >
                  Time: {lesson.max_time} seconds
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.secondary.main
                  }}
                >
                  Pass Score: {lesson.threshold_score}%
                </Typography>
                {lesson.is_locked && (
                  <Lock
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      color: 'text.disabled'
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Lessons;