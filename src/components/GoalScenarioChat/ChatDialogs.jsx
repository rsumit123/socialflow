import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Avatar,
  Box,
  Chip,
  Card,
  CardContent,
  Paper,
  Fade,
  LinearProgress,
  IconButton,
  Zoom,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  EmojiEvents,
  Psychology,
  Lightbulb,
  Assessment,
  Close,
  Info,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ChatDialogs = ({
  // Success Modal
  showSuccessModal,
  setShowSuccessModal,
  messageCount,
  feedbackScore,
  scenario,
  onNavigateBack,
  onRestart,
  
  // Feedback Toast
  showFeedback,
  setShowFeedback,
  realtimeTip,
  
  // Feedback Dialog
  showFeedbackDialog,
  setShowFeedbackDialog,
  selectedMessageFeedback,
  
  // Evaluation Confirm Dialog
  showEvaluationConfirm,
  onPerformForceEvaluation,
  onCancelForceEvaluation,
  isMobile,
  
  // Coaching Intro Dialog
  showCoachingIntro,
  setShowCoachingIntro,
  
  // Error Snackbar
  openSnackbar,
  setOpenSnackbar,
  errorMessage,
}) => {
  const theme = useTheme();

  // Success Modal
  const renderSuccessModal = () => (
    <Dialog
      open={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
          color: 'white',
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 6 }}>
        <Zoom in timeout={500}>
          <EmojiEvents sx={{ fontSize: 80, mb: 2, color: '#FFD700' }} />
        </Zoom>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
          🎉 Goal Achieved!
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Congratulations! You completed this scenario in {messageCount} messages.
        </Typography>
        
        {feedbackScore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Chip
              label={`Final Score: ${feedbackScore}/100`}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                px: 2,
                py: 1,
              }}
            />
          </Box>
        )}
        
        <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', mb: 3 }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              "{scenario?.user_goal}"
            </Typography>
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          onClick={onNavigateBack}
          variant="contained"
          sx={{
            bgcolor: 'white',
            color: theme.palette.success.main,
            mr: 2,
          }}
        >
          Explore More
        </Button>
        <Button
          onClick={onRestart}
          variant="outlined"
          sx={{
            borderColor: 'white',
            color: 'white',
          }}
        >
          Try Again
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Feedback Toast
  const renderFeedbackToast = () => (
    <Fade in={showFeedback} timeout={400}>
      <Paper
        elevation={12}
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 20 },
          left: '50%',
          transform: showFeedback ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-100%)',
          width: { xs: 'calc(100vw - 32px)', sm: '400px', md: '450px' },
          maxWidth: '90vw',
          zIndex: 1400,
          borderRadius: '20px',
          overflow: 'hidden',
          background: feedbackScore 
            ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
            : `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
          color: 'white',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.25)', 
                width: { xs: 36, sm: 40 }, 
                height: { xs: 36, sm: 40 },
                flexShrink: 0
              }}
            >
              {feedbackScore ? <EmojiEvents sx={{ fontSize: { xs: 18, sm: 20 } }} /> : <Lightbulb sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  {feedbackScore ? '🎉 Final Score' : '💡 Coach Tip'}
                </Typography>
                {feedbackScore && (
                  <Chip
                    label={`${feedbackScore}/100`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  />
                )}
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  lineHeight: 1.5,
                  fontSize: { xs: '0.9rem', sm: '0.95rem' }
                }}
              >
                {realtimeTip}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setShowFeedback(false)}
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                mt: -0.5,
                mr: -0.5
              }}
            >
              <Box sx={{ fontSize: 20 }}>×</Box>
            </IconButton>
          </Box>
        </Box>
        
        {/* Progress bar for auto-hide */}
        <LinearProgress
          variant="determinate"
          value={100}
          sx={{
            height: 3,
            bgcolor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'rgba(255,255,255,0.7)',
              animation: showFeedback ? 'shrink 6s linear' : 'none',
              '@keyframes shrink': {
                from: { transform: 'translateX(0%)' },
                to: { transform: 'translateX(100%)' },
              },
            }
          }}
        />
      </Paper>
    </Fade>
  );

  // Detailed Feedback Dialog
  const renderFeedbackDialog = () => (
    <Dialog
      open={showFeedbackDialog}
      onClose={() => setShowFeedbackDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        pb: 1,
        background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
        color: 'white'
      }}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
          <Psychology />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            💡 Detailed Coach Feedback
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Insights on your message
          </Typography>
        </Box>
        <IconButton
          onClick={() => setShowFeedbackDialog(false)}
          sx={{ 
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.6,
            fontSize: { xs: '0.95rem', sm: '1rem' }
          }}
        >
          {selectedMessageFeedback}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={() => setShowFeedbackDialog(false)}
          variant="contained"
          sx={{
            borderRadius: '12px',
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Force Evaluation Confirmation Dialog
  const renderEvaluationConfirmDialog = () => (
    <Dialog
      open={showEvaluationConfirm}
      onClose={onCancelForceEvaluation}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          m: 2,
          maxHeight: '85vh',
          maxWidth: '400px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        p: 2.5,
        background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
        color: 'white',
      }}>
        <Avatar sx={{ 
          bgcolor: 'rgba(255,255,255,0.2)', 
          width: 40, 
          height: 40,
        }}>
          <Assessment />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            fontSize: '1.1rem',
          }}>
            ⚠️ Force Goal Evaluation
          </Typography>
          <Typography variant="body2" sx={{ 
            opacity: 0.9, 
            fontSize: '0.85rem',
          }}>
            Manual goal assessment
          </Typography>
        </Box>
        <IconButton
          onClick={onCancelForceEvaluation}
          size="small"
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { 
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 3, 
        pb: 2,
        px: 3,
        textAlign: 'center'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            mb: 2,
            fontSize: '1.1rem',
            color: theme.palette.text.primary
          }}
        >
          Goal Not Yet Detected
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            lineHeight: 1.5,
            mb: 3,
            color: theme.palette.text.secondary
          }}
        >
          Our system has not yet detected that your goal has been achieved.
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.warning.main,
            mb: 1
          }}
        >
          Do you want to force goal evaluation?
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.85rem',
            color: theme.palette.text.secondary,
            fontStyle: 'italic'
          }}
        >
          This might impact your final score.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2.5, 
        pt: 1, 
        gap: 1.5,
        flexDirection: { xs: 'column', sm: 'row' },
      }}>
        <Button
          onClick={onPerformForceEvaluation}
          variant="contained"
          fullWidth={isMobile}
          sx={{
            borderRadius: '12px',
            py: 1.2,
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
            fontWeight: 600,
            order: { xs: 1, sm: 2 }
          }}
        >
          Yes, Evaluate Now
        </Button>
        <Button
          onClick={onCancelForceEvaluation}
          variant="outlined"
          fullWidth={isMobile}
          sx={{
            borderRadius: '12px',
            py: 1.2,
            px: 3,
            borderColor: theme.palette.grey[300],
            color: theme.palette.text.secondary,
            order: { xs: 2, sm: 1 }
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Coaching Introduction Dialog
  const renderCoachingIntroDialog = () => (
    <Dialog
      open={showCoachingIntro}
      onClose={() => setShowCoachingIntro(false)}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          m: 2,
          maxHeight: '90vh',
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        p: 3,
        background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
        color: 'white',
      }}>
        <Avatar sx={{ 
          bgcolor: 'rgba(255,255,255,0.2)', 
          width: 48, 
          height: 48,
        }}>
          <Lightbulb />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            fontSize: '1.2rem',
          }}>
            💡 AI Coach Features
          </Typography>
          <Typography variant="body2" sx={{ 
            opacity: 0.9, 
            fontSize: '0.9rem',
          }}>
            Learn how to get the most out of your practice
          </Typography>
        </Box>
        <IconButton
          onClick={() => setShowCoachingIntro(false)}
          size="small"
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { 
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 3, 
        pb: 2,
        px: 3,
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            mb: 3,
            textAlign: 'center',
            color: theme.palette.text.primary
          }}
        >
          🎯 AI Coach is Here to Help!
        </Typography>
        
        {/* Real-time Tips Section */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 2,
          p: 2.5,
          borderRadius: '12px',
          bgcolor: theme.palette.success.light + '15',
          border: `1px solid ${theme.palette.success.light}`,
        }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.success.main, 
            width: 48, 
            height: 48,
            flexShrink: 0
          }}>
            <Lightbulb sx={{ color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ 
              color: theme.palette.text.primary,
              lineHeight: 1.5,
              mb: 1.5,
              fontWeight: 600
            }}>
              💡 Instant Coaching Tips
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              lineHeight: 1.5,
            }}>
              Get real-time feedback after each message to improve your conversation skills.
            </Typography>
          </Box>
        </Box>

        {/* Info Icon Feature Section */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 2,
          p: 2.5,
          borderRadius: '12px',
          bgcolor: theme.palette.primary.light + '15',
          border: `2px solid ${theme.palette.primary.light}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }
        }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.primary.main, 
            width: 48, 
            height: 48,
            flexShrink: 0,
            animation: 'gentleGlow 2s infinite alternate',
            '@keyframes gentleGlow': {
              '0%': { boxShadow: `0 0 10px ${theme.palette.primary.main}30` },
              '100%': { boxShadow: `0 0 20px ${theme.palette.primary.main}60` },
            }
          }}>
            <Info sx={{ color: 'white' }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body1" sx={{ 
              color: theme.palette.text.primary,
              lineHeight: 1.5,
              mb: 1.5,
              fontWeight: 600
            }}>
              🔍 Detailed Message Feedback
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              lineHeight: 1.5,
              mb: 2
            }}>
              Look for the glowing <Box component="span" sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 0.5,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                boxShadow: `0 2px 8px ${theme.palette.primary.main}40`,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                }
              }}>
                <Info sx={{ fontSize: 14 }} /> info icon
              </Box> on your messages for personalized coaching insights!
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              lineHeight: 1.5,
              fontStyle: 'italic'
            }}>
              💫 Pro tip: The icon will pulse on your latest message until you try it!
            </Typography>
          </Box>
        </Box>

        {/* Goal Evaluation Section */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 0,
          p: 2.5,
          borderRadius: '12px',
          bgcolor: theme.palette.warning.light + '15',
          border: `1px solid ${theme.palette.warning.light}`,
        }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.warning.main, 
            width: 48, 
            height: 48,
            flexShrink: 0
          }}>
            <Assessment sx={{ color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ 
              color: theme.palette.text.primary,
              lineHeight: 1.5,
              mb: 1.5,
              fontWeight: 600
            }}>
              🎯 Goal Evaluation
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              lineHeight: 1.5
            }}>
              Use <strong>"Evaluate Goal"</strong> when you think you've achieved your conversation objective.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        justifyContent: 'center'
      }}>
        <Button
          onClick={() => setShowCoachingIntro(false)}
          variant="contained"
          size="large"
          sx={{
            borderRadius: '12px',
            py: 1.5,
            px: 4,
            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          Got it! Let's Start Chatting 🚀
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      {/* Success Modal */}
      {renderSuccessModal()}

      {/* Feedback Toast */}
      {renderFeedbackToast()}

      {/* Detailed Feedback Dialog */}
      {renderFeedbackDialog()}

      {/* Force Evaluation Confirmation Dialog */}
      {renderEvaluationConfirmDialog()}

      {/* Coaching Introduction Dialog */}
      {renderCoachingIntroDialog()}

      {/* Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChatDialogs; 