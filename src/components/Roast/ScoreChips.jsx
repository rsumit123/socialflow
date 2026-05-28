import { Box, Chip } from '@mui/material';

const ScoreChips = ({ wit, savage, cringe }) => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    <Chip label={`🔥 Wit ${wit}`} sx={{ bgcolor: 'rgba(255,90,110,0.15)', color: '#ff5a6e', fontWeight: 700 }} />
    <Chip label={`💥 Savage ${savage}`} sx={{ bgcolor: 'rgba(255,170,40,0.15)', color: '#ffaa28', fontWeight: 700 }} />
    <Chip label={`💩 Cringe ${cringe}`} sx={{ bgcolor: 'rgba(120,120,120,0.15)', color: '#a0a0a0', fontWeight: 700 }} />
  </Box>
);

export default ScoreChips;
