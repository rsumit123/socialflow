import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Modal,
  TextField,
  useTheme,
  useMediaQuery,
  Paper,
  Fade,
  LinearProgress,
} from '@mui/material';
import {
  Timer,
  Send,
  TrendingUp,
  History,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import LoadingScreen from '../../components/LessonDetail/LoadingScreen';
import ModalContent from '../../components/LessonDetail/ModalContent';
import ResultModal from '../../components/LessonDetail/ResultModal';
import PreviousAttempts from '../../components/LessonDetail/PreviousAttempts';
import { handleAuthErrors } from '../../Api/index';

/* LessonDetail Component */
const LessonDetail = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { lessonId } = useParams();

  // Component state
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [modalStep, setModalStep] = useState(1);
  const [showModal, setShowModal] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [userResponse, setUserResponse] = useState('');
  const [challengeActive, setChallengeActive] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [result, setResult] = useState(null);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchLessonDetails();
    fetchPreviousAttempts();
    return () => clearInterval(timerRef.current);
  }, [lessonId]);

  const fetchLessonDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/course_content/lessons/${lessonId}/`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (handleAuthErrors(response, navigate)) return;
      const data = await response.json();
      setLesson(data);
      setTimeRemaining(data.max_time);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousAttempts = async () => {
    setAttemptsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/course_content/lesson-progress/?lesson_id=${lessonId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const data = await response.json();
      setPreviousAttempts(
        (data[0]?.lesson.previous_progress.slice(-3) || []).reverse()
      );
    } catch (error) {
      console.error('Error fetching previous attempts:', error);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const startChallenge = () => {
    setChallengeActive(true);
    setShowModal(false);
    setStartTime(Date.now());
    startTimer();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = async () => {
    clearInterval(timerRef.current);
    await submitResponse(userResponse, true);
  };

  const submitResponse = async (response, timerEnded = false) => {
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const requestBody = {
        lesson_id: parseInt(lessonId),
        user_response: response,
        time_taken: timeTaken,
      };

      const submitResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/course_content/evaluate-lesson/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await submitResponse.json();
      setResult(data);
      setShowResultModal(true);
      // Refresh previous attempts
      fetchPreviousAttempts();
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    await submitResponse(userResponse);
  };

  const retryChallenge = () => {
    setUserResponse('');
    setTimeRemaining(lesson?.max_time);
    setChallengeActive(true);
    setStartTime(Date.now());
    startTimer();
  };

  // Handle closing the result modal
  const handleCloseResultModal = () => {
    setShowResultModal(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoadingScreen message="Preparing your lesson..." />
      </Box>
    );
  }

  // Calculate progress percentage for timer
  const timePercentage = lesson?.max_time ? (timeRemaining / lesson.max_time) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Modal open={showModal} onClose={() => {}}>
        <ModalContent
          theme={theme}
          lesson={lesson}
          modalStep={modalStep}
          setModalStep={setModalStep}
          startChallenge={startChallenge}
          isSmallScreen={isSmallScreen}
        />
      </Modal>

      <Modal 
        open={showResultModal} 
        onClose={handleCloseResultModal}
      >
        <ResultModal
          theme={theme}
          result={result}
          retryChallenge={retryChallenge}
          isSmallScreen={isSmallScreen}
          onClose={handleCloseResultModal}
        />
      </Modal>

      <Modal open={submitting} onClose={() => {}}>
        <Fade in={submitting}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              borderRadius: '20px',
              p: 4,
              boxShadow: 24,
            }}
          >
            <LoadingScreen message="The master is evaluating your response..." />
          </Box>
        </Fade>
      </Modal>

      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}
        >
          {lesson?.title}
        </Typography>

        {challengeActive && (
          <>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {timeRemaining !== null && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={timePercentage} 
                    sx={{
                      height: 4,
                      background: 'rgba(0,0,0,0.05)',
                      '& .MuiLinearProgress-bar': {
                        background: timePercentage < 30 
                          ? theme.palette.error.main 
                          : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      }
                    }}
                  />
                </Box>
              )}
              
              <Box sx={{ mt: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    color: theme.palette.primary.main
                  }}
                >
                  Context
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {lesson?.content.Context}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    color: theme.palette.primary.main
                  }}
                >
                  Objective
                </Typography>
                <Typography variant="body1">
                  {lesson?.content.Objective}
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ position: 'relative', mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 1,
                  mb: 1,
                }}
              >
                <Timer 
                  color={timeRemaining < 30 ? "error" : "primary"} 
                  sx={{ animation: timeRemaining < 30 ? 'pulse 1s infinite' : 'none' }}
                />
                <Typography 
                  variant="h6" 
                  color={timeRemaining < 30 ? "error.main" : "primary.main"}
                  sx={{ 
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}
                >
                  {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Type your response here... Be creative and authentic!"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '&:hover, &.Mui-focused': {
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                    },
                  },
                }}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={!userResponse.trim() || submitting}
              startIcon={<Send />}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: '0 4px 14px 0 rgba(63, 81, 181, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 20px 0 rgba(63, 81, 181, 0.6)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </Button>
          </>
        )}

        <PreviousAttempts attemptsLoading={attemptsLoading} previousAttempts={previousAttempts} />
      </Box>
    </Container>
  );
};

export default LessonDetail;