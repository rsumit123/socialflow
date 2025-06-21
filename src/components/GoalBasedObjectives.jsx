import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Button,
  LinearProgress,
  Paper,
  Fade,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  LocalFireDepartment,
  Lock,
  CheckCircle,
  PlayArrow,
  Star,
  EmojiEvents,
  Groups,
  Coffee,
  Business,
  School,
  Psychology,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { handleAuthErrors } from '../Api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const GoalBasedObjectives = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [selectedPath, setSelectedPath] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch learning paths and scenarios
  const fetchLearningPaths = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/scenarios/paths/`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      if (handleAuthErrors(response, navigate)) throw new Error("Failed to fetch learning paths");
      return response.json();
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      setErrorMessage('Failed to load learning paths.');
      setOpenSnackbar(true);
      throw error;
    }
  };

  const { data: learningPaths = [], isLoading, refetch } = useQuery({
    queryKey: ['learningPaths', user.token],
    queryFn: fetchLearningPaths,
    enabled: !!user.token,
    staleTime: 0, // Always refetch when component mounts
    cacheTime: 0, // Don't cache the data
  });

  // Refresh data when component mounts (user returns from scenario)
  useEffect(() => {
    refetch();
  }, [refetch]);

  const getPathIcon = (pathName) => {
    const lowerName = pathName.toLowerCase();
    if (lowerName.includes('small talk')) return <Coffee sx={{ fontSize: 32 }} />;
    if (lowerName.includes('professional')) return <Business sx={{ fontSize: 32 }} />;
    if (lowerName.includes('social')) return <Groups sx={{ fontSize: 32 }} />;
    if (lowerName.includes('academic')) return <School sx={{ fontSize: 32 }} />;
    return <Psychology sx={{ fontSize: 32 }} />;
  };

  const getPathColor = (pathName) => {
    const lowerName = pathName.toLowerCase();
    if (lowerName.includes('small talk')) return theme.palette.info.main;
    if (lowerName.includes('professional')) return theme.palette.primary.main;
    if (lowerName.includes('social')) return theme.palette.success.main;
    if (lowerName.includes('academic')) return theme.palette.warning.main;
    return theme.palette.secondary.main;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return theme.palette.success.main;
      case 'In Progress': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getScenarioStatus = (scenario) => {
    if (!scenario.user_progress) {
      return { status: 'Not Started', goal_achieved: false };
    }
    return {
      status: scenario.user_progress.status_display || 'Not Started',
      goal_achieved: scenario.user_progress.goal_achieved || false
    };
  };

  const calculatePathProgress = (scenarios) => {
    const completed = scenarios.filter(s => s.user_progress && s.user_progress.goal_achieved).length;
    return { completed, total: scenarios.length, percentage: (completed / scenarios.length) * 100 };
  };

  const handleScenarioClick = (scenario) => {
    if (scenario.is_locked) return;
    navigate(`/goal-objectives/scenario/${scenario.id}`);
  };

  const renderPathSelection = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          🎯 Goal Based Objectives
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Master conversation skills through interactive challenges with specific goals
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {learningPaths.map((path) => {
            const progress = calculatePathProgress(path.scenarios);
            const pathColor = getPathColor(path.name);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={path.id}>
                <Fade in timeout={500}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 30px ${pathColor}33`
                      },
                      borderRadius: '20px',
                      overflow: 'hidden',
                      background: `linear-gradient(135deg, ${pathColor}10, ${theme.palette.background.paper})`,
                      border: `2px solid ${pathColor}30`,
                      position: 'relative',
                    }}
                    onClick={() => setSelectedPath(path)}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                          sx={{
                            bgcolor: pathColor,
                            width: 60,
                            height: 60,
                            mr: 2,
                          }}
                        >
                          {getPathIcon(path.name)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            {path.name}
                          </Typography>
                          <Chip
                            label={`${path.scenarios.length} Scenarios`}
                            size="small"
                            sx={{
                              backgroundColor: `${pathColor}20`,
                              color: pathColor,
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>

                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 3, lineHeight: 1.6 }}
                      >
                        {path.description}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: pathColor }}>
                            {progress.completed}/{progress.total} Completed
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress.percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: `${pathColor}20`,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: pathColor,
                              borderRadius: 4,
                            }
                          }}
                        />
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PlayArrow />}
                        sx={{
                          backgroundColor: pathColor,
                          borderRadius: '12px',
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: `${pathColor}dd`,
                          }
                        }}
                      >
                        Start Journey
                      </Button>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );

  const renderScenarioSelection = () => {
    const pathColor = getPathColor(selectedPath.name);
    
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => setSelectedPath(null)}
            sx={{
              mr: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: theme.palette.background.paper,
                transform: 'scale(1.1)'
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {selectedPath.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {selectedPath.description}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {selectedPath.scenarios.map((scenario, index) => {
            const scenarioStatus = getScenarioStatus(scenario);
            const statusColor = getStatusColor(scenarioStatus.status);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={scenario.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: scenario.is_locked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': !scenario.is_locked && {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${pathColor}33`
                    },
                    borderRadius: '16px',
                    overflow: 'hidden',
                    opacity: scenario.is_locked ? 0.6 : 1,
                    background: scenarioStatus.goal_achieved 
                      ? `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.background.paper})`
                      : `linear-gradient(135deg, ${pathColor}10, ${theme.palette.background.paper})`,
                    border: `1px solid ${scenarioStatus.goal_achieved ? theme.palette.success.main : pathColor}30`,
                    position: 'relative',
                  }}
                  onClick={() => handleScenarioClick(scenario)}
                >
                  {/* Lock Overlay */}
                  {scenario.is_locked && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        backgroundColor: theme.palette.grey[700],
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Lock sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                  )}

                  {/* Completion Badge */}
                  {scenarioStatus.goal_achieved && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 2,
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
                      <EmojiEvents sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit' }}>
                        Completed
                      </Typography>
                    </Box>
                  )}

                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                        {scenario.title}
                      </Typography>
                      <Chip
                        label={`Level ${scenario.difficulty_level}`}
                        size="small"
                        sx={{
                          backgroundColor: `${pathColor}20`,
                          color: pathColor,
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, lineHeight: 1.5 }}
                    >
                      {scenario.context_description || `Practice your conversation skills in this ${scenario.title.toLowerCase()} scenario.`}
                    </Typography>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: `${pathColor}10`,
                        borderRadius: '12px',
                        border: `1px solid ${pathColor}30`,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: pathColor }}>
                        🎯 Your Goal:
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {scenario.user_goal || `Complete the ${scenario.title.toLowerCase()} conversation challenge successfully.`}
                      </Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip
                        label={scenarioStatus.status}
                        size="small"
                        sx={{
                          backgroundColor: statusColor,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                      {!scenario.is_locked && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={scenarioStatus.goal_achieved ? <Star /> : <PlayArrow />}
                          sx={{
                            backgroundColor: pathColor,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: `${pathColor}dd`,
                            }
                          }}
                        >
                          {scenarioStatus.goal_achieved ? 'Replay' : 'Start'}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    );
  };

  return selectedPath ? renderScenarioSelection() : renderPathSelection();
};

export default GoalBasedObjectives; 