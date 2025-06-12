import React, { useState, useEffect } from 'react';
import { Assignment, Close, Grade, Message, Refresh } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import makeStyles from '../../utils/makeStylesCompat';
import { gradeAssignmentWithAI, generatePersonalizedFeedback, evaluateEssayWithVertexAI } from '../../services/aiService';
import EnhancedFacultyService from '../../services/enhancedFacultyService';
import {
  Alert,
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
  Paper,
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
  Typography
} from '@mui/material';
import {
  AutorenewRounded as AIIcon,
  Search as SearchIcon,
  Grade as GradeIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Save as SaveIcon,
  Send as SendIcon,
  AutoFixHigh as AutoGradeIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import { styled } from '@mui/material/styles';

// Styled components for modern design
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

const AssignmentCard = styled(StyledCard)(({ theme }) => ({
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

const StatusChip = styled(Chip)(({ theme, status }) => {
  const getColors = () => {
  const theme = useTheme();
    switch (status) {
      case 'completed':
        return { bg: '#4CAF50', color: 'white' };
      case 'pending':
        return { bg: '#FF9800', color: 'white' };
      case 'in-progress':
        return { bg: '#2196F3', color: 'white' };
      default:
        return { bg: '#f44336', color: 'white' };
    }
  };
  
  const colors = getColors();
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    borderRadius: 12,
  };
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: theme.spacing(3),
  },
  searchContainer: {
    marginBottom: theme.spacing(3),
    '& .MuiOutlinedInput-root': {
      borderRadius: 16,
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
  tabsContainer: {
    marginBottom: theme.spacing(3),
    '& .MuiTabs-root': {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: 15,
      padding: theme.spacing(0.5),
    },
    '& .MuiTab-root': {
      borderRadius: 12,
      textTransform: 'none',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      '&.Mui-selected': {
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        color: 'white',
      },
    },
  },
  assignmentGrid: {
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
  paper: {
    padding: theme.spacing(4),
    borderRadius: 20,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginBottom: theme.spacing(3),
    fontWeight: 700,
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '2.5rem',
  },
  tableContainer: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: 15,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  submissionCard: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: 15,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    marginRight: theme.spacing(1),
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    },
  },
  tabContent: {
    padding: theme.spacing(3),
  },
  search: {
    position: 'relative',
    borderRadius: 15,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    marginBottom: theme.spacing(3),
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: 15,
      '& fieldset': {
        border: 'none',
      },
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.main,
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    width: '100%',
  },
  gradingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  questionItem: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(3),
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: 15,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
  gradingActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3),
    gap: theme.spacing(2),
  },
  feedback: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(3),
    background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
    backdropFilter: 'blur(10px)',
    borderRadius: 15,
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  buttonProgress: {
    marginRight: theme.spacing(1),
  },
  score: {
    fontSize: '3rem',
    fontWeight: 700,
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
  },
  scoreLabel: {
    textAlign: 'center',
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  root: {
    width: '100%',
    padding: theme.spacing(2),
  },
  questionPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: 15,
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
    '& .MuiOutlinedInput-root': {
      borderRadius: 12,
      background: 'rgba(255, 255, 255, 0.9)',
    },
  },
  tableHeader: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    '& .MuiTableCell-head': {
      color: 'white',
      fontWeight: 700,
      fontSize: '1rem',
    },
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
    borderRadius: 20,
    fontWeight: 600,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  studentInfo: {
    marginBottom: theme.spacing(2),
  },
  aiButton: {
    background: 'linear-gradient(45deg, #a142f4, #6f42c1)',
    color: 'white',
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(45deg, #8a36d1, #5a32a3)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(161, 66, 244, 0.3)',
    },
    marginRight: theme.spacing(1),
  },
  submittedChip: {
    background: 'linear-gradient(45deg, #4caf50, #45a049)',
    color: 'white',
    fontWeight: 600,
  },
  pendingChip: {
    background: 'linear-gradient(45deg, #ff9800, #f57c00)',
    color: 'white',
    fontWeight: 600,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3),
    gap: theme.spacing(2),
  },
  sliderContainer: {
    padding: theme.spacing(2, 0),
  },
  sliderLabel: {
    marginTop: theme.spacing(1),
  },
  pointsDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
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
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    },
  },
  secondaryButton: {
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    border: '2px solid transparent',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      border: '2px solid rgba(102, 126, 234, 0.3)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
    },
  },
  modernTable: {
    '& .MuiTableCell-root': {
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: theme.spacing(2),
    },
    '& .MuiTableRow-root': {
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  modernCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    },
  },
  tabsContainer: {
    marginBottom: theme.spacing(3),
    '& .MuiTabs-root': {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: 15,
      padding: theme.spacing(0.5),
    },
    '& .MuiTab-root': {
      borderRadius: 12,
      textTransform: 'none',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      '&.Mui-selected': {
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        color: 'white',
      },
    },
  },
}));

// Mock data for pending assignments
const MOCK_ASSIGNMENTS = [
  { 
    id: 'a1', 
    title: 'Algorithm Analysis Assignment', 
    subject: 'Data Structures & Algorithms', 
    dueDate: '2023-07-20', 
    totalSubmissions: 18, 
    pendingGrading: 5,
    gradedSubmissions: 13,
    totalPoints: 50,
    status: 'pending'
  },
  { 
    id: 'a2', 
    title: 'Binary Tree Implementation', 
    subject: 'Data Structures & Algorithms', 
    dueDate: '2023-07-15', 
    totalSubmissions: 20, 
    pendingGrading: 0,
    gradedSubmissions: 20,
    totalPoints: 75,
    status: 'completed'
  },
  { 
    id: 'a3', 
    title: 'Database Design Project', 
    subject: 'Database Systems', 
    dueDate: '2023-07-18', 
    totalSubmissions: 15, 
    pendingGrading: 8,
    gradedSubmissions: 7,
    totalPoints: 40,
    status: 'in-progress'
  },
  { 
    id: 'a4', 
    title: 'Machine Learning Basics', 
    subject: 'Artificial Intelligence', 
    dueDate: '2023-07-25', 
    totalSubmissions: 12, 
    pendingGrading: 12,
    gradedSubmissions: 0,
    totalPoints: 60,
    status: 'pending'
  },
  { 
    id: 'a5', 
    title: 'Network Protocol Analysis', 
    subject: 'Computer Networks', 
    dueDate: '2023-07-22', 
    totalSubmissions: 22, 
    pendingGrading: 3,
    gradedSubmissions: 19,
    totalPoints: 45,
    status: 'in-progress'
  }
];

// Mock data for student submissions
const MOCK_SUBMISSIONS = [
  { id: 101, studentId: 'S1001', studentName: 'Emma Smith', submissionDate: '2023-06-10', status: 'pending' },
  { id: 102, studentId: 'S1002', studentName: 'Aiden Johnson', submissionDate: '2023-06-11', status: 'pending' },
  { id: 103, studentId: 'S1003', studentName: 'Olivia Williams', submissionDate: '2023-06-12', status: 'pending' },
  { id: 104, studentId: 'S1004', studentName: 'Noah Brown', submissionDate: '2023-06-13', status: 'graded', score: 85 },
  { id: 105, studentId: 'S1005', studentName: 'Sophia Jones', submissionDate: '2023-06-14', status: 'graded', score: 92 },
];

// Mock submission details
const MOCK_SUBMISSION_DETAILS = {
  id: 101,
  studentName: 'Emma Smith',
  studentId: 'S1001',
  submissionDate: '2023-06-10 14:32',
  assignmentTitle: 'Introduction to Algorithms',
  questions: [
    {
      id: 'q1',
      text: 'Explain the concept of time complexity in algorithms.',
      answer: "Time complexity is a measure of the amount of time an algorithm takes to run as a function of the length of the input. It's usually expressed using Big O notation, which describes the upper bound of the growth rate of the algorithm's running time. For example, O(n) means the algorithm's running time grows linearly with the input size, while O(n²) means it grows quadratically.",
      maxPoints: 10
    },
    {
      id: 'q2',
      text: 'Compare and contrast merge sort and quick sort algorithms.',
      answer: "Merge sort and quick sort are both efficient sorting algorithms with an average time complexity of O(n log n). Merge sort uses a divide-and-conquer approach, splitting the array recursively and then merging the sorted subarrays. It has a consistent O(n log n) performance regardless of the input data. Quick sort also uses divide-and-conquer but selects a pivot element and partitions the array around it. While quick sort is often faster in practice, it can degrade to O(n²) in the worst case with poor pivot choices. Merge sort requires additional O(n) space, while quick sort can be implemented in-place with O(log n) space complexity for recursion.",
      maxPoints: 10
    },
    {
      id: 'q3',
      text: 'Implement a basic graph traversal algorithm.',
      answer: `function bfs(graph, startNode) {
  const visited = new Set();
  const queue = [startNode];
  visited.add(startNode);

  while (queue.length > 0) {
    const currentNode = queue.shift();
    console.log(currentNode); // Process node

    for (const neighbor of graph[currentNode]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
      maxPoints: 10
    }
  ]
};

function GradeAssignments() {
  const classes = useStyles();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gradingResults, setGradingResults] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedFeedback, setGeneratedFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [maxPoints, setMaxPoints] = useState(0);
  // Load submissions when an assignment is selected
  useEffect(() => {
    const loadSubmissions = async () => {
      if (selectedAssignment) {
        try {
          const result = await EnhancedFacultyService.getSubmissions(selectedAssignment.id);
          if (result.success) {
            setSubmissions(result.data);
          } else {
            // Use mock submissions as fallback
            setSubmissions(MOCK_SUBMISSIONS);
          }
        } catch (error) {
          console.error('Error loading submissions:', error);
          setSubmissions(MOCK_SUBMISSIONS);
        }
      }
    };

    loadSubmissions();
  }, [selectedAssignment]);  // Load assignments when component mounts
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const result = await EnhancedFacultyService.getAssignments();
        if (result.success && result.data && result.data.length > 0) {
          const formattedAssignments = result.data.map(assignment => ({
            id: assignment.id,
            title: assignment.title,
            subject: assignment.courseName || assignment.course,
            dueDate: assignment.dueDate,
            totalSubmissions: assignment.submissions || 0,
            pendingGrading: assignment.pending || 0,
            gradedSubmissions: assignment.graded || 0,
            totalPoints: assignment.totalPoints || 100,
            status: assignment.status || 'pending'
          }));
          setAssignments(formattedAssignments);
        } else {
          // Use mock data as fallback
          setAssignments(MOCK_ASSIGNMENTS);
        }
      } catch (error) {
        console.error('Error loading assignments:', error);
        // Use mock data as fallback
        setAssignments(MOCK_ASSIGNMENTS);
      }
    };

    loadAssignments();
  }, []);
  // Load students when component mounts
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const result = await EnhancedFacultyService.getStudents();
        if (result.success) {
          const formattedStudents = result.data.map(student => ({
            id: student.id,
            name: student.name,
            grade: student.grade,
            class: student.class,
            status: 'submitted'
          }));
          setStudents(formattedStudents);
        }
      } catch (error) {
        console.error('Error loading students:', error);
        // Use mock data as fallback
        const mockStudents = [
          { id: 'S1001', name: 'Alex Johnson', grade: '10th', class: 'CS-A', status: 'submitted' },
          { id: 'S1002', name: 'Emma Wilson', grade: '10th', class: 'CS-A', status: 'submitted' },
          { id: 'S1003', name: 'Michael Brown', grade: '9th', class: 'CS-B', status: 'submitted' },
          { id: 'S1004', name: 'Sophia Davis', grade: '11th', class: 'CS-C', status: 'pending' },
          { id: 'S1005', name: 'Daniel Miller', grade: '9th', class: 'CS-B', status: 'submitted' },
        ];
        setStudents(mockStudents);
      }
    };

    loadStudents();
  }, []);

  // Load questions when assignment is selected
  useEffect(() => {
    if (selectedAssignment) {
      // Mock questions for Algorithm Analysis
      const mockQuestions = [
        {
          id: 'q1',
          text: 'Explain the concept of time complexity in algorithms.',
          answer: "Time complexity is a measure of the amount of time an algorithm takes to run as a function of the length of the input. It's usually expressed using Big O notation, which describes the upper bound of the growth rate of the algorithm's running time. For example, O(n) means the algorithm's running time grows linearly with the input size, while O(n²) means it grows quadratically.",
          maxPoints: 10
        },
        {
          id: 'q2',
          text: 'What is the time complexity of binary search? Explain why.',
          answer: "The time complexity of binary search is O(log n) because the algorithm divides the search interval in half with each comparison. Since the size of the input is reduced by half in each step, the maximum number of comparisons needed to find the target is logarithmic in the size of the input array.",
          maxPoints: 10
        },
        {
          id: 'q3',
          text: 'Compare and contrast quicksort and mergesort algorithms.',
          answer: "Quicksort and mergesort are both efficient sorting algorithms with average-case time complexity of O(n log n). Mergesort uses a divide-and-conquer approach, dividing the array into halves, sorting them recursively, and then merging the sorted halves. It's stable and guarantees O(n log n) performance but requires additional O(n) space. Quicksort also uses divide-and-conquer by selecting a 'pivot' element and partitioning the array around it. It's generally faster in practice due to better cache performance and lower constant factors, but it has a worst-case time complexity of O(n²) and is not stable.",
          maxPoints: 15
        },
        {
          id: 'q4',
          text: 'What is space complexity and why is it important?',
          answer: "Space complexity measures the total amount of memory space an algorithm uses relative to the input size. It's important because in many applications, memory is a limited resource. Even if an algorithm is time-efficient, it might not be practical if it requires too much memory. For example, an algorithm with O(1) space complexity uses constant space regardless of input size, while an algorithm with O(n) space complexity uses memory proportional to the input size.",
          maxPoints: 10
        },
        {
          id: 'q5',
          text: 'Describe a real-world scenario where algorithm efficiency matters significantly.',
          answer: "Algorithm efficiency matters significantly in real-time systems like GPS navigation. When calculating routes in GPS applications, algorithms must process massive graph data representing road networks and find optimal paths quickly. Users expect immediate results when requesting directions or when recalculations are needed due to wrong turns. An inefficient routing algorithm could cause noticeable delays, leading to missed turns and user frustration. Additionally, mobile devices have limited processing power and battery life, so efficient algorithms directly impact device performance and battery consumption.",
          maxPoints: 5
        }
      ];
      setQuestions(mockQuestions);

      // Calculate max points
      const totalMax = mockQuestions.reduce((sum, q) => sum + q.maxPoints, 0);
      setMaxPoints(totalMax);
    }
  }, [selectedAssignment]);

  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(null);
    setGradingResults(null);
  };

  const handleBackToAssignments = () => {
    setSelectedAssignment(null);
    setSelectedSubmission(null);
    setGradingResults(null);
  };

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(MOCK_SUBMISSION_DETAILS);
    setGradingResults(null);
  };

  const handleBackToSubmissions = () => {
    setSelectedSubmission(null);
    setGradingResults(null);
  };

  const handleAutoGrade = async () => {
    setLoading(true);

    try {
      // Create a rubric from the questions
      const rubric = selectedSubmission.questions.map(q => ({
        questionId: q.id,
        maxPoints: q.maxPoints,
        criteria: `Evaluate the answer based on accuracy, completeness, and clarity.`
      }));

      // Create the answers object
      const answers = {};
      selectedSubmission.questions.forEach(q => {
        answers[q.id] = q.answer;
      });

      // Use AI to grade the assignment
      const results = await gradeAssignmentWithAI({
        studentName: selectedSubmission.studentName,
        assignmentId: selectedSubmission.id,
        answers,
        rubric
      });

      setGradingResults(results);
      setSuccessMessage('Assignment graded successfully!');
    } catch (error) {
      console.error('Error grading assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualGradeChange = (questionId, newScore) => {
    if (!gradingResults) return;

    const updatedBreakdown = gradingResults.breakdown.map(item => {
      if (item.questionId === questionId) {
        return { ...item, score: parseInt(newScore, 10) || 0 };
      }
      return item;
    });

    // Recalculate total score
    const totalPoints = updatedBreakdown.reduce((sum, item) => sum + item.score, 0);
    const totalMaxPoints = updatedBreakdown.reduce((sum, item) => sum + item.maxPoints, 0);
    const newOverallScore = Math.round((totalPoints / totalMaxPoints) * 100);

    setGradingResults({
      ...gradingResults,
      breakdown: updatedBreakdown,
      score: newOverallScore
    });
  };

  const handleGenerateFeedback = async () => {
    if (!gradingResults) return;

    setFeedbackLoading(true);

    try {
      // Extract answers from the submission
      const answers = {};
      selectedSubmission.questions.forEach(q => {
        answers[q.id] = q.answer;
      });

      // Generate personalized feedback
      const feedback = await generatePersonalizedFeedback({
        studentName: selectedSubmission.studentName,
        assignment: selectedSubmission.assignmentTitle,
        score: gradingResults.score,
        answers,
        previousPerformance: "Consistently performing well in assignments with an average score of 85%"
      });

      setGeneratedFeedback(feedback);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error generating feedback:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSaveGrading = () => {
    // In a real app, this would save the grading results to a database
    setSuccessMessage('Grading saved successfully!');

    // Update the submission status in the list
    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === selectedSubmission.id) {
        return { ...sub, status: 'graded', score: gradingResults.score };
      }
      return sub;
    });

    setSubmissions(updatedSubmissions);
  };
  // Handle search change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter assignments based on search and tab
  const getFilteredAssignments = () => {
    let filtered = assignments;

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    switch (tabValue) {
      case 0: // Pending
        return filtered.filter(assignment => assignment.status === 'pending');
      case 1: // In Progress
        return filtered.filter(assignment => assignment.status === 'in-progress');
      case 2: // Completed
        return filtered.filter(assignment => assignment.status === 'completed');
      default:
        return filtered;
    }
  };

  const filteredAssignments = getFilteredAssignments();
  // Render the assignment list
  if (!selectedAssignment) {
    return (
      <Container maxWidth="xl" className={classes.container}>
        {/* Header Section */}
        <HeaderSection>
          <Box position="relative" zIndex={2}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <SchoolIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Assignments to Grade
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Review and grade student submissions efficiently
                </Typography>
              </Box>
            </Box>
          </Box>
        </HeaderSection>

        {/* Search Bar */}
        <Box className={classes.searchContainer}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search assignments by title or subject..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              ),
            }}
          />
        </Box>

        {/* Tabs */}
        <Box className={classes.tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(event, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>📋</span>
                  <span>Pending ({assignments.filter(a => a.status === 'pending').length})</span>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>⏳</span>
                  <span>In Progress ({assignments.filter(a => a.status === 'in-progress').length})</span>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>✅</span>
                  <span>Completed ({assignments.filter(a => a.status === 'completed').length})</span>
                </Box>
              } 
            />
          </Tabs>
        </Box>

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <Box className={classes.emptyState}>
            <Assignment sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No assignments found
            </Typography>
            <Typography variant="body2">
              {searchQuery ? 'Try adjusting your search criteria' : 'No assignments available for this filter'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} className={classes.assignmentGrid}>
            {filteredAssignments.map((assignment) => (
              <Grid size={{xs:12,sm:6,md:4}} key={assignment.id}>
                <AssignmentCard>
                  <CardContent>
                    {/* Assignment Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                          {assignment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {assignment.subject}
                        </Typography>
                      </Box>
                      <StatusChip
                        status={assignment.status}
                        label={assignment.status === 'pending' ? 'Pending' : 
                               assignment.status === 'in-progress' ? 'In Progress' : 'Completed'}
                        size="small"
                      />
                    </Box>

                    {/* Assignment Details */}
                    <Box mb={3}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CalendarIcon sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PeopleIcon sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          {assignment.totalSubmissions} submissions
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <GradeIcon sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          Max Points: {assignment.totalPoints}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress Section */}
                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" fontWeight="bold" color="primary">
                          GRADING PROGRESS
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" color="primary">
                          {assignment.gradedSubmissions}/{assignment.totalSubmissions}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        bgcolor: 'rgba(102, 126, 234, 0.1)', 
                        borderRadius: 1,
                        height: 8,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          width: `${(assignment.gradedSubmissions / assignment.totalSubmissions) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          transition: 'width 0.3s ease'
                        }} />
                      </Box>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={1} mb={3}>
                      <Grid size={{xs:6}}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                            color: 'white',
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold">
                            {assignment.gradedSubmissions}
                          </Typography>
                          <Typography variant="caption">
                            Graded
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{xs:6}}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #FF9800 0%, #f57c00 100%)',
                            color: 'white',
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold">
                            {assignment.pendingGrading}
                          </Typography>
                          <Typography variant="caption">
                            Pending
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Action Buttons */}
                    <Box display="flex" gap={1}>
                      <ActionButton
                        variant="contained"
                        fullWidth
                        startIcon={<GradeIcon />}
                        onClick={() => handleSelectAssignment(assignment)}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          }
                        }}
                      >
                        Grade Now
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        sx={{
                          borderColor: '#667eea',
                          color: '#667eea',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            borderColor: '#667eea',
                          }
                        }}
                      >
                        View
                      </ActionButton>
                    </Box>
                  </CardContent>
                </AssignmentCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    );
  }
                          size="small"
                          startIcon={<GradeIcon />}
                          onClick={() => {
                            setSelectedAssignment(assignment.id);
                            setTabValue(1);
                          }}
                        >
                          Grade Now
                        </Button>
                      </TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </div>
    );
  }

  // Render the submissions list for a selected assignment
  if (selectedAssignment && !selectedSubmission) {
    return (
      <div className={classes.container}>
        <Container>
          <Paper className={classes.paper}>
            <Box display="flex" alignItems="center" mb={3}>
              <IconButton
                className={classes.actionButton}
                onClick={handleBackToAssignments}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" className={classes.title}>
                👥 {selectedAssignment} - Student Submissions
              </Typography>
            </Box>

            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table className={classes.modernTable}>
                <TableHead className={classes.tableHeader}>
                  <TableRow><TableCell>🆔 Student ID</TableCell>
                    <TableCell>👤 Name</TableCell>
                    <TableCell>📅 Submission Date</TableCell>
                    <TableCell>📊 Status</TableCell>
                    <TableCell>🎯 Score</TableCell>
                    <TableCell>⚡ Actions</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {submission.studentId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {submission.studentName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {submission.submissionDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {submission.status === 'graded' ? (
                          <Chip
                            icon={<CheckIcon />}
                            label="Graded"
                            className={classes.submittedChip}
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="Pending"
                            className={classes.pendingChip}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.status === 'graded' ? (
                          <Typography variant="h6" className={classes.score} style={{ fontSize: '1.2rem' }}>
                            {submission.score}%
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Not graded
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          className={classes.primaryButton}
                          size="small"
                          startIcon={<GradeIcon />}
                          onClick={() => handleSelectSubmission(submission)}
                        >
                          {submission.status === 'graded' ? 'Review' : 'Grade'}
                        </Button>
                      </TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </div>
    );
  }

  // Render the submission details and grading interface
  return (
    <div className={classes.container}>
      <Container>
        <Paper className={classes.paper}>
          <Box display="flex" alignItems="center" mb={3}>
            <IconButton
              className={classes.actionButton}
              onClick={handleBackToSubmissions}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" className={classes.title}>
              ✏️ Grade Submission - {selectedSubmission.studentName}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{xs:12,md:4}}>
              <Card className={classes.modernCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={700}>
                    📋 Submission Details
                  </Typography>
                  <Divider style={{ marginBottom: 16 }} />

                  <Typography variant="body2" gutterBottom>
                    <strong>👤 Student:</strong> {selectedSubmission.studentName}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>🆔 Student ID:</strong> {selectedSubmission.studentId}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>📚 Assignment:</strong> {selectedSubmission.assignmentTitle}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>📅 Submitted:</strong> {selectedSubmission.submissionDate}
                  </Typography>

                  {gradingResults && (
                    <>
                      <Box mt={3} mb={2}>
                        <Typography variant="h3" className={classes.score}>
                          {gradingResults.score}%
                        </Typography>
                        <Typography variant="body2" className={classes.scoreLabel}>
                          Overall Score
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="center" mt={2}>
                        <Button
                          variant="contained"
                          className={classes.aiButton}
                          onClick={handleGenerateFeedback}
                          disabled={feedbackLoading}
                          startIcon={feedbackLoading ? <CircularProgress size={20} /> : <AIIcon />}
                        >
                          Generate AI Feedback
                        </Button>
                      </Box>
                    </>
                  )}

                  {!gradingResults && (
                    <Box display="flex" justifyContent="center" mt={3}>
                      <Button
                        variant="contained"
                        className={classes.aiButton}
                        onClick={handleAutoGrade}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <AutoGradeIcon />}
                      >
                        🤖 Auto Grade with AI
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{xs:12,md:8}}>
              <div className={classes.gradingContainer}>
                {selectedSubmission.questions.map((question, index) => (
                  <div key={question.id} className={classes.questionItem}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      ❓ <strong>Question {index + 1}:</strong> {question.text}
                    </Typography>

                    <Typography variant="body1" gutterBottom style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>
                      <strong>📝 Student's Answer:</strong><br />
                      <Box
                        component="div"
                        mt={1}
                        p={2}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: 2,
                          border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {question.answer}
                      </Box>
                    </Typography>

                    {gradingResults && (
                      <div className={classes.feedback}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{xs:8}}>
                            <Typography variant="body1" fontWeight={500}>
                              <strong>🤖 AI-Generated Feedback:</strong><br />
                              <Box component="div" mt={1}>
                                {gradingResults.breakdown.find(b => b.questionId === question.id)?.feedback || 'No feedback available.'}
                              </Box>
                            </Typography>
                          </Grid>
                          <Grid size={{xs:4}}>
                            <TextField
                              label="Score"
                              type="number"
                              variant="outlined"
                              size="small"
                              fullWidth
                              value={gradingResults.breakdown.find(b => b.questionId === question.id)?.score || 0}
                              onChange={(e) => handleManualGradeChange(question.id, e.target.value)}
                              InputProps={{
                                inputProps: { min: 0, max: question.maxPoints },
                                endAdornment: <Typography variant="body2">/ {question.maxPoints}</Typography>
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  background: 'rgba(255, 255, 255, 0.9)',
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </div>
                    )}
                  </div>
                ))}

                {gradingResults && (
                  <div className={classes.gradingActions}>
                    <Button
                      variant="outlined"
                      className={classes.secondaryButton}
                      onClick={() => setGradingResults(null)}
                      startIcon={<Refresh />}
                    >
                      Reset Grading
                    </Button>
                    <Button
                      variant="contained"
                      className={classes.primaryButton}
                      onClick={handleSaveGrading}
                      startIcon={<SaveIcon />}
                    >
                      Save Grading
                    </Button>
                  </div>
                )}
              </div>
            </Grid>
          </Grid>
        </Paper>

        {/* Feedback Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight={700}>
              🤖 AI-Generated Personalized Feedback
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {generatedFeedback}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogOpen(false)}
              className={classes.secondaryButton}
            >
              Close
            </Button>
            <Button
              className={classes.primaryButton}
              startIcon={<SendIcon />}
            >
              Send to Student
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Message */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert
            onClose={() => setSuccessMessage('')}
            severity="success"
            sx={{ borderRadius: 2 }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}

export default GradeAssignments;

