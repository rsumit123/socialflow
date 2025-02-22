// src/components/TermsOfService.jsx
import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const TermsOfService = () => {
  return (
    <Box sx={{ py: 8, px: 2 }}>
      <Container maxWidth="md">
        <Typography 
          variant="h2" 
          sx={{ textAlign: 'center', fontWeight: 700, mb: 4 }}
        >
          Terms of Service
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to SocialFlow. By using our platform, you agree to these Terms of Service. Please read them carefully.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Acceptance of Terms
        </Typography>
        <Typography variant="body1" paragraph>
          By accessing and using SocialFlow, you agree to be bound by these Terms of Service and any future updates. If you do not agree, please do not use our platform.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          User Responsibilities
        </Typography>
        <Typography variant="body1" paragraph>
          You are responsible for maintaining the confidentiality of your account and password. All activities that occur under your account are your responsibility.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Prohibited Activities
        </Typography>
        <Typography variant="body1" paragraph>
          Users must not use SocialFlow for any illegal, harmful, or unauthorized purposes. This includes transmitting harmful or inappropriate content.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Intellectual Property
        </Typography>
        <Typography variant="body1" paragraph>
          All content and intellectual property on SocialFlow is owned by us or our licensors. Unauthorized use of any content is strictly prohibited.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Disclaimer of Warranties
        </Typography>
        <Typography variant="body1" paragraph>
          SocialFlow is provided on an "as is" basis without any warranties. We do not guarantee that our services will be uninterrupted or error-free.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Limitation of Liability
        </Typography>
        <Typography variant="body1" paragraph>
          Under no circumstances shall SocialFlow be liable for any direct, indirect, incidental, or consequential damages arising from the use of our services.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Changes to These Terms
        </Typography>
        <Typography variant="body1" paragraph>
          We reserve the right to modify these Terms of Service at any time. Continued use of our platform after any changes constitutes acceptance of the new terms.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Contact Information
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about these Terms of Service, please contact us at support@socialflow.com.
        </Typography>
      </Container>
    </Box>
  );
};

export default TermsOfService;
