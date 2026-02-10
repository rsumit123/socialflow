// src/components/JustChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const JustChat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // PHASE 1: Bot Selection
  const [bots, setBots] = useState([]);
  const [botsLoading, setBotsLoading] = useState(true);
  const [botsError, setBotsError] = useState('');

  // PHASE 2: Chat Session with Selected Bot
  const [selectedBot, setSelectedBot] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); // Chat messages
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // General error state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // For auto-scroll in chat view
  const messagesEndRef = useRef(null);

  // Fetch bots when component mounts
  useEffect(() => {
    const fetchBots = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chat/bots`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        // Expecting an array of bots
        setBots(response.data);
      } catch (error) {
        console.error('Error fetching bots:', error);
        setBotsError('Failed to load bots.');
        setOpenSnackbar(true);
        setErrorMessage('Failed to load bots.');
      } finally {
        setBotsLoading(false);
      }
    };

    fetchBots();
  }, [user.token]);

  // Create a bot session when a bot is selected
  useEffect(() => {
    const createBotSession = async () => {
      if (!selectedBot) return;
      try {
        setIsTyping(true);
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat/sessions/bot/${selectedBot.bot_id}`
          , {}, { headers: { Authorization: `Bearer ${user.token}` } }
        );
        // Expect response to include session_id, ai_response and custom_scenario (if any)
        const { session_id, ai_response, custom_scenario } = response.data;
        setSessionId(session_id);

        // Start messages with custom scenario (if provided) and then initial AI response
        let initialMessages = [];
        if (custom_scenario) {
          initialMessages.push({ message: custom_scenario, sender: 'system' });
        }
        if (ai_response) {
          initialMessages.push({ message: ai_response, sender: 'bot' });
        }
        setMessages(initialMessages);
      } catch (error) {
        console.error('Error creating bot session:', error);
        if (error.response && error.response.data && error.response.data.error === 'Token has expired!') {
          setErrorMessage('Your session has expired. Please login again!');
          setOpenSnackbar(true);
          logout();
          navigate('/login');
        } else {
          setErrorMessage('Failed to create chat session with the selected bot.');
          setOpenSnackbar(true);
        }
      } finally {
        setIsTyping(false);
      }
    };

    createBotSession();
  }, [selectedBot, user.token, logout, navigate]);

  // Auto-scroll to the latest message in chat view
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message in chat view (for bot sessions)
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    const newMessage = { session_id, message: userMessage, sender: 'user' };

    setMessages((prev) => [...prev, newMessage]);
    setUserMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/sessions/bot/message`,
        newMessage,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const { ai_response } = response.data;
      if (ai_response) {
        setMessages((prev) => [...prev, { message: ai_response, sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { message: 'Sorry, there was an error processing your message.', sender: 'bot' },
      ]);
      setErrorMessage('Failed to send message. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setIsTyping(false);
    }
  };

  // Render bot selection view
  const renderBotSelection = () => {
    if (botsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (botsError) {
      return (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          {botsError}
        </Typography>
      );
    }

    return (
      <Box sx={{ padding: { xs: 2, md: 4 } }}>
        <Typography variant="h4" align="center" gutterBottom>
          JustChat
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Pick a bot to start chatting with!
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {bots.map((bot) => (
            <Grid item xs={12} sm={6} md={4} key={bot.bot_id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.03)' },
                }}
              >
                <CardActionArea onClick={() => setSelectedBot(bot)}>
                  <CardContent sx={{ textAlign: 'center', height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Avatar sx={{ width: 56, height: 56, margin: '0 auto', bgcolor: 'primary.main' }}>
                      {bot.bot_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {bot.bot_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {bot.bot_description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Render chat view for a selected bot
  const renderChatView = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Full viewport height
        padding: 2,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Chatting with {selectedBot.bot_name}
      </Typography>
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : msg.sender === 'bot' ? 'flex-start' : 'center',
                mb: 1,
              }}
            >
              {msg.sender === 'bot' && (
                <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>{selectedBot.bot_name?.charAt(0).toUpperCase() || 'B'}</Avatar>
              )}
              {msg.sender === 'system' ? (
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" align="center">
                      {msg.message}
                    </Typography>
                  }
                  sx={{ maxWidth: '80%' }}
                />
              ) : (
                <ListItemText
                  primary={msg.message}
                  sx={{
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.300',
                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                    padding: 1,
                    maxWidth: '75%',
                    wordWrap: 'break-word',
                  }}
                />
              )}
              {msg.sender === 'user' && (
                <Avatar sx={{ ml: 1 }}>👤</Avatar>
              )}
            </ListItem>
          ))}
          {isTyping && (
            <ListItem sx={{ justifyContent: 'flex-start', mb: 1 }}>
              <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>{selectedBot.bot_name?.charAt(0).toUpperCase() || 'B'}</Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      {selectedBot.bot_name || 'Bot'} is typing
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: 'grey.500',
                          borderRadius: '50%',
                          mr: 0.5,
                          animation: 'bounce 1.4s infinite ease-in-out both',
                          '@keyframes bounce': {
                            '0%, 80%, 100%': { transform: 'scale(0)' },
                            '40%': { transform: 'scale(1)' },
                          },
                        }}
                      />
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: 'grey.500',
                          borderRadius: '50%',
                          mr: 0.5,
                          animation: 'bounce 1.4s infinite ease-in-out both',
                          animationDelay: '0.2s',
                          '@keyframes bounce': {
                            '0%, 80%, 100%': { transform: 'scale(0)' },
                            '40%': { transform: 'scale(1)' },
                          },
                        }}
                      />
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: 'grey.500',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite ease-in-out both',
                          animationDelay: '0.4s',
                          '@keyframes bounce': {
                            '0%, 80%, 100%': { transform: 'scale(0)' },
                            '40%': { transform: 'scale(1)' },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                }
                sx={{
                  bgcolor: 'grey.300',
                  color: 'text.primary',
                  borderRadius: 2,
                  padding: 1,
                  maxWidth: '75%',
                }}
              />
            </ListItem>
          )}
        </List>
        <div ref={messagesEndRef} />
      </Paper>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: 1,
          bgcolor: 'background.paper',
          boxShadow: '0 -1px 4px rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type your message..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isTyping}
          aria-label="Type your message"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          sx={{ minWidth: 'auto', padding: '8px 16px' }}
          disabled={isTyping || !userMessage.trim()}
          aria-label="Send message"
        >
          Send
        </Button>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );

  // Render either bot selection or chat view based on whether a bot has been selected
  return selectedBot ? renderChatView() : renderBotSelection();
};

export default JustChat;
