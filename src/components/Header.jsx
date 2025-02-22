// src/components/Header.jsx
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Define navigation items based on authentication status.
  // For unauthenticated users, "Chat" has been removed.
  const navItems = user
    ? [
        { name: 'Platform', path: '/platform' },
        { name: 'Evaluate', path: '/evaluate' },
        { name: 'Report Cards', path: '/report-cards' },
        { name: 'About', path: '/about' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ];

  // Define authentication items.
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

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.name} component={Link} to={item.path}>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
        {authItems.map((item) =>
          item.path ? (
            <ListItem button key={item.name} component={Link} to={item.path}>
              <ListItemText primary={item.name} />
            </ListItem>
          ) : (
            <ListItem button key={item.name} onClick={item.action}>
              <ListItemText primary={item.name} />
            </ListItem>
          )
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            SocialFlow
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.name}
                color="inherit"
                component={Link}
                to={item.path}
              >
                {item.name}
              </Button>
            ))}
            {authItems.map((item) =>
              item.path ? (
                <Button
                  key={item.name}
                  color="inherit"
                  component={Link}
                  to={item.path}
                >
                  {item.name}
                </Button>
              ) : (
                <Button key={item.name} color="inherit" onClick={item.action}>
                  {item.name}
                </Button>
              )
            )}
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
