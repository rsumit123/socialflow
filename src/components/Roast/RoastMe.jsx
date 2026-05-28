import { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, CircularProgress, Button, IconButton, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchMe } from '../../Api/roast';

const Stat = ({ label, value }) => (
  <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', flexGrow: 1 }}>
    <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
  </Paper>
);

const RoastMe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => { fetchMe(user.token, navigate).then(setMe); }, []);

  if (!me) return <Box sx={{ p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
        <IconButton onClick={() => navigate('/roast')}><ArrowBack /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 800, ml: 1 }}>You</Typography>
      </Box>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Stack direction="row" spacing={2}>
          <Stat label="Current streak 🔥" value={me.current_streak} />
          <Stat label="Longest streak" value={me.longest_streak} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Stat label={`Today (floor ${me.today_floor})`} value={`${me.today_count}/${me.today_floor}`} />
          <Stat label="Hall of Fame" value={me.hall_of_fame_count} />
        </Stack>
        <Button fullWidth variant="outlined" sx={{ mt: 3, borderRadius: 3 }} onClick={() => navigate('/roast/hall-of-fame')}>
          View Hall of Fame
        </Button>
      </Container>
    </Box>
  );
};

export default RoastMe;
