import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Modal,
  useTheme,
  useMediaQuery,
  Stack,
  Fade
} from '@mui/material';
import { 
  EmojiPeople,
  ArrowForward,
  Close,
  Lightbulb,
  PsychologyAlt,
  SportsEsports,
  Code, 
  TrendingUp,
  Chat
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

const BotSelection = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/bots/`);
        if (!response.ok) {
          throw new Error('Error fetching bots');
        }
        const data = await response.json();
        setBots(data);
        setLoading(false);
        // Open the intro modal after a short delay
        // setTimeout(() => {
        //   setOpenModal(true);
        // }, 500);
      } catch (error) {
        console.error('Error fetching bots:', error);
        setLoading(false);
      }
    };
    fetchBots();
  }, []);

  useEffect(() => {
    // Start the staggered animation after component mounts
    setStartAnimation(true);
  }, []);

  // Navigate directly to the chat page with the selected bot
  const handleStartChat = (botId) => {
    navigate(`/chat/character/${botId}`);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Returns an icon and a gradient based on the bot id.
  const getBotIcon = (id) => {
    switch (id) {
      case 1:
        return {
          icon: <SportsEsports sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
          gradient: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.primary.light}44)`
        };
      case 2:
        return {
          icon: <Code sx={{ fontSize: 60, color: theme.palette.secondary.main }} />,
          gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}22, ${theme.palette.secondary.light}44)`
        };
      case 3:
        return {
          icon: <EmojiPeople sx={{ fontSize: 60, color: theme.palette.primary.dark }} />,
          gradient: `linear-gradient(135deg, ${theme.palette.primary.dark}22, ${theme.palette.primary.main}44)`
        };
      default:
        return {
          icon: <PsychologyAlt sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
          gradient: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}44)`
        };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h6" color="text.secondary">
          Loading Bots...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 4, md: 8 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 70%, ${theme.palette.primary.main}22, transparent 25%), 
                       radial-gradient(circle at 70% 30%, ${theme.palette.secondary.main}22, transparent 20%)`,
          backgroundSize: '60px 60px',
          animation: 'fadeInOut 15s infinite alternate',
          opacity: 0.5,
          zIndex: 0,
        },
        '@keyframes fadeInOut': {
          '0%': { opacity: 0.3 },
          '100%': { opacity: 0.7 },
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
          <Chip 
            label="CHOOSE YOUR GUIDE" 
            color="primary" 
            size="medium" 
            sx={{ 
              mb: 2, 
              fontWeight: 'bold', 
              borderRadius: '12px', 
              fontSize: '0.9rem',
              background: theme.palette.primary.main + '33',
              color: theme.palette.primary.main,
              border: '1px solid ' + theme.palette.primary.main + '44',
            }} 
          />
          <Typography
            variant={isSmallScreen ? 'h3' : 'h2'}
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              mb: 2,
              letterSpacing: '-0.5px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Who's Your Social Vibe?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.6,
              mb: 4,
              fontWeight: 400,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Choose a conversation partner that matches your preferred style.
            Your selected guide will help evaluate your social skills and provide personalized feedback.
          </Typography>
        </Box>

        {/* Bot Selection Grid */}
        <Grid container spacing={4} justifyContent="center">
          {bots.map((bot, index) => {
            const { icon, gradient } = getBotIcon(bot.id);
            
            return (
              <Fade 
                in={startAnimation} 
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  transitionDuration: '500ms' 
                }}
                key={bot.id}
              >
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '24px',
                      transition: 'all 0.3s ease',
                      background: gradient,
                      border: selectedBot?.id === bot.id 
                        ? `3px solid ${theme.palette.primary.main}` 
                        : `1px solid ${theme.palette.primary.main}22`,
                      overflow: 'visible',
                      position: 'relative',
                      transform: selectedBot?.id === bot.id ? 'scale(1.03)' : 'scale(1)',
                      boxShadow: selectedBot?.id === bot.id 
                        ? `0 20px 40px ${theme.palette.primary.main}44`
                        : `0 10px 30px ${theme.palette.primary.main}22`,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px ${theme.palette.primary.main}33`,
                      },
                    }}
                  >
                    {/* Bot Avatar Circle */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: '-40px', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        background: theme.palette.background.paper,
                        borderRadius: '50%',
                        width: '100px',
                        height: '100px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: `0 10px 20px ${theme.palette.primary.main}33`,
                        border: `1px solid ${theme.palette.primary.main}33`,
                        zIndex: 2,
                      }}
                    >
                      {icon}
                    </Box>
                    
                    <CardContent sx={{ 
                      p: 4, 
                      textAlign: 'center', 
                      pt: 8, 
                      mt: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          mt: 1, 
                          mb: 2, 
                          fontWeight: 700,
                          background: selectedBot?.id === bot.id 
                            ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                            : 'inherit',
                          WebkitBackgroundClip: selectedBot?.id === bot.id ? 'text' : 'inherit',
                          WebkitTextFillColor: selectedBot?.id === bot.id ? 'transparent' : 'inherit',
                        }}
                      >
                        {bot.name}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 3,
                          flex: 1,
                          fontWeight: selectedBot?.id === bot.id ? 500 : 400,
                        }}
                      >
                        {bot.description}
                      </Typography>
                      
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => handleStartChat(bot.id)}
                        endIcon={<Chat />}
                        sx={{
                          borderRadius: '14px',
                          py: 1.5,
                          px: 3,
                          fontSize: '1rem',
                          textTransform: 'none',
                          fontWeight: 600,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          boxShadow: '0 8px 20px ' + theme.palette.primary.main + '44',
                          '&:hover': {
                            transform: 'translateY(-3px) scale(1.02)',
                            boxShadow: '0 12px 25px ' + theme.palette.primary.main + '66'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Start Chatting
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Fade>
            );
          })}
        </Grid>
      </Container>

      {/* Intro Modal */}
      {/* <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Fade in={openModal}>
          <Box sx={{
            maxWidth: '500px',
            width: '100%',
            bgcolor: 'background.paper',
            borderRadius: '24px',
            boxShadow: 24,
            p: 4,
            outline: 'none',
            position: 'relative',
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            border: `1px solid ${theme.palette.primary.main}22`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 30%, ${theme.palette.primary.main}22, transparent 20%), 
                         radial-gradient(circle at 80% 70%, ${theme.palette.secondary.main}22, transparent 20%)`,
              backgroundSize: '30px 30px',
              borderRadius: '24px',
              opacity: 0.5,
              zIndex: 0,
            }
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Button
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  minWidth: 'auto',
                  borderRadius: '50%',
                  p: 1
                }}
              >
                <Close />
              </Button>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <PsychologyAlt sx={{ 
                  fontSize: 70, 
                  color: theme.palette.primary.main,
                  animation: 'pulse 3s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' },
                  }
                }} />
              </Box>
              
              <Typography
                variant="h4"
                sx={{
                  textAlign: 'center',
                  fontWeight: 800,
                  mb: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Choose Your Conversation Partner
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  mb: 3,
                  color: 'text.secondary',
                  lineHeight: 1.6
                }}
              >
                Select the bot personality that you'd find most fun and engaging to chat with. 
                Your chosen companion will guide your conversation and provide helpful feedback 
                to evaluate and improve your social skills.
              </Typography>
              
              <Stack 
                direction="row" 
                spacing={2} 
                sx={{ 
                  mb: 3, 
                  flexWrap: 'wrap', 
                  gap: 2,
                  justifyContent: 'center',
                  '& > div': {
                    backdropFilter: 'blur(10px)',
                    background: theme.palette.background.paper + '66',
                    border: '1px solid ' + theme.palette.primary.main + '22',
                    borderRadius: '12px',
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                <Box>
                  <Lightbulb sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Personalized Feedback</Typography>
                </Box>
                <Box>
                  <TrendingUp sx={{ color: theme.palette.secondary.main }} />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Skill Development</Typography>
                </Box>
              </Stack>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCloseModal}
                sx={{
                  borderRadius: '14px',
                  py: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: '0 8px 20px ' + theme.palette.primary.main + '33',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px ' + theme.palette.primary.main + '55'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Got it!
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal> */}
    </Box>
  );
};

export default BotSelection;
