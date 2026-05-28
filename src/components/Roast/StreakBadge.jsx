import { useEffect, useState } from 'react';
import { Chip, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchMe } from '../../Api/roast';

// Self-fetches; re-fetches when window regains focus so streak feels live after a roast.
const StreakBadge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  const load = () => fetchMe(user.token, navigate).then(setMe).catch(() => {});

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  if (!me) return <CircularProgress size={18} />;
  return (
    <Chip
      label={`🔥 ${me.current_streak} · ${me.today_count}/${me.today_floor}`}
      sx={{ fontWeight: 700, bgcolor: 'rgba(255,90,110,0.12)', color: '#ff5a6e' }}
    />
  );
};

export default StreakBadge;
