import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Container,
  useScrollTrigger,
  Slide,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';

// Hide AppBar on scroll with support for a window prop
function HideOnScroll(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = (props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Navigation items based on authentication status
  const navItems = user
    ? [
        { name: 'Platform', path: '/platform' },
        { name: 'Evaluate', path: '/chat' },
        { name: 'Report Cards', path: '/report-cards' },
        { name: 'About', path: '/about' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ];

  // Authentication items
  const authItems = user
    ? [
        {
          name: 'Logout',
          action: () => {
            logout();
            navigate('/');
          },
        },
      ]
    : [
        { name: 'Login', path: '/login' },
        { name: 'Sign Up', path: '/register' },
      ];

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const isActiveRoute = (path) => location.pathname === path;

  const drawer = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        background: `linear-gradient(145deg, #121212 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        p: 2,
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, mt: 2 }}>
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: '#64ffda',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
          }}
        >
          Social<span style={{ color: '#64ffda' }}>Flow</span>
        </Typography>
      </Box>

      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.name}
            component={Link}
            to={item.path}
            sx={{
              borderRadius: '12px',
              mb: 1,
              background: isActiveRoute(item.path)
                ? 'rgba(255,255,255,0.08)'
                : 'transparent',
              '&:hover': {
                background: 'rgba(255,255,255,0.12)',
              },
            }}
          >
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                fontSize: '1rem',
                fontWeight: isActiveRoute(item.path) ? 'bold' : 'normal',
                color: 'white',
              }}
            />
          </ListItem>
        ))}
        <Box sx={{ my: 2, borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
          {authItems.map((item) =>
            item.path ? (
              <ListItem
                button
                key={item.name}
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  background: isActiveRoute(item.path)
                    ? 'rgba(255,255,255,0.08)'
                    : 'transparent',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.12)',
                  },
                }}
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: '1rem',
                    fontWeight: isActiveRoute(item.path) ? 'bold' : 'normal',
                    color: 'white',
                  }}
                />
              </ListItem>
            ) : (
              <ListItem
                button
                key={item.name}
                onClick={item.action}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.12)',
                  },
                }}
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: '1rem',
                    color: 'white',
                  }}
                />
              </ListItem>
            )
          )}
        </Box>
      </List>
    </Box>
  );

  return (
    <>
      <HideOnScroll {...props}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backdropFilter: 'blur(10px)',
            backgroundColor: 'primary.main',
            backgroundImage:
              'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.03) 0%, transparent 20%)',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ padding: { xs: 1, sm: 2 } }}>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  flexGrow: 1,
                  textDecoration: 'none',
                  color: 'inherit',
                  fontWeight: 'bold',
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  mr: 4,
                }}
              >
                Social<span style={{ color: '#64ffda' }}>Flow</span>
              </Typography>

              <Box sx={{ flexGrow: 1 }} />

              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    sx={{
                      mx: 0.5,
                      px: 2,
                      borderRadius: '12px',
                      position: 'relative',
                      fontWeight: isActiveRoute(item.path) ? 'bold' : 'normal',
                      '&:after': isActiveRoute(item.path)
                        ? {
                            content: '""',
                            position: 'absolute',
                            bottom: '6px',
                            left: '20%',
                            width: '60%',
                            height: '3px',
                            backgroundColor: '#64ffda',
                            borderRadius: '2px',
                          }
                        : {},
                    }}
                  >
                    {item.name}
                  </Button>
                ))}

                <Box
                  sx={{
                    height: '24px',
                    mx: 1,
                    borderLeft: '1px solid rgba(255,255,255,0.3)',
                  }}
                />

                {user && (
                  <Tooltip title="Notifications">
                    <IconButton color="inherit" sx={{ mr: 1 }}>
                      <Badge badgeContent={3} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                )}

                {authItems.map((item) =>
                  item.path ? (
                    <Button
                      key={item.name}
                      variant={item.name === 'Sign Up' ? 'contained' : 'outlined'}
                      color={item.name === 'Sign Up' ? 'secondary' : 'inherit'}
                      component={Link}
                      to={item.path}
                      sx={{
                        ml: 1,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: item.name === 'Sign Up' ? 'bold' : 'normal',
                        boxShadow: item.name === 'Sign Up' ? 2 : 0,
                        border:
                          item.name === 'Sign Up'
                            ? 'none'
                            : '1px solid rgba(255,255,255,0.5)',
                      }}
                    >
                      {item.name}
                    </Button>
                  ) : (
                    <Button
                      key={item.name}
                      color="inherit"
                      onClick={item.action}
                      sx={{
                        ml: 1,
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.5)',
                      }}
                    >
                      {item.name}
                    </Button>
                  )
                )}

                {user && (
                  <Tooltip title="Profile">
                    <IconButton
                      sx={{
                        ml: 2,
                        border: '2px solid rgba(255,255,255,0.2)',
                        padding: '3px',
                      }}
                    >
                      <Avatar
                        sx={{ width: 32, height: 32 }}
                        alt={user.displayName || 'User'}
                        src={user.photoURL || '/static/images/avatar/2.jpg'}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{
                  display: { md: 'none' },
                  ml: 2,
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '16px',
            borderBottomLeftRadius: '16px',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
