import { Box, Typography, Avatar, Chip } from '@mui/material';

/**
 * ContextSetup — renders the scenario "setup_line" in a style that matches
 * the medium it came from (tweet, linkedin_post, slack_dm, bumble_bio, situation).
 *
 * Props:
 *   scenario.context_type   — one of the five variants (default: "situation")
 *   scenario.character      — speaker / character name
 *   scenario.author_handle  — optional extra descriptor / handle
 *   scenario.setup_line     — the actual text the user is responding to
 */

/* ---------- tiny helpers ---------- */

const HeaderChip = ({ label, emoji, bgColor, color }) => (
  <Chip
    label={`${emoji}  ${label}`}
    size="small"
    sx={{
      mb: 1.5,
      fontWeight: 800,
      fontSize: '0.65rem',
      letterSpacing: 1.2,
      bgcolor: bgColor ?? 'rgba(255,255,255,0.08)',
      color: color ?? 'text.secondary',
      borderRadius: 1,
      height: 22,
    }}
  />
);

const avatarLetter = (name) => (name ? name.trim()[0].toUpperCase() : '?');

/* ---------- Tweet ---------- */
const TweetSetup = ({ scenario }) => {
  const { character, author_handle, setup_line } = scenario;
  return (
    <Box>
      <HeaderChip emoji="𝕏" label="REPLYING TO TWEET" />
      <Box
        sx={{
          bgcolor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          p: 1.5,
        }}
      >
        {/* Byline row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ width: 36, height: 36, fontSize: 15, bgcolor: 'primary.dark' }}>
            {avatarLetter(character)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {character}
            </Typography>
            {author_handle ? (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                @{author_handle}
              </Typography>
            ) : null}
          </Box>
        </Box>
        {/* Tweet body */}
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          {setup_line}
        </Typography>
        {/* Flavour footer */}
        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'right', mt: 1, color: 'text.disabled', fontSize: '0.65rem' }}
        >
          𝕏 reply ↩
        </Typography>
      </Box>
    </Box>
  );
};

/* ---------- LinkedIn post ---------- */
const LinkedInSetup = ({ scenario }) => {
  const { character, author_handle, setup_line } = scenario;
  return (
    <Box>
      <HeaderChip emoji="💼" label="REPLYING TO LINKEDIN POST" bgColor="rgba(10,102,194,0.18)" color="#7eb3e8" />
      <Box
        sx={{
          bgcolor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(10,102,194,0.35)',
          borderRadius: 2,
          p: 1.5,
        }}
      >
        {/* Byline */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar
            variant="rounded"
            sx={{ width: 36, height: 36, fontSize: 15, bgcolor: '#0a66c2' }}
          >
            {avatarLetter(character)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {character}
            </Typography>
            {author_handle ? (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {author_handle}
              </Typography>
            ) : null}
          </Box>
        </Box>
        {/* Post body */}
        <Typography variant="body2" sx={{ lineHeight: 1.7, fontSize: '0.92rem' }}>
          {setup_line}
        </Typography>
        {/* Flavour footer */}
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 1.5, color: 'text.disabled', fontSize: '0.68rem' }}
        >
          👍 Like · 💬 Comment · 🔁 Repost
        </Typography>
      </Box>
    </Box>
  );
};

/* ---------- Slack / WhatsApp DM ---------- */

/** Stable-ish fake timestamp derived from character name length so it doesn't change on re-render */
const fakeTimestamp = (character) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = days[(character?.length ?? 0) % 7];
  const hour = (((character?.charCodeAt(0) ?? 65) % 12) || 12);
  const min = String(((character?.charCodeAt(1) ?? 0) % 60)).padStart(2, '0');
  const ampm = (character?.length ?? 0) % 2 === 0 ? 'PM' : 'AM';
  return `${day} ${hour}:${min} ${ampm}`;
};

const SlackDMSetup = ({ scenario }) => {
  const { character, setup_line } = scenario;
  return (
    <Box>
      <HeaderChip emoji="💬" label="DM FROM" bgColor="rgba(74,144,226,0.15)" color="#82b4ea" />
      {/* Chat bubble */}
      <Box
        sx={{
          bgcolor: '#1a4a3a',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '4px 16px 16px 16px',
          p: 1.5,
          maxWidth: '90%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#7ec8a4' }}>
            {character}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.62rem' }}>
            {fakeTimestamp(character)}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          {setup_line}
        </Typography>
      </Box>
    </Box>
  );
};

/* ---------- Bumble bio ---------- */
const BumbleBioSetup = ({ scenario }) => {
  const { character, author_handle, setup_line } = scenario;
  return (
    <Box>
      <HeaderChip emoji="💛" label="BUMBLE BIO" bgColor="rgba(255,212,0,0.15)" color="#e6c200" />
      <Box
        sx={{
          bgcolor: 'rgba(255,212,0,0.05)',
          border: '2px solid #FFD400',
          borderRadius: 3,
          p: 1.5,
        }}
      >
        {/* Name header */}
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.25 }}>
          {character}
        </Typography>
        {author_handle ? (
          <Typography variant="caption" sx={{ color: '#e6c200', display: 'block', mb: 1 }}>
            {author_handle}
          </Typography>
        ) : null}
        <Box sx={{ borderTop: '1px solid rgba(255,212,0,0.2)', pt: 1 }}>
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            {setup_line}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

/* ---------- Situation (default) ---------- */
const SituationSetup = ({ scenario }) => {
  const { character, setup_line } = scenario;
  return (
    <Box>
      <HeaderChip emoji="🎬" label="SITUATION" />
      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1.5, display: 'block' }}>
        {character.toUpperCase()}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 600, lineHeight: 1.4 }}>
        {setup_line}
      </Typography>
    </Box>
  );
};

/* ---------- Main export ---------- */
const ContextSetup = ({ scenario }) => {
  const type = scenario?.context_type ?? 'situation';

  switch (type) {
    case 'tweet':
      return <TweetSetup scenario={scenario} />;
    case 'linkedin_post':
      return <LinkedInSetup scenario={scenario} />;
    case 'slack_dm':
      return <SlackDMSetup scenario={scenario} />;
    case 'bumble_bio':
      return <BumbleBioSetup scenario={scenario} />;
    case 'situation':
    default:
      return <SituationSetup scenario={scenario} />;
  }
};

export default ContextSetup;
