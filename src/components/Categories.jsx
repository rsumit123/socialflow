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
  Backdrop
} from '@mui/material';
import { Lock, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthErrors } from '../Api';

const Categories = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/course_content/categories/`,{
            headers: { Authorization: `Bearer ${user.token}` },
          });
        handleAuthErrors(response, navigate);
        const data = await response.json();
        setCategories(data.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId, isLocked) => {
    if (!isLocked) {
      navigate(`/training/subcategories/${categoryId}`);
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
        onClick={() => navigate('/platform')}
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

      <Typography
        variant={isSmallScreen ? 'h4' : 'h3'}
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 6,
          mt: 4,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Training Categories
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card
              sx={{
                height: '100%',
                cursor: category.is_locked ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: category.is_locked ? 'none' : 'translateY(-8px)',
                  boxShadow: category.is_locked ? 4 : 8
                },
                position: 'relative',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${
                  category.is_locked ? '#f5f5f5' : theme.palette.background.paper
                } 0%, ${
                  category.is_locked ? '#e0e0e0' : theme.palette.background.default
                } 100%)`,
                overflow: 'hidden'
              }}
              onClick={() => handleCategoryClick(category.id, category.is_locked)}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    color: category.is_locked ? 'text.disabled' : 'text.primary'
                  }}
                >
                  {category.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: category.is_locked ? 'text.disabled' : 'text.secondary'
                  }}
                >
                  {category.description || 'Explore and master new skills in this category'}
                </Typography>
                {category.is_locked && (
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

export default Categories;