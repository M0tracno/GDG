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
  styled,
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

const appBarStyles = {
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  backdropFilter: 'blur(20px)',
  borderBottom: 'none',
  boxShadow: '0 4px 20px rgba(30, 60, 114, 0.15)',
};

const drawerStyles = {
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    background: 'linear-gradient(180deg, #1a202c 0%, #2d3748 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
  },
};

const contentStyles = {
  flexGrow: 1,
  backgroundColor: '#f7fafc',
  minHeight: '100vh',
  overflow: 'hidden',
  width: '100%',
  margin: 0,
  padding: 0,
  position: 'relative', // Ensure proper positioning
};

const userSectionStyles = {
  padding: 24,
  textAlign: 'center',
  background: 'linear-gradient(135deg, rgba(30, 60, 114, 0.15) 0%, rgba(42, 82, 152, 0.15) 100%)',
  margin: 16,
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
};

const navItemStyles = {
  margin: '6px 16px',
  borderRadius: 12,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(30, 60, 114, 0.2) 0%, rgba(42, 82, 152, 0.2) 100%)',
    transform: 'translateX(8px)',
  },
};

const activeNavItemStyles = {
  ...navItemStyles,
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  boxShadow: '0 4px 15px rgba(30, 60, 114, 0.4)',
};

const menuIconStyles = {
  color: 'white',
  minWidth: 48,
};

const menuTextStyles = {  '& .MuiTypography-root': {
    fontWeight: 500,
    fontSize: '0.95rem',
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
      <div style={userSectionStyles}>
        <Avatar sx={{ 
          width: 72, 
          height: 72, 
          margin: '0 auto 16px', 
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 25px rgba(30, 60, 114, 0.3)',
        }}>
          <AccountCircleIcon sx={{ fontSize: 48, color: 'white' }} />
        </Avatar>
        <Typography variant="h6" sx={{ 
          color: 'white', 
          fontWeight: 600, 
          fontSize: '1.1rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}>
          {adminName}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          fontWeight: 400,
          fontSize: '0.875rem',
        }}>
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
              sx={isActive ? activeNavItemStyles : navItemStyles}
            >
              <ListItemIcon sx={menuIconStyles}>
                <IconComponent />
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                sx={menuTextStyles}
              />
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>        <ListItem
          component="div"
          onClick={handleLogout}
          sx={{
            ...navItemStyles,
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
            },
          }}
        >
          <ListItemIcon sx={menuIconStyles}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            sx={menuTextStyles}
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
          ...appBarStyles,
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
          </IconButton>          <Typography variant="h6" noWrap component="div" sx={{ 
            flexGrow: 1, 
            fontWeight: 600,
            fontSize: '1.25rem',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            Educational Management System - Admin Dashboard
          </Typography>

          <IconButton 
            color="inherit" 
            sx={{ 
              mr: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.1)',
              },
            }} 
            onClick={handleNotificationClick}
          >
            <Badge 
              badgeContent={notifications} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  color: 'white',
                  fontWeight: 600,
                },
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton 
            color="inherit" 
            onClick={handleProfileClick}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <Avatar sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              width: 40, 
              height: 40,
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}>
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            ...drawerStyles,
          }}
        >
          {drawer}
        </Drawer>          <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            ...drawerStyles,
            '& .MuiDrawer-paper': {
              ...drawerStyles['& .MuiDrawer-paper'],
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
          ...contentStyles,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          pt: '64px', // AppBar height
          pl: 0,
          pr: 0,
          pb: 0,
          overflow: 'hidden',
          minHeight: '100vh',
          backgroundColor: '#f7fafc',
          position: 'relative',
        }}
      >
        <Box sx={{ 
          p: 0, // No padding at all
          height: 'calc(100vh - 64px)', 
          overflow: 'auto',
          backgroundColor: '#f7fafc',
          background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
          width: '100%',
          margin: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(135deg, #2a5298 0%, #1e3c72 100%)',
          },
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
