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
  Link,
  Container,
  Divider,
  Skeleton,
  Paper,
  Chip
} from '@mui/material';
import { 
  Lock, 
  ArrowBack, 
  School, 
  AccessTime, 
  GradeOutlined,
  AutoAwesome,
  MenuBook,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthErrors } from '../Api';
import { useQuery } from '@tanstack/react-query';

const Lessons = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subcategoryId } = useParams();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const fetchSubcategoryInfo = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/course_content/subcategories/${subcategoryId}/`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );
    handleAuthErrors(response, navigate);
    return response.json();
  };

  const fetchLessons = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/course_content/lessons/?subcategory_id=${subcategoryId}`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );
    handleAuthErrors(response, navigate);
    const data = await response.json();
    return data.sort((a, b) => a.order - b.order);
  };

  const { 
    data: subcategoryInfo, 
    isLoading: isLoadingSubcategory, 
    isError: isErrorSubcategory,
    error: errorSubcategory
  } = useQuery({
    queryKey: ['subcategory', subcategoryId],
    queryFn: fetchSubcategoryInfo,
    enabled: !!user.token && !!subcategoryId,
  });

  const { 
    data: lessons = [], 
    isLoading: isLoadingLessons, 
    isError: isErrorLessons,
    error: errorLessons
  } = useQuery({
    queryKey: ['lessons', subcategoryId],
    queryFn: fetchLessons,
    enabled: !!user.token && !!subcategoryId,
  });

  const loading = isLoadingSubcategory || isLoadingLessons;

  if (isErrorSubcategory || isErrorLessons) {
    console.error('Error fetching data:', errorSubcategory || errorLessons);
    return <Typography>Error loading lesson data.</Typography>;
  }

  const handleLessonClick = (lesson) => {
    if (!lesson.is_locked) {
      navigate(`/training/lessondetail/${lesson.id}`);
    }
  };
  
  const handleIntroClick = () => {
    if (subcategoryInfo && !subcategoryInfo.is_locked) {
      navigate(`/training/intro/${subcategoryId}`);
    }
  };

  // Skeleton loading state
  const renderSkeletons = () => {
    return Array(6).fill().map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
        <Card sx={{ height: '100%', borderRadius: '16px' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Skeleton variant="text" width="80%" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" width="60%" height={36} sx={{ mt: 3 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ));
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
      {loading && (
        <Backdrop 
          open={true} 
          sx={{ 
            color: '#fff', 
            zIndex: theme.zIndex.drawer + 1,
            backdropFilter: 'blur(4px)'
          }}
        >
          <Paper 
            elevation={4} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
            }}
          >
            <CircularProgress 
              color="secondary" 
              size={60}
              thickness={4}
              sx={{ mb: 2 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Loading Lessons...
            </Typography>
          </Paper>
        </Backdrop>
      )}

      <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1,
          py: 6,
          position: 'relative'
        }}
      >
        <IconButton
          onClick={() => subcategoryInfo && navigate(`/training/subcategories/${subcategoryInfo.category.id}`)}
          disabled={!subcategoryInfo}
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
              onClick={() => subcategoryInfo && navigate(`/training/subcategories/${subcategoryInfo.category.id}`)}
            >
              {subcategoryInfo?.category.name}
            </Link>
            <Typography 
              color="text.primary" 
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {subcategoryInfo?.name}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 5 }}>
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
            Available Lessons
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
            Select a lesson to begin your learning experience
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {/* Introduction Lesson Card - Always first and unlocked if subcategory is unlocked */}
          {!loading && subcategoryInfo && (
            <Grid item xs={12} sm={12} md={8} lg={6}>
              <Card
                sx={{
                  height: '100%',
                  cursor: subcategoryInfo.is_locked ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: subcategoryInfo.is_locked ? 'none' : 'translateY(-8px)',
                    boxShadow: theme.shadows[subcategoryInfo.is_locked ? 4 : 15]
                  },
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${
                    subcategoryInfo.is_locked 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(66, 66, 66, 0.8)' 
                        : 'rgba(245, 245, 245, 0.9)' 
                      : theme.palette.background.paper
                  } 0%, ${
                    subcategoryInfo.is_locked 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(33, 33, 33, 0.8)' 
                        : 'rgba(224, 224, 224, 0.9)' 
                      : theme.palette.background.default
                  } 100%)`,
                  border: `1px solid ${theme.palette.divider}`
                }}
                onClick={handleIntroClick}
              >
                {!subcategoryInfo.is_locked && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    }}
                  />
                )}
                <CardContent sx={{ 
                  p: { xs: 3, sm: 4 }, 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  alignItems: 'center', 
                  height: '100%',
                  gap: 3
                }}>
                  <Box 
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    {subcategoryInfo.is_locked ? (
                      <Box sx={{ 
                        p: 2,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: theme.palette.action.disabledBackground,
                        color: 'text.disabled',
                        width: { xs: '60px', sm: '80px' },
                        height: { xs: '60px', sm: '80px' },
                      }}>
                        <Lock fontSize="large" />
                      </Box>
                    ) : (
                      <Box sx={{ 
                        p: 2,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}33)`,
                        color: theme.palette.primary.main,
                        boxShadow: `0 8px 20px ${theme.palette.primary.main}33`,
                        width: { xs: '60px', sm: '80px' },
                        height: { xs: '60px', sm: '80px' },
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '-4px',
                          left: '-4px',
                          right: '-4px',
                          bottom: '-4px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          opacity: 0.3,
                          zIndex: -1,
                        }
                      }}>
                        <MenuBook fontSize="large" />
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    textAlign: { xs: 'center', sm: 'left' },
                    flex: 1
                  }}>
                    <Chip 
                      label="Introduction" 
                      size="small"
                      color={subcategoryInfo.is_locked ? "default" : "primary"}
                      sx={{ 
                        mb: 1.5,
                        fontWeight: 600,
                        opacity: subcategoryInfo.is_locked ? 0.6 : 1
                      }} 
                    />
                    
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: subcategoryInfo.is_locked ? 'text.disabled' : 'text.primary',
                      }}
                    >
                      Learn about {subcategoryInfo.name}
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      color={subcategoryInfo.is_locked ? "text.disabled" : "text.secondary"}
                      sx={{ 
                        mb: 2.5,
                        lineHeight: 1.6,
                        maxWidth: '600px'
                      }}
                    >
                      {subcategoryInfo.description || "Get an introduction to this topic and understand the key concepts before diving into the lessons."}
                    </Typography>
                    
                    {subcategoryInfo.is_locked ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.disabled">
                          Locked Content
                        </Typography>
                      </Box>
                    ) : (
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
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
                          Read Introduction
                        </Typography>
                        <ArrowForward fontSize="small" />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {/* Regular Lessons */}
          {loading 
            ? renderSkeletons() 
            : lessons.map((lesson, index) => (
            <Grid item xs={12} sm={6} md={4} key={lesson.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: lesson.is_locked ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: lesson.is_locked ? 'none' : 'translateY(-8px)',
                    boxShadow: theme.shadows[lesson.is_locked ? 4 : 15]
                  },
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${
                    lesson.is_locked 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(66, 66, 66, 0.8)' 
                        : 'rgba(245, 245, 245, 0.9)' 
                      : theme.palette.background.paper
                  } 0%, ${
                    lesson.is_locked 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(33, 33, 33, 0.8)' 
                        : 'rgba(224, 224, 224, 0.9)' 
                      : theme.palette.background.default
                  } 100%)`
                }}
                onClick={() => handleLessonClick(lesson)}
              >
                {!lesson.is_locked && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    }}
                  />
                )}
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <Chip 
                    label={`Lesson ${index + 1}`} 
                    size="small"
                    color={lesson.is_locked ? "default" : "primary"}
                    sx={{ 
                      mb: 2,
                      fontWeight: 600,
                      opacity: lesson.is_locked ? 0.6 : 1
                    }} 
                  />
                  <Box 
                    sx={{
                      mb: 3,
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                  >
                    {lesson.is_locked ? (
                      <Box sx={{ 
                        p: 2,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: theme.palette.action.disabledBackground,
                        color: 'text.disabled'
                      }}>
                        <Lock fontSize="large" />
                      </Box>
                    ) : (
                      <Box sx={{ 
                        p: 2,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: `rgba(${theme.palette.primary.main.replace(/[^\d,]/g, '')}, 0.1)`,
                        color: theme.palette.primary.main,
                        boxShadow: theme.shadows[2]
                      }}>
                        <AutoAwesome fontSize="large" />
                      </Box>
                    )}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: lesson.is_locked ? 'text.disabled' : 'text.primary',
                      textAlign: 'center'
                    }}
                  >
                    {lesson.title}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 1.5,
                      width: '100%',
                      mb: 3,
                      mt: 'auto'
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: lesson.is_locked ? 'text.disabled' : theme.palette.primary.main,
                        justifyContent: 'center'
                      }}
                    >
                      <AccessTime fontSize="small" />
                      <Typography variant="body2" fontWeight={500}>
                        Time Limit: {lesson.max_time} seconds
                      </Typography>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: lesson.is_locked ? 'text.disabled' : theme.palette.secondary.main,
                        justifyContent: 'center'
                      }}
                    >
                      <GradeOutlined fontSize="small" />
                      <Typography variant="body2" fontWeight={500}>
                        Pass Score: {lesson.threshold_score}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  {lesson.is_locked ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="body2" color="text.disabled">
                        Locked Lesson
                      </Typography>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
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
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Lessons;