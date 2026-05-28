import React, { useState, useEffect } from 'react';
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
  Popper,
  ClickAwayListener,
} from '@mui/material';
import {
  Psychology,
  SentimentSatisfied,
  Info,
  Lightbulb,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Split a message into normal text + *stage directions*. Stage directions are
// rendered as muted italic action lines (e.g. *sips chai* → "sips chai" italic).
const STAGE_RE = /\*([^*\n]+?)\*/g;
const renderMessageBody = (raw, theme, sender) => {
  if (!raw) return null;
  const lines = String(raw).split(/\n+/).filter(l => l.length > 0);
  const actionColor = sender === 'user' ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary;
  return (
    <Box>
      {lines.map((line, li) => {
        const parts = [];
        let lastIdx = 0;
        let match;
        STAGE_RE.lastIndex = 0;
        while ((match = STAGE_RE.exec(line)) !== null) {
          if (match.index > lastIdx) parts.push({ kind: 'text', text: line.slice(lastIdx, match.index) });
          parts.push({ kind: 'action', text: match[1].trim() });
          lastIdx = match.index + match[0].length;
        }
        if (lastIdx < line.length) parts.push({ kind: 'text', text: line.slice(lastIdx) });
        if (parts.length === 0) parts.push({ kind: 'text', text: line });

        // If the whole line is one action, render as a standalone muted line
        if (parts.length === 1 && parts[0].kind === 'action') {
          return (
            <Typography
              key={li}
              variant="body2"
              sx={{ fontStyle: 'italic', color: actionColor, opacity: 0.85, mb: 0.5 }}
            >
              {parts[0].text}
            </Typography>
          );
        }
        return (
          <Typography key={li} variant="body1" sx={{ mb: li < lines.length - 1 ? 0.5 : 0 }}>
            {parts.map((p, pi) => p.kind === 'action' ? (
              <Box key={pi} component="span" sx={{ fontStyle: 'italic', color: actionColor, opacity: 0.85 }}>
                {p.text}
              </Box>
            ) : (
              <span key={pi}>{p.text}</span>
            ))}
          </Typography>
        );
      })}
    </Box>
  );
};

const ChatMessages = ({
  messages,
  isTyping,
  messagesEndRef,
  onShowMessageFeedback,
}) => {
  const theme = useTheme();
  const [hasClickedInfoIcon, setHasClickedInfoIcon] = useState(false);

  // Check if we should show the highlight (user hasn't clicked any info icon yet)
  const shouldShowHighlight = !hasClickedInfoIcon;

  // Find the last user message with feedback for highlighting
  const lastUserMessageIndex = messages.reduce((lastIndex, msg, index) => {
    return (msg.sender === 'user' && msg.feedback) ? index : lastIndex;
  }, -1);

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
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <Psychology sx={{ fontSize: 20 }} />
          </Avatar>
          <Paper
            elevation={2}
            sx={{
              p: 1.5,
              borderRadius: '20px 20px 20px 4px',
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              minWidth: '60px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: theme.palette.secondary.main,
                    borderRadius: '50%',
                    animation: 'typing 1.4s infinite ease-in-out both',
                    animationDelay: `${i * 0.16}s`,
                    '@keyframes typing': {
                      '0%, 80%, 100%': { 
                        transform: 'scale(0)',
                        opacity: 0.5,
                      },
                      '40%': { 
                        transform: 'scale(1)',
                        opacity: 1,
                      },
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
        {messages.map((msg, index) => {
          const isLastUserMessage = index === lastUserMessageIndex;
          const shouldHighlightThisIcon = isLastUserMessage && shouldShowHighlight;
          
          return (
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
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main, display: { xs: 'none', md: 'flex' } }}>
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
                      {renderMessageBody(msg.message, theme, msg.sender)}
                    </Paper>
                    {/* Inline coach tip below AI bubble */}
                    {msg.sender === 'ai' && msg.tip && (
                      <Box
                        sx={{
                          mt: 1,
                          ml: 0.5,
                          px: 1.5,
                          py: 1,
                          borderRadius: '12px',
                          bgcolor: 'rgba(33, 150, 243, 0.08)',
                          border: `1px solid ${theme.palette.info.main}33`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          maxWidth: '100%',
                        }}
                      >
                        <Lightbulb sx={{ fontSize: 16, color: theme.palette.info.main, mt: '2px', flexShrink: 0 }} />
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', lineHeight: 1.4, fontSize: '0.78rem' }}
                        >
                          {msg.tip}
                        </Typography>
                      </Box>
                    )}
                    {/* Info icon for user messages with feedback */}
                    {msg.sender === 'user' && msg.feedback && (
                      <Tooltip 
                        title={shouldHighlightThisIcon ? "💡 Click for detailed AI feedback!" : "View detailed feedback"}
                        placement="left"
                        arrow
                      >
                        <IconButton
                          size="small"
                          onClick={() => {
                            onShowMessageFeedback(msg.feedback);
                            setHasClickedInfoIcon(true);
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: shouldHighlightThisIcon ? '#fff' : 'rgba(255,255,255,0.8)',
                            bgcolor: shouldHighlightThisIcon ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                            width: 24,
                            height: 24,
                            boxShadow: shouldHighlightThisIcon ? '0 0 15px rgba(255,255,255,0.4)' : 'none',
                            animation: shouldHighlightThisIcon ? 'gentlePulse 3s infinite' : 'none',
                            '@keyframes gentlePulse': {
                              '0%': {
                                transform: 'scale(1)',
                                boxShadow: '0 0 15px rgba(255,255,255,0.4)',
                              },
                              '50%': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 0 20px rgba(255,255,255,0.6)',
                              },
                              '100%': {
                                transform: 'scale(1)',
                                boxShadow: '0 0 15px rgba(255,255,255,0.4)',
                              },
                            },
                            '&:hover': {
                              color: 'white',
                              bgcolor: 'rgba(255,255,255,0.2)',
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          <Info sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  {msg.sender === 'user' && (
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, display: { xs: 'none', md: 'flex' } }}>
                      <SentimentSatisfied />
                    </Avatar>
                  )}
                </Box>
              </Fade>
            </ListItem>
          );
        })}
        
        {isTyping && renderTypingIndicator()}
      </List>
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatMessages; 