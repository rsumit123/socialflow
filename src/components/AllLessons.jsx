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
  Badge,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Zoom,
  Collapse,
  Button,
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
  CheckCircle,
  Star,
  FilterList,
  ExpandMore,
  ExpandLess,
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
  const [page, setPage] = React.useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState('');
  const [filtersExpanded, setFiltersExpanded] = React.useState(!isSmallScreen);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    setFiltersExpanded(!isSmallScreen);
  }, [isSmallScreen]);

  const fetchUnlockedLessons = async (page, categoryId) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/course_content/unlocked-lessons/`);
    url.searchParams.append('limit', limit);
    url.searchParams.append('offset', offset);
    if (categoryId) {
      url.searchParams.append('category_id', categoryId);
    }
    
    const response = await fetch(
      url.toString(),
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );
    if (handleAuthErrors(response, navigate)) throw new Error("Failed to fetch unlocked lessons");
    const data = await response.json();
    return data;
  };

  const fetchCategories = async () => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/course_content/categories/list/`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    if (handleAuthErrors(response, navigate)) throw new Error("Failed to fetch categories");
    return response.json();
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['unlockedLessons', page, selectedCategoryId],
    queryFn: () => fetchUnlockedLessons(page, selectedCategoryId),
    enabled: !!user.token,
    keepPreviousData: true,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: !!user.token,
  });

  const lessons = data?.lessons || [];
  const totalLessons = data?.total || 0;
  const pageCount = Math.ceil(totalLessons / 10);

  const handleCategoryChange = (event) => {
    setSelectedCategoryId(event.target.value);
    setPage(1);
  };

  // Helper function to check lesson completion and get best score
  const getLessonStatus = (lesson) => {
    const previousProgress = lesson.previous_progress || [];
    const thresholdScore = lesson.threshold_score || 0;
    
    if (previousProgress.length === 0) {
      return { isCompleted: false, bestScore: null };
    }
    
    const scores = previousProgress.map(attempt => attempt.score || 0);
    const bestScore = Math.max(...scores);
    const isCompleted = bestScore >= thresholdScore;
    
    return { isCompleted, bestScore };
  };

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

        <Box sx={{ mb: isSmallScreen ? 3 : 6 }}>
          {isSmallScreen && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                variant="outlined"
                sx={{
                  borderRadius: '25px',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    transform: 'scale(1.02)',
                  },
                  transition: 'all 0.3s ease',
                }}
                startIcon={<FilterList />}
                endIcon={filtersExpanded ? <ExpandLess /> : <ExpandMore />}
              >
                {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
                {selectedCategoryId && !filtersExpanded && (
                  <Chip
                    label={categories.find(c => c.id === selectedCategoryId)?.name || 'Filtered'}
                    size="small"
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: '0.7rem',
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                    }}
                  />
                )}
              </Button>
            </Box>
          )}
          
          <Collapse in={filtersExpanded} timeout={400}>
            <Box sx={{ textAlign: 'center', mb: isSmallScreen ? 2 : 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mb: 2,
                  fontSize: isSmallScreen ? '1rem' : '1.25rem',
                }}
              >
                <FilterList sx={{ fontSize: isSmallScreen ? 18 : 20 }} />
                Choose Your Vibe
              </Typography>
            </Box>
            
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: isSmallScreen ? 1.5 : 2,
                justifyContent: 'center',
                maxWidth: '800px',
                mx: 'auto',
                px: 2,
              }}
            >
              <Zoom in={filtersExpanded} timeout={300}>
                <Chip
                  label="All Categories"
                  onClick={() => handleCategoryChange({ target: { value: '' } })}
                  variant={selectedCategoryId === '' ? 'filled' : 'outlined'}
                  sx={{
                    px: isSmallScreen ? 2 : 3,
                    py: isSmallScreen ? 1.5 : 2,
                    height: 'auto',
                    fontSize: isSmallScreen ? '0.85rem' : '1rem',
                    fontWeight: 600,
                    borderRadius: '25px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: selectedCategoryId === '' 
                      ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      : 'transparent',
                    color: selectedCategoryId === '' ? 'white' : 'text.primary',
                    border: selectedCategoryId === '' 
                      ? 'none' 
                      : `2px solid ${theme.palette.divider}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: selectedCategoryId === '' 
                        ? `0 8px 25px ${theme.palette.primary.main}44`
                        : `0 8px 25px ${theme.palette.grey[400]}44`,
                      backgroundColor: selectedCategoryId === '' 
                        ? `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                        : theme.palette.action.hover,
                    },
                    '& .MuiChip-label': {
                      padding: isSmallScreen ? '6px 12px' : '8px 16px',
                    },
                  }}
                  icon={<AutoAwesome sx={{ fontSize: isSmallScreen ? 16 : 20 }} />}
                />
              </Zoom>
              
              {categories.map((category, index) => {
                const { icon, color } = getCategoryVisuals(category.name);
                const isSelected = selectedCategoryId === category.id;
                
                return (
                  <Zoom in={filtersExpanded} timeout={400 + index * 100} key={category.id}>
                    <Chip
                      label={category.name}
                      onClick={() => handleCategoryChange({ target: { value: category.id } })}
                      variant={isSelected ? 'filled' : 'outlined'}
                      sx={{
                        px: isSmallScreen ? 2 : 3,
                        py: isSmallScreen ? 1.5 : 2,
                        height: 'auto',
                        fontSize: isSmallScreen ? '0.85rem' : '1rem',
                        fontWeight: 600,
                        borderRadius: '25px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backgroundColor: isSelected ? color : 'transparent',
                        color: isSelected ? 'white' : 'text.primary',
                        border: isSelected ? 'none' : `2px solid ${color}44`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${color}44`,
                          backgroundColor: isSelected ? color : `${color}11`,
                          borderColor: isSelected ? 'transparent' : color,
                        },
                        '& .MuiChip-label': {
                          padding: isSmallScreen ? '6px 12px' : '8px 16px',
                        },
                        '& .MuiChip-icon': {
                          color: isSelected ? 'white' : color,
                          fontSize: isSmallScreen ? 16 : 20,
                        },
                      }}
                      icon={React.cloneElement(icon, { sx: { fontSize: isSmallScreen ? 16 : 20 } })}
                    />
                  </Zoom>
                );
              })}
            </Box>
            
            {selectedCategoryId && (
              <Fade in timeout={500}>
                <Box sx={{ textAlign: 'center', mt: isSmallScreen ? 2 : 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      opacity: 0.8,
                      fontSize: isSmallScreen ? '0.8rem' : '0.875rem',
                    }}
                  >
                    Showing {categories.find(c => c.id === selectedCategoryId)?.name} scenarios
                  </Typography>
                </Box>
              </Fade>
            )}
          </Collapse>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
            <CircularProgress />
          </Box>
        ) : lessons.length === 0 ? (
          <Typography sx={{ textAlign: 'center' }}>No unlocked lessons available yet. Complete some introductory modules to unlock more scenarios!</Typography>
        ) : (
          <>
            <Grid container spacing={4} justifyContent="center">
              {lessons.map((lesson) => {
                const categoryName = lesson.subcategory?.category?.name || '';
                const { icon, color, gradient } = getCategoryVisuals(categoryName);
                const { isCompleted, bestScore } = getLessonStatus(lesson);
                
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
                      position: 'relative',
                    }}
                    onClick={() => handleLessonClick(lesson.id)}
                  >
                    {/* Completion Badge */}
                    {isCompleted && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          backgroundColor: theme.palette.success.main,
                          color: 'white',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '20px',
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit' }}>
                          Best: {bestScore}
                        </Typography>
                      </Box>
                    )}

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
                          boxShadow: theme.shadows[3],
                          position: 'relative',
                        }}
                      >
                        {icon}
                        {isCompleted && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              backgroundColor: theme.palette.success.main,
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                          >
                            <Star sx={{ fontSize: 14, color: 'white' }} />
                          </Box>
                        )}
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
                          background: isCompleted 
                            ? `linear-gradient(45deg, ${theme.palette.success.light}, ${theme.palette.success.main})`
                            : theme.palette.action.hover,
                          color: isCompleted ? 'white' : 'inherit',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: isCompleted 
                              ? `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                              : theme.palette.action.selected
                          }
                        }}
                      >
                        <Typography variant="button" sx={{ fontWeight: 500 }}>
                          {isCompleted ? 'Replay Lesson' : 'Start Lesson'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )})}
            </Grid>
            {pageCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, pb: 4 }}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size={isSmallScreen ? 'small' : 'large'}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default AllLessons; 