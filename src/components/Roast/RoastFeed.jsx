import { useEffect, useState } from 'react';
import { Box, Container, CircularProgress, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchFeed, submitRoast, toggleSave, shareCardUrl } from '../../Api/roast';
import RoastCard from './RoastCard';
import StreakBadge from './StreakBadge';

const RoastFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  const loadNext = async () => {
    setLoading(true); setEmpty(false);
    try {
      const data = await fetchFeed(user.token, navigate);
      if (data.empty) setEmpty(true);
      else setScenario(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadNext(); }, []);

  const handleSubmit = (scenarioId, reply) => submitRoast(user.token, navigate, scenarioId, reply);
  const handleSave = (attemptId) => toggleSave(user.token, navigate, attemptId);

  const handleShare = async (attemptId) => {
    const url = shareCardUrl(attemptId);
    if (navigator.share) {
      try {
        // Fetch the PNG, then share as a file so WhatsApp/IG accept it as an image
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], 'roast.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: 'My roast', text: 'Check out my roast comeback' });
        return;
      } catch (_) { /* fall through to copy */ }
    }
    await navigator.clipboard.writeText(url);
    alert('Card link copied!');
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>roast</Typography>
        <StreakBadge />
      </Box>
      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 3 }}>
        {loading && <CircularProgress sx={{ mx: 'auto' }} />}
        {empty && (
          <Box sx={{ textAlign: 'center', mx: 'auto' }}>
            <Typography variant="h6">No more scenarios right now.</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Fresh ones drop in soon. Check back later.
            </Typography>
          </Box>
        )}
        {scenario && !loading && (
          <RoastCard
            scenario={scenario}
            onSubmit={handleSubmit}
            onSave={handleSave}
            onShare={handleShare}
            onNext={loadNext}
          />
        )}
      </Container>
    </Box>
  );
};

export default RoastFeed;
