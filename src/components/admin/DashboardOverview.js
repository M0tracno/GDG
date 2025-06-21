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

// Add CSS animations
const styles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

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
      case 'warning': return <WarningIcon sx={{ color: '#f59e0b', fontSize: 20 }} />;
      case 'error': return <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />;
      case 'success': return <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />;
      default: return <CheckCircleIcon sx={{ color: '#3b82f6', fontSize: 20 }} />;
    }
  };
  const StatCard = ({ title, value, subValue, icon, color, trend }) => (
    <Card 
      sx={{ 
        height: '100%', 
        background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
        border: `1px solid ${color}20`,
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 40px ${color}25`,
          '& .stat-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: color, 
              mb: 1,
              fontSize: '2.5rem',
              lineHeight: 1,
            }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 0.5,
              color: '#2d3748',
              fontSize: '1.1rem',
            }}>
              {title}
            </Typography>
            {subValue && (
              <Typography variant="body2" sx={{ 
                color: '#718096',
                fontSize: '0.875rem',
                lineHeight: 1.4,
              }}>
                {subValue}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1.5}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f0fff4',
                  border: '1px solid #68d391',
                  borderRadius: 2,
                  px: 1,
                  py: 0.5,
                }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#38a169', mr: 0.5 }} />
                  <Typography variant="caption" sx={{ 
                    color: '#38a169', 
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}>
                    +{trend}% this week
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Box 
            className="stat-icon"
            sx={{ 
              backgroundColor: color, 
              borderRadius: 3, 
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: `0 8px 25px ${color}30`,
            }}
          >
            {React.createElement(icon, { sx: { fontSize: 36, color: 'white' } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
  const SystemHealthCard = ({ healthData }) => (
    <Card sx={{ 
      borderRadius: 3, 
      height: '100%',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: '#1a202c',
            fontSize: '1.25rem',
          }}>
            System Health
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              animation: 'pulse 2s infinite',
            }} />
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 500 }}>
              Loading system health...
            </Typography>
          </Box>
        </Box>
        
        {healthData ? (
          <Box>
            {Object.entries(healthData).map(([service, data]) => (
              <Box key={service} mb={2.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ 
                    textTransform: 'capitalize',
                    fontWeight: 500,
                    color: '#374151',
                  }}>
                    {service.replace(/([A-Z])/g, ' $1')}
                  </Typography>
                  <Chip 
                    label={data.status || 'Online'} 
                    color={data.status === 'Online' ? 'success' : 'warning'}
                    size="small"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      height: 24,
                    }}
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={data.status === 'Online' ? 100 : 60}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: data.status === 'Online' ? '#10b981' : '#f59e0b',
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="caption" sx={{ 
                  color: '#6b7280',
                  fontSize: '0.75rem',
                  mt: 0.5,
                  display: 'block',
                }}>
                  Response: {data.responseTime || 'N/A'}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: '#6366f1', mb: 2 }} />
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Loading system health...
            </Typography>
          </Box>
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

  const stats = dashboardData?.summary || defaultStats;  return (
    <Box sx={{ 
      p: 2, // Reduced padding
      pt: 1, // Minimal top padding
      height: '100%',
      minHeight: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 0, // Remove any gaps between sections
      backgroundColor: 'transparent', // Ensure background is transparent
    }}>      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1a202c', 
            mb: 1,
            fontSize: '2rem',
          }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#718096',
            fontSize: '1rem',
            fontWeight: 400,
          }}>
            Welcome back! Here's what's happening in your system today.
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <IconButton 
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              backgroundColor: '#f7fafc',
              border: '1px solid #e2e8f0',
              '&:hover': {
                backgroundColor: '#edf2f7',
                transform: 'scale(1.05)',
              },
            }}
          >
            <RefreshIcon sx={{ 
              color: '#4a5568',
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            }} />
          </IconButton>
          <Chip 
            label={`Last updated: ${new Date().toLocaleTimeString()}`}
            variant="outlined"
            sx={{ 
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              color: '#4a5568',
            }}
          />
        </Box>
      </Box>      {/* Main Statistics */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Students"
            value={stats.totalStudents || 0}
            subValue={`${stats.totalFaculty || 0} Faculty`}
            icon={PeopleIcon}
            color="#4f46e5"
            trend="12"
          />
        </Grid>        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Quizzes"
            value={stats.totalQuizzes || 0}
            subValue="created"
            icon={QuizIcon}
            color="#7c3aed"
            trend="8"
          />
        </Grid>        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active"
            value={stats.activeUsers || 0}
            subValue="currently active"
            icon={PersonAddIcon}
            color="#ec4899"
            trend="15"
          />
        </Grid>        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Parent accounts"
            value={stats.totalParents || 0}
            subValue="active"
            icon={FamilyIcon}
            color="#3b82f6"
            trend="5"
          />
        </Grid>
      </Grid>      {/* Secondary Statistics */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            borderRadius: 3, 
            height: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3,
                color: '#1a202c',
                fontSize: '1.25rem',
              }}>
                Recent Activity
              </Typography>
              
              <List sx={{ p: 0 }}>
                {recentActivity.map((activity, index) => (
                  <ListItem key={activity.id} divider={index < recentActivity.length - 1} sx={{ 
                    px: 0, 
                    py: 2,
                    borderColor: '#f1f5f9',
                  }}>
                    <ListItemIcon>
                      <Box sx={{
                        backgroundColor: '#f0f9ff',
                        borderRadius: 2,
                        p: 1.5,
                        border: '1px solid #e0f2fe',
                      }}>
                        <AssignmentIcon sx={{ color: '#0284c7', fontSize: 20 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.user} • ${activity.time}`}
                      primaryTypographyProps={{ 
                        fontWeight: 500,
                        color: '#1a202c',
                        fontSize: '0.95rem',
                      }}
                      secondaryTypographyProps={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>        
        <Grid item xs={12} md={4}>
          <SystemHealthCard healthData={dashboardData?.health} />
        </Grid>
      </Grid>      {/* System Alerts */}
      <Grid container spacing={3} sx={{ mb: 0 }}>
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3,
                color: '#1a202c',
                fontSize: '1.25rem',
              }}>
                System Alerts
              </Typography>
              
              <List sx={{ p: 0 }}>
                {systemAlerts.map((alert, index) => (
                  <ListItem key={alert.id} divider={index < systemAlerts.length - 1} sx={{ 
                    px: 0, 
                    py: 2,
                    borderColor: '#f1f5f9',
                  }}>
                    <ListItemIcon>
                      <Box sx={{
                        backgroundColor: alert.type === 'error' ? '#fef2f2' : 
                                       alert.type === 'warning' ? '#fffbeb' :
                                       alert.type === 'success' ? '#f0fdf4' : '#f0f9ff',
                        borderRadius: 2,
                        p: 1.5,
                        border: `1px solid ${
                          alert.type === 'error' ? '#fecaca' : 
                          alert.type === 'warning' ? '#fed7aa' :
                          alert.type === 'success' ? '#bbf7d0' : '#bae6fd'
                        }`,
                      }}>
                        {getAlertIcon(alert.type)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={alert.time}
                      primaryTypographyProps={{ 
                        fontWeight: 500,
                        color: '#1a202c',
                        fontSize: '0.95rem',
                      }}
                      secondaryTypographyProps={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                      }}
                    />
                    <Box sx={{ ml: 2 }}>
                      <Chip
                        label={alert.severity}
                        size="small"
                        color={alert.severity === 'high' ? 'error' : 
                               alert.severity === 'medium' ? 'warning' : 'default'}
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}
                      />
                    </Box>
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
