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

const SubCategories = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categoryId } = useParams();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/course_content/subcategories/?category_id=${categoryId}`,{
            headers: { Authorization: `Bearer ${user.token}` },
          });
        handleAuthErrors(response, navigate);
        const data = await response.json();
        setSubcategories(data.sort((a, b) => a.order - b.order));
        if (data.length > 0) {
          setCategoryName(data[0].category.name);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [categoryId]);

  const handleSubcategoryClick = (subcategoryId, isLocked) => {
    if (!isLocked) {
      navigate(`/training/lessons/${subcategoryId}`);
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
        onClick={() => navigate('/training/1')}
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
          <Typography color="text.primary">{categoryName}</Typography>
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
        {categoryName} Modules
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {subcategories.map((subcategory) => (
          <Grid item xs={12} sm={6} md={4} key={subcategory.id}>
            <Card
              sx={{
                height: '100%',
                cursor: subcategory.is_locked ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: subcategory.is_locked ? 'none' : 'translateY(-8px)',
                  boxShadow: subcategory.is_locked ? 4 : 8
                },
                position: 'relative',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${
                  subcategory.is_locked ? '#f5f5f5' : theme.palette.background.paper
                } 0%, ${
                  subcategory.is_locked ? '#e0e0e0' : theme.palette.background.default
                } 100%)`,
                overflow: 'hidden'
              }}
              onClick={() => handleSubcategoryClick(subcategory.id, subcategory.is_locked)}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    color: subcategory.is_locked ? 'text.disabled' : 'text.primary'
                  }}
                >
                  {subcategory.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: subcategory.is_locked ? 'text.disabled' : 'text.secondary'
                  }}
                >
                  {subcategory.description || 'Master specific skills within this module'}
                </Typography>
                {subcategory.is_locked && (
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

export default SubCategories;