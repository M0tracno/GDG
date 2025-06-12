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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import UnifiedDashboardLayout from '../components/layout/UnifiedDashboardLayout';
import ParentService from '../services/parentService';

const ModernParentDashboard = () => {
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
        profile: profileResponse.data || {},
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
                color: 'white',
                width: 56,
                height: 56,
                boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
              }}
            >
              {icon}
            </Avatar>
            {trend && (
              <Chip
                label={trend}
                size="small"
                color={trend.includes('+') ? 'success' : 'default'}
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: color, mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
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
            height: 4,
            background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.5)} 100%)`,
          }}
        />
      </Card>
    </motion.div>
  );

  const RecentActivityCard = ({ title, items, icon, onViewAll }) => (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              {icon}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
          </Box>
          <Button size="small" onClick={onViewAll} sx={{ textTransform: 'none' }}>
            View All
          </Button>
        </Box>
        <List sx={{ py: 0 }}>
          {items.slice(0, 3).map((item, index) => (
            <React.Fragment key={item.id || index}>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <StarIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.title || item.subject || item.description}
                  secondary={item.subtitle || item.date || item.studentName}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: '0.875rem' }}
                />
                {item.grade && (
                  <Chip
                    label={item.grade}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </ListItem>
              {index < Math.min(items.length - 1, 2) && <Divider component="li" />}
            </React.Fragment>
          ))}
          {items.length === 0 && (
            <ListItem sx={{ px: 0, py: 2 }}>
              <ListItemText
                primary="No recent activity"
                secondary="Check back later for updates"
                sx={{ textAlign: 'center' }}
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                Welcome back, {dashboardData.profile.firstName || 'Parent'}! 👋
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Here's your children's academic overview
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    backdropFilter: 'blur(10px)',
                  }}
                  startIcon={<RefreshIcon />}
                  onClick={loadDashboardData}
                >
                  Refresh Data
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                  startIcon={<EventIcon />}
                  onClick={() => setCurrentView('events')}
                >
                  View Calendar
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            />
          </Paper>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Total Children"
                value={stats.totalChildren || children.length}
                icon={<ChildrenIcon />}
                color={theme.palette.primary.main}
                subtitle="Enrolled students"
              />
            </Grid>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Active Courses"
                value={stats.totalCourses || 0}
                icon={<SchoolIcon />}
                color={theme.palette.success.main}
                subtitle="This semester"
              />
            </Grid>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Recent Grades"
                value={stats.recentGrades || recentGrades.length}
                icon={<GradesIcon />}
                color={theme.palette.info.main}
                subtitle="This week"
                trend={stats.recentGrades > 0 ? `+${stats.recentGrades}` : ''}
              />
            </Grid>
            <Grid size={{xs:12,sm:6,md:3}}>
              <StatCard
                title="Upcoming Events"
                value={stats.pendingMeetings || upcomingEvents.length}
                icon={<EventIcon />}
                color={theme.palette.warning.main}
                subtitle="Next 30 days"
              />
            </Grid>
          </Grid>
        </motion.div>

        {/* Performance Overview */}
        {stats.avgGrade > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Academic Performance Overview
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{xs:12,md:6}}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        Average Grade: {stats.avgGrade?.toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={stats.avgGrade || 0}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{xs:12,md:6}}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        Attendance Rate: {stats.avgAttendance?.toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={stats.avgAttendance || 0}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            background: `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.success.main} 100%)`,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Activity Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Grid container spacing={3}>
            <Grid size={{xs:12,md:6}}>
              <RecentActivityCard
                title="Recent Grades"
                items={recentGrades.map(grade => ({
                  id: grade.id,
                  title: `${grade.subject} - ${grade.assignment}`,
                  subtitle: `${grade.studentName} • ${new Date(grade.date).toLocaleDateString()}`,
                  grade: grade.grade
                }))}
                icon={<GradesIcon />}
                onViewAll={() => setCurrentView('grades')}
              />
            </Grid>
            <Grid size={{xs:12,md:6}}>
              <RecentActivityCard
                title="Upcoming Events"
                items={upcomingEvents.map(event => ({
                  id: event.id,
                  title: event.title,
                  subtitle: `${new Date(event.date).toLocaleDateString()} • ${event.time}`,
                  description: event.description
                }))}
                icon={<CalendarIcon />}
                onViewAll={() => setCurrentView('events')}
              />
            </Grid>
            <Grid size={{xs:12,md:6}}>
              <RecentActivityCard
                title="Teacher Feedback"
                items={recentFeedback.map(feedback => ({
                  id: feedback.id,
                  title: `${feedback.subject} Feedback`,
                  subtitle: `${feedback.teacherName} • ${feedback.studentName}`,
                  description: feedback.feedback
                }))}
                icon={<MessageIcon />}
                onViewAll={() => setCurrentView('communication')}
              />
            </Grid>
            <Grid size={{xs:12,md:6}}>
              <RecentActivityCard
                title="Pending Assignments"
                items={assignments.filter(a => a.status === 'pending').map(assignment => ({
                  id: assignment.id,
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
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
        totalChildren: dashboardData.stats.totalChildren || 0,
        totalCourses: dashboardData.stats.totalCourses || 0,
        recentGrades: dashboardData.stats.recentGrades || 0,
        pendingMeetings: dashboardData.stats.pendingMeetings || 0,
      }}
      notifications={dashboardData.upcomingEvents.length + dashboardData.assignments.filter(a => a.status === 'pending').length}
    >
      <AnimatePresence mode="wait">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {currentView === 'dashboard' ? (
          renderDashboardContent()
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
                We're working on bringing you comprehensive {currentView} management features.
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

export default ModernParentDashboard;
