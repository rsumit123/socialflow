import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Zoom, useTheme } from '@mui/material';

// Enhanced dialog with better visuals and animation
const CustomDialog = ({ open, title, content, actions, onClose }) => {
  const theme = useTheme();
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
          maxWidth: '90vw',
          width: '450px',
        },
      }}
    >
      <DialogTitle
        sx={{
          position: 'relative',
          pb: 1,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          fontWeight: 700,
          textAlign: 'center',
          fontSize: '1.3rem',
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ mt: 2, px: 3 }}>
        <DialogContentText sx={{ color: 'text.primary' }}>{content}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center' }}>{actions}</DialogActions>
    </Dialog>
  );
};

export default CustomDialog;