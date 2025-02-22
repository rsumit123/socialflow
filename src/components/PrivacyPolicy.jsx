// src/components/PrivacyPolicy.jsx
import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Box sx={{ py: 8, px: 2 }}>
      <Container maxWidth="md">
        <Typography 
          variant="h2" 
          sx={{ textAlign: 'center', fontWeight: 700, mb: 4 }}
        >
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to SocialFlow. Your privacy is important to us, and we are committed to safeguarding your personal information. This Privacy Policy explains how we collect, use, and protect your data.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information you provide directly when you register, use our services, or communicate with us. This may include your name, email address, and other profile details.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          Your data is used to enhance your experience, personalize content, and improve our services. We also use your information to communicate important updates and notifications.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Cookies and Tracking Technologies
        </Typography>
        <Typography variant="body1" paragraph>
          Our site uses cookies and similar tracking technologies to improve your experience, analyze usage trends, and deliver personalized content.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Changes to This Policy
        </Typography>
        <Typography variant="body1" paragraph>
          We may update this Privacy Policy periodically. When changes are made, we will update the effective date on this page.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions or concerns about our Privacy Policy, please reach out to us at privacy@socialflow.com.
        </Typography>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
