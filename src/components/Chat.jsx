import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  useMediaQuery,
  IconButton,
  Fade,
  Zoom,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Send, EmojiEmotions, Psychology, School, Info } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Enhanced MessageBubble with improved animations and visual polish
const MessageBubble = React.memo(({ message, sender, theme }) => {
  const isUser = sender === 'user';
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Small delay for staggered animation effect
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Zoom in={visible} timeout={400}>
      <ListItem
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 1.5,
          alignItems: 'flex-start',
          padding: '4px 8px',
        }}
      >
        {!isUser && (
          <Avatar
            sx={{
              mr: 1.5,
              bgcolor: sender === 'bot' ? theme.palette.primary.main : 'grey.300',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              animation: sender === 'bot' ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0.2)' },
                '70%': { boxShadow: '0 0 0 10px rgba(0, 0, 0, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' },
              },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            {sender === 'bot' ? <Psychology /> : <School />}
          </Avatar>
        )}
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            // Enhanced gradients for more visual interest
            background: isUser
              ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              : sender === 'system'
              ? `linear-gradient(to right, ${theme.palette.background.default}, ${theme.palette.background.paper})`
              : theme.palette.grey[100],
            color: isUser
              ? 'white'
              : theme.palette.getContrastText(theme.palette.grey[100]),
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            maxWidth: '75%',
            position: 'relative',
            boxShadow: isUser 
              ? '0 4px 12px rgba(0,0,0,0.15)' 
              : '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Typography 
            variant="body1" 
            component="div"
            sx={{
              lineHeight: 1.6,
              fontSize: '1rem',
              fontWeight: sender === 'system' ? 500 : 400,
            }}
          >
            {message}
          </Typography>
        </Paper>
        {isUser && (
          <Avatar
            sx={{
              ml: 1.5,
              bgcolor: theme.palette.secondary.main,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              animation: 'fadeInWithBounce 0.4s ease-out',
              '@keyframes fadeInWithBounce': {
                '0%': { opacity: 0, transform: 'scale(0.8)' },
                '70%': { opacity: 1, transform: 'scale(1.1)' },
                '100%': { opacity: 1, transform: 'scale(1)' },
              },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <EmojiEmotions />
          </Avatar>
        )}
      </ListItem>
    </Zoom>
  );
});

// Enhanced MessageList with day dividers and improved animations
const MessageList = React.memo(({ messages, isTyping, theme }) => {
  
  // Render typing indicator with enhanced animation
  const renderTypingIndicator = () => (
    <MessageBubble
      key="typing"
      message={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="div" sx={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Thinking
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
                animationDelay: `${i * 0.16}s`,
                '@keyframes bounce': {
                  '0%, 80%, 100%': { transform: 'translateY(0)' },
                  '40%': { transform: 'translateY(-10px)' },
                },
              }}
            />
          ))}
        </Box>
      }
      sender="bot"
      theme={theme}
    />
  );
  
  return (
    <List sx={{ width: '100%' }}>
      {messages.map((msg, index) => (
        <MessageBubble 
          key={index} 
          message={msg.message} 
          sender={msg.sender} 
          theme={theme} 
        />
      ))}
      {isTyping && renderTypingIndicator()}
    </List>
  );
});

// Enhanced dialog with better visuals and animation
const CustomDialog = ({ open, title, content, actions, onClose }) => {
  const theme = useTheme();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
          maxWidth: '90vw',
          width: '450px',
        },
      }}
    >
      <DialogTitle
        sx={{
          position: 'relative',
          pb: 1,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          fontWeight: 700,
          textAlign: 'center',
          fontSize: '1.3rem',
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ mt: 2, px: 3 }}>
        <DialogContentText sx={{ color: 'text.primary' }}>{content}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center' }}>{actions}</DialogActions>
    </Dialog>
  );
};

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

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage = {
      session_id: sessionId,
      message: userMessage,
      sender: 'user',
    };

    setMessages((prev) => [...prev, { message: userMessage, sender: 'user' }]);
    setUserMessage('');
    setIsTyping(true);
    setIsBottom(true); // Force scroll to bottom when sending message

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
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
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
            SocialFlow Chat
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
          <MessageList messages={messages} isTyping={isTyping} theme={theme} />
          <div ref={messagesEndRef} />
          <ScrollToBottomButton />
        </Box>
        
        {/* Input Area */}
        <Paper
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
          }}
          elevation={0}
        >
          <TextField
            sx={{ flex: 1 }}
            variant="outlined"
            size="medium"
            placeholder={isTyping ? "Wait for response..." : "Type your message..."}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            disabled={isTyping}
            InputProps={{
              sx: {
                borderRadius: '30px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                  transition: 'all 0.2s ease',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: '1px',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: '2px',
                },
                bgcolor: 'background.default',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              },
            }}
          />
          {isTyping ? (
            <Box 
              sx={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 48,
                height: 48,
              }}
            >
              <CircularProgress size={24} color="primary" />
            </Box>
          ) : (
            <Tooltip title="Send message">
              <IconButton
                onClick={handleSendMessage}
                disabled={!userMessage.trim()}
                sx={{
                  flexShrink: 0,
                  backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  '& .MuiSvgIcon-root': {
                    fill: 'white !important',
                  },
                  '&:hover': {
                    backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                    color: 'grey.500',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Send />
              </IconButton>
            </Tooltip>
          )}
        </Paper>
      </Paper>

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
    </Box>
  );
};

export default Chat;