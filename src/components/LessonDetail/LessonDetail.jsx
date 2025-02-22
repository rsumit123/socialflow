import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Modal,
  TextField,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  Timer,
  Send,
  CheckCircle,
  Warning,
  TrendingUp,
  History,
  Psychology,
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
      handleAuthErrors(response, navigate);
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
      // Refresh previous attempts (spinner shows inside the card)
      fetchPreviousAttempts();

      if (data.completed && data.next_lesson_url) {
        setTimeout(() => {
          window.location.href = data.next_lesson_url;
        }, 3000);
      }
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
    setShowResultModal(false);
    setUserResponse('');
    setTimeRemaining(lesson?.max_time);
    setChallengeActive(true);
    setStartTime(Date.now());
    startTimer();
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

      <Modal open={showResultModal} onClose={() => {}}>
        <ResultModal
          theme={theme}
          result={result}
          retryChallenge={retryChallenge}
          isSmallScreen={isSmallScreen}
        />
      </Modal>

      <Modal open={submitting} onClose={() => {}}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: '20px',
            p: 4,
          }}
        >
          <LoadingScreen message="The master is evaluating your response..." />
        </Box>
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
            <Paper sx={{ p: 3, mb: 4, borderRadius: '15px' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Context
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {lesson?.content.Context}
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Objective
              </Typography>
              <Typography variant="body1">
                {lesson?.content.Objective}
              </Typography>
            </Paper>

            <Box sx={{ position: 'relative', mb: 4 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Type your response here... Be creative and authentic!"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '15px',
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Timer color="primary" />
                <Typography variant="h6" color="primary">
                  {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={!userResponse.trim() || submitting}
              startIcon={<Send />}
              sx={{
                borderRadius: '30px',
                py: 1.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
