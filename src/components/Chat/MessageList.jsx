import React from 'react';
import { List, Box, Typography, useTheme } from '@mui/material';
import MessageBubble from './MessageBubble';

// Renders a list of messages and typing indicator
const MessageList = React.memo(({ messages, isTyping }) => {
  const theme = useTheme();
  
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
      delayAnimation={false}
    />
  );
  
  return (
    <List sx={{ width: '100%' }}>
      {messages.map((msg, index) => (
        <MessageBubble 
          key={index} 
          message={msg.message} 
          sender={msg.sender}
        />
      ))}
      {isTyping && renderTypingIndicator()}
    </List>
  );
});

export default MessageList;