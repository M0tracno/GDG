import React, { useState, useEffect } from 'react';
import { 
  Close as CloseIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  AutorenewRounded as AIIcon,
  Search as SearchIcon,
  Feedback as FeedbackIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import makeStyles from '../../utils/makeStylesCompat';
import { generatePersonalizedFeedback } from '../../services/aiService';
import EnhancedFacultyService from '../../services/enhancedFacultyService';
import { format } from 'date-fns';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Rating,
  Select,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Badge
} from '@mui/material';

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
    marginBottom: theme.spacing(3),
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
  tabsContainer: {
    marginBottom: theme.spacing(3),
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    '& .MuiTabs-root': {
      borderRadius: 12
    },
    '& .MuiTab-root': {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
      minHeight: 48
    },
    '& .Mui-selected': {
      color: '#667eea'
    },
    '& .MuiTabs-indicator': {
      background: 'linear-gradient(45deg, #667eea, #764ba2)',
      height: 3,
      borderRadius: 2
    }
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
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
  searchField: {
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      borderRadius: 12,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)'
    }
  },
  tableContainer: {
    borderRadius: 15,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    overflow: 'hidden'
  },
  headerRow: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    '& .MuiTableCell-head': {
      color: 'white',
      fontWeight: 700,
      fontSize: '1rem'
    }
  },
  modernTable: {
    '& .MuiTableCell-root': {
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: theme.spacing(2)
    },
    '& .MuiTableRow-root': {
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }
    }
  },
  primaryButton: {
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
    }
  },
  aiButton: {
    background: 'linear-gradient(45deg, #a142f4, #b968c7)',
    color: 'white',
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    '&:hover': {
      background: 'linear-gradient(45deg, #9333ea, #a855f7)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(161, 66, 244, 0.3)'
    }
  },
  feedbackCard: {
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)'
    }
  },
  statusChip: {
    borderRadius: 20,
    fontWeight: 600
  },
  sentChip: {
    background: 'linear-gradient(45deg, #4caf50, #45a049)',
    color: 'white'
  },
  draftChip: {
    background: 'linear-gradient(45deg, #ff9800, #f57c00)',
    color: 'white'
  },
  pendingChip: {
    background: 'linear-gradient(45deg, #2196f3, #1976d2)',
    color: 'white'
  },
  modernDialog: {
    '& .MuiDialog-paper': {
      borderRadius: 20,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
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
  emptyStateIcon: {
    fontSize: '4rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2)
  },
  noDataContainer: {
    textAlign: 'center',
    padding: theme.spacing(6),
    '& .MuiTypography-root': {
      color: theme.palette.text.secondary,
      fontWeight: 500
    }
  }
}));

const FacultyFeedback = () => {
  const theme = useTheme();
  const classes = useStyles();
  const enhancedFacultyService = new EnhancedFacultyService();
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [feedbackDialog, setFeedbackDialog] = useState({ open: false, feedback: null, mode: 'create' });
  const [newFeedback, setNewFeedback] = useState({
    studentId: '',
    courseId: '',
    subject: '',
    content: '',
    rating: 0,
    category: 'academic'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dashboardStats, setDashboardStats] = useState({
    totalFeedback: 0,
    sentToday: 0,
    avgRating: 0,
    responseRate: 0
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load courses
      const coursesResult = await enhancedFacultyService.getCourses();
      if (coursesResult.success) {
        setCourses(coursesResult.data);
      } else {
        // Mock courses
        setCourses([
          { id: 'CS101', name: 'Introduction to Computer Science', code: 'CS101' },
          { id: 'CS201', name: 'Data Structures & Algorithms', code: 'CS201' },
          { id: 'CS301', name: 'Software Engineering', code: 'CS301' }
        ]);
      }

      // Load students
      const studentsResult = await enhancedFacultyService.getStudents();
      if (studentsResult.success) {
        setStudents(studentsResult.data);
      } else {
        // Mock students
        setStudents([
          { id: 'S1001', firstName: 'Alex', lastName: 'Johnson', studentId: 'CS2024001' },
          { id: 'S1002', firstName: 'Emma', lastName: 'Wilson', studentId: 'CS2024002' },
          { id: 'S1003', firstName: 'Michael', lastName: 'Brown', studentId: 'CS2024003' },
          { id: 'S1004', firstName: 'Sophia', lastName: 'Davis', studentId: 'CS2024004' },
          { id: 'S1005', firstName: 'Daniel', lastName: 'Miller', studentId: 'CS2024005' }
        ]);
      }

      // Load feedback data
      await loadFeedbackData();

    } catch (error) {
      console.error('Error loading initial data:', error);
      setSnackbar({
        open: true,
        message: 'Error loading data. Using sample data.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbackData = async () => {
    try {
      // Generate mock feedback data
      const mockFeedback = [
        {
          id: 'F001',
          studentId: 'S1001',
          studentName: 'Alex Johnson',
          courseId: 'CS101',
          courseName: 'Introduction to Computer Science',
          subject: 'Excellent Progress in Programming',
          content: 'Alex has shown remarkable improvement in programming concepts. Keep up the excellent work!',
          rating: 5,
          category: 'academic',
          status: 'sent',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'F002',
          studentId: 'S1002',
          studentName: 'Emma Wilson',
          courseId: 'CS201',
          courseName: 'Data Structures & Algorithms',
          subject: 'Need for Additional Practice',
          content: 'Emma would benefit from additional practice with algorithm complexity. I recommend reviewing the textbook examples.',
          rating: 3,
          category: 'improvement',
          status: 'draft',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          sentAt: null
        },
        {
          id: 'F003',
          studentId: 'S1003',
          studentName: 'Michael Brown',
          courseId: 'CS301',
          courseName: 'Software Engineering',
          subject: 'Outstanding Team Collaboration',
          content: 'Michael demonstrates excellent leadership skills in group projects. His collaboration and communication are exemplary.',
          rating: 5,
          category: 'behavioral',
          status: 'sent',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'F004',
          studentId: 'S1004',
          studentName: 'Sophia Davis',
          courseId: 'CS101',
          courseName: 'Introduction to Computer Science',
          subject: 'Creative Problem Solving',
          content: 'Sophia consistently provides creative solutions to programming challenges. Her analytical thinking is impressive.',
          rating: 4,
          category: 'academic',
          status: 'pending',
          createdAt: new Date().toISOString(),
          sentAt: null
        }
      ];

      setFeedback(mockFeedback);

      // Calculate dashboard stats
      const totalFeedback = mockFeedback.length;
      const sentToday = mockFeedback.filter(f => 
        f.sentAt && new Date(f.sentAt).toDateString() === new Date().toDateString()
      ).length;
      const avgRating = mockFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;
      const responseRate = Math.round((mockFeedback.filter(f => f.status === 'sent').length / totalFeedback) * 100);

      setDashboardStats({
        totalFeedback,
        sentToday,
        avgRating: Math.round(avgRating * 10) / 10,
        responseRate
      });

    } catch (error) {
      console.error('Error loading feedback data:', error);
    }
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
      setSnackbar({
        open: true,
        message: 'Data refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
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

  const handleCreateFeedback = () => {
    setFeedbackDialog({ open: true, feedback: null, mode: 'create' });
    setNewFeedback({
      studentId: '',
      courseId: '',
      subject: '',
      content: '',
      rating: 0,
      category: 'academic'
    });
  };

  const handleEditFeedback = (feedback) => {
    setFeedbackDialog({ open: true, feedback, mode: 'edit' });
    setNewFeedback({
      studentId: feedback.studentId,
      courseId: feedback.courseId,
      subject: feedback.subject,
      content: feedback.content,
      rating: feedback.rating,
      category: feedback.category
    });
  };

  const handleSaveFeedback = async () => {
    try {
      if (feedbackDialog.mode === 'create') {
        const newFeedbackItem = {
          id: `F${Date.now()}`,
          ...newFeedback,
          studentName: students.find(s => s.id === newFeedback.studentId)?.firstName + ' ' + students.find(s => s.id === newFeedback.studentId)?.lastName,
          courseName: courses.find(c => c.id === newFeedback.courseId)?.name,
          status: 'draft',
          createdAt: new Date().toISOString(),
          sentAt: null
        };
        setFeedback(prev => [...prev, newFeedbackItem]);
      } else {
        setFeedback(prev => prev.map(f => 
          f.id === feedbackDialog.feedback.id ? { ...f, ...newFeedback } : f
        ));
      }

      setFeedbackDialog({ open: false, feedback: null, mode: 'create' });
      setSnackbar({
        open: true,
        message: 'Feedback saved successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving feedback',
        severity: 'error'
      });
    }
  };

  const handleSendFeedback = async (feedbackId) => {
    try {
      setFeedback(prev => prev.map(f => 
        f.id === feedbackId ? { ...f, status: 'sent', sentAt: new Date().toISOString() } : f
      ));
      setSnackbar({
        open: true,
        message: 'Feedback sent successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error sending feedback',
        severity: 'error'
      });
    }
  };

  const handleGenerateAIFeedback = async () => {
    try {
      const aiContent = await generatePersonalizedFeedback({
        studentName: students.find(s => s.id === newFeedback.studentId)?.firstName || '',
        courseName: courses.find(c => c.id === newFeedback.courseId)?.name || '',
        category: newFeedback.category
      });
      
      setNewFeedback(prev => ({ ...prev, content: aiContent }));
      setSnackbar({
        open: true,
        message: 'AI feedback generated successfully',
        severity: 'success'
      });
    } catch (error) {
      // Fallback AI content
      const fallbackContent = `Based on recent performance, this student shows ${newFeedback.category === 'academic' ? 'strong academic progress' : newFeedback.category === 'behavioral' ? 'positive behavioral development' : 'areas for improvement'}. Continue encouraging their efforts and provide additional support where needed.`;
      setNewFeedback(prev => ({ ...prev, content: fallbackContent }));
    }
  };

  const filteredFeedback = feedback.filter(f => {
    const matchesSearch = f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || f.courseId === selectedCourse;
    const matchesStudent = !selectedStudent || f.studentId === selectedStudent;
    const matchesTab = tabValue === 0 || 
                      (tabValue === 1 && f.status === 'sent') ||
                      (tabValue === 2 && f.status === 'draft') ||
                      (tabValue === 3 && f.status === 'pending');
    
    return matchesSearch && matchesCourse && matchesStudent && matchesTab;
  });

  if (loading) {
    return (
      <div className={classes.root}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress size={60} />
        </Box>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {/* Statistics Dashboard */}
      <Grid container spacing={3} className={classes.statsContainer}>
        <Grid size={{xs:12,md:3}}>
          <Card className={classes.statCard}>
            <CardContent style={{ textAlign: 'center' }}>
              <FeedbackIcon className={classes.statIcon} />
              <Typography variant="h4" className={classes.statValue}>
                {dashboardStats.totalFeedback}
              </Typography>
              <Typography variant="caption" className={classes.statLabel}>
                Total Feedback
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs:12,md:3}}>
          <Card className={classes.statCard}>
            <CardContent style={{ textAlign: 'center' }}>
              <SendIcon className={classes.statIcon} style={{ color: '#4caf50' }} />
              <Typography variant="h4" className={classes.statValue} style={{ color: '#4caf50' }}>
                {dashboardStats.sentToday}
              </Typography>
              <Typography variant="caption" className={classes.statLabel}>
                Sent Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs:12,md:3}}>
          <Card className={classes.statCard}>
            <CardContent style={{ textAlign: 'center' }}>
              <StarIcon className={classes.statIcon} style={{ color: '#ff9800' }} />
              <Typography variant="h4" className={classes.statValue} style={{ color: '#ff9800' }}>
                {dashboardStats.avgRating}
              </Typography>
              <Typography variant="caption" className={classes.statLabel}>
                Average Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs:12,md:3}}>
          <Card className={classes.statCard}>
            <CardContent style={{ textAlign: 'center' }}>
              <TrendingUpIcon className={classes.statIcon} style={{ color: '#2196f3' }} />
              <Typography variant="h4" className={classes.statValue} style={{ color: '#2196f3' }}>
                {dashboardStats.responseRate}%
              </Typography>
              <Typography variant="caption" className={classes.statLabel}>
                Response Rate
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardStats.responseRate} 
                style={{ marginTop: 8, borderRadius: 4, height: 6 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper className={classes.paper}>
        <Box display="flex" alignItems="center" justifyContent="between">
          <Typography variant="h4" className={classes.title}>
            <FeedbackIcon style={{ fontSize: '3rem' }} />
            Student Feedback Management
          </Typography>
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

        {/* Tabs */}
        <Box className={classes.tabsContainer}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label={`All Feedback (${feedback.length})`} />
            <Tab label={`Sent (${feedback.filter(f => f.status === 'sent').length})`} />
            <Tab label={`Drafts (${feedback.filter(f => f.status === 'draft').length})`} />
            <Tab label={`Pending (${feedback.filter(f => f.status === 'pending').length})`} />
          </Tabs>
        </Box>

        {/* Filters and Actions */}
        <Grid container spacing={2} style={{ marginBottom: 24 }}>
          <Grid size={{xs:12,md:4}}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchField}
              InputProps={{
                startAdornment: <SearchIcon style={{ marginRight: 8, color: '#667eea' }} />
              }}
            />
          </Grid>
          <Grid size={{xs:12,md:3}}>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel>Filter by Course</InputLabel>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <MenuItem value="">All Courses</MenuItem>
                {courses.map(course => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{xs:12,md:3}}>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel>Filter by Student</InputLabel>
              <Select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <MenuItem value="">All Students</MenuItem>
                {students.map(student => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{xs:12,md:2}}>
            <Button
              fullWidth
              variant="contained"
              className={classes.primaryButton}
              startIcon={<EditIcon />}
              onClick={handleCreateFeedback}
              style={{ height: 56 }}
            >
              New Feedback
            </Button>
          </Grid>
        </Grid>

        {/* Feedback Table */}
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.modernTable}>
            <TableHead className={classes.headerRow}>
              <TableRow><TableCell>Student</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {filteredFeedback.map((feedbackItem) => (
                <TableRow key={feedbackItem.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        style={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          marginRight: 12,
                          width: 40,
                          height: 40
                        }}
                      >
                        {feedbackItem.studentName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="body1" fontWeight={500}>
                        {feedbackItem.studentName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {feedbackItem.courseName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight={500}>
                      {feedbackItem.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Rating value={feedbackItem.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      className={`${classes.statusChip} ${
                        feedbackItem.status === 'sent' ? classes.sentChip :
                        feedbackItem.status === 'draft' ? classes.draftChip :
                        classes.pendingChip
                      }`}
                      label={feedbackItem.status.toUpperCase()}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(feedbackItem.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditFeedback(feedbackItem)}
                          style={{ color: '#667eea' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {feedbackItem.status !== 'sent' && (
                        <Tooltip title="Send">
                          <IconButton 
                            size="small" 
                            onClick={() => handleSendFeedback(feedbackItem.id)}
                            style={{ color: '#4caf50' }}
                          >
                            <SendIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredFeedback.length === 0 && (
          <Box className={classes.noDataContainer}>
            <FeedbackIcon className={classes.emptyStateIcon} />
            <Typography variant="h6">
              No feedback found
            </Typography>
            <Typography variant="body2" style={{ marginTop: 8 }}>
              {tabValue === 0 ? 'Create your first feedback to get started' : 'No feedback matches the current filter criteria'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialog.open}
        onClose={() => setFeedbackDialog({ open: false, feedback: null, mode: 'create' })}
        maxWidth="md"
        fullWidth
        className={classes.modernDialog}
      >
        <DialogTitle>
          <Typography variant="h6" style={{ fontWeight: 600 }}>
            {feedbackDialog.mode === 'create' ? 'Create New Feedback' : 'Edit Feedback'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} style={{ marginTop: 8 }}>
            <Grid size={{xs:12,md:6}}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select
                  value={newFeedback.studentId}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, studentId: e.target.value }))}
                >
                  {students.map(student => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12,md:6}}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={newFeedback.courseId}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, courseId: e.target.value }))}
                >
                  {courses.map(course => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Subject"
                value={newFeedback.subject}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, subject: e.target.value }))}
              />
            </Grid>
            <Grid size={{xs:12,md:6}}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newFeedback.category}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="behavioral">Behavioral</MenuItem>
                  <MenuItem value="improvement">Improvement</MenuItem>
                  <MenuItem value="achievement">Achievement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12,md:6}}>
              <Box>
                <Typography component="legend" style={{ marginBottom: 8 }}>Rating</Typography>
                <Rating
                  value={newFeedback.rating}
                  onChange={(event, newValue) => setNewFeedback(prev => ({ ...prev, rating: newValue }))}
                  size="large"
                />
              </Box>
            </Grid>
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Feedback Content"
                value={newFeedback.content}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, content: e.target.value }))}
              />
            </Grid>
            <Grid size={{xs:12}}>
              <Button
                variant="outlined"
                className={classes.aiButton}
                startIcon={<AIIcon />}
                onClick={handleGenerateAIFeedback}
                disabled={!newFeedback.studentId || !newFeedback.courseId}
              >
                Generate AI Feedback
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog({ open: false, feedback: null, mode: 'create' })}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            className={classes.primaryButton}
            onClick={handleSaveFeedback}
            disabled={!newFeedback.studentId || !newFeedback.courseId || !newFeedback.subject}
          >
            Save Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          style={{ borderRadius: 12 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FacultyFeedback;
