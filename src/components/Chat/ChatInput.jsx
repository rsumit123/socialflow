import React from 'react';
import { TextField, IconButton, Paper, Box, CircularProgress, Tooltip } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useTheme } from '@mui/material';

const ChatInput = ({ value, onChange, onSend, isTyping }) => {
  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !isTyping) {
      onSend();
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
            onClick={handleSubmit}
            disabled={!value.trim()}
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
  );
};

export default ChatInput;