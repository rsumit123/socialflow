import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Collapse,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Assessment,
  RestartAlt,
  Flag,
  Celebration,
  ExpandMore,
  ExpandLess,
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
  const [missionExpanded, setMissionExpanded] = useState(true);

  return (
    <>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          px: { xs: 1.5, md: 3 },
          py: 1.5,
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

      {/* Goal Display — collapsible */}
      <Paper
        elevation={0}
        sx={{
          px: { xs: 1.5, md: 3 },
          py: missionExpanded ? 1.5 : 0.75,
          borderRadius: 0,
          background: goalAchieved
            ? `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`
            : `linear-gradient(135deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})`,
          color: 'white',
          cursor: 'pointer',
          transition: 'padding 0.2s ease',
        }}
        onClick={() => setMissionExpanded(prev => !prev)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
            {goalAchieved ? '🎯 Goal Achieved!' : '🎯 Mission'}
          </Typography>
          {!missionExpanded && (
            <Typography variant="body2" sx={{ opacity: 0.85, flex: 1, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
              — {scenario?.user_goal}
            </Typography>
          )}
          <IconButton size="small" sx={{ color: 'white', ml: 'auto', p: 0.25 }}>
            {missionExpanded ? <ExpandLess sx={{ fontSize: 20 }} /> : <ExpandMore sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>
        <Collapse in={missionExpanded}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
              {goalAchieved ? <CheckCircle sx={{ fontSize: 18 }} /> : <Flag sx={{ fontSize: 18 }} />}
            </Avatar>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              {scenario?.user_goal}
            </Typography>
            {goalAchieved && <Celebration sx={{ fontSize: 24, color: '#FFD700' }} />}
          </Box>
        </Collapse>
      </Paper>
    </>
  );
};

export default GoalScenarioHeader; 