import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Modal,
  TextField,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  Timer,
  Send,
  CheckCircle,
  Warning,
  TrendingUp,
  History,
  Psychology,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';




/* ModalContent Component */
const ModalContent = React.forwardRef((props, ref) => {
    const { theme, lesson, modalStep, setModalStep, startChallenge, isSmallScreen } = props;
    return (
      <Paper
        ref={ref}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isSmallScreen ? '90%' : 500,
          bgcolor: 'background.paper',
          borderRadius: '20px',
          boxShadow: 24,
          p: 4,
        }}
      >
        {modalStep === 1 && (
          <>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              }}
            >
              Welcome to {lesson?.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {lesson?.content.subcategory_introduction}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setModalStep(2)}
              sx={{
                borderRadius: '30px',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Next
            </Button>
          </>
        )}
        {modalStep === 2 && (
          <>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {lesson?.content.modal_page_2_intro}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setModalStep(3)}
              sx={{
                borderRadius: '30px',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Next
            </Button>
          </>
        )}
        {modalStep === 3 && (
          <>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Ready to begin?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Show us your best social skills! Remember, authenticity and creativity are key.
            </Typography>
            <Button
              variant="contained"
              onClick={startChallenge}
              sx={{
                borderRadius: '30px',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Begin Challenge
            </Button>
          </>
        )}
      </Paper>
    );
  });
  
  export default ModalContent;