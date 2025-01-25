import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import { Button, Box, Container } from '@mui/material';

function Auth() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {showLogin ? <Login /> : <Register />}
        <Box sx={{ mt: 2, width: '100%' }}> {/* Ensure full width for center alignment */}
          <Button
            fullWidth
            onClick={() => setShowLogin(!showLogin)}
            color="secondary"
          >
            {showLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Auth;