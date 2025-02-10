// src/components/Home.jsx
import React from 'react';
import { Box, Grid, Card, CardContent, CardActionArea, Typography, IconButton, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SchoolIcon from '@mui/icons-material/School';
import LockIcon from '@mui/icons-material/Lock';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // Define card options; Lessons is locked
  const options = [
    {
      title: 'Just Chat',
      subtitle: 'Have a casual conversation',
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      onClick: () => navigate('/justchat'),
      locked: false,
    },
    {
      title: 'Learn',
      subtitle: 'Discover new insights',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      onClick: () => navigate('/chat'),
      locked: false,
    },
    {
      title: 'Lessons',
      subtitle: 'Unlock curated lessons',
      icon: <SchoolIcon sx={{ fontSize: 40, opacity: 0.5 }} />, // using same icon with lower opacity
      onClick: () => {},
      locked: true,
    },
    {
      title: 'Reports',
      subtitle: 'View your performance',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      onClick: () => navigate('/report-cards'),
      locked: false,
    },
  ];

  return (
    <Box
      sx={{
        padding: { xs: 2, md: 4 },
        bgcolor: 'background.default',
        minHeight: 'calc(100vh - 64px)', // Account for header height
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Welcome to SocialFlow
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Choose an option to get started
      </Typography>
      <Grid container spacing={4} sx={{ marginTop: 4 }}>
        {options.map((option, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: 'transform 0.3s',
                position: 'relative', // Needed for absolute positioning
                '&:hover': { transform: option.locked ? 'none' : 'scale(1.03)' },
                bgcolor: option.locked ? 'grey.200' : 'background.paper',
              }}
            >
              {option.locked ? (
                <Tooltip title="This section is locked">
                  <Box sx={{ position: 'relative' }}>
                    <CardActionArea disabled>
                      <CardContent sx={{ textAlign: 'center', height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {option.icon}
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {option.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {option.subtitle}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    {/* Absolutely positioned lock icon */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        borderRadius: '50%',
                        padding: 0.5,
                      }}
                    >
                      <LockIcon sx={{ fontSize: 16, color: 'white' }} />
                    </Box>
                  </Box>
                </Tooltip>
              ) : (
                <CardActionArea onClick={option.onClick}>
                  <CardContent sx={{ textAlign: 'center', height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {option.icon}
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {option.subtitle}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
