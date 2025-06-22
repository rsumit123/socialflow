import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Fade,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  LocalFireDepartment,
  EmojiEvents,
  Timeline,
  TrendingUp,
  Assessment,
  CheckCircle,
  PlayArrow,
  Star,
  Coffee,
  Business,
  Groups,
  School,
  Psychology,
} from '@mui/icons-material';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';

const MissionControlTab = ({ missionControlPaths, loadingMissionControl, onMissionClick }) => {
  const theme = useTheme();

  // Calculate Mission Control stats
  const calculateMissionStats = (paths) => {
    let totalMissions = 0;
    let completedMissions = 0;
    let totalAttempts = 0;
    let totalScore = 0;
    let scoredMissions = 0;
    const attemptedMissions = [];
    const recentMissions = [];

    paths.forEach(path => {
      path.scenarios.forEach(scenario => {
        totalMissions++;
        
        if (scenario.user_progress) {
          totalAttempts++;
          attemptedMissions.push({
            ...scenario,
            pathName: path.name,
            pathId: path.id
          });
          
          // Add to recent missions (last 10)
          recentMissions.push({
            ...scenario,
            pathName: path.name,
            lastUpdated: new Date(scenario.user_progress.last_updated_at)
          });
          
          if (scenario.user_progress.goal_achieved) {
            completedMissions++;
          }
          
          if (scenario.user_progress.total_score !== null) {
            totalScore += scenario.user_progress.total_score;
            scoredMissions++;
          }
        }
      });
    });

    // Sort recent missions by last updated
    recentMissions.sort((a, b) => b.lastUpdated - a.lastUpdated);

    return {
      totalMissions,
      completedMissions,
      totalAttempts,
      averageScore: scoredMissions > 0 ? Math.round(totalScore / scoredMissions) : 0,
      completionRate: totalAttempts > 0 ? Math.round((completedMissions / totalAttempts) * 100) : 0,
      attemptedMissions,
      recentMissions: recentMissions.slice(0, 10),
      scoredMissions
    };
  };

  // Calculate path-wise performance
  const calculatePathStats = (paths) => {
    return paths.map(path => {
      const scenarios = path.scenarios;
      const attempted = scenarios.filter(s => s.user_progress);
      const completed = scenarios.filter(s => s.user_progress && s.user_progress.goal_achieved);
      const scored = scenarios.filter(s => s.user_progress && s.user_progress.total_score !== null);
      
      const totalScore = scored.reduce((sum, s) => sum + (s.user_progress.total_score || 0), 0);
      
      return {
        name: path.name,
        totalScenarios: scenarios.length,
        attempted: attempted.length,
        completed: completed.length,
        averageScore: scored.length > 0 ? Math.round(totalScore / scored.length) : 0,
        completionRate: attempted.length > 0 ? Math.round((completed.length / attempted.length) * 100) : 0,
      };
    }).filter(path => path.attempted > 0); // Only show paths with attempts
  };

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

  const getScenarioStatus = (scenario) => {
    if (!scenario.user_progress) {
      return { status: 'Not Started', goal_achieved: false, color: theme.palette.grey[500] };
    }
    const progress = scenario.user_progress;
    return {
      status: progress.get_status_display || 'Not Started',
      goal_achieved: progress.goal_achieved || false,
      score: progress.total_score,
      color: progress.goal_achieved 
        ? theme.palette.success.main 
        : progress.status === 'IP' 
        ? theme.palette.warning.main 
        : theme.palette.grey[500]
    };
  };

  if (loadingMissionControl) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!missionControlPaths || missionControlPaths.length === 0) {
    return (
      <Paper 
        sx={{ 
          p: 6, 
          textAlign: 'center',
          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          borderRadius: '20px',
        }}
      >
        <LocalFireDepartment sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
        <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
          No Mission Data Available
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Start your first mission to see your progress here!
        </Typography>
      </Paper>
    );
  }

  const missionStats = calculateMissionStats(missionControlPaths);
  const pathStats = calculatePathStats(missionControlPaths);

  // Stats Cards Configuration
  const statsConfig = [
    {
      title: 'Completed Missions',
      value: missionStats.completedMissions,
      icon: <EmojiEvents sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />,
      color: theme.palette.success.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.success.main}10)`,
      border: `1px solid ${theme.palette.success.main}30`,
    },
    {
      title: 'Total Attempts',
      value: missionStats.totalAttempts,
      icon: <Timeline sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />,
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
      border: `1px solid ${theme.palette.primary.main}30`,
    },
    {
      title: 'Average Score',
      value: missionStats.averageScore > 0 ? `${missionStats.averageScore}/100` : 'N/A',
      icon: <TrendingUp sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />,
      color: theme.palette.warning.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.warning.light}20, ${theme.palette.warning.main}10)`,
      border: `1px solid ${theme.palette.warning.main}30`,
    },
    {
      title: 'Success Rate',
      value: `${missionStats.completionRate}%`,
      icon: <Assessment sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />,
      color: theme.palette.info.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.info.light}20, ${theme.palette.info.main}10)`,
      border: `1px solid ${theme.palette.info.main}30`,
    },
  ];

  // Mission Progress Chart Data
  const missionChartData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [
          missionStats.completedMissions,
          missionStats.totalAttempts - missionStats.completedMissions,
          missionStats.totalMissions - missionStats.totalAttempts
        ],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.grey[300],
        ],
        borderWidth: 0,
      },
    ],
  };

  // Path Performance Chart Data
  const pathChartData = {
    labels: pathStats.map(path => path.name),
    datasets: [
      {
        label: 'Average Score',
        data: pathStats.map(path => path.averageScore),
        backgroundColor: `${theme.palette.primary.main}80`,
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Success Rate %',
        data: pathStats.map(path => path.completionRate),
        backgroundColor: `${theme.palette.success.main}80`,
        borderColor: theme.palette.success.main,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    cutout: '60%',
  };

  const pathChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const pathIndex = context.dataIndex;
            const path = pathStats[pathIndex];
            return [
              `Missions: ${path.totalScenarios}`,
              `Attempted: ${path.attempted}`,
              `Completed: ${path.completed}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value, index, values) {
            return value + '%';
          }
        }
      },
    },
  };

  return (
    <Fade in timeout={500}>
      <Box>
        {missionStats.totalAttempts === 0 ? (
          // Empty state
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LocalFireDepartment sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
              Start Your Mission Journey!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Complete missions to track your progress and see detailed analytics here.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {missionStats.totalMissions} missions are available to practice
            </Typography>
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statsConfig.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      background: stat.bgGradient,
                      border: stat.border,
                      borderRadius: '16px',
                    }}
                  >
                    {stat.icon}
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: '16px' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Mission Overview
                  </Typography>
                  <Box sx={{ maxWidth: 250, mx: 'auto' }}>
                    <Doughnut key="mission-overview-chart" data={missionChartData} options={doughnutOptions} />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: '16px' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Performance by Path
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Your average scores and success rates across different mission paths
                  </Typography>
                  {pathStats.length > 0 ? (
                    <Box sx={{ height: 250 }}>
                      <Bar key="path-performance-chart" data={pathChartData} options={pathChartOptions} />
                    </Box>
                  ) : (
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">
                        Complete more missions to see path-wise performance!
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Recent Missions */}
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Mission Attempts
            </Typography>
            
            <Grid container spacing={3}>
              {missionStats.recentMissions.map((mission) => {
                const status = getScenarioStatus(mission);
                const pathColor = getPathColor(mission.pathName);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={mission.id}>
                    <Card
                      onClick={() => onMissionClick(mission.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: '16px',
                        border: `1px solid ${status.color}30`,
                        background: `linear-gradient(135deg, ${status.color}10, ${theme.palette.background.paper})`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 20px ${status.color}30`,
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: pathColor,
                              width: 40,
                              height: 40,
                              mr: 2,
                            }}
                          >
                            {getPathIcon(mission.pathName)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              {mission.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {mission.pathName}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={status.status}
                            size="small"
                            sx={{
                              bgcolor: `${status.color}20`,
                              color: status.color,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                          {status.score !== null && (
                            <Chip
                              label={`Score: ${status.score}/100`}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: `${pathColor}50`,
                                color: pathColor,
                                fontSize: '0.7rem',
                              }}
                            />
                          )}
                          <Chip
                            label={`Level ${mission.difficulty_level}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: `${theme.palette.grey[400]}`,
                              color: theme.palette.grey[600],
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: '0.85rem',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {mission.user_goal}
                        </Typography>
                        
                        {mission.user_progress && mission.user_progress.feedback && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: `${theme.palette.info.main}10`, borderRadius: '8px' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                              Coach Feedback:
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.8rem',
                                lineHeight: 1.3,
                                mt: 0.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {mission.user_progress.feedback}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Box>
    </Fade>
  );
};

export default MissionControlTab; 