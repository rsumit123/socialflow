import React from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  Assessment,
  Mic,
  MicOff,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ChatInput = ({
  userMessage,
  setUserMessage,
  isTyping,
  isListening,
  speechSupported,
  goalAchieved,
  messageCount,
  isEvaluating,
  showEvaluationConfirm,
  onSendMessage,
  onKeyPress,
  onForceEvaluation,
  onStartListening,
  onStopListening,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
      {/* Evaluate Goal Button in input area - show when not achieved and has messages */}
      {!goalAchieved && messageCount > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={onForceEvaluation}
            disabled={isEvaluating && !showEvaluationConfirm}
            startIcon={
              (isEvaluating && !showEvaluationConfirm) ? (
                <CircularProgress size={16} />
              ) : (
                <Assessment />
              )
            }
            sx={{
              borderRadius: '20px',
              px: 3,
              py: 1,
              borderColor: theme.palette.warning.main,
              color: theme.palette.warning.main,
              '&:hover': {
                borderColor: theme.palette.warning.dark,
                bgcolor: theme.palette.warning.light + '20',
              },
              '&:disabled': {
                opacity: 0.6,
              }
            }}
          >
            {(isEvaluating && !showEvaluationConfirm) ? 'Evaluating...' : 'Evaluate Goal'}
          </Button>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={isListening ? "Listening... speak now" : "Type your message or use voice input..."}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={onKeyPress}
          disabled={isTyping}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              ...(isListening && {
                borderColor: theme.palette.success.main,
                '& fieldset': {
                  borderColor: theme.palette.success.main,
                  borderWidth: '2px',
                }
              })
            }
          }}
        />
        
        {/* Voice Input Button */}
        {speechSupported && (
          <Button
            variant={isListening ? "contained" : "outlined"}
            onClick={isListening ? onStopListening : onStartListening}
            disabled={isTyping}
            sx={{
              minWidth: 'auto',
              p: 1.5,
              borderRadius: '50%',
              color: isListening ? 'white' : theme.palette.primary.main,
              bgcolor: isListening ? theme.palette.success.main : 'transparent',
              borderColor: isListening ? theme.palette.success.main : theme.palette.primary.main,
              '&:hover': {
                bgcolor: isListening ? theme.palette.success.dark : theme.palette.primary.light + '20',
                borderColor: isListening ? theme.palette.success.dark : theme.palette.primary.main,
              },
              ...(isListening && {
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                }
              })
            }}
          >
            {isListening ? <MicOff /> : <Mic />}
          </Button>
        )}
        
        <Button
          variant="contained"
          onClick={onSendMessage}
          disabled={isTyping || !userMessage.trim()}
          sx={{
            minWidth: 'auto',
            p: 1.5,
            borderRadius: '50%',
          }}
        >
          <Send />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInput; 