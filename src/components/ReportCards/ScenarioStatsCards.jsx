import React from 'react';
import {
  Grid,
  Card,
  Typography,
} from '@mui/material';
import {
  EmojiEvents,
  Timeline,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ScenarioStatsCards = ({ scenarioStats }) => {
  const theme = useTheme();

  const statsConfig = [
    {
      title: 'Completed Scenarios',
      value: scenarioStats.completed,
      icon: <EmojiEvents sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />,
      color: theme.palette.success.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.success.main}10)`,
      border: `1px solid ${theme.palette.success.main}30`,
    },
    {
      title: 'Total Attempts',
      value: scenarioStats.totalAttempts,
      icon: <Timeline sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />,
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
      border: `1px solid ${theme.palette.primary.main}30`,
    },
    {
      title: 'Average Score',
      value: scenarioStats.averageScore,
      icon: <TrendingUp sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />,
      color: theme.palette.warning.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.warning.light}20, ${theme.palette.warning.main}10)`,
      border: `1px solid ${theme.palette.warning.main}30`,
    },
    {
      title: 'Completion Rate',
      value: `${Math.round((scenarioStats.completed / scenarioStats.total) * 100) || 0}%`,
      icon: <Assessment sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />,
      color: theme.palette.info.main,
      bgGradient: `linear-gradient(135deg, ${theme.palette.info.light}20, ${theme.palette.info.main}10)`,
      border: `1px solid ${theme.palette.info.main}30`,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statsConfig.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: stat.bgGradient,
              border: stat.border,
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
  );
};

export default ScenarioStatsCards; 