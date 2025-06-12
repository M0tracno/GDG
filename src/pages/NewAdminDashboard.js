import React, { useState, useEffect } from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Badge,
  Divider,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AdminService from '../services/adminService';

// Import dashboard components
import DashboardOverview from '../components/admin/DashboardOverview';
import UserManagementNew from '../components/admin/UserManagementNew';
import CourseManagementNew from '../components/admin/CourseManagementNew';
import CourseAllocationNew from '../components/admin/CourseAllocationNew';
import DataManagementNew from '../components/admin/DataManagementNew';
import ReportsAnalyticsNew from '../components/admin/ReportsAnalyticsNew';
import SystemSettingsNew from '../components/admin/SystemSettingsNew';

const drawerWidth = 280;

const useStyles = {
  appBar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backdropFilter: 'blur(20px)',
    borderBottom: 'none',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      background: 'linear-gradient(180deg, #2D3748 0%, #1A202C 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
    },
  },  content: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa', // Use solid color instead of gradient
    minHeight: '100vh',
    overflow: 'hidden',
    width: '100%', // Ensure full width
    margin: 0, // Remove any margins
    padding: 0, // Remove any padding that might cause gaps
  },
  userSection: {
    padding: 24,
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    margin: 16,
    borderRadius: 16,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  navItem: {
    margin: '8px 16px',
    borderRadius: 12,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
      transform: 'translateX(8px)',
    },
    '&.active': {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    },
  },
  menuIcon: {
    color: 'white',
    minWidth: 48,
  },
  menuText: {
    '& .MuiTypography-root': {
      fontWeight: 500,
      fontSize: '0.95rem',
    },
  },
};

const menuItems = [
  { label: 'Dashboard', path: '', icon: DashboardIcon },
  { label: 'User Management', path: 'users', icon: PeopleIcon },
  { label: 'Course Management', path: 'courses', icon: SchoolIcon },
  { label: 'Course Allocation', path: 'course-allocation', icon: AssignmentIcon },
  { label: 'Data Management', path: 'data', icon: StorageIcon },
  { label: 'Reports & Analytics', path: 'reports', icon: AnalyticsIcon },
  { label: 'System Settings', path: 'settings', icon: SettingsIcon },
];

function NewAdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryResult, metricsResult, healthResult] = await Promise.all([
        AdminService.getDashboardSummary(),
        AdminService.getRealTimeMetrics(),
        AdminService.getSystemHealth(),
      ]);

      setDashboardData({
        summary: summaryResult.success ? summaryResult.data : null,
        metrics: metricsResult.success ? metricsResult.data : null,
        health: healthResult.success ? healthResult.data : null,
      });

      // Set notifications count from metrics
      if (metricsResult.success) {
        setNotifications(metricsResult.data?.pendingApprovals || 0);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleProfileClick = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleProfileClose = () => {
    setProfileMenuAnchor(null);
  };

  const isPathActive = (path) => {
    const currentPath = location.pathname.replace('/admin-dashboard/', '').replace('/admin-dashboard', '');
    return currentPath === path;
  };

  const adminName = currentUser?.displayName || 'Administrator';

  const drawer = (
    <div>
      <div style={useStyles.userSection}>
        <Avatar sx={{ width: 64, height: 64, margin: '0 auto 16px', bgcolor: '#667eea' }}>
          <AccountCircleIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          {adminName}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          System Administrator
        </Typography>
      </div>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      <List sx={{ padding: '16px 0' }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = isPathActive(item.path);
          
          return (            <ListItem
              key={item.label}
              component="div"
              onClick={() => navigate(`/admin-dashboard/${item.path}`)}
              sx={{
                ...useStyles.navItem,
                ...(isActive && useStyles.navItem['&.active']),
                cursor: 'pointer',
              }}
            >
              <ListItemIcon sx={useStyles.menuIcon}>
                <IconComponent />
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                sx={useStyles.menuText}
              />
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>        <ListItem
          component="div"
          onClick={handleLogout}
          sx={{
            ...useStyles.navItem,
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
            },
            cursor: 'pointer',
          }}
        >
          <ListItemIcon sx={useStyles.menuIcon}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            sx={useStyles.menuText}
          />
        </ListItem>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        sx={{
          ...useStyles.appBar,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Educational Management System - Admin Dashboard
          </Typography>

          <IconButton color="inherit" sx={{ mr: 1 }} onClick={handleNotificationClick}>
            <Badge badgeContent={notifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={handleProfileClick}>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            ...useStyles.drawer,
          }}
        >
          {drawer}
        </Drawer>
          <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            ...useStyles.drawer,
            '& .MuiDrawer-paper': {
              ...useStyles.drawer['& .MuiDrawer-paper'],
              position: 'fixed',
              height: '100vh',
              top: 0,
              left: 0,
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>      <Box
        component="main"
        sx={{
          ...useStyles.content,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          pt: '64px', // AppBar height
          pl: 0,
          pr: 0,
          pb: 0, // Remove bottom padding
          overflow: 'hidden', // Prevent gaps
        }}
      >
        <Box sx={{ 
          p: 3, 
          height: 'calc(100vh - 64px)', 
          overflow: 'auto',
          backgroundColor: '#f8f9fa', // Ensure consistent background
          width: '100%' // Ensure full width
        }}>
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={60} sx={{ color: '#667eea' }} />
            </Box>
          )}
          
          <Routes>
            <Route 
              path="/" 
              element={<DashboardOverview dashboardData={dashboardData} loading={loading} />} 
            />
            <Route path="/users" element={<UserManagementNew />} />
            <Route path="/courses" element={<CourseManagementNew />} />
            <Route path="/course-allocation" element={<CourseAllocationNew />} />
            <Route path="/data" element={<DataManagementNew />} />
            <Route path="/reports" element={<ReportsAnalyticsNew />} />
            <Route path="/settings" element={<SystemSettingsNew />} />
          </Routes>
        </Box>
      </Box>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleNotificationClose}>
          <Typography variant="body2">No new notifications</Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose}>
          <Typography variant="body2">System update completed</Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose}>
          <Typography variant="body2">View all notifications</Typography>
        </MenuItem>
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfileClose}>
          <Typography variant="body2">Profile Settings</Typography>
        </MenuItem>
        <MenuItem onClick={handleProfileClose}>
          <Typography variant="body2">Account Settings</Typography>
        </MenuItem>
        <MenuItem onClick={() => { handleProfileClose(); handleLogout(); }}>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default NewAdminDashboard;
