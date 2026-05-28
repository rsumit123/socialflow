import { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, CircularProgress, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { handleAuthErrors } from '../../Api';
import ScoreChips from './ScoreChips';

const HallOfFame = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/roast/hall-of-fame/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (handleAuthErrors(r, navigate)) return;
      setItems(await r.json());
    })();
  }, []);

  if (!items) return <Box sx={{ p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
        <IconButton onClick={() => navigate('/roast')}><ArrowBack /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 800, ml: 1 }}>Hall of Fame 🏆</Typography>
      </Box>
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {items.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 8 }}>
            No saved roasts yet. Wit &gt; 70 auto-saves.
          </Typography>
        )}
        {items.map(it => (
          <Paper key={it.id} sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>
              {it.character.toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              "{it.setup_line}"
            </Typography>
            <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 700 }}>
              {it.user_reply}
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              <ScoreChips wit={it.wit} savage={it.savage} cringe={it.cringe} />
            </Box>
          </Paper>
        ))}
      </Container>
    </Box>
  );
};

export default HallOfFame;
