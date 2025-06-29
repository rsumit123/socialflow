import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  Fade,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Psychology,
  SentimentSatisfied,
  Info,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ChatMessages = ({
  messages,
  isTyping,
  messagesEndRef,
  onShowMessageFeedback,
}) => {
  const theme = useTheme();

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

  return (
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
                        onClick={() => onShowMessageFeedback(msg.feedback)}
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
        
        {isTyping && renderTypingIndicator()}
      </List>
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatMessages; 