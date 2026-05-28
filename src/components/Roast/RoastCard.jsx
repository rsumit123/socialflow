import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, IconButton, CircularProgress } from '@mui/material';
import { Send, BookmarkBorder, Bookmark, IosShare, Refresh } from '@mui/icons-material';
import ScoreChips from './ScoreChips';
import ReactionLine from './ReactionLine';

const RoastCard = ({ scenario, onSubmit, onSave, onShare, onNext, onRetry }) => {
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    if (!reply.trim() || busy) return;
    setBusy(true);
    try {
      const r = await onSubmit(scenario.id, reply.trim());
      setResult(r);
      setSaved(r.wit >= 70);
    } finally { setBusy(false); }
  };

  const handleSave = async () => {
    if (!result) return;
    const r = await onSave(result.id);
    setSaved(r.saved);
  };

  const handleRetry = () => { setReply(''); setResult(null); setSaved(false); onRetry?.(); };
  const handleNext = () => { setReply(''); setResult(null); setSaved(false); onNext(); };

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: 4, maxWidth: 560, mx: 'auto', width: '100%' }}>
      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1.5 }}>
        {scenario.character.toUpperCase()}
      </Typography>
      <Typography variant="h6" sx={{ mt: 1, fontWeight: 600, lineHeight: 1.4 }}>
        {scenario.setup_line}
      </Typography>

      {!result ? (
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth multiline minRows={2} maxRows={4}
            placeholder="Your comeback…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={busy}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <Button
            fullWidth variant="contained" endIcon={busy ? <CircularProgress size={18} color="inherit" /> : <Send />}
            disabled={busy || !reply.trim()} onClick={handleSubmit} sx={{ mt: 2, borderRadius: 3, py: 1.2 }}
          >
            {busy ? 'Judging…' : 'Send'}
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>You said:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>"{reply}"</Typography>
          <ScoreChips wit={result.wit} savage={result.savage} cringe={result.cringe} />
          <ReactionLine text={result.reaction} character={scenario.character} />
          <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'space-between' }}>
            <IconButton onClick={handleSave} aria-label="save">
              {saved ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </IconButton>
            <IconButton onClick={() => onShare(result.id)} aria-label="share"><IosShare /></IconButton>
            <IconButton onClick={handleRetry} aria-label="retry"><Refresh /></IconButton>
            <Button variant="contained" onClick={handleNext} sx={{ borderRadius: 3 }}>Next ↑</Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RoastCard;
