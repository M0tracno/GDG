import React, { useState, useEffect, Suspense } from 'react';
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
  School as SchoolIcon,
  Book as CoursesIcon,
  Assignment as AssignmentIcon,
  Grade as GradesIcon,
  Quiz as QuizIcon,
  EventNote as AttendanceIcon,
  Feedback as FeedbackIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  AccountCircle as ProfileIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import UnifiedDashboardLayout from '../components/layout/UnifiedDashboardLayout';
import StudentService from '../services/studentService';
import { useAuth } from '../auth/AuthContext';

// Lazy load student components
const StudentCourses = React.lazy(() => import('../components/student/Courses'));
const StudentAttendance = React.lazy(() => import('../components/student/StudentAttendance'));

const LoadingComponent = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
    <CircularProgress size={60} thickness={4} />
  </Box>
);

const StudentDashboard = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    profile: {},
    courses: [],
    stats: {},
    recentGrades: [],
    upcomingAssignments: [],
    recentFeedback: [],
    attendance: {}
  });
  const [currentView, setCurrentView] = useState('dashboard');

  // Menu items for student dashboard
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { key: 'courses', label: 'My Courses', icon: <CoursesIcon /> },
    { key: 'assignments', label: 'Assignments', icon: <AssignmentIcon /> },
    { key: 'grades', label: 'Grades & Progress', icon: <GradesIcon /> },
    { key: 'quizzes', label: 'Quizzes', icon: <QuizIcon /> },
    { key: 'attendance', label: 'Attendance', icon: <AttendanceIcon /> },
    { key: 'feedback', label: 'Feedback', icon: <FeedbackIcon /> },
  ];
  useEffect(() => {
    loadDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(loadDashboardData, 300000);
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Dashboard loading timeout, setting fallback data');
        setLoading(false);
        setDashboardData({
          profile: { 
            firstName: 'Demo', 
            lastName: 'Student',
            studentId: 'STU123456',
            email: 'demo.student@example.com',
            class: '12th Grade',
            section: 'A'
          },
          courses: [],
          stats: {
            totalCourses: 6,
            completedAssignments: 8,
            pendingAssignments: 3,
            averageGrade: 'B+',
            attendanceRate: 92
          },
          recentGrades: [],
          upcomingAssignments: [],
          recentFeedback: [],
          attendance: {}
        });
      }
    }, 10000); // 10 second timeout
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [loading]);
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const studentId = currentUser?.uid || currentUser?.id || 'demo-student';
      console.log('Loading dashboard data for student:', studentId);

      // Use Promise.allSettled instead of Promise.all to handle individual failures
      const [
        profileResponse,
        coursesResponse,
        assignmentsResponse,
        gradesResponse,
        feedbackResponse,
        attendanceResponse
      ] = await Promise.allSettled([
        StudentService.getStudentProfile(studentId),
        StudentService.getEnrolledCourses(studentId),
        StudentService.getAssignments(studentId),
        StudentService.getGrades(studentId),
        StudentService.getFeedback(studentId),
        StudentService.getAttendance(studentId)
      ]);      setDashboardData({
        profile: profileResponse.status === 'fulfilled' ? (profileResponse.value?.data || { 
          firstName: 'Demo', 
          lastName: 'Student',
          studentId: currentUser?.studentId || 'STU123456',
          email: currentUser?.email || 'demo.student@example.com',
          class: '12th Grade',
          section: 'A'
        }) : { 
          firstName: 'Demo', 
          lastName: 'Student',
          studentId: currentUser?.studentId || 'STU123456',
          email: currentUser?.email || 'demo.student@example.com',
          class: '12th Grade',
          section: 'A'
        },
        courses: coursesResponse.status === 'fulfilled' ? (coursesResponse.value?.data || []) : [],
        stats: {
          totalCourses: coursesResponse.status === 'fulfilled' ? (coursesResponse.value?.data?.length || 6) : 6,
          completedAssignments: assignmentsResponse.status === 'fulfilled' ? (assignmentsResponse.value?.data?.filter(a => a.status === 'completed').length || 8) : 8,
          pendingAssignments: assignmentsResponse.status === 'fulfilled' ? (assignmentsResponse.value?.data?.filter(a => a.status === 'pending').length || 3) : 3,
          averageGrade: gradesResponse.status === 'fulfilled' ? (gradesResponse.value?.data?.averageGrade || 'B+') : 'B+',
          attendanceRate: attendanceResponse.status === 'fulfilled' ? (attendanceResponse.value?.data?.percentage || 92) : 92
        },
        recentGrades: gradesResponse.status === 'fulfilled' ? (gradesResponse.value?.data || []) : [],
        upcomingAssignments: assignmentsResponse.status === 'fulfilled' ? (assignmentsResponse.value?.data?.filter(a => a.status === 'pending') || []) : [],
        recentFeedback: feedbackResponse.status === 'fulfilled' ? (feedbackResponse.value?.data || []) : [],
        attendance: attendanceResponse.status === 'fulfilled' ? (attendanceResponse.value?.data || {}) : {}
      });

      console.log('Dashboard data loaded successfully');

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set fallback data
      setDashboardData({
        profile: { 
          firstName: 'Demo', 
          lastName: 'Student',
          studentId: currentUser?.studentId || 'STU123456',
          email: currentUser?.email || 'demo.student@example.com',
          class: '12th Grade',
          section: 'A'
        },
        courses: [],
        stats: {
          totalCourses: 6,
          completedAssignments: 8,
          pendingAssignments: 3,
          averageGrade: 'B+',
          attendanceRate: 92
        },
        recentGrades: [],
        upcomingAssignments: [],
        recentFeedback: [],
        attendance: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          border: `2px solid ${alpha(color, 0.2)}`,
          borderRadius: 3,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: color,
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
            {trend && (
              <Chip
                label={trend}
                size="small"
                sx={{
                  bgcolor: alpha(color, 0.1),
                  color: color,
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const RecentActivityCard = ({ title, items, icon, onViewAll }) => (
    <Card sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
          </Box>
          {onViewAll && (
            <Button size="small" onClick={onViewAll}>
              View All
            </Button>
          )}
        </Box>
        <List dense>
          {items.slice(0, 4).map((item, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.title || item.name}
                secondary={item.subtitle || item.description}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
          {items.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No recent activity
            </Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );

  const renderDashboardContent = () => {
    const { profile, stats } = dashboardData;

    return (
      <Box sx={{ p: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{xs:12,md:8}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem'
                    }}
                  >
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Welcome back, {profile.firstName}!
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {profile.class} - Section {profile.section}
                    </Typography>
                    <Chip
                      label={`Student ID: ${profile.studentId}`}
                      variant="outlined"
                      sx={{ mt: 1, fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid size={{xs:12,md:4}}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadDashboardData}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Enrolled Courses"
                value={stats.totalCourses}
                icon={<SchoolIcon />}
                color="#2196F3"
                subtitle="Active this semester"
              />
            </Grid>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Completed Assignments"
                value={stats.completedAssignments}
                icon={<CheckIcon />}
                color="#4CAF50"
                subtitle={`${stats.pendingAssignments} pending`}
                trend="On Track"
              />
            </Grid>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Average Grade"
                value={stats.averageGrade}
                icon={<StarIcon />}
                color="#FF9800"
                subtitle="Overall performance"
                trend="Good"
              />
            </Grid>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Attendance Rate"
                value={`${stats.attendanceRate}%`}
                icon={<AttendanceIcon />}
                color="#9C27B0"
                subtitle="This semester"
                trend="Excellent"
              />
            </Grid>
          </Grid>

          {/* Recent Activity and Quick Actions */}
          <Grid container spacing={3}>
            <Grid size={{xs:12,md:6}}>
              <RecentActivityCard
                title="Recent Grades"
                items={dashboardData.recentGrades.map(grade => ({
                  title: grade.subject || grade.courseName,
                  subtitle: `Grade: ${grade.grade} | ${new Date(grade.date).toLocaleDateString()}`,
                  description: grade.assignment
                }))}
                icon={<GradesIcon />}
                onViewAll={() => setCurrentView('grades')}
              />
            </Grid>
            <Grid size={{xs:12,md:6}}>
              <RecentActivityCard
                title="Upcoming Assignments"
                items={dashboardData.upcomingAssignments.map(assignment => ({
                  title: assignment.title,
                  subtitle: `Due: ${new Date(assignment.dueDate).toLocaleDateString()}`,
                  description: assignment.subject
                }))}
                icon={<AssignmentIcon />}
                onViewAll={() => setCurrentView('assignments')}
              />
            </Grid>
          </Grid>
        </motion.div>
      </Box>
    );
  };
  if (loading) {
    return (
      <UnifiedDashboardLayout
        title="Student Dashboard"
        menuItems={menuItems}
        currentView={currentView}
        onViewChange={setCurrentView}
        userStats={{}}
        notifications={0}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', p: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading your dashboard...
            </Typography>
          </Box>
        </Box>
      </UnifiedDashboardLayout>
    );
  }

  return (
    <UnifiedDashboardLayout
      title="Student Dashboard"
      menuItems={menuItems}
      currentView={currentView}
      onViewChange={setCurrentView}
      userStats={{
        totalCourses: dashboardData.stats.totalCourses || 0,
        completedAssignments: dashboardData.stats.completedAssignments || 0,
        pendingAssignments: dashboardData.stats.pendingAssignments || 0,
        averageGrade: dashboardData.stats.averageGrade || 'N/A',
      }}
      notifications={dashboardData.upcomingAssignments.length + dashboardData.recentFeedback.length}
    >
      <AnimatePresence mode="wait">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {currentView === 'dashboard' ? (
          renderDashboardContent()
        ) : currentView === 'courses' ? (
          <Suspense fallback={<LoadingComponent />}>
            <StudentCourses />
          </Suspense>
        ) : currentView === 'attendance' ? (
          <Suspense fallback={<LoadingComponent />}>
            <StudentAttendance />
          </Suspense>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
              {menuItems.find(item => item.key === currentView)?.label || 'Dashboard'}
            </Typography>
            <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                This section is under development
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We're working on bringing you comprehensive {currentView} features.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setCurrentView('dashboard')}
                sx={{ textTransform: 'none' }}
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

export default StudentDashboard;

