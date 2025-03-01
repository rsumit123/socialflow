import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Button,
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
  IconButton,
  Zoom,
  Tooltip,
} from '@mui/material';
import { Send, Psychology, School, Info, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import our custom components
import MessageList from './MessageList';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import CustomDialog from './CustomDialog';

const Chat = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openModal, setOpenModal] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [evaluationModal, setEvaluationModal] = useState(false);
  const [reportLink, setReportLink] = useState('');
  const [isBottom, setIsBottom] = useState(true);
  const [motivationSnackbarOpen, setMotivationSnackbarOpen] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [endChatDialogOpen, setEndChatDialogOpen] = useState(false);

  const isMounted = useRef(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const extractSessionIdFromLink = (link) => {
    try {
      const url = new URL(link);
      const pathSegments = url.pathname.split('/');
      return pathSegments[pathSegments.length - 1];
    } catch (error) {
      console.error('Invalid report link:', error);
      return '';
    }
  };

  // Create new chat session
  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    const createChatSession = async () => {
      try {
        setIsTyping(true);
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/sessions/`);
        const { session_id, ai_response, custom_scenario } = response.data;
        setSessionId(session_id);

        if (custom_scenario) {
          setTimeout(() => {
            setMessages([
              {
                message: custom_scenario.scenario,
                sender: 'system',
              },
            ]);
          }, 500);
        }

        if (ai_response) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                message: ai_response,
                sender: 'bot',
              },
            ]);
            setIsTyping(false);
          }, 1000);
        } else {
          setIsTyping(false);
        }
      } catch (error) {
        console.error('Error creating chat session:', error);
        if (error.response?.data?.error === 'Token has expired!') {
          setSessionExpired(true);
          logout();
        } else {
          setErrorMessage('Failed to create chat session.');
          setOpenSnackbar(true);
        }
        setIsTyping(false);
      }
    };

    createChatSession();
  }, [logout]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isBottom]);

  // Handle scroll detection
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsBottom(isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Show motivational message every 3 user messages (if below 10)
  useEffect(() => {
    const userMsgCount = messages.filter((msg) => msg.sender === 'user').length;
    if (userMsgCount > 0 && userMsgCount < 10 && userMsgCount % 3 === 0) {
      setMotivationMessage(`You are doing good. Keep going for ${10 - userMsgCount} more messages!`);
      setMotivationSnackbarOpen(true);
    }
  }, [messages]);

  // Updated send message function to optionally accept a custom message
  const handleSendMessage = async (customMessage) => {
    const messageToSend = customMessage !== undefined ? customMessage : userMessage;
    if (!messageToSend.trim()) return;

    const newMessage = {
      session_id: sessionId,
      message: messageToSend,
      sender: 'user',
    };

    setMessages((prev) => [...prev, { message: messageToSend, sender: 'user' }]);
    if (customMessage === undefined) setUserMessage('');
    setIsTyping(true);
    setIsBottom(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/sessions/${sessionId}/messages/`,
        newMessage
      );

      const { ai_response, evaluation } = response.data;

      if (evaluation) {
        const { report_link } = evaluation;
        setReportLink(report_link || '');
        setMessages((prev) => [...prev, { message: ai_response, sender: 'bot' }]);
        setEvaluationModal(true);
      } else if (ai_response) {
        setMessages((prev) => [...prev, { message: ai_response, sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.data?.error === 'Token has expired!') {
        setSessionExpired(true);
        logout();
      } else {
        setMessages((prev) => [
          ...prev,
          { message: 'Sorry, there was an error processing your message.', sender: 'bot' },
        ]);
        setErrorMessage('Failed to send message. Please try again.');
        setOpenSnackbar(true);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Scroll to bottom button
  const ScrollToBottomButton = () => (
    <Zoom in={!isBottom}>
      <IconButton
        onClick={() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          setIsBottom(true);
        }}
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 10,
          bgcolor: theme.palette.primary.main,
          color: 'white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <Send sx={{ transform: 'rotate(-90deg)' }} />
      </IconButton>
    </Zoom>
  );

  // Render session expired dialog
  const renderSessionExpiredDialog = () => (
    <CustomDialog
      open={sessionExpired}
      title="Session Expired"
      content="Your session has expired. Please login again."
      actions={
        <Button
          onClick={() => navigate('/login')}
          variant="contained"
          sx={{
            borderRadius: '30px',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Go to Login
        </Button>
      }
    />
  );

  // Render evaluation modal
  const renderEvaluationModal = () => (
    <CustomDialog
      open={evaluationModal}
      title="Report Card Generated"
      content={
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <School sx={{ fontSize: 60, color: theme.palette.primary.main, opacity: 0.9 }} />
          </Box>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 2 }}>
            Your report card has been generated. Click below to view your performance or continue chatting.
          </Typography>
          <Button
            onClick={() => {
              setEvaluationModal(false);
              if (reportLink) {
                const sessionId = extractSessionIdFromLink(reportLink);
                navigate(sessionId ? `/report-cards/${sessionId}` : '/report-cards');
              }
            }}
            sx={{
              mt: 2,
              display: 'block',
              width: '100%',
              borderRadius: '30px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              '&:hover': {
                boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease',
            }}
            variant="contained"
          >
            View Report Card
          </Button>
        </>
      }
      actions={
        <Button
          onClick={() => setEvaluationModal(false)}
          variant="outlined"
          sx={{ 
            borderRadius: '30px',
            px: 3,
            textTransform: 'none',
          }}
        >
          Continue Chatting
        </Button>
      }
    />
  );

  // Render welcome modal
  const renderWelcomeModal = () => (
    <CustomDialog 
      open={openModal}
      title="Welcome to SocialFlow"
      content={
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Psychology sx={{ fontSize: 60, color: theme.palette.primary.main, opacity: 0.8 }} />
          </Box>
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            Welcome to SocialFlow! Get ready to enhance your social conversation skills through 
            engaging real-life scenarios. Let's see how you handle different social situations 
            and help you improve your communication abilities.
          </Typography>
        </>
      }
      actions={
        <Button
          onClick={() => setOpenModal(false)}
          variant="contained"
          sx={{
            borderRadius: '30px',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            px: 4,
            py: 1.2,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Let's Begin!
        </Button>
      }
      onClose={() => setOpenModal(false)}
    />
  );

  // Render End Chat confirmation dialog
  const renderEndChatDialog = () => (
    <CustomDialog
      open={endChatDialogOpen}
      title="End Chat"
      content="You are about to end this chat abruptly, and generate report. Do you want to continue?"
      actions={
        <>
          <Button
            onClick={() => {
              setEndChatDialogOpen(false);
              handleSendMessage("end this chat");
            }}
            variant="contained"
            sx={{
              backgroundColor: theme.palette.error.main,
              '&:hover': { backgroundColor: theme.palette.error.dark },
              borderRadius: '30px',
              px: 3,
              py: 1,
              textTransform: 'none'
            }}
          >
            Yes, End Chat
          </Button>
          <Button
            onClick={() => setEndChatDialogOpen(false)}
            variant="outlined"
            sx={{
              ml: 2,
              borderRadius: '30px',
              px: 3,
              py: 1,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
        </>
      }
    />
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        padding: isSmallScreen ? 1 : 2,
        bgcolor: 'background.default',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      {/* Render dialogs */}
      {renderSessionExpiredDialog()}
      {renderEvaluationModal()}
      {renderWelcomeModal()}
      {renderEndChatDialog()}

      <Paper
        elevation={5}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          flexGrow: 1,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header with End Chat Icon */}
        <Box
          sx={{
            p: 2,
            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '25%',
                  width: '50%',
                  height: 3,
                  backgroundColor: 'white',
                  borderRadius: 2,
                },
              }}
            >
              Evaluation
            </Typography>
            <Tooltip title="Practice your social communication skills">
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'white',
                  ml: 1,
                  opacity: 0.8,
                  '&:hover': { opacity: 1 }
                }}
              >
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Tooltip title="End Chat">
            <IconButton
              onClick={() => setEndChatDialogOpen(true)}
              sx={{
                color: theme.palette.error.main,
              }}
            >
              <ExitToApp />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Chat Area */}
        <Box
          ref={chatContainerRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            padding: isSmallScreen ? 1 : 2,
            backgroundImage: `radial-gradient(circle at center, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            position: 'relative',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.background.default,
            },
            '&::-webkit-scrollbar-thumb': {
              background: `${theme.palette.primary.main}80`,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.primary.main,
            },
          }}
        >
          <MessageList messages={messages} isTyping={isTyping} />
          <div ref={messagesEndRef} />
          <ScrollToBottomButton />
        </Box>
        
        {/* Input Area */}
        <ChatInput 
          value={userMessage} 
          onChange={setUserMessage} 
          onSend={() => handleSendMessage()} 
          isTyping={isTyping} 
        />
      </Paper>

      {/* Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 8,
            fontWeight: 500,
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Motivational Snackbar */}
      <Snackbar
        open={motivationSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setMotivationSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setMotivationSnackbarOpen(false)}
          severity="info"
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 8,
            fontWeight: 500,
          }}
        >
          {motivationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chat;
