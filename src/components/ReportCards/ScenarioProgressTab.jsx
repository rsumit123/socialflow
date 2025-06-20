import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Fade,
} from '@mui/material';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';
import ScenarioStatsCards from './ScenarioStatsCards';
import ScenarioCard from './ScenarioCard';
import { calculateScenarioStats, getLessonStatus } from './reportCardUtils.jsx';

const ScenarioProgressTab = ({ 
  scenarios, 
  loadingScenarios, 
  onLessonClick 
}) => {
  const theme = useTheme();
  const scenarioStats = calculateScenarioStats(scenarios);
  
  // Filter to only show attempted lessons
  const attemptedScenarios = scenarios.filter(s => getLessonStatus(s).attempts > 0);

  // Group scenarios by category and calculate stats
  const categoryStats = React.useMemo(() => {
    const categoryMap = {};
    
    attemptedScenarios.forEach(lesson => {
      const categoryName = lesson.subcategory?.category?.name || 'Other';
      const { isCompleted, bestScore, attempts } = getLessonStatus(lesson);
      
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          lessons: [],
          totalAttempts: 0,
          completed: 0,
          totalScore: 0,
        };
      }
      
      categoryMap[categoryName].lessons.push(lesson);
      categoryMap[categoryName].totalAttempts += attempts;
      if (isCompleted) categoryMap[categoryName].completed += 1;
      categoryMap[categoryName].totalScore += bestScore || 0;
    });
    
    // Calculate averages and return as array
    return Object.values(categoryMap).map(category => ({
      ...category,
      averageScore: category.lessons.length > 0 
        ? Math.round(category.totalScore / category.lessons.length) 
        : 0,
      completionRate: category.lessons.length > 0 
        ? Math.round((category.completed / category.lessons.length) * 100) 
        : 0,
    }));
  }, [attemptedScenarios]);

  // Category performance chart data
  const categoryChartData = {
    labels: categoryStats.map(cat => cat.name),
    datasets: [
      {
        label: 'Average Score',
        data: categoryStats.map(cat => cat.averageScore),
        backgroundColor: `${theme.palette.primary.main}80`,
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Completion Rate %',
        data: categoryStats.map(cat => cat.completionRate),
        backgroundColor: `${theme.palette.success.main}80`,
        borderColor: theme.palette.success.main,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const categoryChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const categoryIndex = context.dataIndex;
            const category = categoryStats[categoryIndex];
            return [
              `Lessons: ${category.lessons.length}`,
              `Total Attempts: ${category.totalAttempts}`,
              `Completed: ${category.completed}`
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
          callback: function(value) {
            return value + '%';
          }
        }
      },
    },
  };

  // Scenario Progress Chart Data
  const scenarioChartData = {
    labels: ['Completed', 'In Progress'],
    datasets: [
      {
        data: [scenarioStats.completed, scenarioStats.total - scenarioStats.completed],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.grey[300],
        ],
        borderWidth: 0,
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

  return (
    <Fade in timeout={500}>
      <Box>
        {loadingScenarios ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            {attemptedScenarios.length > 0 ? (
              <ScenarioStatsCards scenarioStats={scenarioStats} />
            ) : (
              // Show empty state message
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                  Start Your Learning Journey!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Practice scenarios to track your progress and see detailed statistics here.
                </Typography>
                {scenarioStats.totalAvailable > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {scenarioStats.totalAvailable} scenarios are available to practice
                  </Typography>
                )}
              </Box>
            )}

            {/* Progress Chart */}
            {attemptedScenarios.length > 0 && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Completion Overview
                    </Typography>
                    <Box sx={{ maxWidth: 250, mx: 'auto' }}>
                      <Doughnut data={scenarioChartData} options={doughnutOptions} />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Performance by Category
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Your average scores and completion rates across different scenario types
                    </Typography>
                    {categoryStats.length > 0 ? (
                      <Box sx={{ height: 250 }}>
                        <Bar data={categoryChartData} options={categoryChartOptions} />
                      </Box>
                    ) : (
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">
                          Practice more scenarios to see category-wise performance!
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Scenario Cards */}
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Your Practiced Scenarios
            </Typography>

            {attemptedScenarios.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                  No scenarios practiced yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Start practicing scenarios to see your progress here!
                </Typography>
                {scenarioStats.totalAvailable > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {scenarioStats.totalAvailable} scenarios available to practice
                  </Typography>
                )}
              </Box>
            ) : (
              <Grid container spacing={3}>
                {attemptedScenarios.map((lesson) => (
                  <ScenarioCard 
                    key={lesson.id}
                    lesson={lesson}
                    onLessonClick={onLessonClick}
                  />
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
    </Fade>
  );
};

export default ScenarioProgressTab; 