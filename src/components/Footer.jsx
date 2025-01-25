// src/components/Footer.jsx
import React from 'react';
import { Box, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        padding: 4,
        mt: 'auto',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        <Typography variant="h6">SocialFlow</Typography>
        <Typography variant="body2">Enhancing Your Social Skills</Typography>
        <Box mt={2}>
          <Link href="#" sx={{ color: 'white', mr: 2, '&:hover': { textDecoration: 'underline' } }}>
            Privacy Policy
          </Link>
          <Link href="#" sx={{ color: 'white', mr: 2, '&:hover': { textDecoration: 'underline' } }}>
            Terms of Service
          </Link>
        </Box>
        <Box mt={1}>
          <IconButton href="#" color="inherit">
            <FacebookIcon />
          </IconButton>
          <IconButton href="#" color="inherit">
            <TwitterIcon />
          </IconButton>
          <IconButton href="#" color="inherit">
            <InstagramIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
