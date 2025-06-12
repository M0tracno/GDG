import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  FamilyRestroom as FamilyIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import AdminService from '../../services/adminService';

const DashboardOverview = ({ dashboardData, loading }) => {
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    responseTime: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSystemData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      // Load system alerts
      setSystemAlerts([
        { 
          id: 1, 
          type: 'warning', 
          message: 'High server load detected (CPU: 85%)', 
          time: new Date(Date.now() - 5 * 60000).toLocaleTimeString(),
          severity: 'medium'
        },
        { 
          id: 2, 
          type: 'info', 
          message: `${Math.floor(Math.random() * 20) + 10} new user registrations pending`, 
          time: new Date(Date.now() - 10 * 60000).toLocaleTimeString(),
          severity: 'low'
        },
        { 
          id: 3, 
          type: 'success', 
          message: 'Database backup completed successfully', 
          time: new Date(Date.now() - 60 * 60000).toLocaleTimeString(),
          severity: 'low'
        },
        { 
          id: 4, 
          type: 'error', 
          message: 'Email service temporarily unavailable', 
          time: new Date(Date.now() - 15 * 60000).toLocaleTimeString(),
          severity: 'high'
        },
      ]);

      // Load recent activity
      setRecentActivity([
        { 
          id: 1, 
          action: 'New student registered', 
          user: 'John Doe', 
          time: new Date(Date.now() - 2 * 60000).toLocaleTimeString(),
          type: 'user'
        },
        { 
          id: 2, 
          action: 'Course updated', 
          user: 'Dr. Smith', 
          time: new Date(Date.now() - 5 * 60000).toLocaleTimeString(),
          type: 'course'
        },
        { 
          id: 3, 
          action: 'Quiz created', 
          user: 'Prof. Johnson', 
          time: new Date(Date.now() - 8 * 60000).toLocaleTimeString(),
          type: 'quiz'
        },
        { 
          id: 4, 
          action: 'Parent account activated', 
          user: 'Jane Wilson', 
          time: new Date(Date.now() - 12 * 60000).toLocaleTimeString(),
          type: 'user'
        },
        { 
          id: 5, 
          action: 'System backup initiated', 
          user: 'System', 
          time: new Date(Date.now() - 18 * 60000).toLocaleTimeString(),
          type: 'system'
        },
      ]);

      // Load system metrics
      setSystemMetrics({
        cpuUsage: Math.floor(Math.random() * 30) + 60, // 60-90%
        memoryUsage: Math.floor(Math.random() * 25) + 55, // 55-80%
        diskUsage: Math.floor(Math.random() * 20) + 45, // 45-65%
        responseTime: Math.floor(Math.random() * 50) + 80, // 80-130ms
      });
    } catch (error) {
      console.error('Error loading system data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSystemData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'error': return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'success': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      default: return <CheckCircleIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const StatCard = ({ title, value, subValue, icon, color, trend }) => (
    <Card 
      sx={{ 
        height: '100%', 
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${color}25`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: color, mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            {subValue && (
              <Typography variant="body2" color="text.secondary">
                {subValue}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  +{trend}% this week
                </Typography>
              </Box>
            )}
          </Box>
          <Box 
            sx={{ 
              backgroundColor: color, 
              borderRadius: 2, 
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.createElement(icon, { sx: { fontSize: 32, color: 'white' } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const SystemHealthCard = ({ healthData }) => (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            System Health
          </Typography>
          <IconButton size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
        
        {healthData ? (
          <Box>
            {Object.entries(healthData).map(([service, data]) => (
              <Box key={service} mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {service.replace(/([A-Z])/g, ' $1')}
                  </Typography>
                  <Chip 
                    label={data.status || 'Online'} 
                    color={data.status === 'Online' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={data.status === 'Online' ? 100 : 60}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: '#f5f5f5',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: data.status === 'Online' ? '#4caf50' : '#ff9800',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Response: {data.responseTime || 'N/A'}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Loading system health...</Typography>
        )}
      </CardContent>
    </Card>
  );

  const defaultStats = {
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalParents: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    activeUsers: 0,
    systemLoad: 0,
  };

  const stats = dashboardData?.summary || defaultStats;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748', mb: 1 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening in your system today.
          </Typography>
        </Box>
        <Chip 
          label={`Last updated: ${new Date().toLocaleTimeString()}`}
          variant="outlined"
          sx={{ fontSize: '0.875rem' }}
        />
      </Box>

      {/* Main Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{xs:12,sm:6,md:3}}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            subValue={`${stats.totalStudents || 0} Students, ${stats.totalFaculty || 0} Faculty`}
            icon={PeopleIcon}
            color="#667eea"
            trend="12"
          />
        </Grid>
        
        <Grid size={{xs:12,sm:6,md:3}}>
          <StatCard
            title="Active Courses"
            value={stats.totalCourses || 0}
            subValue={`${stats.totalQuizzes || 0} quizzes created`}
            icon={SchoolIcon}
            color="#764ba2"
            trend="8"
          />
        </Grid>
        
        <Grid size={{xs:12,sm:6,md:3}}>
          <StatCard
            title="Students"
            value={stats.totalStudents || 0}
            subValue={`${stats.activeUsers || 0} currently active`}
            icon={PersonAddIcon}
            color="#f093fb"
            trend="15"
          />
        </Grid>
        
        <Grid size={{xs:12,sm:6,md:3}}>
          <StatCard
            title="Parents"
            value={stats.totalParents || 0}
            subValue="Parent accounts active"
            icon={FamilyIcon}
            color="#4facfe"
            trend="5"
          />
        </Grid>
      </Grid>

      {/* Secondary Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{xs:12,md:8}}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Activity
              </Typography>
              
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} divider sx={{ px: 0 }}>
                    <ListItemIcon>
                      <AssignmentIcon sx={{ color: '#667eea' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.user} • ${activity.time}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{xs:12,md:4}}>
          <SystemHealthCard healthData={dashboardData?.health} />
        </Grid>
      </Grid>

      {/* System Alerts */}
      <Grid container spacing={3}>
        <Grid size={{xs:12}}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                System Alerts
              </Typography>
              
              <List>
                {systemAlerts.map((alert) => (
                  <ListItem key={alert.id} divider sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getAlertIcon(alert.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={alert.time}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;
