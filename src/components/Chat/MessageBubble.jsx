import React, { useState, useEffect } from 'react';
import { ListItem, Avatar, Paper, Typography, Box, Zoom, useTheme } from '@mui/material';
import { EmojiEmotions, School } from '@mui/icons-material';

// MessageBubble component for rendering individual chat messages
const MessageBubble = React.memo(({ message, sender, delayAnimation = true, botName }) => {
  const theme = useTheme();
  const isUser = sender === 'user';
  const [visible, setVisible] = useState(!delayAnimation);
  
  useEffect(() => {
    if (delayAnimation) {
      // Small delay for staggered animation effect
      const timer = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [delayAnimation]);

  // Special rendering for typing indicator
  const isTypingIndicator = sender === 'bot' && typeof message === 'object';

  return (
    <Zoom in={visible} timeout={400}>
      <ListItem
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 0.75,
          alignItems: 'flex-start',
          padding: '2px 8px',
          '&:first-of-type': {
            mt: 1,
          },
          ...(sender === 'system' && {
            my: 0.5,
          })
        }}
      >
        {!isUser && (
          <Avatar
            sx={{
              mr: 1.5,
              width: 36,
              height: 36,
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
            {sender === 'bot' ? (botName ? botName.charAt(0).toUpperCase() : 'B') : <School sx={{ fontSize: 20 }} />}
          </Avatar>
        )}
        <Paper
          elevation={3}
          sx={{
            padding: 1.5,
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
          {isTypingIndicator ? (
            message
          ) : (
            <Typography 
              variant="body1" 
              component="div"
              sx={{
                lineHeight: 1.5,
                fontSize: '1rem',
                fontWeight: sender === 'system' ? 500 : 400,
              }}
            >
              {message}
            </Typography>
          )}
        </Paper>
        {isUser && (
          <Avatar
            sx={{
              ml: 1.5,
              width: 36,
              height: 36,
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
            <EmojiEmotions sx={{ fontSize: 20 }} />
          </Avatar>
        )}
      </ListItem>
    </Zoom>
  );
});

export default MessageBubble;