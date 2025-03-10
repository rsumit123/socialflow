import React from 'react';
import { Box, Typography, Link, IconButton, Container, Grid, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Link as RouterLink } from 'react-router-dom';

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const legalLinks = [
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
  ];

  const socialLinks = [
    { icon: <LinkedInIcon />, name: 'LinkedIn', url: 'https://linkedin.com/in/rsumit123' },
    { icon: <GitHubIcon />, name: 'GitHub', url: 'https://github.com/rsumit123' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.03) 0%, transparent 20%)',
        color: 'white',
        mt: 'auto',
        pt: 6,
        pb: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '5px',
          background: 'linear-gradient(90deg, #64ffda, #1976d2, #64ffda)',
          backgroundSize: '200% 100%',
          animation: `${gradientMove} 4s ease infinite`,
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Brand Section */}
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                mb: 1,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Social<span style={{ color: '#64ffda' }}>Flow</span>
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: '500px', fontWeight: 300, lineHeight: 1.6 }}>
                Elevate your social presence with AI-powered insights and creative tips & strategies for a better social experience.
            </Typography>
          </Grid>

          {/* Social & Legal Section */}
          <Grid item xs={12} md={6}>
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', md: 'row' }} 
              justifyContent="flex-end" 
              alignItems="center" 
              gap={2}
            >
              {/* Social Links */}
              <Box>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                      },
                      mx: 0.5,
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
              {/* Legal Links */}
              <Box display="flex" gap={2}>
                {legalLinks.map((link) => (
                  <Link
                    key={link.name}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: 'white',
                      opacity: 0.8,
                      textDecoration: 'none',
                      transition: 'opacity 0.2s ease',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 4, mb: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />

        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', md: 'row' }} 
          justifyContent="space-between" 
          alignItems="center" 
          gap={1}
        >
          <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center' }}>
            © {new Date().getFullYear()} SocialFlow. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, textAlign: 'center' }}>
            Crafted with passion & creativity.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
