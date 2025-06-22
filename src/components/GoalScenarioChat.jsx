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
  Info,
  Close,
  Assessment,
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
  const [realtimeTip, setRealtimeTip] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState(null);
  const [selectedMessageFeedback, setSelectedMessageFeedback] = useState('');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showEvaluationConfirm, setShowEvaluationConfirm] = useState(false);
  const [showCoachingIntro, setShowCoachingIntro] = useState(false);

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
        
        // Check if goal was previously achieved (but don't set goalAchieved state)
        // This allows fresh replay experience while knowing completion status
        
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

  // Fetch chat history for in-progress scenarios
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!scenarioId || !user.token) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/scenarios/${scenarioId}/history/`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        if (handleAuthErrors(response, navigate)) throw new Error("Failed to fetch history");
        
        const history = await response.json();
        
        if (history && history.length > 0) {
          // Convert API history format to our message format
          const convertedMessages = history.map((msg, index) => ({
            id: Date.now() + index, // Generate unique IDs
            message: msg.content,
            sender: msg.role === 'user' ? 'user' : 'ai',
            timestamp: new Date(msg.timestamp).getTime(),
            feedback: msg.role === 'user' ? msg.feedback : undefined,
          }));

          // Add context message at the beginning if we have history
          const contextMessage = {
            message: scenario?.context_description || 'Loading context...',
            sender: 'system',
            timestamp: Date.now() - 1000,
            type: 'context'
          };

          setMessages([contextMessage, ...convertedMessages]);
          setMessageCount(history.filter(msg => msg.role === 'user').length);
        } else {
          // No history, add initial context message
          setMessages([
            {
              message: scenario?.context_description || '',
              sender: 'system',
              timestamp: Date.now(),
              type: 'context'
            }
          ]);
        }
        
      } catch (error) {
        console.error('Error fetching chat history:', error);
        // If history fetch fails, just start fresh with context
        setMessages([
          {
            message: scenario?.context_description || '',
            sender: 'system',
            timestamp: Date.now(),
            type: 'context'
          }
        ]);
      }
    };

    if (scenario) {
      fetchChatHistory();
    }
  }, [scenario, scenarioId, user.token, navigate]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show coaching intro popup after initial load
  useEffect(() => {
    if (scenario && !isLoading) {
      // Show after a brief delay to let the user see the interface first
      const timer = setTimeout(() => {
        setShowCoachingIntro(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [scenario, isLoading]);

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
        
        {feedbackScore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Chip
              label={`Final Score: ${feedbackScore}/100`}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                px: 2,
                py: 1,
              }}
            />
          </Box>
        )}
        
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

    const currentMessageId = Date.now();
    const newMessage = {
      id: currentMessageId,
      message: userMessage.trim(),
      sender: 'user',
      timestamp: currentMessageId
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
        // Update the user message with feedback if provided
        if (data.feedback) {
          setMessages(prev => prev.map(msg => 
            msg.id === currentMessageId 
              ? { ...msg, feedback: data.feedback }
              : msg
          ));
        }

        // Add AI response
        setMessages(prev => [...prev, {
          message: data.ai_response,
          sender: 'ai',
          timestamp: Date.now()
        }]);

        // Check if goal is achieved FIRST
        if (data.goal_achieved && !goalAchieved) {
          setGoalAchieved(true);
          
          // Show the "Final Score" toast
          if (data.real_time_tip) {
            setRealtimeTip(data.real_time_tip);
            setFeedbackScore(data.score); // Score is final here
            setShowFeedback(true);
            setTimeout(() => setShowFeedback(false), 6000);
          }
          
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

        } else if (data.real_time_tip) {
          // If goal is not achieved, just show the regular coach tip
          setRealtimeTip(data.real_time_tip);
          setFeedbackScore(null); // Ensure score is null for regular tips
          setShowFeedback(true);
          
          // Auto-hide feedback after 6 seconds
          setTimeout(() => {
            setShowFeedback(false);
          }, 6000);
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

  const handleShowMessageFeedback = (feedback) => {
    setSelectedMessageFeedback(feedback);
    setShowFeedbackDialog(true);
  };

  // Handle force goal evaluation
  const handleForceEvaluation = async () => {
    if (isEvaluating || goalAchieved) return;

    setIsEvaluating(true);
    setShowEvaluationConfirm(true);
  };

  // Actual API call for force evaluation
  const performForceEvaluation = async () => {
    setShowEvaluationConfirm(false);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/scenarios/${scenarioId}/force-complete/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (handleAuthErrors(response, navigate)) throw new Error("Failed to evaluate goal");
      
      const data = await response.json();
      
      // Handle the evaluation result
      if (data.goal_achieved) {
        setGoalAchieved(true);
        setFeedbackScore(data.score);
        
        // Show success feedback
        if (data.feedback) {
          setRealtimeTip(data.feedback);
          setShowFeedback(true);
          setTimeout(() => setShowFeedback(false), 6000);
        }
        
        // Invalidate cache and show success modal
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
      } else {
        // Goal not achieved, show feedback
        if (data.feedback) {
          setRealtimeTip(data.feedback);
          setFeedbackScore(null);
          setShowFeedback(true);
          setTimeout(() => setShowFeedback(false), 6000);
        }
      }
      
    } catch (error) {
      console.error('Error evaluating goal:', error);
      setErrorMessage('Failed to evaluate goal. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Cancel force evaluation
  const cancelForceEvaluation = () => {
    setShowEvaluationConfirm(false);
    setIsEvaluating(false);
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
    setShowFeedback(false);
    setRealtimeTip('');
    setFeedbackScore(null);
    setSelectedMessageFeedback('');
    setShowFeedbackDialog(false);
    setIsEvaluating(false);
    setShowEvaluationConfirm(false);
  };

  // Render feedback toast - drops from top
  const renderFeedbackToast = () => (
    <Fade in={showFeedback} timeout={400}>
      <Paper
        elevation={12}
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 20 },
          left: '50%',
          transform: showFeedback ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-100%)',
          width: { xs: 'calc(100vw - 32px)', sm: '400px', md: '450px' },
          maxWidth: '90vw',
          zIndex: 1400,
          borderRadius: '20px',
          overflow: 'hidden',
          background: feedbackScore 
            ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
            : `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
          color: 'white',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.25)', 
                width: { xs: 36, sm: 40 }, 
                height: { xs: 36, sm: 40 },
                flexShrink: 0
              }}
            >
              {feedbackScore ? <EmojiEvents sx={{ fontSize: { xs: 18, sm: 20 } }} /> : <Lightbulb sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  {feedbackScore ? '🎉 Final Score' : '💡 Coach Tip'}
                </Typography>
                {feedbackScore && (
                  <Chip
                    label={`${feedbackScore}/100`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  />
                )}
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  lineHeight: 1.5,
                  fontSize: { xs: '0.9rem', sm: '0.95rem' }
                }}
              >
                {realtimeTip}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setShowFeedback(false)}
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                mt: -0.5,
                mr: -0.5
              }}
            >
              <Box sx={{ fontSize: 20 }}>×</Box>
            </IconButton>
          </Box>
        </Box>
        
        {/* Progress bar for auto-hide */}
        <LinearProgress
          variant="determinate"
          value={100}
          sx={{
            height: 3,
            bgcolor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'rgba(255,255,255,0.7)',
              animation: showFeedback ? 'shrink 6s linear' : 'none',
              '@keyframes shrink': {
                from: { transform: 'translateX(0%)' },
                to: { transform: 'translateX(100%)' },
              },
            }
          }}
        />
      </Paper>
    </Fade>
  );

  // Render detailed feedback dialog
  const renderFeedbackDialog = () => (
    <Dialog
      open={showFeedbackDialog}
      onClose={() => setShowFeedbackDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        pb: 1,
        background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
        color: 'white'
      }}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
          <Psychology />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            💡 Detailed Coach Feedback
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Insights on your message
          </Typography>
        </Box>
        <IconButton
          onClick={() => setShowFeedbackDialog(false)}
          sx={{ 
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            fontSize: { xs: '0.95rem', sm: '1rem' }
          }}
        >
          {selectedMessageFeedback}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={() => setShowFeedbackDialog(false)}
          variant="contained"
          sx={{
            borderRadius: '12px',
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render force evaluation confirmation dialog
  const renderEvaluationConfirmDialog = () => (
    <Dialog
      open={showEvaluationConfirm}
      onClose={cancelForceEvaluation}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          m: 2,
          maxHeight: '85vh',
          maxWidth: '400px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        p: 2.5,
        background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
        color: 'white',
      }}>
        <Avatar sx={{ 
          bgcolor: 'rgba(255,255,255,0.2)', 
          width: 40, 
          height: 40,
        }}>
          <Assessment />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            fontSize: '1.1rem',
          }}>
            ⚠️ Force Goal Evaluation
          </Typography>
          <Typography variant="body2" sx={{ 
            opacity: 0.9, 
            fontSize: '0.85rem',
          }}>
            Manual goal assessment
          </Typography>
        </Box>
        <IconButton
          onClick={cancelForceEvaluation}
          size="small"
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { 
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 3, 
        pb: 2,
        px: 3,
        textAlign: 'center'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            mb: 2,
            fontSize: '1.1rem',
            color: theme.palette.text.primary
          }}
        >
          Goal Not Yet Detected
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            lineHeight: 1.5,
            mb: 3,
            color: theme.palette.text.secondary
          }}
        >
          Our system has not yet detected that your goal has been achieved.
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.warning.main,
            mb: 1
          }}
        >
          Do you want to force goal evaluation?
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.85rem',
            color: theme.palette.text.secondary,
            fontStyle: 'italic'
          }}
        >
          This might impact your final score.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2.5, 
        pt: 1, 
        gap: 1.5,
        flexDirection: { xs: 'column', sm: 'row' },
      }}>
        <Button
          onClick={performForceEvaluation}
          variant="contained"
          fullWidth={isMobile}
          sx={{
            borderRadius: '12px',
            py: 1.2,
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
            fontWeight: 600,
            order: { xs: 1, sm: 2 }
          }}
        >
          Yes, Evaluate Now
        </Button>
        <Button
          onClick={cancelForceEvaluation}
          variant="outlined"
          fullWidth={isMobile}
          sx={{
            borderRadius: '12px',
            py: 1.2,
            px: 3,
            borderColor: theme.palette.grey[300],
            color: theme.palette.text.secondary,
            order: { xs: 2, sm: 1 }
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render coaching introduction dialog
  const renderCoachingIntroDialog = () => (
    <Dialog
      open={showCoachingIntro}
      onClose={() => setShowCoachingIntro(false)}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          m: 2,
          maxHeight: '90vh',
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        p: 3,
        background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
        color: 'white',
      }}>
        <Avatar sx={{ 
          bgcolor: 'rgba(255,255,255,0.2)', 
          width: 48, 
          height: 48,
        }}>
          <Lightbulb />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            fontSize: '1.2rem',
          }}>
            💡 AI Coach Features
          </Typography>
          <Typography variant="body2" sx={{ 
            opacity: 0.9, 
            fontSize: '0.9rem',
          }}>
            Learn how to get the most out of your practice
          </Typography>
        </Box>
        <IconButton
          onClick={() => setShowCoachingIntro(false)}
          size="small"
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { 
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 3, 
        pb: 2,
        px: 3,
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            mb: 3,
            textAlign: 'center',
            color: theme.palette.text.primary
          }}
        >
          🎯 AI Coach is Here to Help!
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 2,
          p: 2.5,
          borderRadius: '12px',
          bgcolor: theme.palette.info.light + '15',
          border: `1px solid ${theme.palette.info.light}`,
        }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.info.main, 
            width: 48, 
            height: 48,
            flexShrink: 0
          }}>
            <Lightbulb sx={{ color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ 
              color: theme.palette.text.primary,
              lineHeight: 1.5,
              mb: 2
            }}>
              Get <strong>instant coaching tips</strong> after each message to improve your conversation skills.
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              lineHeight: 1.5,
              mb: 2
            }}>
              Click the <Box component="span" sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 0.5,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                px: 1,
                py: 0.25,
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <Info sx={{ fontSize: 12 }} /> info icon
              </Box> on your messages for detailed feedback.
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              lineHeight: 1.5
            }}>
              Use <strong>"Evaluate Goal"</strong> when you think you've achieved your objective.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        justifyContent: 'center'
      }}>
        <Button
          onClick={() => setShowCoachingIntro(false)}
          variant="contained"
          size="large"
          sx={{
            borderRadius: '12px',
            py: 1.5,
            px: 4,
            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          Got it! Let's Start Chatting 🚀
        </Button>
      </DialogActions>
    </Dialog>
  );

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
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Evaluate Goal Button - only show if not achieved and has messages */}
            {!goalAchieved && messageCount > 0 && (
              <Tooltip title="Evaluate Goal">
                <IconButton 
                  onClick={handleForceEvaluation} 
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
              <IconButton onClick={handleRestart} sx={{ color: 'white' }}>
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
                      <Box sx={{ position: 'relative', maxWidth: '100%' }}>
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
                            pr: msg.sender === 'user' && msg.feedback ? 5 : 2,
                          }}
                        >
                          <Typography variant="body1">
                            {msg.message}
                          </Typography>
                        </Paper>
                        {/* Info icon for user messages with feedback */}
                        {msg.sender === 'user' && msg.feedback && (
                          <Tooltip title="View detailed feedback">
                            <IconButton
                              size="small"
                              onClick={() => handleShowMessageFeedback(msg.feedback)}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: 'rgba(255,255,255,0.8)',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                width: 24,
                                height: 24,
                                '&:hover': {
                                  color: 'white',
                                  bgcolor: 'rgba(255,255,255,0.2)',
                                },
                              }}
                            >
                              <Info sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
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
            {/* Evaluate Goal Button in input area - show when not achieved and has messages */}
            {!goalAchieved && messageCount > 0 && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleForceEvaluation}
                  disabled={isEvaluating && !showEvaluationConfirm}
                  startIcon={
                    (isEvaluating && !showEvaluationConfirm) ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Assessment />
                    )
                  }
                  sx={{
                    borderRadius: '20px',
                    px: 3,
                    py: 1,
                    borderColor: theme.palette.warning.main,
                    color: theme.palette.warning.main,
                    '&:hover': {
                      borderColor: theme.palette.warning.dark,
                      bgcolor: theme.palette.warning.light + '20',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                    }
                  }}
                >
                  {(isEvaluating && !showEvaluationConfirm) ? 'Evaluating...' : 'Evaluate Goal'}
                </Button>
              </Box>
            )}
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
          
          {feedbackScore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Chip
                label={`Final Score: ${feedbackScore}/100`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 2,
                  py: 1,
                }}
              />
            </Box>
          )}
          
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

      {/* Feedback Toast */}
      {renderFeedbackToast()}

      {/* Detailed Feedback Dialog */}
      {renderFeedbackDialog()}

      {/* Force Evaluation Confirmation Dialog */}
      {renderEvaluationConfirmDialog()}

      {/* Coaching Introduction Dialog */}
      {renderCoachingIntroDialog()}

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