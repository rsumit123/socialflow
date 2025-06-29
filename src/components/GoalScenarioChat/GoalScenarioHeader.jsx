import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Assessment,
  RestartAlt,
  Flag,
  Celebration,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const GoalScenarioHeader = ({
  scenario,
  messageCount,
  goalAchieved,
  isEvaluating,
  showEvaluationConfirm,
  onBack,
  onForceEvaluation,
  onRestart,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          borderRadius: 0,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={onBack}
            sx={{ color: 'white' }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700 }}>
              {scenario?.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Chip
                label={`Level ${scenario?.difficulty_level}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                label={`${messageCount} messages`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              {goalAchieved && (
                <Chip
                  icon={<CheckCircle />}
                  label="Completed"
                  size="small"
                  sx={{ bgcolor: theme.palette.success.main, color: 'white' }}
                />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Evaluate Goal Button - only show if not achieved and has messages */}
            {!goalAchieved && messageCount > 0 && (
              <Tooltip title="Evaluate Goal">
                <IconButton 
                  onClick={onForceEvaluation} 
                  disabled={isEvaluating && !showEvaluationConfirm}
                  sx={{ 
                    color: 'white',
                    bgcolor: (isEvaluating && !showEvaluationConfirm) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                    '&:disabled': {
                      color: 'rgba(255,255,255,0.5)',
                    }
                  }}
                >
                  {(isEvaluating && !showEvaluationConfirm) ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    <Assessment />
                  )}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Restart">
              <IconButton onClick={onRestart} sx={{ color: 'white' }}>
                <RestartAlt />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Goal Display */}
      <Paper
        elevation={2}
        sx={{
          mx: 2,
          mt: 2,
          p: 3,
          borderRadius: '16px',
          background: goalAchieved 
            ? `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`
            : `linear-gradient(135deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})`,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            {goalAchieved ? <CheckCircle /> : <Flag />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {goalAchieved ? '🎯 Goal Achieved!' : '🎯 Your Mission'}
            </Typography>
            <Typography variant="body1">
              {scenario?.user_goal}
            </Typography>
          </Box>
          {goalAchieved && <Celebration sx={{ fontSize: 32, color: '#FFD700' }} />}
        </Box>
      </Paper>
    </>
  );
};

export default GoalScenarioHeader; 