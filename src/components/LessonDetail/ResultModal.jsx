import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Fade, Chip, Collapse, Divider } from '@mui/material';
import { CheckCircle, Warning, RestartAlt, ArrowForward, GridView, ExpandMore, ExpandLess, Lightbulb } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ResultModal = React.forwardRef((props, ref) => {
  const { theme, result, retryChallenge, isSmallScreen, onClose } = props;
  const navigate = useNavigate();
  const [showExamples, setShowExamples] = useState(false);

  const handleNextLesson = () => {
    // Close the modal first, then navigate to the next lesson
    if (onClose) {
      onClose();
    }
    
    if (result?.next_lesson_url) {
      // Extract relative URL from the absolute URL provided by the backend
      const nextUrl = new URL(result.next_lesson_url).pathname;
      navigate(nextUrl);
    }
  };

  const handleRetry = () => {
    if (onClose) {
      onClose();
    }
    retryChallenge();
  };

  const handleAllScenarios = () => {
    if (onClose) {
      onClose();
    }
    navigate('/all-scenarios');
  };

  const toggleExamples = () => {
    setShowExamples(!showExamples);
  };

  if (!result) return null;

  const isSuccess = result?.completed;
  const score = result?.score || 0;
  const hasSampleResponses = result?.sample_responses && result.sample_responses.length > 0;
  
  let scoreColor = 'error.main';
  
  if (score >= 80) {
    scoreColor = 'success.main';
  } else if (score >= 60) {
    scoreColor = 'warning.main';
  }

  return (
    <Fade in>
      <Paper
        ref={ref}
        elevation={8}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isSmallScreen ? '90%' : 500,
          bgcolor: 'background.paper',
          borderRadius: '24px',
          boxShadow: 24,
          p: { xs: 3, sm: 4 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {isSuccess ? (
            <CheckCircle 
              sx={{ 
                fontSize: 70, 
                color: 'success.main',
                filter: 'drop-shadow(0px 4px 8px rgba(76, 175, 80, 0.3))'
              }} 
            />
          ) : (
            <Warning 
              sx={{ 
                fontSize: 70, 
                color: 'warning.main',
                filter: 'drop-shadow(0px 4px 8px rgba(255, 152, 0, 0.3))'
              }} 
            />
          )}
        </Box>
        
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center', 
            mb: 1,
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isSuccess ? 'Well Done!' : 'Almost There!'}
        </Typography>
        
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Chip
            label={`Score: ${score}`}
            sx={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'white',
              backgroundColor: scoreColor,
              padding: '18px 10px',
              height: 'auto',
              '& .MuiChip-label': {
                padding: '0 12px',
              }
            }}
          />
        </Box>
        
        <Paper 
          elevation={0}
          sx={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.04)', 
            p: { xs: 2, sm: 2.5 }, 
            borderRadius: '16px',
            mb: 4,
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.6,
              color: 'text.primary',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {result?.feedback}
          </Typography>
        </Paper>

        {/* Example Responses Section */}
        {hasSampleResponses && (
          <Box sx={{ mb: 4 }}>
            <Box
              onClick={toggleExamples}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${theme.palette.primary.main}22`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderColor: theme.palette.primary.main + '44',
                }
              }}
            >
              <Lightbulb 
                sx={{ 
                  fontSize: 20, 
                  color: theme.palette.primary.main 
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}
              >
                Feeling stuck? Check example responses...
              </Typography>
              {showExamples ? (
                <ExpandLess sx={{ fontSize: 20, color: theme.palette.primary.main }} />
              ) : (
                <ExpandMore sx={{ fontSize: 20, color: theme.palette.primary.main }} />
              )}
            </Box>
            
            <Collapse in={showExamples}>
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 2, 
                    color: 'text.secondary',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}
                >
                  Here are some example responses:
                </Typography>
                {result.sample_responses.map((response, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      p: 2,
                      borderRadius: '12px',
                      mb: index < result.sample_responses.length - 1 ? 2 : 0,
                      border: `1px solid ${theme.palette.secondary.main}22`,
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        lineHeight: 1.5,
                        color: 'text.primary',
                        fontStyle: 'italic'
                      }}
                    >
                      "{response}"
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            flexDirection: isSmallScreen ? 'column' : 'row',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outlined"
            onClick={handleRetry}
            startIcon={<RestartAlt />}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              borderWidth: '2px',
              borderColor: theme.palette.primary.main,
              '&:hover': {
                borderWidth: '2px',
                backgroundColor: 'rgba(63, 81, 181, 0.08)',
              }
            }}
          >
            Try Again
          </Button>

          <Button
            variant="outlined"
            onClick={handleAllScenarios}
            startIcon={<GridView />}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              borderWidth: '2px',
              borderColor: theme.palette.secondary.main,
              color: theme.palette.secondary.main,
              '&:hover': {
                borderWidth: '2px',
                backgroundColor: 'rgba(156, 39, 176, 0.08)',
                borderColor: theme.palette.secondary.main,
              }
            }}
          >
            All Scenarios
          </Button>
          
          {isSuccess && (
            <Button
              variant="contained"
              onClick={handleNextLesson}
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
                boxShadow: '0 4px 14px 0 rgba(63, 81, 181, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 20px 0 rgba(63, 81, 181, 0.6)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Go to Next Lesson
            </Button>
          )}
        </Box>
      </Paper>
    </Fade>
  );
});

export default ResultModal;