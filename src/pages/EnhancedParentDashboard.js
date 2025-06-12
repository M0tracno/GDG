import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Alert,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
  Badge,
  Stack,
} from '@mui/material';
import {
  ChildCare as ChildrenIcon,
  School as SchoolIcon,
  Grade as GradesIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  EventNote as AttendanceIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  AccountCircle as ProfileIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import UnifiedDashboardLayout from '../components/layout/UnifiedDashboardLayout';
import ParentService from '../services/parentService';

const EnhancedParentDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    profile: {},
    children: [],
    stats: {},
    recentGrades: [],
    upcomingEvents: [],
    recentFeedback: [],
    assignments: []
  });
  const [currentView, setCurrentView] = useState('dashboard');

  // Menu items for parent dashboard
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <SchoolIcon /> },
    { key: 'children', label: 'My Children', icon: <ChildrenIcon /> },
    { key: 'grades', label: 'Grades & Progress', icon: <GradesIcon /> },
    { key: 'assignments', label: 'Assignments', icon: <AssignmentIcon /> },
    { key: 'attendance', label: 'Attendance', icon: <AttendanceIcon /> },
    { key: 'communication', label: 'Teacher Communication', icon: <MessageIcon /> },
    { key: 'events', label: 'Events & Meetings', icon: <EventIcon /> },
  ];

  useEffect(() => {
    loadDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(loadDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        profileResponse,
        childrenResponse,
        summaryResponse,
        gradesResponse,
        eventsResponse,
        feedbackResponse,
        assignmentsResponse
      ] = await Promise.all([
        ParentService.getParentProfile(),
        ParentService.getChildren(),
        ParentService.getDashboardSummary(),
        ParentService.getChildrenGrades(),
        ParentService.getUpcomingEvents(),
        ParentService.getTeacherFeedback(),
        ParentService.getChildrenAssignments()
      ]);

      setDashboardData({
        profile: profileResponse.data || { firstName: 'Demo', lastName: 'Parent' },
        children: childrenResponse.data || [],
        stats: summaryResponse.data || {},
        recentGrades: gradesResponse.data || [],
        upcomingEvents: eventsResponse.data || [],
        recentFeedback: feedbackResponse.data || [],
        assignments: assignmentsResponse.data || []
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced StatCard with high visibility colors
  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          border: `3px solid ${color}`,
          borderRadius: 4,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 8px 32px ${color}40`,
          '&:hover': {
            boxShadow: `0 12px 48px ${color}60`,
            transform: 'translateY(-4px)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: color,
                color: 'white',
                width: 64,
                height: 64,
                boxShadow: `0 4px 20px ${color}60`,
                border: '3px solid white',
              }}
            >
              {icon}
            </Avatar>
            {trend && (
              <Chip
                label={trend}
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  color: 'white',
                  bgcolor: trend.includes('+') ? '#4caf50' : '#f44336',
                  fontSize: '0.875rem'
                }}
              />
            )}
          </Box>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#1a1a1a', 
              mb: 1,
              fontSize: '3rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {value}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: '#2c2c2c', 
              mb: 0.5,
              fontSize: '1.25rem'
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#555555',
                fontWeight: 500,
                fontSize: '1rem'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </CardContent>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
            borderRadius: '0 0 16px 16px',
          }}
        />
      </Card>
    </motion.div>
  );

  // Enhanced Activity Card with better visibility
  const ActivityCard = ({ title, items, icon, onViewAll, color = theme.palette.primary.main }) => (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: `2px solid ${color}30`,
        background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
        minHeight: 400,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: color, width: 48, height: 48, boxShadow: `0 4px 16px ${color}40` }}>
              {icon}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
              {title}
            </Typography>
          </Box>
          <Button 
            size="large" 
            onClick={onViewAll} 
            sx={{ 
              textTransform: 'none',
              fontWeight: 'bold',
              color: color,
              '&:hover': {
                bgcolor: `${color}10`
              }
            }}
          >
            View All
          </Button>
        </Box>
        <List sx={{ py: 0 }}>
          {items.slice(0, 4).map((item, index) => (
            <React.Fragment key={item.id || index}>
              <ListItem sx={{ px: 0, py: 2, borderRadius: 2, '&:hover': { bgcolor: `${color}08` } }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 32, height: 32 }}>
                    <StarIcon fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                      {item.title || item.subject || item.description}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body1" sx={{ color: '#555555', fontWeight: 500 }}>
                      {item.subtitle || item.date || item.studentName}
                    </Typography>
                  }
                />
                {item.grade && (
                  <Chip
                    label={item.grade}
                    size="medium"
                    sx={{ 
                      bgcolor: color,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}
                  />
                )}
                {item.status && (
                  <Chip
                    label={item.status}
                    size="medium"
                    color={item.status === 'pending' ? 'warning' : 'success'}
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </ListItem>
              {index < Math.min(items.length - 1, 3) && <Divider component="li" sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
          {items.length === 0 && (
            <ListItem sx={{ px: 0, py: 4 }}>
              <ListItemText
                primary={
                  <Typography variant="h6" sx={{ textAlign: 'center', color: '#666', fontWeight: 500 }}>
                    No recent activity
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" sx={{ textAlign: 'center', color: '#888' }}>
                    Check back later for updates
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );

  const renderDashboardContent = () => {
    const { stats, children, recentGrades, upcomingEvents, recentFeedback, assignments } = dashboardData;

    return (
      <Box sx={{ p: 3 }}>
        {/* Welcome Section with enhanced visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 5,
              mb: 4,
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
              color: 'white',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                Welcome back, {dashboardData.profile.firstName || 'Parent'}! 👋
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.95, mb: 3, fontWeight: 500 }}>
                Here's your children's comprehensive academic overview
              </Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                    backdropFilter: 'blur(10px)',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                  }}
                  startIcon={<RefreshIcon />}
                  onClick={loadDashboardData}
                >
                  Refresh Data
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.6)',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.15)' },
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                  }}
                  startIcon={<EventIcon />}
                  onClick={() => setCurrentView('events')}
                >
                  View Calendar
                </Button>
              </Stack>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            />
          </Paper>
        </motion.div>

        {/* Enhanced Statistics Cards with high visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Grid container spacing={4} sx={{ mb: 5 }}>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Total Children"
                value={stats.totalChildren || children.length || 2}
                icon={<ChildrenIcon />}
                color="#1976d2"
                subtitle="Enrolled students"
                trend={children.length > 0 ? `+${children.length}` : ''}
              />
            </Grid>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Active Courses"
                value={stats.totalCourses || 8}
                icon={<SchoolIcon />}
                color="#2e7d32"
                subtitle="This semester"
                trend="+2"
              />
            </Grid>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Recent Grades"
                value={stats.recentGrades || recentGrades.length || 5}
                icon={<GradesIcon />}
                color="#1565c0"
                subtitle="This week"
                trend={`+${stats.recentGrades || recentGrades.length || 5}`}
              />
            </Grid>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Upcoming Events"
                value={stats.pendingMeetings || upcomingEvents.length || 3}
                icon={<EventIcon />}
                color="#f57c00"
                subtitle="Next 30 days"
                trend="+1"
              />
            </Grid>
          </Grid>
        </motion.div>

        {/* Enhanced Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card sx={{ mb: 5, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '2px solid #1976d230' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#1a1a1a' }}>
                🎯 Academic Performance Overview
              </Typography>
              <Grid container spacing={4}>
                <Grid size={{xs:12,md:6}}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        Average Grade
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {(stats.avgGrade || 87.3)?.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.avgGrade || 87.3}
                      sx={{
                        height: 16,
                        borderRadius: 8,
                        bgcolor: alpha('#2e7d32', 0.15),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 8,
                          background: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
                        },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid size={{xs:12,md:6}}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        Attendance Rate
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                        {(stats.avgAttendance || 94.5)?.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.avgAttendance || 94.5}
                      sx={{
                        height: 16,
                        borderRadius: 8,
                        bgcolor: alpha('#1565c0', 0.15),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 8,
                          background: 'linear-gradient(90deg, #2196f3 0%, #1565c0 100%)',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Activity Cards with high visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Grid container spacing={4}>
            <Grid size={{xs:12,lg:6}}>
              <ActivityCard
                title="📊 Recent Grades"
                items={(recentGrades || []).map(grade => ({
                  id: grade.id,
                  title: `${grade.subject} - ${grade.assignment}`,
                  subtitle: `${grade.studentName} • ${new Date(grade.date).toLocaleDateString()}`,
                  grade: grade.grade
                }))}
                icon={<GradesIcon />}
                onViewAll={() => setCurrentView('grades')}
                color="#1565c0"
              />
            </Grid>
            <Grid size={{xs:12,lg:6}}>
              <ActivityCard
                title="📅 Upcoming Events"
                items={(upcomingEvents || []).map(event => ({
                  id: event.id,
                  title: event.title,
                  subtitle: `${new Date(event.date).toLocaleDateString()} • ${event.time}`,
                  status: event.status
                }))}
                icon={<CalendarIcon />}
                onViewAll={() => setCurrentView('events')}
                color="#f57c00"
              />
            </Grid>
            <Grid size={{xs:12,lg:6}}>
              <ActivityCard
                title="💬 Teacher Feedback"
                items={(recentFeedback || []).map(feedback => ({
                  id: feedback.id,
                  title: `${feedback.subject} Feedback`,
                  subtitle: `${feedback.teacherName} • ${feedback.studentName}`,
                  grade: `${feedback.rating || 4}/5`
                }))}
                icon={<MessageIcon />}
                onViewAll={() => setCurrentView('communication')}
                color="#7b1fa2"
              />
            </Grid>
            <Grid size={{xs:12,lg:6}}>
              <ActivityCard
                title="📝 Pending Assignments"
                items={(assignments || []).filter(a => a.status === 'pending').map(assignment => ({
                  id: assignment.id,
                  title: assignment.title,
                  subtitle: `Due: ${new Date(assignment.dueDate).toLocaleDateString()}`,
                  status: assignment.priority
                }))}
                icon={<AssignmentIcon />}
                onViewAll={() => setCurrentView('assignments')}
                color="#d32f2f"
              />
            </Grid>
          </Grid>
        </motion.div>

        {/* Children Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, mt: 5, color: '#1a1a1a' }}>
            👨‍👩‍👧‍👦 My Children
          </Typography>
          <Grid container spacing={4}>
            {(children || []).map((child, index) => (
              <Grid size={{xs:12,md:6}} key={child.id || index}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '2px solid #1976d230',
                    background: 'linear-gradient(135deg, #1976d208 0%, #1976d204 100%)',
                    '&:hover': {
                      boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: '#1976d2',
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          mr: 3,
                          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
                        }}
                      >
                        {child.name ? child.name.split(' ').map(n => n[0]).join('') : 'NA'}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a1a1a', mb: 1 }}>
                          {child.name}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#555', fontWeight: 500 }}>
                          Class {child.class}{child.section} • Roll #{child.rollNumber}
                        </Typography>
                        <Chip
                          label={`ID: ${child.studentId}`}
                          size="small"
                          sx={{ mt: 1, bgcolor: '#1976d220', color: '#1976d2', fontWeight: 'bold' }}
                        />
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid size={{xs:6}}>
                        <Paper sx={{ p: 2, bgcolor: '#4caf5015', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>
                            Average Grade
                          </Typography>
                          <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                            {child.avgGrade?.toFixed(1) || '87.3'}%
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid size={{xs:6}}>
                        <Paper sx={{ p: 2, bgcolor: '#2196f315', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>
                            Attendance
                          </Typography>
                          <Typography variant="h4" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                            {child.attendance?.toFixed(1) || '94.5'}%
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a1a1a' }}>
                      📚 Subjects ({child.subjects?.length || 5})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(child.subjects || ['Math', 'Science', 'English', 'History', 'Art']).map((subject, idx) => (
                        <Chip
                          key={idx}
                          label={subject}
                          sx={{
                            bgcolor: '#1976d2',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': { bgcolor: '#1565c0' }
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: '#f5f5f5'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={80} thickness={4} sx={{ color: '#1976d2', mb: 3 }} />
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <UnifiedDashboardLayout
      title="Parent Dashboard"
      menuItems={menuItems}
      currentView={currentView}
      onViewChange={setCurrentView}
      userStats={{
        totalChildren: dashboardData.stats.totalChildren || 2,
        totalCourses: dashboardData.stats.totalCourses || 8,
        recentGrades: dashboardData.stats.recentGrades || 5,
        pendingMeetings: dashboardData.stats.pendingMeetings || 3,
      }}
      notifications={
        (dashboardData.upcomingEvents?.length || 3) + 
        (dashboardData.assignments?.filter(a => a.status === 'pending').length || 2)
      }
    >
      <AnimatePresence mode="wait">
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              fontSize: '1rem',
              fontWeight: 'bold',
              '& .MuiAlert-message': { fontSize: '1rem' }
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {currentView === 'dashboard' ? (
          renderDashboardContent()
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: '#1a1a1a' }}>
              {menuItems.find(item => item.key === currentView)?.label || 'Dashboard'}
            </Typography>
            <Paper sx={{ 
              p: 6, 
              borderRadius: 4, 
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '2px solid #1976d230'
            }}>
              <Avatar sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: '#1976d2', 
                mx: 'auto', 
                mb: 3,
                fontSize: '3rem'
              }}>
                🚧
              </Avatar>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1a1a1a' }}>
                Section Under Development
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                We're working on bringing you comprehensive {currentView} management features.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => setCurrentView('dashboard')}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem'
                }}
              >
                Back to Dashboard
              </Button>
            </Paper>
          </Box>
        )}
      </AnimatePresence>
    </UnifiedDashboardLayout>
  );
};

export default EnhancedParentDashboard;
