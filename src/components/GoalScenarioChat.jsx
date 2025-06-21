import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Fade,
  Zoom,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack,
  Send,
  LocalFireDepartment,
  EmojiEvents,
  Star,
  Refresh,
  CheckCircle,
  Flag,
  Psychology,
  SentimentSatisfied,
  ChatBubbleOutline,
  Lightbulb,
  Celebration,
  RestartAlt,
  Home,
  AutoAwesome,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { handleAuthErrors } from '../Api';
import confetti from 'canvas-confetti';
import { useQueryClient } from '@tanstack/react-query';

const GoalScenarioChat = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // Fetch scenario details
  useEffect(() => {
    const fetchScenario = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/scenarios/paths/`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        
        if (handleAuthErrors(response, navigate)) throw new Error("Failed to fetch scenario");
        
        const paths = await response.json();
        let foundScenario = null;
        
        for (const path of paths) {
          foundScenario = path.scenarios.find(s => s.id === parseInt(scenarioId));
          if (foundScenario) break;
        }
        
        if (!foundScenario) {
          setErrorMessage('Scenario not found');
          setOpenSnackbar(true);
          navigate('/goal-objectives');
          return;
        }
        
        setScenario(foundScenario);
        
        // Check if already completed
        if (foundScenario.user_progress && foundScenario.user_progress.goal_achieved) {
          setGoalAchieved(true);
        }
        
        // Add initial context message with enhanced styling
        setMessages([
          {
            message: foundScenario.context_description,
            sender: 'system',
            timestamp: Date.now(),
            type: 'context'
          }
        ]);
        
      } catch (error) {
        console.error('Error fetching scenario:', error);
        setErrorMessage('Failed to load scenario');
        setOpenSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (scenarioId && user.token) {
      fetchScenario();
    }
  }, [scenarioId, user.token, navigate]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const getMessageBubbleStyle = (sender, type) => {
    switch (sender) {
      case 'user':
        return {
          bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          borderRadius: '20px 20px 4px 20px',
          ml: 'auto',
          maxWidth: '80%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            right: -8,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderTop: `8px solid ${theme.palette.primary.main}`,
          }
        };
      case 'ai':
        return {
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: '20px 20px 20px 4px',
          mr: 'auto',
          maxWidth: '80%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: -8,
            width: 0,
            height: 0,
            borderRight: '8px solid transparent',
            borderTop: `8px solid ${theme.palette.background.paper}`,
          }
        };
      case 'system':
        if (type === 'context') {
          return {
            bgcolor: `linear-gradient(135deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
            color: 'white',
            borderRadius: '16px',
            mx: 'auto',
            maxWidth: '90%',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
          };
        }
        return {
          bgcolor: theme.palette.warning.light,
          color: theme.palette.warning.contrastText,
          borderRadius: '12px',
          mx: 'auto',
          maxWidth: '85%',
          textAlign: 'center',
        };
      default:
        return {};
    }
  };

  const renderTypingIndicator = () => (
    <ListItem sx={{ justifyContent: 'flex-start', mb: 2, p: 0 }}>
      <Fade in timeout={300}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: theme.palette.secondary.main, 
              width: 40, 
              height: 40,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <Psychology sx={{ fontSize: 20 }} />
          </Avatar>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: '20px 20px 20px 4px',
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                AI is thinking
              </Typography>
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: theme.palette.primary.main,
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out both',
                    animationDelay: `${i * 0.2}s`,
                    '@keyframes bounce': {
                      '0%, 80%, 100%': { transform: 'scale(0)' },
                      '40%': { transform: 'scale(1)' },
                    },
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Box>
      </Fade>
    </ListItem>
  );

  const renderSuccessModal = () => (
    <Dialog
      open={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '24px',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
          color: 'white',
          m: isMobile ? 0 : 2,
        }
      }}
    >
      <DialogContent sx={{ 
        textAlign: 'center', 
        py: isMobile ? 4 : 6,
        px: isMobile ? 2 : 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: isMobile ? '100vh' : 'auto',
      }}>
        <Zoom in timeout={500}>
          <Box>
            <EmojiEvents sx={{ 
              fontSize: isMobile ? 80 : 100, 
              mb: 2, 
              color: '#FFD700' 
            }} />
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              sx={{ 
                fontWeight: 800, 
                mb: 2,
                fontSize: isMobile ? '2rem' : '3rem'
              }}
            >
              🎉 Goal Achieved!
            </Typography>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              sx={{ 
                mb: 3, 
                opacity: 0.9,
                fontSize: isMobile ? '1rem' : '1.25rem',
                px: isMobile ? 1 : 0
              }}
            >
              Congratulations! You completed this scenario in {messageCount} messages.
            </Typography>
          </Box>
        </Zoom>
        
        <Card sx={{ 
          bgcolor: 'rgba(255,255,255,0.15)', 
          color: 'white', 
          mb: 3, 
          backdropFilter: 'blur(10px)',
          mx: isMobile ? 1 : 0
        }}>
          <CardContent sx={{ py: isMobile ? 2 : 3 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                fontSize: isMobile ? '0.9rem' : '1rem'
              }}
            >
              🎯 Goal Achieved:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontStyle: 'italic',
                fontSize: isMobile ? '0.85rem' : '0.875rem',
                lineHeight: 1.4
              }}
            >
              "{scenario?.user_goal}"
            </Typography>
          </CardContent>
        </Card>
        
        <Typography 
          variant="body2" 
          sx={{ 
            opacity: 0.8, 
            mb: 3,
            fontSize: isMobile ? '0.85rem' : '0.875rem',
            px: isMobile ? 1 : 0
          }}
        >
          Your conversation skills are improving! Ready for the next challenge?
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ 
        justifyContent: 'center', 
        pb: isMobile ? 4 : 4, 
        pt: 0,
        gap: isMobile ? 1 : 2,
        flexDirection: isMobile ? 'column' : 'row',
        px: isMobile ? 3 : 2
      }}>
        <Button
          onClick={() => {
            // Ensure data is refreshed when returning to objectives
            queryClient.invalidateQueries(['learningPaths']);
            navigate('/goal-objectives');
          }}
          variant="contained"
          size={isMobile ? "medium" : "large"}
          startIcon={<Home />}
          fullWidth={isMobile}
          sx={{
            bgcolor: 'white',
            color: theme.palette.success.main,
            borderRadius: '16px',
            px: isMobile ? 3 : 4,
            py: isMobile ? 1.2 : 1.5,
            fontWeight: 600,
            fontSize: isMobile ? '0.9rem' : '1rem',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.9)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          Explore More Scenarios
        </Button>
        <Button
          onClick={handleRestart}
          variant="outlined"
          size={isMobile ? "medium" : "large"}
          startIcon={<RestartAlt />}
          fullWidth={isMobile}
          sx={{
            borderColor: 'white',
            color: 'white',
            borderRadius: '16px',
            px: isMobile ? 3 : 4,
            py: isMobile ? 1.2 : 1.5,
            fontWeight: 600,
            fontSize: isMobile ? '0.9rem' : '1rem',
            '&:hover': {
              borderColor: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          Try Again
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading scenario...
        </Typography>
      </Box>
    );
  }

  if (!scenario) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          Scenario not found
        </Typography>
        <Button
          onClick={() => navigate('/goal-objectives')}
          variant="contained"
          startIcon={<ArrowBack />}
          sx={{ borderRadius: '12px' }}
        >
          Back to Objectives
        </Button>
      </Container>
    );
  }

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!userMessage.trim() || isTyping) return;

    const newMessage = {
      message: userMessage.trim(),
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setUserMessage('');
    setIsTyping(true);
    setMessageCount(prev => prev + 1);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/scenarios/${scenarioId}/interact/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            user_input: userMessage.trim()
          }),
        }
      );

      if (handleAuthErrors(response, navigate)) throw new Error("Failed to send message");
      
      const data = await response.json();
      
      // Add AI response with typing delay
      setTimeout(() => {
        setMessages(prev => [...prev, {
          message: data.ai_response,
          sender: 'ai',
          timestamp: Date.now()
        }]);

        // Check if goal is achieved
        if (data.goal_achieved && !goalAchieved) {
          setGoalAchieved(true);
          
          // Invalidate learning paths cache to refresh scenario status
          queryClient.invalidateQueries(['learningPaths']);
          
          setTimeout(() => {
            setShowSuccessModal(true);
            // Confetti celebration
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
            });
          }, 1000);
        }
        setIsTyping(false);
      }, 800 + Math.random() * 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        message: 'Sorry, there was an error processing your message. Please try again.',
        sender: 'system',
        timestamp: Date.now(),
        type: 'error'
      }]);
      setErrorMessage('Failed to send message');
      setOpenSnackbar(true);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRestart = () => {
    setMessages([{
      message: scenario?.context_description || '',
      sender: 'system',
      timestamp: Date.now(),
      type: 'context'
    }]);
    setGoalAchieved(false);
    setMessageCount(0);
    setShowSuccessModal(false);
  };

  // Early returns after all hooks are called
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading scenario...
        </Typography>
      </Box>
    );
  }

  if (!scenario) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          Scenario not found
        </Typography>
        <Button
          onClick={() => navigate('/goal-objectives')}
          variant="contained"
          startIcon={<ArrowBack />}
        >
          Back to Objectives
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      bgcolor: 'background.default'
    }}>
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
            onClick={() => {
              // Refresh data when going back
              queryClient.invalidateQueries(['learningPaths']);
              navigate('/goal-objectives');
            }}
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
          <Tooltip title="Restart">
            <IconButton onClick={handleRestart} sx={{ color: 'white' }}>
              <RestartAlt />
            </IconButton>
          </Tooltip>
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

      {/* Chat Messages */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', px: 2 }}>
        <Paper
          elevation={2}
          sx={{
            height: '100%',
            mt: 2,
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <List>
              {messages.map((msg, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 
                                  msg.sender === 'system' ? 'center' : 'flex-start',
                    mb: 2,
                    p: 0,
                  }}
                >
                  <Fade in timeout={300}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, maxWidth: '80%' }}>
                      {msg.sender === 'ai' && (
                        <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                          <Psychology />
                        </Avatar>
                      )}
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : 
                                       msg.sender === 'system' ? '12px' : '20px 20px 20px 4px',
                          bgcolor: msg.sender === 'user' ? theme.palette.primary.main :
                                  msg.sender === 'system' ? theme.palette.info.light :
                                  theme.palette.grey[100],
                          color: msg.sender === 'user' || msg.sender === 'system' ? 'white' : 'text.primary',
                          maxWidth: '100%',
                        }}
                      >
                        <Typography variant="body1">
                          {msg.message}
                        </Typography>
                      </Paper>
                      {msg.sender === 'user' && (
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <SentimentSatisfied />
                        </Avatar>
                      )}
                    </Box>
                  </Fade>
                </ListItem>
              ))}
              
              {isTyping && (
                <ListItem sx={{ justifyContent: 'flex-start', mb: 2, p: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <Psychology />
                    </Avatar>
                    <Paper sx={{ p: 2, borderRadius: '20px 20px 20px 4px' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[0, 1, 2].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: 'grey.500',
                              borderRadius: '50%',
                              animation: 'bounce 1.4s infinite ease-in-out both',
                              animationDelay: `${i * 0.2}s`,
                              '@keyframes bounce': {
                                '0%, 80%, 100%': { transform: 'scale(0)' },
                                '40%': { transform: 'scale(1)' },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Box>
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your message..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={isTyping || !userMessage.trim()}
                sx={{
                  minWidth: 'auto',
                  p: 1.5,
                  borderRadius: '50%',
                }}
              >
                <Send />
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Success Modal */}
      <Dialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
            color: 'white',
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          <Zoom in timeout={500}>
            <EmojiEvents sx={{ fontSize: 80, mb: 2, color: '#FFD700' }} />
          </Zoom>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            🎉 Goal Achieved!
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Congratulations! You completed this scenario in {messageCount} messages.
          </Typography>
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', mb: 3 }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                "{scenario?.user_goal}"
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => navigate('/goal-objectives')}
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: theme.palette.success.main,
              mr: 2,
            }}
          >
            Explore More
          </Button>
          <Button
            onClick={handleRestart}
            variant="outlined"
            sx={{
              borderColor: 'white',
              color: 'white',
            }}
          >
            Try Again
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GoalScenarioChat; 