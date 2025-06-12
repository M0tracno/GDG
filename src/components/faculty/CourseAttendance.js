import React, { useState, useEffect } from 'react';
import { Add as AddIcon, CalendarToday as CalendarIcon, CalendarToday, Event, History as HistoryIcon, Refresh, Save as SaveIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import makeStyles from '../../utils/makeStylesCompat';
import { useAuth } from '../../auth/AuthContext';
import { useDatabase } from '../../hooks/useDatabase';
import enhancedFacultyService from '../../services/enhancedFacultyService';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: theme.spacing(3)},
  title: {
    marginBottom: theme.spacing(3),
    fontWeight: 700,
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '2.5rem'},
  paper: {
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    borderRadius: 20,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'},
  formControl: {
    minWidth: 200,
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      borderRadius: 12,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      '& fieldset': {
        borderColor: 'rgba(102, 126, 234, 0.3)'},
      '&:hover fieldset': {
        borderColor: 'rgba(102, 126, 234, 0.6)'},
      '&.Mui-focused fieldset': {
        borderColor: '#667eea'}}},
  primaryButton: {
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'},
    '&:disabled': {
      background: 'rgba(0, 0, 0, 0.26)',
      transform: 'none'}},
  secondaryButton: {
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    border: '2px solid transparent',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      border: '2px solid rgba(102, 126, 234, 0.3)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'}},
  tableContainer: {
    marginTop: theme.spacing(3),
    '& .MuiPaper-root': {
      borderRadius: 15,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      overflow: 'hidden'}},
  modernTable: {
    '& .MuiTableHead-root': {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      '& .MuiTableCell-head': {
        color: 'white',
        fontWeight: 700,
        fontSize: '1rem'}},
    '& .MuiTableCell-root': {
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: theme.spacing(2)},
    '& .MuiTableRow-root': {
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'}}},
  attendancePresent: {
    color: '#4caf50',
    fontWeight: 700,
    background: 'linear-gradient(45deg, #4caf50, #45a049)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'},
  attendanceAbsent: {
    color: '#f44336',
    fontWeight: 700,
    background: 'linear-gradient(45deg, #f44336, #d32f2f)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'},
  attendanceExcused: {
    color: '#ff9800',
    fontWeight: 700,
    background: 'linear-gradient(45deg, #ff9800, #f57c00)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'},
  headerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3)},
  courseTitle: {
    fontWeight: 700,
    fontSize: '1.25rem',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'},
  historyButton: {
    marginLeft: theme.spacing(1)},
  modernCheckbox: {
    '&.Mui-checked': {
      color: '#667eea'},
    '&.MuiCheckbox-colorSecondary.Mui-checked': {
      color: '#f44336'}},
  sectionHeader: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    fontSize: '1.5rem'},
  noDataContainer: {
    textAlign: 'center',
    padding: theme.spacing(4),
    '& .MuiTypography-root': {
      color: theme.palette.text.secondary,
      fontWeight: 500}},
  modernDialog: {
    '& .MuiDialog-paper': {
      borderRadius: 20,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'}}}));

function CourseAttendance() {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const { getAllCourses, getCourseAttendance, recordAttendance, updateAttendance, getCollection, addDocument, loading: dbLoading } = useDatabase();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    semester: '',
    academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString()
  });
  const [viewingHistory, setViewingHistory] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedCourse, selectedDate]);
  // Fetch available courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Try enhanced service first, then fallback to database
      const enhancedCourses = await enhancedFacultyService.getCourses();
      if (enhancedCourses && enhancedCourses.length > 0) {
        setCourses(enhancedCourses);
      } else {
        const data = await getCollection('courses', {
          where: ['facultyId', '==', currentUser.uid]
        });
        setCourses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showSnackbar('Error fetching courses', 'error');
      setCourses([]); // Ensure courses is always an array
    } finally {
      setLoading(false);
    }
  };
  // Fetch students enrolled in the selected course
  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Try enhanced service first, then fallback to database
      const enhancedStudents = await enhancedFacultyService.getStudents();
      if (enhancedStudents && enhancedStudents.length > 0) {
        // Filter students for the selected course
        const courseStudents = enhancedStudents.filter(student => 
          student.courses && student.courses.includes(selectedCourse)
        );
        setStudents(courseStudents);
      } else {
        const data = await getCollection('enrollments', {
          where: ['courseId', '==', selectedCourse]
        });
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showSnackbar('Error fetching enrolled students', 'error');
    } finally {
      setLoading(false);
    }
  };
  // Fetch attendance records for the selected date and course
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Try enhanced service first, then fallback to database
      const enhancedAttendance = await enhancedFacultyService.getAttendanceRecords(selectedCourse, selectedDate);
      if (enhancedAttendance && enhancedAttendance.length > 0) {
        setAttendance(enhancedAttendance);
      } else {
        const data = await getCollection('attendance', {
          where: [
            ['courseId', '==', selectedCourse],
            ['date', '==', selectedDate]
          ]
        });
        setAttendance(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showSnackbar('Error fetching attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle course selection change
  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
    setViewingHistory(false);
  };

  // Handle date change
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setViewingHistory(false);
  };

  // Handle attendance status change
  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prevAttendance => {
      // Find if record already exists
      const existingIndex = prevAttendance.findIndex(
        record => record.studentId === studentId
      );

      if (existingIndex >= 0) {
        // Update existing record
        const updatedAttendance = [...prevAttendance];
        updatedAttendance[existingIndex] = {
          ...updatedAttendance[existingIndex],
          status
        };
        return updatedAttendance;
      } else {
        // Create new record
        return [
          ...prevAttendance,
          {
            id: `attendance_${Date.now()}_${studentId}`,
            courseId: selectedCourse,
            studentId,
            date: selectedDate,
            status,
            timestamp: new Date().toISOString()
          }
        ];
      }
    });
  };

  // Save attendance records
  const saveAttendance = async () => {
    if (!selectedCourse || !selectedDate) {
      showSnackbar('Please select a course and date', 'error');
      return;
    }

    if (attendance.length === 0) {
      showSnackbar('No attendance records to save', 'error');
      return;
    }

    setLoading(true);
    try {
      // In real application, save to Firestore
      for (const record of attendance) {
        if (record.id.startsWith('attendance_')) {
          // New record, add document
          await addDocument('attendance', record);
        } else {
          // Existing record, update document
          await updateAttendance(selectedCourse, record.id, record);
        }
      }
      showSnackbar('Attendance saved successfully', 'success');
    } catch (error) {
      console.error('Error saving attendance:', error);
      showSnackbar('Error saving attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show snackbar message
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
  const theme = useTheme();
    setSnackbarOpen(false);
  };

  // Handle add course dialog
  const handleAddCourseDialogOpen = () => {
    setAddCourseDialogOpen(true);
  };

  const handleAddCourseDialogClose = () => {
    setAddCourseDialogOpen(false);
  };

  const handleNewCourseChange = (field) => (event) => {
    setNewCourse({
      ...newCourse,
      [field]: event.target.value
    });
  };

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.code) {
      showSnackbar('Course name and code are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const courseData = {
        id: `course_${Date.now()}`,
        name: newCourse.name,
        code: newCourse.code,
        semester: newCourse.semester,
        academicYear: newCourse.academicYear,
        facultyId: currentUser.uid,
        facultyName: currentUser.displayName || 'Faculty',
        createdAt: new Date().toISOString()
      };

      // In real application, save to Firestore
      await addDocument('courses', courseData);
      // Refresh courses
      await fetchCourses();
      showSnackbar('Course added successfully', 'success');

      // Reset form and close dialog
      setNewCourse({
        name: '',
        code: '',
        semester: '',
        academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString()
      });
      handleAddCourseDialogClose();
    } catch (error) {
      console.error('Error adding course:', error);
      showSnackbar('Error adding course', 'error');
    } finally {
      setLoading(false);
    }
  };

  // View attendance history
  const viewAttendanceHistory = async () => {
    if (!selectedCourse) {
      showSnackbar('Please select a course', 'error');
      return;
    }

    setLoading(true);
    try {
      // In real application, fetch from Firestore
      const data = await getCollection('attendance', {
        where: ['courseId', '==', selectedCourse],
        orderBy: ['date', 'desc']
      });
      setAttendanceHistory(data);
      setViewingHistory(true);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      showSnackbar('Error fetching attendance history', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Return to attendance taking
  const returnToAttendance = () => {
    setViewingHistory(false);
  };

  // Get attendance status for a student
  const getAttendanceStatus = (studentId) => {
    const record = attendance.find(a => a.studentId === studentId);
    return record ? record.status : 'absent';
  };

  // Get student name by ID
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  // Mock data generators
  const getMockCourses = () => {
    return [
      { id: 'course1', name: 'Introduction to Computer Science', code: 'CS101', semester: 'Fall', academicYear: '2023-2024', facultyId: 'faculty1', facultyName: 'Dr. John Smith' },
      { id: 'course2', name: 'Data Structures and Algorithms', code: 'CS201', semester: 'Fall', academicYear: '2023-2024', facultyId: 'faculty1', facultyName: 'Dr. John Smith' },
      { id: 'course3', name: 'Database Systems', code: 'CS301', semester: 'Fall', academicYear: '2023-2024', facultyId: 'faculty1', facultyName: 'Dr. John Smith' }
    ];
  };

  const getMockStudents = () => {
    return [
      { id: 'student1', name: 'Emma Johnson', email: 'emma.j@example.com', studentId: 'S1001' },
      { id: 'student2', name: 'Ethan Williams', email: 'ethan.w@example.com', studentId: 'S1002' },
      { id: 'student3', name: 'Olivia Davis', email: 'olivia.d@example.com', studentId: 'S1003' },
      { id: 'student4', name: 'Noah Martin', email: 'noah.m@example.com', studentId: 'S1004' },
      { id: 'student5', name: 'Sophia Wilson', email: 'sophia.w@example.com', studentId: 'S1005' }
    ];
  };

  const getMockAttendance = (courseId, date) => {
    // For demo, generate random attendance or use predefined one
    const today = new Date().toISOString().split('T')[0];

    // For today, show empty attendance to allow entry
    if (date === today) {
      return [];
    }

    // For other dates, show mock attendance
    return [
      { id: 'att1', courseId, studentId: 'student1', date, status: 'present', timestamp: '2023-05-10T09:00:00Z' },
      { id: 'att2', courseId, studentId: 'student2', date, status: 'present', timestamp: '2023-05-10T09:00:00Z' },
      { id: 'att3', courseId, studentId: 'student3', date, status: 'absent', timestamp: '2023-05-10T09:00:00Z' },
      { id: 'att4', courseId, studentId: 'student4', date, status: 'excused', timestamp: '2023-05-10T09:00:00Z' },
      { id: 'att5', courseId, studentId: 'student5', date, status: 'present', timestamp: '2023-05-10T09:00:00Z' }
    ];
  };

  const getMockAttendanceHistory = (courseId) => {
    return [
      ...getMockAttendance(courseId, '2023-05-15'),
      ...getMockAttendance(courseId, '2023-05-14'),
      ...getMockAttendance(courseId, '2023-05-13'),
      ...getMockAttendance(courseId, '2023-05-12'),
      ...getMockAttendance(courseId, '2023-05-11'),
      ...getMockAttendance(courseId, '2023-05-10')
    ];
  };

  return (
    <div className={classes.root}>
      <div className={classes.headerActions}>
        <Typography variant="h4" className={classes.title}>
          📊 Attendance Management
        </Typography>

        <Button
          variant="contained"
          className={classes.primaryButton}
          startIcon={<AddIcon />}
          onClick={handleAddCourseDialogOpen}
        >
          ➕ Add Course
        </Button>
      </div>

      <Paper className={classes.paper}>
        <Grid container spacing={3}>
          <Grid size={{xs:12,md:4}}>
            <FormControl variant="outlined" className={classes.formControl} fullWidth>
              <InputLabel>📚 Select Course</InputLabel>
              <Select
                value={selectedCourse}
                onChange={handleCourseChange}
                label="📚 Select Course"
              >
                <MenuItem value="">
                  <em>Select a course</em>
                </MenuItem>
                {Array.isArray(courses) && courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    <strong>{course.code}</strong> - {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {selectedCourse && !viewingHistory && (
            <Grid size={{xs:12,md:4}}>
              <TextField
                label="📅 Date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                variant="outlined"
                fullWidth
                className={classes.formControl}
                InputLabelProps={{
                  shrink: true}}
              />
            </Grid>
          )}

          {selectedCourse && (
            <Grid size={{xs:12,md:4}}>
              {viewingHistory ? (
                <Button
                  variant="outlined"
                  className={classes.secondaryButton}
                  onClick={returnToAttendance}
                  startIcon={<CalendarIcon />}
                >
                  📋 Return to Attendance
                </Button>
              ) : (
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    variant="contained"
                    className={classes.primaryButton}
                    startIcon={<SaveIcon />}
                    onClick={saveAttendance}
                    disabled={loading}
                  >
                    💾 Save Attendance
                  </Button>
                  <Button
                    variant="outlined"
                    className={classes.secondaryButton}
                    startIcon={<HistoryIcon />}
                    onClick={viewAttendanceHistory}
                    disabled={loading}
                  >
                    📈 View History
                  </Button>
                </Box>
              )}
            </Grid>
          )}
        </Grid>

        {selectedCourse ? (
          viewingHistory ? (
            // Attendance History View
            <div className={classes.tableContainer}>
              <Typography variant="h6" className={classes.sectionHeader} gutterBottom>
                📈 Attendance History for {Array.isArray(courses) ? courses.find(c => c.id === selectedCourse)?.name : 'Unknown Course'}
              </Typography>

              <TableContainer component={Paper}>
                <Table className={classes.modernTable}>
                  <TableHead>
                    <TableRow><TableCell>📅 Date</TableCell>
                      <TableCell>👤 Student</TableCell>
                      <TableCell>📊 Status</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(attendanceHistory) && attendanceHistory.length > 0 ? (
                      attendanceHistory.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <Typography variant="body1" fontWeight={500}>
                              {record.date}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1">
                              {getStudentName(record.studentId)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body1"
                              className={
                                record.status === 'present'
                                  ? classes.attendancePresent
                                  : record.status === 'excused'
                                  ? classes.attendanceExcused
                                  : classes.attendanceAbsent
                              }
                            >
                              {record.status === 'present' ? '✅ PRESENT' :
                               record.status === 'excused' ? '⚠️ EXCUSED' :
                               '❌ ABSENT'}
                            </Typography>
                          </TableCell></TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={3} className={classes.noDataContainer}>
                          <Typography variant="h6">
                            📭 No attendance records found
                          </Typography>
                        </TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ) : (
            // Attendance Taking View
            <div className={classes.tableContainer}>
              <Typography variant="h6" className={classes.sectionHeader} gutterBottom>
                📋 Attendance for {selectedDate}
              </Typography>

              {students.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table className={classes.modernTable}>
                    <TableHead>
                      <TableRow><TableCell>🆔 Student ID</TableCell>
                        <TableCell>👤 Name</TableCell>
                        <TableCell>✅ Present</TableCell>
                        <TableCell>❌ Absent</TableCell>
                        <TableCell>⚠️ Excused</TableCell></TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(students) && students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {student.studentId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight={500}>
                              {student.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={getAttendanceStatus(student.id) === 'present'}
                              onChange={() => handleAttendanceChange(student.id, 'present')}
                              className={classes.modernCheckbox}
                              size="large"
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={getAttendanceStatus(student.id) === 'absent'}
                              onChange={() => handleAttendanceChange(student.id, 'absent')}
                              className={classes.modernCheckbox}
                              color="secondary"
                              size="large"
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={getAttendanceStatus(student.id) === 'excused'}
                              onChange={() => handleAttendanceChange(student.id, 'excused')}
                              className={classes.modernCheckbox}
                              size="large"
                            />
                          </TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box className={classes.noDataContainer}>
                  <Typography variant="h6">
                    👥 No students enrolled in this course.
                  </Typography>
                </Box>
              )}
            </div>
          )
        ) : (
          // No course selected
          <Box className={classes.noDataContainer}>
            <Typography variant="h5">
              📚 Please select a course to manage attendance.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add Course Dialog */}
      <Dialog
        open={addCourseDialogOpen}
        onClose={handleAddCourseDialogClose}
        className={classes.modernDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={700}>
            ➕ Add New Course
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid size={{xs:12}}>
              <TextField
                label="📚 Course Name"
                value={newCourse.name}
                onChange={handleNewCourseChange('name')}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                className={classes.formControl}
              />
            </Grid>
            <Grid size={{xs:12}}>
              <TextField
                label="🔢 Course Code"
                value={newCourse.code}
                onChange={handleNewCourseChange('code')}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                className={classes.formControl}
              />
            </Grid>
            <Grid size={{xs:12,sm:6}}>
              <TextField
                label="📅 Semester"
                value={newCourse.semester}
                onChange={handleNewCourseChange('semester')}
                fullWidth
                margin="normal"
                variant="outlined"
                select
                className={classes.formControl}
              >
                <MenuItem value="">Select Semester</MenuItem>
                <MenuItem value="Fall">🍂 Fall</MenuItem>
                <MenuItem value="Spring">🌸 Spring</MenuItem>
                <MenuItem value="Summer">☀️ Summer</MenuItem>
                <MenuItem value="Winter">❄️ Winter</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{xs:12,sm:6}}>
              <TextField
                label="📆 Academic Year"
                value={newCourse.academicYear}
                onChange={handleNewCourseChange('academicYear')}
                fullWidth
                margin="normal"
                variant="outlined"
                className={classes.formControl}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAddCourseDialogClose}
            className={classes.secondaryButton}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCourse}
            className={classes.primaryButton}
            disabled={loading}
          >
            ➕ Add Course
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default CourseAttendance;

