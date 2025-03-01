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
  BookmarkBorder, 
  CodeOutlined,
  ChatBubbleOutline,
  AssignmentOutlined,
  VideocamOutlined 
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthErrors } from '../Api';

const SubCategories = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categoryId } = useParams();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  // Map of subcategory icons based on name keywords
  const getSubcategoryIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('practice') || lowerName.includes('exercise'))
      return <AssignmentOutlined fontSize="large" />;
    if (lowerName.includes('conversation') || lowerName.includes('discussion'))
      return <ChatBubbleOutline fontSize="large" />;
    if (lowerName.includes('video') || lowerName.includes('watch'))
      return <VideocamOutlined fontSize="large" />;
    if (lowerName.includes('code') || lowerName.includes('technical'))
      return <CodeOutlined fontSize="large" />;
    if (lowerName.includes('read') || lowerName.includes('material'))
      return <BookmarkBorder fontSize="large" />;
    // Default icon
    return <School fontSize="large" />;
  };

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/course_content/subcategories/?category_id=${categoryId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        handleAuthErrors(response, navigate);
        const data = await response.json();
        setSubcategories(data.sort((a, b) => a.order - b.order));
        if (data.length > 0) {
          setCategoryName(data[0].category.name);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        // Add a small delay to prevent layout jumps
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchSubcategories();
  }, [categoryId, user.token, navigate]);

  const handleSubcategoryClick = (subcategoryId, isLocked) => {
    if (!isLocked) {
      navigate(`/training/lessons/${subcategoryId}`);
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
              <Skeleton variant="rounded" width="60%" height={36} sx={{ mt: 2 }} />
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
              Loading Modules...
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
          onClick={() => navigate('/training/1')}
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
            <Typography 
              color="text.primary" 
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {categoryName}
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
            {categoryName} Modules
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
            Select a module to continue your training journey
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {loading 
            ? renderSkeletons() 
            : subcategories.map((subcategory, index) => (
              <Grid item xs={12} sm={6} md={4} key={subcategory.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: subcategory.is_locked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: subcategory.is_locked ? 'none' : 'translateY(-8px)',
                      boxShadow: theme.shadows[subcategory.is_locked ? 4 : 15]
                    },
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${
                      subcategory.is_locked 
                        ? theme.palette.mode === 'dark' 
                          ? 'rgba(66, 66, 66, 0.8)' 
                          : 'rgba(245, 245, 245, 0.9)' 
                        : theme.palette.background.paper
                    } 0%, ${
                      subcategory.is_locked 
                        ? theme.palette.mode === 'dark' 
                          ? 'rgba(33, 33, 33, 0.8)' 
                          : 'rgba(224, 224, 224, 0.9)' 
                        : theme.palette.background.default
                    } 100%)`
                  }}
                  onClick={() => handleSubcategoryClick(subcategory.id, subcategory.is_locked)}
                >
                  {!subcategory.is_locked && (
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
                      label={`Module ${index + 1}`} 
                      size="small"
                      color={subcategory.is_locked ? "default" : "primary"}
                      sx={{ 
                        mb: 2,
                        fontWeight: 600,
                        opacity: subcategory.is_locked ? 0.6 : 1
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
                        color: subcategory.is_locked ? 'text.disabled' : theme.palette.primary.main,
                        background: subcategory.is_locked 
                          ? theme.palette.action.disabledBackground 
                          : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                        boxShadow: subcategory.is_locked ? 'none' : theme.shadows[3]
                      }}
                    >
                      {getSubcategoryIcon(subcategory.name)}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: subcategory.is_locked ? 'text.disabled' : 'text.primary'
                      }}
                    >
                      {subcategory.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: subcategory.is_locked ? 'text.disabled' : 'text.secondary',
                        textAlign: 'center',
                        mb: 2,
                        flexGrow: 1
                      }}
                    >
                      {subcategory.description || 'Master specific skills within this module'}
                    </Typography>
                    {subcategory.is_locked ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Lock color="disabled" />
                        <Typography variant="body2" color="text.disabled">
                          Locked Module
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
                          Start Learning
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

export default SubCategories;