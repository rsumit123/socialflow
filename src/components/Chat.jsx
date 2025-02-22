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
} from '@mui/material';
import { Send, EmojiEmotions, Psychology, School } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// MessageBubble is memoized so it only re-renders if its props change.
const MessageBubble = React.memo(({ message, sender, theme }) => {
  const isUser = sender === 'user';

  return (
    <Fade in={true} timeout={500}>
      <ListItem
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 1,
          alignItems: 'flex-start',
        }}
      >
        {!isUser && (
          <Avatar
            sx={{
              mr: 1,
              bgcolor: sender === 'bot' ? theme.palette.primary.main : 'grey.300',
              animation: sender === 'bot' ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0.2)' },
                '70%': { boxShadow: '0 0 0 10px rgba(0, 0, 0, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' },
              },
            }}
          >
            {sender === 'bot' ? <Psychology /> : <School />}
          </Avatar>
        )}
        <Paper
          elevation={2}
          sx={{
            padding: 1.5,
            // For user messages use a gradient, for non-user use a light grey.
            bgcolor: isUser
              ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              : sender === 'system'
              ? theme.palette.background.default
              : theme.palette.grey[200],
            // For non-user messages, we force a contrasting text color using getContrastText.
            color: isUser
              ? 'white'
              : theme.palette.getContrastText(theme.palette.grey[200]),
            borderRadius: 2,
            maxWidth: '75%',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              ...(isUser
                ? {
                    right: -8,
                    borderWidth: '8px 0 8px 8px',
                    borderColor: `transparent transparent transparent ${theme.palette.primary.main}`,
                  }
                : {
                    left: -8,
                    borderWidth: '8px 8px 8px 0',
                    borderColor: `transparent ${
                      sender === 'system'
                        ? theme.palette.background.default
                        : theme.palette.grey[200]
                    } transparent transparent`,
                  }),
            },
          }}
        >
          {/* Render as a div to avoid nested <p> issues */}
          <Typography variant="body1" component="div">
            {message}
          </Typography>
        </Paper>
        {isUser && (
          <Avatar
            sx={{
              ml: 1,
              bgcolor: theme.palette.secondary.main,
              animation: 'fadeIn 0.3s ease-in',
              '@keyframes fadeIn': {
                '0%': { opacity: 0 },
                '100%': { opacity: 1 },
              },
            }}
          >
            <EmojiEmotions />
          </Avatar>
        )}
      </ListItem>
    </Fade>
  );
});

// MessageList is extracted and memoized so that updates to the input field won't force re-rendering of the chat history.
const MessageList = React.memo(({ messages, isTyping, theme }) => (
  <List>
    {messages.map((msg, index) => (
      <MessageBubble key={index} message={msg.message} sender={msg.sender} theme={theme} />
    ))}
    {isTyping && (
      <MessageBubble
        key="typing"
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography component="div">Typing</Typography>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 6,
                  height: 6,
                  bgcolor: theme.palette.primary.main,
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out both',
                  animationDelay: `${i * 0.16}s`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': { transform: 'scale(0)' },
                    '40%': { transform: 'scale(1)' },
                  },
                }}
              />
            ))}
          </Box>
        }
        sender="bot"
        theme={theme}
      />
    )}
  </List>
));

const CustomDialog = ({ open, title, content, actions, onClose }) => {
  const theme = useTheme();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
          backgroundImage: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.primary' }}>{content}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>{actions}</DialogActions>
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
            setIsTyping(false);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
            Your report card has been generated. Click below to view your performance or continue chatting.
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
            sx={{ borderRadius: '30px' }}
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
            Welcome to SocialFlow! Get ready to enhance your social conversation skills through 
            engaging real-life scenarios. Let's see how you handle different social situations 
            and help you improve your communication abilities.
          </>
        }
        actions={
          <Button
            onClick={() => setOpenModal(false)}
            variant="contained"
            sx={{
              borderRadius: '30px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            Let's Begin!
          </Button>
        }
        onClose={() => setOpenModal(false)}
      />

      <Paper
        ref={chatContainerRef}
        elevation={3}
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: 2,
          marginBottom: 2,
          borderRadius: 3,
          bgcolor: 'background.paper',
          backgroundImage: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3,
          }}
        >
          SocialFlow Chat
        </Typography>
        
        <MessageList messages={messages} isTyping={isTyping} theme={theme} />
        <div ref={messagesEndRef} />
      </Paper>

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
          p: 1,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 -1px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <TextField
          sx={{ flex: 1 }}
          variant="outlined"
          size="medium"
          placeholder="Type your message..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          disabled={isTyping}
          InputProps={{
            sx: {
              borderRadius: '30px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
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
            },
          }}
        />
        <IconButton
          onClick={handleSendMessage}
          disabled={isTyping || !userMessage.trim()}
          sx={{
            flexShrink: 0,
            bgcolor: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            width: 48,
            height: 48,
            borderRadius: '50%',
            // Force the nested icon to have white fill.
            '& .MuiSvgIcon-root': {
              fill: 'white !important',
            },
            '&:hover': {
              bgcolor: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              transform: 'scale(1.05)',
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
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{
            width: '100%',
            borderRadius: 2,
            bgcolor: theme.palette.error.main,
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chat;
