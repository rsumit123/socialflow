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

import { Send, Chat as ChatIcon, Info, ExitToApp, PsychologyAlt } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { handleAuthErrors } from '../../Api';

// Import our custom components
import MessageList from './MessageList';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import CustomDialog from './CustomDialog';

// Define message count threshold for auto-generating reports
// Ideally this would come from .env, but for now hardcoding with a constant for easy modification
const MESSAGE_COUNT_THRESHOLD = 10;

const Chat = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // Extract bot id from the URL

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
  const [endChatDialogOpen, setEndChatDialogOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [characterName, setCharacterName] = useState('your chat partner');
  const [reportGenerated, setReportGenerated] = useState(false); // Track if report has been generated

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

  // Create new chat session with bot_id query parameter
  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    const createChatSession = async () => {
      try {
        setIsTyping(true);
        // Pass the bot_id from the URL as a query param
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/sessions/?bot_id=${id}`);
        const { session_id, ai_response, custom_scenario } = response.data;
        setSessionId(session_id);
        setCharacterName(custom_scenario?.ai_name || 'your chat partner');

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
        // Check if this is an auth-related error
        if (error.response && handleAuthErrors(error.response, navigate)) {
          // The handleAuthErrors function will handle redirection if necessary
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
  }, [logout, id]);

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


  // Function to generate report
  const generateReport = async (shouldEndChat = false) => {
    // Skip if report already generated
    if (reportGenerated) {
      if (shouldEndChat) {
        navigate('/report-cards');
      }
      return;
    }
    
    if (!sessionId) return;
    
    setIsTyping(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/sessions/${sessionId}/generate-report/`
      );
      
      const { report_link } = response.data;
      
      setReportLink(report_link || '');
      setReportGenerated(true); // Mark report as generated
      
      // If the user explicitly ended the chat, navigate to Progress Tracker
      // Otherwise show the evaluation modal, allowing them to continue chatting
      if (shouldEndChat) {
        navigate('/report-cards');
      } else {
        setEvaluationModal(true);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      if (error.response && handleAuthErrors(error.response, navigate)) {
        // The handleAuthErrors function will handle redirection if necessary
        setSessionExpired(true);
        logout();
      } else {
        setErrorMessage('Failed to generate report. Please try again.');
        setOpenSnackbar(true);
        
        // If explicitly ending chat, still navigate away even if report generation failed
        if (shouldEndChat) {
          navigate('/report-cards');
        }
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Updated send message function to check message count
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

      const { ai_response, message_count, chat_ended } = response.data;

      // Update message count
      setMessageCount(message_count || 0);
      
      // Add bot's response to the messages
      if (ai_response) {
        setMessages((prev) => [...prev, { message: ai_response, sender: 'bot' }]);
      }
      
      // If chat has ended naturally or message count threshold reached, generate report
      // Only if report hasn't been generated yet
      if (!reportGenerated && (chat_ended || (message_count && message_count >= MESSAGE_COUNT_THRESHOLD))) {
        await generateReport(false); // Pass false to show modal and allow continuing chat
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response && handleAuthErrors(error.response, navigate)) {
        // The handleAuthErrors function will handle redirection if necessary
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
      <Tooltip title="Scroll to bottom">
        <IconButton
          color="primary"
          size="large"
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setIsBottom(true);
          }}
          sx={{
            position: 'absolute',
            bottom: '80px',
            right: '20px',
            zIndex: 2,
            backgroundColor: 'background.paper',
            boxShadow: theme.shadows[4],
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <Send sx={{ transform: 'rotate(90deg)' }} />
        </IconButton>
      </Tooltip>
    </Zoom>
  );

  // Render Session Expired dialog
  const renderSessionExpiredDialog = () => (
    <CustomDialog
      open={sessionExpired}
      title="Session Expired"
      content="Your session has expired. Please login again to continue."
      actions={
        <Button
          onClick={() => navigate('/login')}
          variant="contained"
          sx={{ borderRadius: '30px', px: 3, py: 1, textTransform: 'none' }}
        >
          Login
        </Button>
      }
    />
  );

  // Render Evaluation modal that shows at end of chat
  const renderEvaluationModal = () => (
    <CustomDialog
      open={evaluationModal}
      title="Chat Evaluation Ready"
      content={
        <Box sx={{ textAlign: 'center' }}>
          <PsychologyAlt
            sx={{
              fontSize: 60,
              color: theme.palette.primary.main,
              mb: 2,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          />
          <Typography variant="h6" gutterBottom>
            Great job! Your social skills evaluation is ready.
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We've analyzed your conversation and prepared a detailed report on your social skills.
            You can view your report or continue chatting!
          </Typography>
        </Box>
      }
      actions={
        <>
          <Button
            onClick={() => {
              setEvaluationModal(false);
              if (reportLink) {
                window.location.href = reportLink;
              } else {
                navigate('/report-cards');
              }
            }}
            variant="contained"
            sx={{
              borderRadius: '30px',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              '&:hover': {
                boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            View My Report
          </Button>
          <Button
            onClick={() => setEvaluationModal(false)}
            variant="outlined"
            sx={{
              ml: 2,
              borderRadius: '30px',
              px: 3,
              py: 1.5,
              textTransform: 'none',
            }}
          >
            Continue Chatting
          </Button>
        </>
      }
      onClose={() => setEvaluationModal(false)}
    />
  );

  // Render Welcome modal
  const renderWelcomeModal = () => (
    <CustomDialog
      open={openModal}
      title="Welcome to Chat!"
      content={
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <ChatIcon
              sx={{
                fontSize: 60,
                color: theme.palette.primary.main,
                animation: 'wave 1s infinite alternate',
                '@keyframes wave': {
                  '0%': { transform: 'rotate(-10deg)' },
                  '100%': { transform: 'rotate(10deg)' },
                },
              }}
            />
          </Box>
          <Typography variant="body1" paragraph>
            You're about to chat with {characterName}. This is a safe space to practice your social skills.
          </Typography>
          <Typography variant="body1" paragraph>
            Just be yourself and enjoy the conversation!
          </Typography>
        </Box>
      }
      actions={
        <Button
          onClick={() => setOpenModal(false)}
          variant="contained"
          sx={{
            borderRadius: '30px',
            px: 3,
            py: 1.5,
            textTransform: 'none',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
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
      content="You are about to end this chat and generate a report. Do you want to continue?"
      actions={
        <>
          <Button
            onClick={() => {
              setEndChatDialogOpen(false);
              generateReport(true); // Pass true to indicate this is an explicit end chat action
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
                fontWeight: 600,
                mr: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Chat Session
            </Typography>
          </Box>

          <Tooltip title="End Chat">
            <IconButton
              onClick={() => setEndChatDialogOpen(true)}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s',
              }}
            >
              <ExitToApp />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Chat message area with scroll container */}
        <Box
          ref={chatContainerRef}
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.default',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            // This will push messages to the bottom when there are few messages
            justifyContent: messages.length < 4 ? 'flex-end' : 'flex-start',
          }}
        >
          <MessageList messages={messages} isTyping={isTyping} botName={characterName} />
          <div ref={messagesEndRef} />
          <ScrollToBottomButton />
        </Box>

        {/* Input area for user messages */}
        <ChatInput value={userMessage} onChange={setUserMessage} onSend={handleSendMessage} isTyping={isTyping} />
      </Paper>

      {/* Snackbar for error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default Chat;
