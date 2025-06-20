import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Box,
  LinearProgress,
  Button,
  Zoom,
} from '@mui/material';
import {
  CheckCircle,
  ReplayOutlined,
  PlayArrow,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getLessonStatus, getCategoryVisuals } from './reportCardUtils.jsx';

const ScenarioCard = ({ lesson, onLessonClick }) => {
  const theme = useTheme();
  const categoryName = lesson.subcategory?.category?.name || '';
  const { icon, color, bgColor } = getCategoryVisuals(categoryName, theme);
  const { isCompleted, bestScore, attempts } = getLessonStatus(lesson);

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Zoom in timeout={500}>
        <Card
          sx={{
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${color}33`
            },
            borderRadius: '16px',
            overflow: 'hidden',
            background: bgColor,
            border: `1px solid ${color}30`,
            position: 'relative',
          }}
          onClick={() => onLessonClick(lesson.id)}
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
                {bestScore}
              </Typography>
            </Box>
          )}

          <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: color,
                  mr: 2,
                  width: 40,
                  height: 40,
                }}
              >
                {icon}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Chip 
                  label={lesson.subcategory_name} 
                  size="small"
                  sx={{ 
                    backgroundColor: color,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }} 
                />
              </Box>
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: 'text.primary',
                lineHeight: 1.3,
              }}
            >
              {lesson.title}
            </Typography>

            <Box sx={{ mt: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Attempts: {attempts}
                </Typography>
                {lesson.threshold_score && (
                  <Typography variant="body2" color="text.secondary">
                    Target: {lesson.threshold_score}
                  </Typography>
                )}
              </Box>

              {attempts > 0 && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={bestScore || 0}
                    color={isCompleted ? 'success' : 'primary'}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: `${color}20`,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Best Score: {bestScore || 0}%
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant={isCompleted ? "outlined" : "contained"}
                startIcon={isCompleted ? <ReplayOutlined /> : <PlayArrow />}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: isCompleted ? 'transparent' : color,
                  borderColor: color,
                  color: isCompleted ? color : 'white',
                  '&:hover': {
                    bgcolor: isCompleted ? `${color}10` : `${color}dd`,
                    borderColor: color,
                  }
                }}
              >
                {isCompleted ? 'Practice Again' : 'Start Practice'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Zoom>
    </Grid>
  );
};

export default ScenarioCard; 