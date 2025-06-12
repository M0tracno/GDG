import React, { Suspense, useState, useEffect } from 'react';
import { 
  Box, 
  CircularProgress, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import UnifiedDashboardLayout from '../components/layout/UnifiedDashboardLayout';
import useDashboard from '../hooks/useDashboard';
import EnhancedFacultyService from '../services/enhancedFacultyService';

// Icons
import {
  Email as CommunicationIcon,
  Book as CoursesIcon,
  People as StudentsIcon,
  Assignment as AssignmentIcon,
  Grading as GradingIcon,
  Quiz as QuizIcon,
  EventNote as AttendanceIcon,
  Feedback as FeedbackIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  TrendingUp,
  Schedule,
  Notifications,
  Settings,
  MoreVert,
  Add,
  Refresh,
  CheckCircle,
  Warning,
  School,
  Class
} from '@mui/icons-material';

// Styled components for modern design
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
  },
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  borderRadius: 16,
  background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
  border: `1px solid ${color}30`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${color}20`,
  },
}));

const DashboardHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: 20,
  padding: theme.spacing(3),
  color: 'white',
  marginBottom: theme.spacing(3),
}));

// Lazy load faculty components
const FacultyCourses = React.lazy(() => import('../components/faculty/FacultyCourses'));
const StudentList = React.lazy(() => import('../components/faculty/StudentList'));
const GradeAssignments = React.lazy(() => import('../components/faculty/GradeAssignments'));
const QuizCreation = React.lazy(() => import('../components/faculty/QuizCreation'));
const QuizManagement = React.lazy(() => import('../components/faculty/QuizManagementNew'));
const CourseAttendance = React.lazy(() => import('../components/faculty/CourseAttendanceNew'));
const FacultyFeedback = React.lazy(() => import('../components/faculty/FacultyFeedbackNew'));
const QuizAnalytics = React.lazy(() => import('../components/faculty/QuizAnalytics'));
const FacultyCommunication = React.lazy(() => import('../components/faculty/FacultyCommunicationNew'));

const LoadingComponent = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
    <CircularProgress size={60} thickness={4} />
  </Box>
);

const FacultyDashboard = () => {
  const {
    loading,
    error,
    stats,
    notifications,
    currentView,
    handleViewChange,
    refreshData
  } = useDashboard('faculty');
  // Enhanced state management
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [refreshing, setRefreshing] = useState(false);

  // Load all dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setRefreshing(true);
    try {
      // Load faculty profile
      const profileResult = await EnhancedFacultyService.getFacultyProfile();
      if (profileResult.success) {
        setFacultyProfile(profileResult.data);
      }

      // Load dashboard stats
      const statsResult = await EnhancedFacultyService.getDashboardStats();
      if (statsResult.success) {
        setDashboardStats(statsResult.data);
      }

      // Load recent activity
      const activityResult = await EnhancedFacultyService.getRecentActivity();
      if (activityResult.success) {
        setRecentActivity(activityResult.data);
      }

      showSnackbar('Dashboard data loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showSnackbar('Error loading dashboard data', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  // Menu items for faculty dashboard
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard Overview', icon: <DashboardIcon /> },
    { key: 'courses', label: 'My Courses', icon: <CoursesIcon /> },
    { key: 'students', label: 'Students', icon: <StudentsIcon /> },
    { key: 'assignments', label: 'Assignments', icon: <AssignmentIcon /> },
    { key: 'grading', label: 'Grading', icon: <GradingIcon /> },
    { key: 'quizzes', label: 'Quiz Management', icon: <QuizIcon /> },
    { key: 'attendance', label: 'Attendance', icon: <AttendanceIcon /> },
    { key: 'feedback', label: 'Feedback', icon: <FeedbackIcon /> },
    { key: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { key: 'communication', label: 'Communication', icon: <CommunicationIcon /> },
  ];

  // Dashboard Overview Component
  const DashboardOverview = () => {
    if (!facultyProfile || !dashboardStats) {
      return <LoadingComponent />;
    }

    const statItems = [
      {
        title: 'Total Courses',
        value: dashboardStats.totalCourses,
        icon: <CoursesIcon />,
        color: '#667eea',
        trend: '+2 this semester'
      },
      {
        title: 'Total Students',
        value: dashboardStats.totalStudents,
        icon: <StudentsIcon />,
        color: '#4CAF50',
        trend: `${dashboardStats.activeStudents} active`
      },
      {
        title: 'Assignments',
        value: dashboardStats.totalAssignments,
        icon: <AssignmentIcon />,
        color: '#FF9800',
        trend: `${dashboardStats.pendingGrades} pending`
      },
      {
        title: 'Attendance Rate',
        value: `${dashboardStats.averageAttendance}%`,
        icon: <AttendanceIcon />,
        color: '#2196F3',
        trend: '+2.3% this month'
      }
    ];

    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <DashboardHeader>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{xs:12,md:8}}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '1.5rem'
                  }}
                >
                  {facultyProfile.firstName?.[0]}{facultyProfile.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Welcome back, {facultyProfile.firstName}!
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {facultyProfile.title} - {facultyProfile.department}
                  </Typography>
                  <Chip 
                    label={`${facultyProfile.experience} Experience`}
                    sx={{ 
                      mt: 1, 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white' 
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid size={{xs:12,md:4}}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={loadDashboardData}
                  disabled={refreshing}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                  }}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <IconButton sx={{ color: 'white' }}>
                  <Notifications />
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                  <Settings />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
          {refreshing && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}
        </DashboardHeader>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statItems.map((stat, index) => (
            <Grid size={{xs:12,sm:6,md:3}} key={index}>
              <StatCard color={stat.color}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: `${stat.color}20`,
                        color: stat.color
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color={stat.color}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.trend}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid size={{xs:12,md:4}}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <List>
                  <ListItem 
                    button 
                    onClick={() => handleViewChange('assignments')}
                    sx={{ borderRadius: 2, mb: 1 }}
                  >
                    <ListItemIcon>
                      <Add color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Create Assignment" />
                  </ListItem>
                  <ListItem 
                    button 
                    onClick={() => handleViewChange('quizzes')}
                    sx={{ borderRadius: 2, mb: 1 }}
                  >
                    <ListItemIcon>
                      <QuizIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Create Quiz" />
                  </ListItem>
                  <ListItem 
                    button 
                    onClick={() => handleViewChange('attendance')}
                    sx={{ borderRadius: 2, mb: 1 }}
                  >
                    <ListItemIcon>
                      <AttendanceIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Mark Attendance" />
                  </ListItem>
                  <ListItem 
                    button 
                    onClick={() => handleViewChange('grading')}
                    sx={{ borderRadius: 2, mb: 1 }}
                  >
                    <ListItemIcon>
                      <GradingIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Grade Submissions" />
                  </ListItem>
                </List>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{xs:12,md:8}}>
            <StyledCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Recent Activity
                  </Typography>
                  <Button size="small" endIcon={<TrendingUp />}>
                    View All
                  </Button>
                </Box>
                <List>
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: '50%',
                              bgcolor: activity.type === 'submission' ? '#4CAF50' : 
                                      activity.type === 'grading' ? '#FF9800' : '#2196F3',
                              color: 'white'
                            }}
                          >
                            {activity.type === 'submission' ? <AssignmentIcon fontSize="small" /> :
                             activity.type === 'grading' ? <GradingIcon fontSize="small" /> :
                             <CheckCircle fontSize="small" />}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.timestamp}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentActivity.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    );
  };
  // Render content based on current view
  const renderContent = () => {
    if (loading && currentView === 'dashboard') {
      return <LoadingComponent />;
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading dashboard data: {error}
          <Button onClick={refreshData} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      );
    }

    switch (currentView) {
      case 'dashboard':
      default:
        return <DashboardOverview />;
      case 'courses':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <FacultyCourses />
          </Suspense>
        );
      case 'students':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <StudentList />
          </Suspense>
        );
      case 'assignments':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <GradeAssignments />
          </Suspense>
        );
      case 'grading':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <GradeAssignments />
          </Suspense>
        );
      case 'quizzes':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <QuizManagement />
          </Suspense>
        );
      case 'attendance':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <CourseAttendance />
          </Suspense>
        );
      case 'feedback':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <FacultyFeedback />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <QuizAnalytics />
          </Suspense>
        );
      case 'communication':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <FacultyCommunication />
          </Suspense>
        );
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>      <UnifiedDashboardLayout
        title="Faculty Dashboard"
        menuItems={menuItems}
        currentView={currentView}
        onViewChange={handleViewChange}
        userStats={dashboardStats || {}}
        notifications={notifications || 0}
      >
        {renderContent()}
      </UnifiedDashboardLayout>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FacultyDashboard;

