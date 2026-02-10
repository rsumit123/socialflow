import React from 'react';
import { List, Box, Typography, useTheme } from '@mui/material';
import MessageBubble from './MessageBubble';

// Renders a list of messages and typing indicator
const MessageList = React.memo(({ messages, isTyping, botName }) => {
  const theme = useTheme();
  
  // Render typing indicator with enhanced animation
  const renderTypingIndicator = () => (
    <MessageBubble
      key="typing"
      botName={botName}
      message={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="div" sx={{ fontSize: '0.9rem', opacity: 0.9 }}>
            {botName ? `${botName} is typing` : 'Typing'}
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
    <List 
      sx={{ 
        width: '100%',
        p: 0,
        // Remove any extra padding/margin that might create unwanted space
        m: 0,
        // Make the list take up only as much space as needed
        flexGrow: 0
      }}
    >
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          message={msg.message}
          sender={msg.sender}
          botName={botName}
        />
      ))}
      {isTyping && renderTypingIndicator()}
    </List>
  );
});

export default MessageList;