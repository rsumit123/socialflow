// src/components/Chat.jsx
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
  ListItemText,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Chat = () => {
  const { user, logout } = useAuth(); // Destructure logout from useAuth
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); // Initialize with empty array
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [openModal, setOpenModal] = useState(true); // State for modal

  const [sessionExpired, setSessionExpired] = useState(false); // New state for session expiration

  const isMounted = useRef(false); // Prevent duplicate session creation
  const messagesEndRef = useRef(null); // For auto-scroll

  // Create a chat session when the component mounts
  useEffect(() => {
    if (isMounted.current) return; // Prevent duplicate calls
    isMounted.current = true;

    const createChatSession = async () => {
      try {
        setIsTyping(true); // Show typing indicator before API call

        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v2/chat/sessions/`);
        const { session_id, ai_response, custom_scenario } = response.data;
        setSessionId(session_id);

        if (custom_scenario) {
          // Optional: Introduce a delay to simulate typing for system message
          setTimeout(() => {
            setMessages([
              {
                message: custom_scenario,
                sender: 'system',
              },
            ]);
            setIsTyping(false); // Hide typing indicator after setting the system message
          }, 500); // 0.5-second delay for better UX
        }

        if (ai_response) {
          // Optional: Introduce a delay to simulate typing for AI response
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                message: ai_response,
                sender: 'bot',
              },
            ]);
            setIsTyping(false); // Hide typing indicator after setting the AI message
          }, 1000); // 1-second delay
        } else {
          setIsTyping(false); // Hide typing indicator if no AI response
        }
      } catch (error) {
        console.error('Error creating chat session:', error);

        if (error.response && error.response.data && error.response.data.error === 'Token has expired!') {
          // Handle token expiration
          setSessionExpired(true); // Show expiration dialog
          logout(); // Log out the user from AuthContext
        } else {
          setErrorMessage('Failed to create chat session.');
          setOpenSnackbar(true);
        }

        setIsTyping(false); // Ensure typing indicator is hidden on error
      }
    };

    createChatSession();
  }, [logout]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message send
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage = {
      session_id: sessionId,
      message: userMessage,
      sender: 'user',
    };

    setMessages((prev) => [...prev, { message: userMessage, sender: 'user' }]);
    setUserMessage('');
    setIsTyping(true); // Show typing indicator

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/sessions/${sessionId}/messages/`,
        newMessage
      );

      // Assuming the response contains ai_response
      const { ai_response } = response.data;
      if (ai_response) {
        setMessages((prev) => [...prev, { message: ai_response, sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      if (error.response && error.response.data && error.response.data.error === 'Token has expired!') {
        // Handle token expiration
        setSessionExpired(true); // Show expiration dialog
        logout(); // Log out the user from AuthContext
      } else {
        setMessages((prev) => [
          ...prev,
          { message: 'Sorry, there was an error processing your message.', sender: 'bot' },
        ]);
        setErrorMessage('Failed to send message. Please try again.');
        setOpenSnackbar(true);
      }
    } finally {
      setIsTyping(false); // Hide typing indicator
    }
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Function to render messages based on sender
  const renderMessage = (msg, index) => {
    switch (msg.sender) {
      case 'system':
        return (
          <ListItem key={index} sx={{ justifyContent: 'center', mb: 1 }}>
            <Paper
              elevation={0}
              sx={{
                padding: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                maxWidth: '80%',
              }}
            >
              <Typography variant="body2" color="text.secondary" align="center">
                {msg.message}
              </Typography>
            </Paper>
          </ListItem>
        );
      case 'user':
        return (
          <ListItem
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 1,
            }}
          >
            <Avatar sx={{ ml: 1 }}>👤</Avatar>
            <ListItemText
              primary={msg.message}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 2,
                padding: 1,
                maxWidth: '75%',
                wordWrap: 'break-word',
              }}
            />
          </ListItem>
        );
      case 'bot':
        return (
          <ListItem
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              mb: 1,
            }}
          >
            <Avatar sx={{ mr: 1 }}>🤖</Avatar>
            <ListItemText
              primary={msg.message}
              sx={{
                bgcolor: 'grey.300',
                color: 'text.primary',
                borderRadius: 2,
                padding: 1,
                maxWidth: '75%',
                wordWrap: 'break-word',
              }}
            />
          </ListItem>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Keep height 100vh for full viewport
        padding: 2,
        bgcolor: 'background.default',
      }}
    >
      {/* Session Expiration Dialog */}
      <Dialog
        open={sessionExpired}
        onClose={() => {}} // Prevent closing the dialog manually
        aria-labelledby="session-expired-dialog-title"
        aria-describedby="session-expired-dialog-description"
      >
        <DialogTitle id="session-expired-dialog-title">Session Expired</DialogTitle>
        <DialogContent>
          <DialogContentText id="session-expired-dialog-description">
            Your session has expired. Please login again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => navigate('/login')}
            color="primary"
            variant="contained"
            autoFocus
            aria-label="Redirect to Login Page"
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Welcome Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="welcome-dialog-title"
        aria-describedby="welcome-dialog-description"
      >
        <DialogTitle id="welcome-dialog-title">Welcome to SocialFlow</DialogTitle>
        <DialogContent>
          <DialogContentText id="welcome-dialog-description">
            Hey! Welcome to SocialFlow. You are about to improve your social conversation skills.
            Let's see how you fare in a real-life stimulated scenario. We are awaiting your result.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary" aria-label="Start Chat">
            Let's Go
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Messages */}
      <Paper
        elevation={3}
        sx={{
          flex: 1, // Allows the Paper to grow and fill available space
          overflowY: 'auto',
          padding: 2,
          marginBottom: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          SocialFlow Chat
        </Typography>
        <List>
          {messages.map((msg, index) => renderMessage(msg, index))}

          {/* Typing Indicator */}
          {isTyping && (
            <ListItem sx={{ justifyContent: 'flex-start', mb: 1 }}>
              <Avatar sx={{ mr: 1 }}>🤖</Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      AI is typing
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

      {/* Message Input */}
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
              e.preventDefault(); // Prevent newline
              handleSendMessage();
            }
          }}
          disabled={isTyping} // Disable input when AI is typing
          aria-label="Type your message"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          sx={{ minWidth: 'auto', padding: '8px 16px' }}
          disabled={isTyping || !userMessage.trim()} // Disable send when AI is typing or message is empty
          aria-label="Send message"
        >
          Send
        </Button>
      </Box>

      {/* Snackbar for General Error Messages */}
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
};

export default Chat;
