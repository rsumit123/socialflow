import { Box, Typography } from '@mui/material';

// Renders text with *...* segments as italic muted action descriptions.
const ReactionLine = ({ text, character }) => {
  if (!text) return null;
  const STAGE = /\*([^*\n]+?)\*/g;
  const parts = [];
  let lastIdx = 0, m;
  while ((m = STAGE.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push({ kind: 'text', text: text.slice(lastIdx, m.index) });
    parts.push({ kind: 'action', text: m[1].trim() });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push({ kind: 'text', text: text.slice(lastIdx) });

  return (
    <Box sx={{ mt: 2, pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
      {character && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
          {character.toUpperCase()}
        </Typography>
      )}
      <Typography variant="body1" sx={{ mt: 0.5 }}>
        {parts.map((p, i) => p.kind === 'action' ? (
          <Box key={i} component="span" sx={{ fontStyle: 'italic', color: 'text.secondary', opacity: 0.85 }}>
            {p.text + ' '}
          </Box>
        ) : (
          <span key={i}>{p.text}</span>
        ))}
      </Typography>
    </Box>
  );
};

export default ReactionLine;
