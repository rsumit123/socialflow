import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRoast = () => {
    if (user) {
      navigate('/roast');
    } else {
      navigate('/login');
    }
  };

  const handleTraining = () => {
    if (user) {
      navigate('/goal-objectives');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>
          roast 🔥
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
          The daily Indian comeback game.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          3 roasts a day keeps your streak alive.
        </Typography>
        <Stack spacing={1} alignItems="center">
          <Button
            size="large"
            variant="contained"
            onClick={handleRoast}
            sx={{ px: 6, py: 1.5, borderRadius: 3 }}
          >
            Start roasting →
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={handleTraining}
            sx={{ color: 'text.secondary', mt: 2 }}
          >
            Looking for the training mode?
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default LandingPage;
