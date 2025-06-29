import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Button,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { handleAuthErrors } from '../../Api';
import confetti from 'canvas-confetti';
import { useQueryClient } from '@tanstack/react-query';

// Import sub-components
import GoalScenarioHeader from './GoalScenarioHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatDialogs from './ChatDialogs';

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
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);

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

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        
        if (transcript) {
          setUserMessage(prev => prev + (prev ? ' ' : '') + transcript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone access to use voice input.');
          setOpenSnackbar(true);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }
  }, []);

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

  // Voice input handlers
  const startListening = () => {
    if (speechRecognition && !isListening) {
      try {
        speechRecognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setErrorMessage('Failed to start voice recognition. Please try again.');
        setOpenSnackbar(true);
      }
    }
  };

  const stopListening = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
    }
  };

  // Navigation handlers
  const handleBack = () => {
    // Refresh data when going back
    queryClient.invalidateQueries(['learningPaths']);
    navigate('/goal-objectives');
  };

  const handleNavigateBack = () => navigate('/goal-objectives');

  // Loading state
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

  // Scenario not found
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

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      bgcolor: 'background.default'
    }}>
      {/* Header Component */}
      <GoalScenarioHeader
        scenario={scenario}
        messageCount={messageCount}
        goalAchieved={goalAchieved}
        isEvaluating={isEvaluating}
        showEvaluationConfirm={showEvaluationConfirm}
        onBack={handleBack}
        onForceEvaluation={handleForceEvaluation}
        onRestart={handleRestart}
      />

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
          {/* Messages Component */}
          <ChatMessages
            messages={messages}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            onShowMessageFeedback={handleShowMessageFeedback}
          />

          {/* Input Component */}
          <ChatInput
            userMessage={userMessage}
            setUserMessage={setUserMessage}
            isTyping={isTyping}
            isListening={isListening}
            speechSupported={speechSupported}
            goalAchieved={goalAchieved}
            messageCount={messageCount}
            isEvaluating={isEvaluating}
            showEvaluationConfirm={showEvaluationConfirm}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            onForceEvaluation={handleForceEvaluation}
            onStartListening={startListening}
            onStopListening={stopListening}
          />
        </Paper>
      </Box>

      {/* All Dialogs Component */}
      <ChatDialogs
        // Success Modal
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        messageCount={messageCount}
        feedbackScore={feedbackScore}
        scenario={scenario}
        onNavigateBack={handleNavigateBack}
        onRestart={handleRestart}
        
        // Feedback Toast
        showFeedback={showFeedback}
        setShowFeedback={setShowFeedback}
        realtimeTip={realtimeTip}
        
        // Feedback Dialog
        showFeedbackDialog={showFeedbackDialog}
        setShowFeedbackDialog={setShowFeedbackDialog}
        selectedMessageFeedback={selectedMessageFeedback}
        
        // Evaluation Confirm Dialog
        showEvaluationConfirm={showEvaluationConfirm}
        onPerformForceEvaluation={performForceEvaluation}
        onCancelForceEvaluation={cancelForceEvaluation}
        isMobile={isMobile}
        
        // Coaching Intro Dialog
        showCoachingIntro={showCoachingIntro}
        setShowCoachingIntro={setShowCoachingIntro}
        
        // Error Snackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        errorMessage={errorMessage}
      />
    </Box>
  );
};

export default GoalScenarioChat; 