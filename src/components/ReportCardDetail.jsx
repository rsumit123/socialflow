import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  Button,
  Grid,
  Fade,
  Grow,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import {
  Radar,
  RadialBar,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadarChart,
} from 'recharts';
import CelebrationIcon from '@mui/icons-material/Celebration';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import ConfettiExplosion from 'react-confetti-explosion';
import { handleAuthErrors } from '../Api';

const ReportCardDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { session_id } = useParams();
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isExploding, setIsExploding] = useState(false);

  useEffect(() => {
    const fetchReportCard = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/report/report-cards/${session_id}/`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setReportCard(response.data);
        
        // Check if this is the first report
        if (response.data.first_report === true) {
          // Wait 5 seconds before showing the modal
          setTimeout(() => {
            setShowCongratulations(true);
            setIsExploding(true);
          }, 5000);
        }
      } catch (error) {
        console.error('Error fetching report card:', error);
        if (error.response && handleAuthErrors(error.response, navigate)) {
          // handleAuthErrors will handle the redirection
          setErrorMessage('Your session has expired. Please login again!');
          setOpenSnackbar(true);
        } else {
          setErrorMessage('Failed to load the report card.');
          setOpenSnackbar(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReportCard();
  }, [session_id, user.token]);

  const handleStartTraining = () => {
    setShowCongratulations(false);
    navigate('/training/1');
  };

  const handleCloseModal = () => {
    setShowCongratulations(false);
  };

  // Convert scores to radar data
  const radarData = reportCard ? [
    { category: 'Humor', score: reportCard.humor_score, fullMark: 100 },
    { category: 'Engagement', score: reportCard.engagement_score, fullMark: 100 },
    { category: 'Empathy', score: reportCard.empathy_score, fullMark: 100 },
  ] : [];

  // Function to determine score color
  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green for high scores
    if (score >= 60) return '#FFC107'; // Yellow for medium scores
    return '#F44336'; // Red for low scores
  };

  // Function to get score label
  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Loading your performance insights...
        </Typography>
      </Box>
    );
  }

  if (!reportCard) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Report card not found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We couldn't find the report for this session. Please try again or contact support.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'background.default',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Grow in={!loading} timeout={800}>
        <Box>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              textAlign: 'center', 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 4,
            }}
          >
            Your Communication Report
          </Typography>

          {/* Overall Score Card */}
          <Fade in={!loading} timeout={1000}>
            <Card 
              elevation={4}
              sx={{
                marginBottom: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.9) 100%)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
              }}
            >
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  background: `linear-gradient(90deg, ${getScoreColor(reportCard.total_score)} 0%, #2196F3 100%)`,
                }}
              />
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                      Overall Performance
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {new Date(reportCard.created_at).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 1 }}>
                      <StarIcon sx={{ color: getScoreColor(reportCard.total_score), mr: 1 }} />
                      <Typography variant="h3" fontWeight={700}>
                        {reportCard.total_score}
                        <Typography component="span" variant="h5" color="text.secondary">/100</Typography>
                      </Typography>
                    </Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: getScoreColor(reportCard.total_score),
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      {getScoreLabel(reportCard.total_score)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ height: { xs: 250, md: 300 } }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid gridType="polygon" />
                          <PolarAngleAxis dataKey="category" tick={{ fill: theme.palette.text.secondary, fontSize: 14 }} />
                          <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>

          <Grid container spacing={3}>
            {/* Detailed Scores */}
            <Grid item xs={12} md={7}>
              <Fade in={!loading} timeout={1200}>
                <Card 
                  elevation={3}
                  sx={{
                    borderRadius: 4,
                    background: '#fff',
                    height: '100%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Detailed Scores
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmojiEmotionsIcon sx={{ color: '#FF9800', mr: 2 }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Humor
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                          <Typography variant="h6" fontWeight={600}>
                            {reportCard.humor_score}/100
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={reportCard.humor_score} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          backgroundColor: 'rgba(255, 152, 0, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#FF9800',
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PsychologyIcon sx={{ color: '#2196F3', mr: 2 }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Engagement
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                          <Typography variant="h6" fontWeight={600}>
                            {reportCard.engagement_score}/100
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={reportCard.engagement_score} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          backgroundColor: 'rgba(33, 150, 243, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#2196F3',
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FavoriteIcon sx={{ color: '#E91E63', mr: 2 }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Empathy
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                          <Typography variant="h6" fontWeight={600}>
                            {reportCard.empathy_score}/100
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={reportCard.empathy_score} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          backgroundColor: 'rgba(233, 30, 99, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#E91E63',
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Feedback Card */}
            <Grid item xs={12} md={5}>
              <Fade in={!loading} timeout={1400}>
                <Card 
                  elevation={3}
                  sx={{
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #F5F7FA 0%, #E4EBF5 100%)',
                    height: '100%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '50%',
                      height: '5px',
                      background: 'linear-gradient(90deg, transparent 0%, #673AB7 100%)',
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Personalized Feedback
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    {reportCard.custom_scenario && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          SCENARIO
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(103, 58, 183, 0.08)',
                          borderRadius: 2,
                          fontStyle: 'italic'
                        }}>
                          {reportCard.custom_scenario}
                        </Typography>
                      </Box>
                    )}
                    
                    {reportCard.feedback && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          FEEDBACK & RECOMMENDATIONS
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(255, 255, 255, 0.6)',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}>
                          {reportCard.feedback}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>
        </Box>
      </Grow>

      {/* Congratulations Modal */}
      <Modal
        open={showCongratulations}
        onClose={handleCloseModal}
        aria-labelledby="congratulations-modal"
        aria-describedby="congratulations-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
        }}>
          {isExploding && (
            <Box sx={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)' }}>
              <ConfettiExplosion 
                force={0.8}
                duration={3000}
                particleCount={100}
                width={1600}
              />
            </Box>
          )}
          <CelebrationIcon sx={{ fontSize: 60, color: '#FFD700', mb: 2 }} />
          <Typography id="congratulations-modal-title" variant="h5" component="h2" fontWeight={700} gutterBottom>
            Congratulations!
          </Typography>
          <Typography id="congratulations-modal-description" sx={{ mt: 2, mb: 4 }}>
            Your customized training plan has been unlocked. Ready to enhance your skills?
          </Typography>
          
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="outlined" 
              onClick={handleCloseModal}
              sx={{
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 600,
                borderColor: '#9E9E9E',
                color: '#757575',
                '&:hover': {
                  borderColor: '#757575',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              Maybe Later
            </Button>
            
            <Button 
              variant="contained" 
              onClick={handleStartTraining}
              sx={{
                borderRadius: 8,
                padding: '10px 30px',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #21CBF3 90%)',
                  boxShadow: '0 6px 25px rgba(33, 150, 243, 0.5)',
                }
              }}
            >
              Start Training
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Snackbar for Error Messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportCardDetail;