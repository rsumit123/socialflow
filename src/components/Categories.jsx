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
  Container,
  Divider,
  Skeleton,
  Paper
} from '@mui/material';
import { 
  Lock, 
  ArrowBack, 
  Explore, 
  Psychology, 
  WorkOutline, 
  TrendingUp 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthErrors } from '../Api';

const Categories = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map of category icons based on category name keywords
  const getCategoryIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('communication') || lowerName.includes('social'))
      return <Psychology fontSize="large" />;
    if (lowerName.includes('career') || lowerName.includes('professional'))
      return <WorkOutline fontSize="large" />;
    if (lowerName.includes('progress') || lowerName.includes('advance'))
      return <TrendingUp fontSize="large" />;
    // Default icon
    return <Explore fontSize="large" />;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/course_content/categories/`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (handleAuthErrors(response, navigate)) return;
        const data = await response.json();
        setCategories(data.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        // Add a small delay to prevent layout jumps
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchCategories();
  }, [user.token, navigate]);

  const handleCategoryClick = (categoryId, isLocked) => {
    if (!isLocked) {
      navigate(`/training/subcategories/${categoryId}`);
    }
  };

  // Skeleton loading state
  const renderSkeletons = () => {
    return Array(6).fill().map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
        <Card sx={{ height: '100%', borderRadius: '16px' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Skeleton variant="circular" width={60} height={60} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="90%" height={20} />
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
        minHeight: '100vh', // Force minimum height to viewport
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
              Loading Categories...
            </Typography>
          </Paper>
        </Backdrop>
      )}

      <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, // This ensures the container takes available space
          py: 6,
          position: 'relative'
        }}
      >
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
            Training Categories
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
            Select a category to begin your training and develop essential skills
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {loading 
            ? renderSkeletons() 
            : categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: category.is_locked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: category.is_locked ? 'none' : 'translateY(-8px)',
                      boxShadow: theme.shadows[category.is_locked ? 4 : 15]
                    },
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${
                      category.is_locked 
                        ? theme.palette.mode === 'dark' 
                          ? 'rgba(66, 66, 66, 0.8)' 
                          : 'rgba(245, 245, 245, 0.9)' 
                        : theme.palette.background.paper
                    } 0%, ${
                      category.is_locked 
                        ? theme.palette.mode === 'dark' 
                          ? 'rgba(33, 33, 33, 0.8)' 
                          : 'rgba(224, 224, 224, 0.9)' 
                        : theme.palette.background.default
                    } 100%)`
                  }}
                  onClick={() => handleCategoryClick(category.id, category.is_locked)}
                >
                  {!category.is_locked && (
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
                  <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box 
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: category.is_locked ? 'text.disabled' : theme.palette.primary.main,
                        background: category.is_locked 
                          ? theme.palette.action.disabledBackground 
                          : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                        boxShadow: category.is_locked ? 'none' : theme.shadows[3]
                      }}
                    >
                      {getCategoryIcon(category.name)}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: category.is_locked ? 'text.disabled' : 'text.primary'
                      }}
                    >
                      {category.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: category.is_locked ? 'text.disabled' : 'text.secondary',
                        textAlign: 'center',
                        mb: 2
                      }}
                    >
                      {category.description || 'Explore and master new skills in this category'}
                    </Typography>
                    {category.is_locked ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Lock color="disabled" />
                        <Typography variant="body2" color="text.disabled">
                          Locked Content
                        </Typography>
                      </Box>
                    ) : (
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
                          Explore Content
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          }
        </Grid>
      </Container>
    </Box>
  );
};

export default Categories;