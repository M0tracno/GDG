import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as CopyIcon,
  HelpOutline as QuestionIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  PlayArrow as ActiveIcon,
  Done as CompletedIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  IconButton,
  LinearProgress,
  Tab,
  Tabs,
  TextField,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import facultyService from '../../services/facultyService';
import enhancedFacultyService from '../../services/enhancedFacultyService';
import makeStyles from '../../utils/makeStylesCompat';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: 24,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  color: 'white',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '50%',
  }
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  }
}));

const QuizCard = styled(StyledCard)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '& .MuiCardContent-root': {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
  }
}));

const StatusAvatar = styled(Avatar)(({ theme, status }) => {
  const getColor = () => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'scheduled': return '#2196F3';
      case 'completed': return '#9E9E9E';
      default: return '#FF9800';
    }
  };
  
  return {
    width: 48,
    height: 48,
    backgroundColor: getColor(),
    fontSize: '1.2rem',
    fontWeight: 'bold',
  };
});

const ActionButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    transform: 'scale(1.1)',
  }
}));

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: theme.spacing(3)
  },
  statsContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap'
  },
  quizGrid: {
    '& .MuiGrid-item': {
      transition: 'all 0.3s ease',
    }
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(6),
    color: '#666',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  fabButton: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    }
  }
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`quiz-tabpanel-${index}`}
      aria-labelledby={`quiz-tab-${index}`}
      {...other}
    >
      {value === index && <Box style={{ padding: '24px' }}>{children}</Box>}
    </div>
  );
}

// Mock quiz data
const MOCK_QUIZZES = [
  {
    id: 'quiz1',
    title: 'Basic concepts of arrays, linked lists, and stacks',
    subject: 'Data Structures',
    course: 'CS201',
    totalQuestions: 15,
    duration: 45,
    status: 'active',
    startDate: '2024-12-10T09:00:00Z',
    endDate: '2024-12-15T23:59:00Z',
    attempts: 18,
    averageScore: 78.5,
    maxScore: 100,
    difficulty: 'Medium',
    tags: ['arrays', 'linked lists', 'stacks'],
    createdBy: 'Prof. Smith',
    createdAt: '2024-12-05T10:00:00Z'
  },
  {
    id: 'quiz2',
    title: 'Understanding Big O notation and time complexity',
    subject: 'Algorithms',
    course: 'CS101',
    totalQuestions: 20,
    duration: 60,
    status: 'completed',
    startDate: '2024-12-01T10:00:00Z',
    endDate: '2024-12-05T23:59:00Z',
    attempts: 25,
    averageScore: 85.2,
    maxScore: 100,
    difficulty: 'Hard',
    tags: ['big-o', 'complexity', 'algorithms'],
    createdBy: 'Prof. Johnson',
    createdAt: '2024-11-28T14:00:00Z'
  },
  {
    id: 'quiz3',
    title: 'Database Normalization and SQL Queries',
    subject: 'Database Systems',
    course: 'CS301',
    totalQuestions: 12,
    duration: 30,
    status: 'scheduled',
    startDate: '2024-12-20T14:00:00Z',
    endDate: '2024-12-25T23:59:00Z',
    attempts: 0,
    averageScore: 0,
    maxScore: 100,
    difficulty: 'Medium',
    tags: ['database', 'normalization', 'sql'],
    createdBy: 'Prof. Davis',
    createdAt: '2024-12-08T11:00:00Z'
  },
  {
    id: 'quiz4',
    title: 'Object-Oriented Programming Concepts',
    subject: 'Programming',
    course: 'CS102',
    totalQuestions: 18,
    duration: 50,
    status: 'draft',
    startDate: null,
    endDate: null,
    attempts: 0,
    averageScore: 0,
    maxScore: 100,
    difficulty: 'Easy',
    tags: ['oop', 'classes', 'inheritance'],
    createdBy: 'Prof. Wilson',
    createdAt: '2024-12-09T16:00:00Z'
  }
];

const QuizManagement = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, quiz: null });
  const [duplicateDialog, setDuplicateDialog] = useState({ open: false, quiz: null });

  // Stats state
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    completedQuizzes: 0,
    draftQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0
  });

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      
      // Try enhanced service first
      try {
        const result = await enhancedFacultyService.getQuizzes();
        if (result && result.success && result.data && result.data.length > 0) {
          setQuizzes(result.data);
          calculateStats(result.data);
          return;
        }
      } catch (enhancedError) {
        console.log('Enhanced service not available, using fallback');
      }

      // Try faculty service
      try {
        const response = await facultyService.getQuizzes();
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          setQuizzes(response.data);
          calculateStats(response.data);
          return;
        }
      } catch (facultyError) {
        console.log('Faculty service not available, using mock data');
      }

      // Use mock data as fallback
      setQuizzes(MOCK_QUIZZES);
      calculateStats(MOCK_QUIZZES);
      
    } catch (error) {
      console.error('Error loading quizzes:', error);
      // Even if there's an error, use mock data
      setQuizzes(MOCK_QUIZZES);
      calculateStats(MOCK_QUIZZES);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (quizData) => {
    const safeQuizData = Array.isArray(quizData) ? quizData : [];
    
    let active = 0;
    let completed = 0;
    let draft = 0;
    
    safeQuizData.forEach(quiz => {
      if (quiz.status === 'draft') {
        draft++;
      } else if (quiz.status === 'completed') {
        completed++;
      } else if (quiz.status === 'active') {
        active++;
      }
    });

    const totalAttempts = safeQuizData.reduce((sum, quiz) => sum + (quiz.attempts || 0), 0);
    const totalScore = safeQuizData.reduce((sum, quiz) => sum + (quiz.averageScore || 0), 0);
    const averageScore = completed > 0 ? (totalScore / completed).toFixed(1) : 0;

    setStats({
      totalQuizzes: safeQuizData.length,
      activeQuizzes: active,
      completedQuizzes: completed,
      draftQuizzes: draft,
      totalAttempts,
      averageScore
    });
  };

  const handleDeleteQuiz = async () => {
    try {
      await facultyService.deleteQuiz(deleteDialog.quiz.id);
      setDeleteDialog({ open: false, quiz: null });
      loadQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const handleDuplicateQuiz = async (newTitle) => {
    try {
      await facultyService.duplicateQuiz(duplicateDialog.quiz.id, newTitle);
      setDuplicateDialog({ open: false, quiz: null });
      loadQuizzes();
    } catch (error) {
      console.error('Error duplicating quiz:', error);
    }
  };

  const getStatusInfo = (quiz) => {
    if (quiz.status === 'draft') {
      return { status: 'draft', label: 'Draft', color: '#FF9800' };
    } else if (quiz.status === 'active') {
      return { status: 'active', label: 'Active', color: '#4CAF50' };
    } else if (quiz.status === 'completed') {
      return { status: 'completed', label: 'Completed', color: '#9E9E9E' };
    } else {
      return { status: 'scheduled', label: 'Scheduled', color: '#2196F3' };
    }
  };

  const getIconForStatus = (status) => {
    switch (status) {
      case 'active': return <ActiveIcon />;
      case 'completed': return <CompletedIcon />;
      case 'scheduled': return <ScheduleIcon />;
      default: return <EditIcon />;
    }
  };

  const QuizCardGrid = ({ quizzes }) => {
    const [menuAnchor, setMenuAnchor] = useState({});

    const handleMenuClick = (event, quizId) => {
      setMenuAnchor({ ...menuAnchor, [quizId]: event.currentTarget });
    };

    const handleMenuClose = (quizId) => {
      setMenuAnchor({ ...menuAnchor, [quizId]: null });
    };

    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      return (
        <Box className={classes.emptyState}>
          <QuestionIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No quizzes found
          </Typography>
          <Typography variant="body2">
            Create your first quiz to get started
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3} className={classes.quizGrid}>
        {quizzes.map((quiz) => {
          const statusInfo = getStatusInfo(quiz);
          return (
            <Grid size={{xs:12,sm:6,md:4}} key={quiz.id}>
              <QuizCard>
                <CardContent>
                  {/* Quiz Header */}
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <StatusAvatar status={statusInfo.status}>
                      {getIconForStatus(statusInfo.status)}
                    </StatusAvatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {quiz.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {quiz.subject}
                      </Typography>
                    </Box>
                    <ActionButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, quiz.id)}
                    >
                      <MoreIcon />
                    </ActionButton>
                    <Menu
                      anchorEl={menuAnchor[quiz.id]}
                      open={Boolean(menuAnchor[quiz.id])}
                      onClose={() => handleMenuClose(quiz.id)}
                    >
                      <MenuItem onClick={() => {
                        navigate(`/faculty/quiz-results/${quiz.id}`);
                        handleMenuClose(quiz.id);
                      }}>
                        <ViewIcon sx={{ mr: 1 }} /> View Results
                      </MenuItem>
                      <MenuItem onClick={() => {
                        navigate(`/faculty/quiz-edit/${quiz.id}`);
                        handleMenuClose(quiz.id);
                      }}>
                        <EditIcon sx={{ mr: 1 }} /> Edit Quiz
                      </MenuItem>
                      <MenuItem onClick={() => {
                        setDuplicateDialog({ open: true, quiz });
                        handleMenuClose(quiz.id);
                      }}>
                        <CopyIcon sx={{ mr: 1 }} /> Duplicate
                      </MenuItem>
                      <Divider />
                      <MenuItem 
                        onClick={() => {
                          setDeleteDialog({ open: true, quiz });
                          handleMenuClose(quiz.id);
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon sx={{ mr: 1 }} /> Delete
                      </MenuItem>
                    </Menu>
                  </Box>

                  {/* Quiz Details */}
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <QuestionIcon sx={{ fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {quiz.totalQuestions} questions • {quiz.duration} minutes
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <ScheduleIcon sx={{ fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {quiz.startDate ? new Date(quiz.startDate).toLocaleDateString() : 'Not scheduled'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon sx={{ fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {quiz.attempts} attempts
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status and Difficulty */}
                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip
                      label={statusInfo.label}
                      size="small"
                      sx={{
                        backgroundColor: statusInfo.color,
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={quiz.difficulty}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: quiz.difficulty === 'Easy' ? '#4CAF50' : 
                                   quiz.difficulty === 'Medium' ? '#FF9800' : '#f44336',
                        color: quiz.difficulty === 'Easy' ? '#4CAF50' : 
                               quiz.difficulty === 'Medium' ? '#FF9800' : '#f44336',
                      }}
                    />
                  </Box>

                  {/* Performance Metrics */}
                  {quiz.status !== 'draft' && quiz.attempts > 0 && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        AVERAGE SCORE
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Box sx={{ 
                          width: '100%', 
                          bgcolor: 'rgba(102, 126, 234, 0.1)', 
                          borderRadius: 1,
                          height: 6,
                          overflow: 'hidden'
                        }}>
                          <Box sx={{
                            width: `${quiz.averageScore}%`,
                            height: '100%',
                            background: quiz.averageScore >= 80 ? 
                              'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)' :
                              quiz.averageScore >= 60 ?
                              'linear-gradient(90deg, #FF9800 0%, #f57c00 100%)' :
                              'linear-gradient(90deg, #f44336 0%, #d32f2f 100%)',
                            transition: 'width 0.3s ease'
                          }} />
                        </Box>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {quiz.averageScore}%
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between">
                    <ActionButton
                      size="small"
                      onClick={() => navigate(`/faculty/quiz-view/${quiz.id}`)}
                      sx={{ color: '#2196F3' }}
                    >
                      <ViewIcon />
                    </ActionButton>
                    <ActionButton
                      size="small"
                      onClick={() => navigate(`/faculty/quiz-edit/${quiz.id}`)}
                      sx={{ color: '#FF9800' }}
                    >
                      <EditIcon />
                    </ActionButton>
                    <ActionButton
                      size="small"
                      onClick={() => setDuplicateDialog({ open: true, quiz })}
                      sx={{ color: '#9C27B0' }}
                    >
                      <CopyIcon />
                    </ActionButton>
                    <ActionButton
                      size="small"
                      onClick={() => setDeleteDialog({ open: true, quiz })}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </ActionButton>
                  </Box>
                </CardContent>
              </QuizCard>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box style={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  // Ensure quizzes is always an array to prevent filter errors
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];

  return (
    <Container maxWidth="xl" className={classes.root}>
      {/* Header Section */}
      <HeaderSection>
        <Box position="relative" zIndex={2}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <AssignmentIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Quiz Management System
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Create, manage, and analyze your quizzes effectively
              </Typography>
            </Box>
          </Box>
        </Box>
      </HeaderSection>

      {/* Statistics Cards */}
      <Box className={classes.statsContainer}>
        <StatCard sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <QuestionIcon sx={{ fontSize: 32, color: '#667eea' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="#667eea">
                  {stats.totalQuizzes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Quizzes
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </StatCard>

        <StatCard sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <ActiveIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                  {stats.activeQuizzes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Quizzes
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </StatCard>

        <StatCard sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <CompletedIcon sx={{ fontSize: 32, color: '#9E9E9E' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="#9E9E9E">
                  {stats.completedQuizzes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </StatCard>

        <StatCard sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <EditIcon sx={{ fontSize: 32, color: '#FF9800' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="#FF9800">
                  {stats.draftQuizzes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Draft Quizzes
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </StatCard>
      </Box>

      {/* Tabs for Quiz Categories */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(event, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-selected': {
                color: '#667eea',
              }
            }
          }}
        >
          <Tab label={`All Quizzes (${stats.totalQuizzes})`} />
          <Tab label={`Active (${stats.activeQuizzes})`} />
          <Tab label={`Completed (${stats.completedQuizzes})`} />
          <Tab label={`Drafts (${stats.draftQuizzes})`} />
        </Tabs>
      </Box>

      {/* Quiz Content */}
      <TabPanel value={tabValue} index={0}>
        <QuizCardGrid quizzes={safeQuizzes} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <QuizCardGrid quizzes={safeQuizzes.filter(quiz => getStatusInfo(quiz).status === 'active')} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <QuizCardGrid quizzes={safeQuizzes.filter(quiz => getStatusInfo(quiz).status === 'completed')} />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <QuizCardGrid quizzes={safeQuizzes.filter(quiz => quiz.status === 'draft')} />
      </TabPanel>

      {/* Floating Action Button */}
      <Fab
        className={classes.fabButton}
        onClick={() => navigate('/faculty/quiz-create')}
        size="large"
      >
        <AddIcon sx={{ color: 'white' }} />
      </Fab>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, quiz: null })}>
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.quiz?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, quiz: null })}>Cancel</Button>
          <Button onClick={handleDeleteQuiz} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialog.open} onClose={() => setDuplicateDialog({ open: false, quiz: null })}>
        <DialogTitle>Duplicate Quiz</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Quiz Title"
            fullWidth
            variant="outlined"
            defaultValue={duplicateDialog.quiz?.title ? `Copy of ${duplicateDialog.quiz.title}` : ''}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleDuplicateQuiz(e.target.value);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialog({ open: false, quiz: null })}>Cancel</Button>
          <Button 
            onClick={() => {
              const titleInput = document.querySelector('input[label="New Quiz Title"]');
              handleDuplicateQuiz(titleInput?.value || `Copy of ${duplicateDialog.quiz?.title}`);
            }} 
            variant="contained"
          >
            Duplicate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizManagement;

