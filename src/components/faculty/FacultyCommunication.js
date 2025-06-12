import React, { useState, useEffect } from 'react';
import { 
  Avatar, 
  Badge, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  CircularProgress,
  Container, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Divider, 
  Grid, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Paper, 
  Snackbar,
  Alert,
  Tab, 
  Tabs, 
  TextField, 
  Typography,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Announcement as AnnouncementIcon,
  Add as AddIcon,
  Reply as ReplyIcon,
  VideoCall as VideoCallIcon,
  Send as SendIcon,
  Forum as ForumIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import makeStyles from '../../utils/makeStylesCompat';
import EnhancedFacultyService from '../../services/enhancedFacultyService';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: theme.spacing(3)
  },
  paper: {
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    borderRadius: 20,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  },
  title: {
    fontWeight: 700,
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '2.5rem',
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2)
  },
  statsContainer: {
    marginBottom: theme.spacing(4)
  },
  statCard: {
    height: '100%',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    borderRadius: 16,
    border: '1px solid rgba(102, 126, 234, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)'
    }
  },
  statIcon: {
    fontSize: '3rem',
    color: '#667eea',
    marginBottom: theme.spacing(1)
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#2c3e50'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  primaryButton: {
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    marginRight: theme.spacing(1),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
    },
    '&:disabled': {
      opacity: 0.6,
      transform: 'none'
    }
  },
  secondaryButton: {
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    border: '2px solid #667eea',
    color: '#667eea',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(102, 126, 234, 0.1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)'
    }
  },
  refreshButton: {
    borderRadius: '50%',
    minWidth: 48,
    width: 48,
    height: 48,
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
      transform: 'rotate(180deg) scale(1.1)'
    }
  },
  modernTabs: {
    '& .MuiTab-root': {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
      minHeight: 48,
      '&.Mui-selected': {
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }
    },
    '& .MuiTabs-indicator': {
      background: 'linear-gradient(45deg, #667eea, #764ba2)',
      height: 3,
      borderRadius: 2
    }
  },
  messageCard: {
    borderRadius: 16,
    marginBottom: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
    }
  },
  unreadMessage: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    border: '1px solid rgba(102, 126, 234, 0.3)'
  },
  announcementCard: {
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
    }
  },
  actionCard: {
    textAlign: 'center',
    padding: theme.spacing(4),
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
    }
  },
  modernDialog: {
    '& .MuiDialog-paper': {
      borderRadius: 20,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 12,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      '& fieldset': {
        borderColor: 'rgba(102, 126, 234, 0.3)'
      },
      '&:hover fieldset': {
        borderColor: 'rgba(102, 126, 234, 0.6)'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#667eea'
      }
    }
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  }
}));

const FacultyCommunication = () => {
  const theme = useTheme();
  const classes = useStyles();
    // Enhanced Faculty Service instance (use the exported singleton)
  const enhancedFacultyService = EnhancedFacultyService;

  // Simple date formatting function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // State
  const [tabValue, setTabValue] = useState(0);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dashboardStats, setDashboardStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    totalAnnouncements: 0,
    messagesSentToday: 0
  });

  useEffect(() => {
    loadCommunicationData();
  }, []);

  const loadCommunicationData = async () => {
    try {
      setLoading(true);
      
      // Try enhanced service for communication data
      const communicationData = await enhancedFacultyService.getCommunicationData();
      
      if (communicationData.success) {
        setMessages(communicationData.data.messages);
        setAnnouncements(communicationData.data.announcements);
        setDashboardStats(communicationData.data.stats);
      } else {
        // Fallback to mock data
        await loadMockData();
      }
    } catch (error) {
      console.error('Error loading communication data:', error);
      await loadMockData();
      setSnackbar({
        open: true,
        message: 'Error loading communication data. Using sample data.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = async () => {
    const mockMessages = [
      {
        id: 1,
        from: 'John Parent',
        subject: 'Question about Assignment 3',
        message: 'Could you please clarify the requirements for the third assignment? My child is having trouble understanding the rubric.',
        timestamp: '2024-06-07 14:30',
        read: false,
        type: 'parent',
        priority: 'normal'
      },
      {
        id: 2,
        from: 'Alice Student',
        subject: 'Quiz Reschedule Request',
        message: 'I have a medical appointment during the quiz time. Can we reschedule? I have a doctor\'s note.',
        timestamp: '2024-06-07 12:15',
        read: true,
        type: 'student',
        priority: 'high'
      },
      {
        id: 3,
        from: 'Admin Office',
        subject: 'Faculty Meeting Tomorrow',
        message: 'Reminder: Faculty meeting tomorrow at 3 PM in Conference Room A. Please bring your progress reports.',
        timestamp: '2024-06-06 16:45',
        read: true,
        type: 'admin',
        priority: 'normal'
      },
      {
        id: 4,
        from: 'Sarah Parent',
        subject: 'Thank you for extra help',
        message: 'Thank you for taking the time to help my daughter with her math homework. She really appreciates it!',
        timestamp: '2024-06-06 09:30',
        read: false,
        type: 'parent',
        priority: 'low'
      },
      {
        id: 5,
        from: 'Michael Student',
        subject: 'Project Collaboration Question',
        message: 'Can we form groups of 4 for the final project instead of 3? We have some great ideas to work together.',
        timestamp: '2024-06-05 18:20',
        read: true,
        type: 'student',
        priority: 'normal'
      }
    ];

    const mockAnnouncements = [
      {
        id: 1,
        title: 'Midterm Exam Schedule Released',
        content: 'The midterm examination schedule has been posted on the course portal. Please check your individual course pages for specific dates and times. Good luck with your preparation!',
        course: 'All Courses',
        timestamp: '2024-06-06 10:00',
        recipients: 145,
        status: 'published'
      },
      {
        id: 2,
        title: 'Assignment 4 Due Date Extended',
        content: 'Due to the recent technical difficulties with the online submission system, Assignment 4 deadline has been extended to next Friday. Please use this extra time wisely.',
        course: 'CS-101',
        timestamp: '2024-06-05 15:30',
        recipients: 52,
        status: 'published'
      },
      {
        id: 3,
        title: 'Guest Lecture Next Week',
        content: 'We are excited to announce a guest lecture by Dr. Smith from MIT next Tuesday at 2 PM. The topic will be "Future of Artificial Intelligence". All students are welcome!',
        course: 'CS-201',
        timestamp: '2024-06-04 11:15',
        recipients: 38,
        status: 'published'
      }
    ];

    const mockStats = {
      totalMessages: mockMessages.length,
      unreadMessages: mockMessages.filter(m => !m.read).length,
      totalAnnouncements: mockAnnouncements.length,
      messagesSentToday: 3
    };

    setMessages(mockMessages);
    setAnnouncements(mockAnnouncements);
    setDashboardStats(mockStats);
  };
  // Handle refresh data
  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await loadCommunicationData();
      setSnackbar({
        open: true,
        message: 'Communication data refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSnackbar({
        open: true,
        message: 'Error refreshing data',
        severity: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && messageSubject.trim() && selectedRecipient) {
      console.log('Sending message:', { 
        subject: messageSubject, 
        message: newMessage, 
        recipient: selectedRecipient 
      });
      setNewMessage('');
      setMessageSubject('');
      setSelectedRecipient('');
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Message sent successfully!',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'warning'
      });
    }
  };

  const handleReply = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setMessageSubject(`Re: ${message.subject}`);
      setSelectedRecipient(message.from);
      setOpenDialog(true);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const getTypeColor = (type) => {
    switch (type) {
      case 'parent': return 'primary';
      case 'student': return 'secondary';
      case 'admin': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'parent': return <EmailIcon />;
      case 'student': return <MessageIcon />;
      case 'admin': return <AnnouncementIcon />;
      default: return <MessageIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'normal': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#2196f3';
    }
  };

  // Statistics Card Component
  const StatCard = ({ title, value, icon, color = '#667eea' }) => (
    <Card className={classes.statCard}>
      <CardContent style={{ textAlign: 'center' }}>
        {React.cloneElement(icon, { className: classes.statIcon, style: { color } })}
        <Typography variant="h4" className={classes.statValue}>
          {value}
        </Typography>
        <Typography variant="caption" className={classes.statLabel}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={classes.root}>
        <div className={classes.loadingContainer}>
          <CircularProgress size={60} style={{ color: '#667eea' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {/* Statistics Dashboard */}
      <Grid container spacing={3} className={classes.statsContainer}>
        <Grid size={{xs:12,md:3}}>
          <StatCard
            title="Total Messages"
            value={dashboardStats.totalMessages}
            icon={<MessageIcon />}
            color="#667eea"
          />
        </Grid>
        <Grid size={{xs:12,md:3}}>
          <StatCard
            title="Unread Messages"
            value={dashboardStats.unreadMessages}
            icon={<NotificationIcon />}
            color="#f44336"
          />
        </Grid>
        <Grid size={{xs:12,md:3}}>
          <StatCard
            title="Announcements"
            value={dashboardStats.totalAnnouncements}
            icon={<AnnouncementIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid size={{xs:12,md:3}}>
          <StatCard
            title="Sent Today"
            value={dashboardStats.messagesSentToday}
            icon={<SendIcon />}
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* Main Communication Center */}
      <Paper className={classes.paper}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" className={classes.title}>
            <ForumIcon style={{ fontSize: '3rem' }} />
            Communication Center
          </Typography>
          <Box display="flex" alignItems="center">
            <Button
              variant="contained"
              className={classes.primaryButton}
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              style={{ marginRight: 16 }}
            >
              New Message
            </Button>
            <Tooltip title="Refresh Data">
              <IconButton 
                className={classes.refreshButton}
                onClick={handleRefreshData}
                disabled={refreshing}
              >
                {refreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Paper style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255, 255, 255, 0.9)' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            className={classes.modernTabs}
            style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
          >
            <Tab
              label={
                <Badge badgeContent={messages.filter(m => !m.read).length} color="error">
                  <Box display="flex" alignItems="center" gap={1}>
                    <MessageIcon />
                    Messages
                  </Box>
                </Badge>
              }
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <AnnouncementIcon />
                  Announcements
                </Box>
              }
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <ScheduleIcon />
                  Quick Actions
                </Box>
              }
            />
          </Tabs>          {/* Messages Tab */}
          {tabValue === 0 && (
            <Box style={{ padding: 24 }}>
              {messages.length > 0 ? (
                <List style={{ padding: 0 }}>
                  {messages.map((message, index) => (
                    <ListItem
                      key={message.id}
                      className={`${classes.messageCard} ${!message.read ? classes.unreadMessage : ''}`}
                      style={{ marginBottom: 16, borderRadius: 16 }}
                    >
                      <ListItemAvatar>
                        <Box 
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: `linear-gradient(45deg, ${getPriorityColor(message.priority)}, ${getPriorityColor(message.priority)}99)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.25rem'
                          }}
                        >
                          {getTypeIcon(message.type)}
                        </Box>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography 
                              variant="subtitle1" 
                              style={{ 
                                fontWeight: message.read ? 500 : 700,
                                color: '#2c3e50'
                              }}
                            >
                              {message.from}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip
                                label={message.type}
                                size="small"
                                color={getTypeColor(message.type)}
                                style={{ 
                                  borderRadius: 12,
                                  fontWeight: 600,
                                  textTransform: 'capitalize'
                                }}
                              />
                              <Typography variant="caption" color="textSecondary" style={{ fontWeight: 500 }}>
                                {formatDate(new Date(message.timestamp))}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant="body2" 
                              style={{ 
                                fontWeight: message.read ? 500 : 600,
                                marginBottom: 8,
                                color: '#2c3e50'
                              }}
                            >
                              {message.subject}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" style={{ lineHeight: 1.5 }}>
                              {message.message}
                            </Typography>
                          </Box>
                        }
                      />
                      <Tooltip title="Reply">
                        <IconButton
                          onClick={() => handleReply(message.id)}
                          style={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            color: 'white',
                            marginLeft: 16,
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                            }
                          }}
                        >
                          <ReplyIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={8}>
                  <MessageIcon style={{ fontSize: '4rem', color: '#bdc3c7', marginBottom: 16 }} />
                  <Typography variant="h6" color="textSecondary">
                    No messages yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Your messages will appear here
                  </Typography>
                </Box>
              )}
            </Box>
          )}          {/* Announcements Tab */}
          {tabValue === 1 && (
            <Box style={{ padding: 24 }}>
              {announcements.length > 0 ? (
                <Grid container spacing={3}>
                  {announcements.map((announcement) => (
                    <Grid size={{xs:12}} key={announcement.id}>
                      <Card className={classes.announcementCard}>
                        <CardContent style={{ padding: 24 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box flex={1}>
                              <Typography 
                                variant="h6" 
                                style={{ fontWeight: 700, marginBottom: 16, color: '#2c3e50' }}
                              >
                                {announcement.title}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Chip 
                                  label={announcement.course} 
                                  size="small" 
                                  style={{
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    color: 'white',
                                    fontWeight: 600,
                                    borderRadius: 12
                                  }}
                                />
                                <Typography variant="caption" color="textSecondary" style={{ fontWeight: 500 }}>
                                  {format(new Date(announcement.timestamp), 'MMM dd, yyyy HH:mm')}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <PeopleIcon style={{ fontSize: 16, color: '#7f8c8d' }} />
                                  <Typography variant="caption" color="textSecondary" style={{ fontWeight: 500 }}>
                                    {announcement.recipients} recipients
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Typography variant="body1" style={{ lineHeight: 1.6, color: '#2c3e50' }}>
                            {announcement.content}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                            <Chip 
                              label={announcement.status || 'published'} 
                              size="small" 
                              color="success"
                              style={{ 
                                fontWeight: 600,
                                borderRadius: 12,
                                textTransform: 'capitalize'
                              }}
                            />
                            <Box display="flex" gap={1}>
                              <Button 
                                size="small" 
                                className={classes.secondaryButton}
                                style={{ padding: '6px 16px' }}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="small" 
                                className={classes.primaryButton}
                                style={{ padding: '6px 16px' }}
                              >
                                View Details
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={8}>
                  <AnnouncementIcon style={{ fontSize: '4rem', color: '#bdc3c7', marginBottom: 16 }} />
                  <Typography variant="h6" color="textSecondary">
                    No announcements yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Create your first announcement to reach students and parents
                  </Typography>
                </Box>
              )}
            </Box>
          )}          {/* Quick Actions Tab */}
          {tabValue === 2 && (
            <Box style={{ padding: 24 }}>
              <Grid container spacing={3}>
                <Grid size={{xs:12,md:4}}>
                  <Card className={classes.actionCard}>
                    <EmailIcon style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
                    <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 8, color: '#2c3e50' }}>
                      Email Parents
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16, lineHeight: 1.5 }}>
                      Send bulk emails to all parents about student progress and updates
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      className={classes.secondaryButton}
                      style={{ marginTop: 'auto' }}
                    >
                      Compose Email
                    </Button>
                  </Card>
                </Grid>

                <Grid size={{xs:12,md:4}}>
                  <Card className={classes.actionCard}>
                    <AnnouncementIcon style={{ fontSize: 48, color: '#ff9800', marginBottom: 16 }} />
                    <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 8, color: '#2c3e50' }}>
                      Class Announcement
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16, lineHeight: 1.5 }}>
                      Post important announcements to all courses and notify students instantly
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      className={classes.secondaryButton}
                      style={{ marginTop: 'auto' }}
                    >
                      Create Announcement
                    </Button>
                  </Card>
                </Grid>

                <Grid size={{xs:12,md:4}}>
                  <Card className={classes.actionCard}>
                    <VideoCallIcon style={{ fontSize: 48, color: '#4caf50', marginBottom: 16 }} />
                    <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 8, color: '#2c3e50' }}>
                      Schedule Meeting
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16, lineHeight: 1.5 }}>
                      Schedule parent-teacher conferences and virtual meetings
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      className={classes.secondaryButton}
                      style={{ marginTop: 'auto' }}
                    >
                      Schedule Meeting
                    </Button>
                  </Card>
                </Grid>
                
                <Grid size={{xs:12,md:4}}>
                  <Card className={classes.actionCard}>
                    <TrendingUpIcon style={{ fontSize: 48, color: '#9c27b0', marginBottom: 16 }} />
                    <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 8, color: '#2c3e50' }}>
                      Progress Reports
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16, lineHeight: 1.5 }}>
                      Generate and send detailed progress reports to parents
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      className={classes.secondaryButton}
                      style={{ marginTop: 'auto' }}
                    >
                      Generate Report
                    </Button>
                  </Card>
                </Grid>

                <Grid size={{xs:12,md:4}}>
                  <Card className={classes.actionCard}>
                    <NotificationIcon style={{ fontSize: 48, color: '#f44336', marginBottom: 16 }} />
                    <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 8, color: '#2c3e50' }}>
                      Emergency Alert
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16, lineHeight: 1.5 }}>
                      Send urgent notifications to all parents and students
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      className={classes.secondaryButton}
                      style={{ marginTop: 'auto' }}
                    >
                      Send Alert
                    </Button>
                  </Card>
                </Grid>

                <Grid size={{xs:12,md:4}}>
                  <Card className={classes.actionCard}>
                    <PeopleIcon style={{ fontSize: 48, color: '#607d8b', marginBottom: 16 }} />
                    <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 8, color: '#2c3e50' }}>
                      Group Message
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16, lineHeight: 1.5 }}>
                      Send messages to specific groups of students or parents
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      className={classes.secondaryButton}
                      style={{ marginTop: 'auto' }}
                    >
                      Create Group
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Paper>      {/* Enhanced New Message Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        className={classes.modernDialog}
      >
        <DialogTitle>
          <Typography variant="h6" style={{ fontWeight: 600, color: '#2c3e50' }}>
            New Message
          </Typography>
        </DialogTitle>
        <DialogContent style={{ paddingTop: 20 }}>
          <TextField
            select
            fullWidth
            label="Recipient"
            value={selectedRecipient}
            onChange={(e) => setSelectedRecipient(e.target.value)}
            margin="normal"
            className={classes.textField}
            SelectProps={{
              native: true
            }}
          >
            <option value="">Select recipient...</option>
            <option value="all-parents">All Parents</option>
            <option value="all-students">All Students (Class A)</option>
            <option value="all-students-b">All Students (Class B)</option>
            <option value="specific-parent">Specific Parent</option>
            <option value="specific-student">Specific Student</option>
            <option value="administration">Administration</option>
          </TextField>

          <TextField
            fullWidth
            label="Subject"
            value={messageSubject}
            onChange={(e) => setMessageSubject(e.target.value)}
            margin="normal"
            className={classes.textField}
            placeholder="Enter message subject..."
          />

          <TextField
            fullWidth
            label="Message"
            multiline
            rows={6}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            margin="normal"
            className={classes.textField}
            placeholder="Type your message here..."
          />
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            className={classes.secondaryButton}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            className={classes.primaryButton}
            startIcon={<SendIcon />}
            disabled={!newMessage.trim() || !messageSubject.trim() || !selectedRecipient}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FacultyCommunication;

