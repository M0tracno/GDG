const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock data for demonstration - in production, this would come from database
let quizzes = [
  {
    id: 1,
    title: 'Introduction to Algebra',
    description: 'Basic algebra concepts and problem solving',
    subject: 'Mathematics',
    category: 'Algebra',
    difficulty: 'medium',
    duration: 60,
    totalPoints: 20,
    passingScore: 60,
    maxAttempts: 3,
    shuffleQuestions: false,
    shuffleOptions: true,
    showCorrectAnswers: true,
    showScoreImmediately: true,
    allowBackNavigation: true,
    requireProctoring: false,
    startDate: new Date('2024-01-15T09:00:00'),
    endDate: new Date('2024-01-30T23:59:59'),
    instructions: 'Read each question carefully and select the best answer.',
    tags: 'algebra, mathematics, basic',
    status: 'active',
    createdAt: new Date('2024-01-10T10:00:00'),
    updatedAt: new Date('2024-01-10T10:00:00'),
    facultyId: 1,
    attempts: 25,
    averageScore: 78.5,
    questions: [
      {
        id: 1,
        question: 'What is the value of x in the equation: 2x + 5 = 15?',
        type: 'multiple-choice',
        options: ['3', '5', '7', '10'],
        correctAnswer: '5',
        explanation: 'Solving: 2x + 5 = 15, 2x = 10, x = 5',
        points: 2,
        difficulty: 'easy'
      },
      {
        id: 2,
        question: 'Simplify: 3(x + 4) - 2x',
        type: 'multiple-choice',
        options: ['x + 12', 'x + 4', '5x + 12', '3x + 2'],
        correctAnswer: 'x + 12',
        explanation: '3(x + 4) - 2x = 3x + 12 - 2x = x + 12',
        points: 3,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 2,
    title: 'World War II History',
    description: 'Major events and outcomes of WWII',
    subject: 'History',
    category: 'World Wars',
    difficulty: 'hard',
    duration: 90,
    totalPoints: 30,
    passingScore: 70,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: false,
    showScoreImmediately: false,
    allowBackNavigation: false,
    requireProctoring: true,
    startDate: new Date('2024-02-01T09:00:00'),
    endDate: new Date('2024-02-15T23:59:59'),
    instructions: 'This is a comprehensive test on WWII. No external resources allowed.',
    tags: 'history, world war, events',
    status: 'scheduled',
    createdAt: new Date('2024-01-20T14:00:00'),
    updatedAt: new Date('2024-01-20T14:00:00'),
    facultyId: 2,
    attempts: 0,
    averageScore: 0,
    questions: [
      {
        id: 3,
        question: 'When did World War II officially begin?',
        type: 'multiple-choice',
        options: ['September 1, 1939', 'December 7, 1941', 'June 6, 1944', 'May 8, 1945'],
        correctAnswer: 'September 1, 1939',
        explanation: 'WWII began on September 1, 1939 when Germany invaded Poland',
        points: 2,
        difficulty: 'easy'
      }
    ]
  }
];

let questionBank = [
  {
    id: 1,
    question: 'What is the capital of France?',
    type: 'multiple-choice',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    explanation: 'Paris is the capital and largest city of France',
    subject: 'Geography',
    category: 'European Capitals',
    difficulty: 'easy',
    tags: 'geography, europe, capitals',
    points: 1,
    usageCount: 5,
    createdAt: new Date('2024-01-01T10:00:00'),
    facultyId: 1
  },
  {
    id: 2,
    question: 'What is photosynthesis?',
    type: 'short-answer',
    correctAnswer: 'The process by which plants convert light energy into chemical energy',
    explanation: 'Photosynthesis is the biological process where plants use sunlight, water, and CO2 to produce glucose and oxygen',
    subject: 'Science',
    category: 'Biology',
    difficulty: 'medium',
    tags: 'biology, plants, energy',
    points: 3,
    usageCount: 12,
    createdAt: new Date('2024-01-05T11:00:00'),
    facultyId: 1
  }
];

let quizAttempts = [
  {
    id: 1,
    quizId: 1,
    studentId: 'S001',
    studentName: 'John Smith',
    score: 85,
    status: 'completed',
    startTime: new Date('2024-01-16T10:00:00'),
    endTime: new Date('2024-01-16T10:45:00'),
    submittedAt: new Date('2024-01-16T10:45:00'),
    answers: [
      {
        questionId: 1,
        question: 'What is the value of x in the equation: 2x + 5 = 15?',
        studentAnswer: '5',
        correctAnswer: '5',
        isCorrect: true,
        points: 2
      },
      {
        questionId: 2,
        question: 'Simplify: 3(x + 4) - 2x',
        studentAnswer: 'x + 12',
        correctAnswer: 'x + 12',
        isCorrect: true,
        points: 3
      }
    ]
  },
  {
    id: 2,
    quizId: 1,
    studentId: 'S002',
    studentName: 'Sarah Johnson',
    score: 65,
    status: 'completed',
    startTime: new Date('2024-01-17T14:00:00'),
    endTime: new Date('2024-01-17T14:50:00'),
    submittedAt: new Date('2024-01-17T14:50:00'),
    answers: [
      {
        questionId: 1,
        question: 'What is the value of x in the equation: 2x + 5 = 15?',
        studentAnswer: '3',
        correctAnswer: '5',
        isCorrect: false,
        points: 0
      },
      {
        questionId: 2,
        question: 'Simplify: 3(x + 4) - 2x',
        studentAnswer: 'x + 12',
        correctAnswer: 'x + 12',
        isCorrect: true,
        points: 3
      }
    ]
  }
];

// ============ QUIZ MANAGEMENT ROUTES ============

// Get all quizzes with filtering
router.get('/quizzes', auth, (req, res) => {
  try {
    const { status, subject, difficulty } = req.query;
    let filteredQuizzes = [...quizzes];

    if (status) {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.status === status);
    }
    
    if (subject) {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.subject === subject);
    }
    
    if (difficulty) {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.difficulty === difficulty);
    }

    res.json(filteredQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get single quiz
router.get('/quizzes/:id', auth, (req, res) => {
  try {
    const quiz = quizzes.find(q => q.id === parseInt(req.params.id));
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Create new quiz
router.post('/quizzes', auth, (req, res) => {
  try {
    const newQuiz = {
      id: quizzes.length + 1,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      facultyId: req.user.id,
      attempts: 0,
      averageScore: 0
    };
    
    quizzes.push(newQuiz);
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Update quiz
router.put('/quizzes/:id', auth, (req, res) => {
  try {
    const quizIndex = quizzes.findIndex(q => q.id === parseInt(req.params.id));
    if (quizIndex === -1) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    quizzes[quizIndex] = {
      ...quizzes[quizIndex],
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json(quizzes[quizIndex]);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// Delete quiz
router.delete('/quizzes/:id', auth, (req, res) => {
  try {
    const quizIndex = quizzes.findIndex(q => q.id === parseInt(req.params.id));
    if (quizIndex === -1) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    quizzes.splice(quizIndex, 1);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// Duplicate quiz
router.post('/quizzes/:id/duplicate', auth, (req, res) => {
  try {
    const quiz = quizzes.find(q => q.id === parseInt(req.params.id));
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const duplicatedQuiz = {
      ...quiz,
      id: quizzes.length + 1,
      title: req.body.title || `${quiz.title} (Copy)`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      attempts: 0,
      averageScore: 0
    };
    
    quizzes.push(duplicatedQuiz);
    res.status(201).json(duplicatedQuiz);
  } catch (error) {
    console.error('Error duplicating quiz:', error);
    res.status(500).json({ error: 'Failed to duplicate quiz' });
  }
});

// ============ QUIZ ANALYTICS ROUTES ============

// Get quiz analytics
router.get('/quizzes/:id/analytics', auth, (req, res) => {
  try {
    const { timeRange = 'all' } = req.query;
    const quizId = parseInt(req.params.id);
    
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const attempts = quizAttempts.filter(a => a.quizId === quizId);
    
    // Calculate analytics
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.status === 'completed').length;
    const averageScore = totalAttempts > 0 
      ? attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts 
      : 0;
    
    const passRate = totalAttempts > 0 
      ? (attempts.filter(a => a.score >= quiz.passingScore).length / totalAttempts) * 100 
      : 0;
    
    // Score distribution
    const scoreDistribution = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
    attempts.forEach(attempt => {
      const score = attempt.score;
      if (score <= 20) scoreDistribution[0]++;
      else if (score <= 40) scoreDistribution[1]++;
      else if (score <= 60) scoreDistribution[2]++;
      else if (score <= 80) scoreDistribution[3]++;
      else scoreDistribution[4]++;
    });
    
    // Question analysis
    const questionAnalysis = quiz.questions.map((question, index) => {
      const correctAnswers = attempts.reduce((count, attempt) => {
        const answer = attempt.answers.find(a => a.questionId === question.id);
        return count + (answer && answer.isCorrect ? 1 : 0);
      }, 0);
      
      return {
        questionNumber: index + 1,
        questionId: question.id,
        question: question.question,
        correctPercentage: totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0,
        totalResponses: totalAttempts
      };
    });
    
    // Mock trends data
    const attemptsTrend = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [5, 8, 12, 15]
    };
    
    const analytics = {
      totalAttempts,
      completedAttempts,
      inProgressAttempts: 0,
      notAttemptedCount: 0,
      averageScore: Math.round(averageScore * 10) / 10,
      passRate: Math.round(passRate * 10) / 10,
      completionRate: totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0,
      averageTimeSpent: '45m',
      maxTimeSpent: '60m',
      scoreDistribution,
      questionAnalysis,
      attemptsTrend,
      scoreTrend: { change: 5.2 },
      attemptsTrend: { change: 12.5 }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching quiz analytics:', error);
    res.status(500).json({ error: 'Failed to fetch quiz analytics' });
  }
});

// Get quiz attempts
router.get('/quizzes/:id/attempts', auth, (req, res) => {
  try {
    const quizId = parseInt(req.params.id);
    const attempts = quizAttempts.filter(a => a.quizId === quizId);
    res.json(attempts);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
});

// Export quiz results
router.get('/quizzes/:id/export', auth, (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const quizId = parseInt(req.params.id);
    
    const quiz = quizzes.find(q => q.id === quizId);
    const attempts = quizAttempts.filter(a => a.quizId === quizId);
    
    if (format === 'csv') {
      let csvContent = 'Student Name,Student ID,Score,Status,Start Time,End Time,Time Spent\n';
      
      attempts.forEach(attempt => {
        const timeSpent = new Date(attempt.endTime) - new Date(attempt.startTime);
        const minutes = Math.floor(timeSpent / 60000);
        csvContent += `${attempt.studentName},${attempt.studentId},${attempt.score}%,${attempt.status},${attempt.startTime},${attempt.endTime},${minutes}m\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=quiz-${quizId}-results.csv`);
      res.send(csvContent);
    } else {
      res.json({ quiz, attempts });
    }
  } catch (error) {
    console.error('Error exporting quiz results:', error);
    res.status(500).json({ error: 'Failed to export quiz results' });
  }
});

// Get general faculty analytics
router.get('/faculty/quiz-analytics', auth, (req, res) => {
  try {
    const facultyQuizzes = quizzes.filter(q => q.facultyId === req.user.id);
    const totalQuizzes = facultyQuizzes.length;
    const totalAttempts = quizAttempts.length;
    const averageScore = totalAttempts > 0 
      ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts 
      : 0;
    
    res.json({
      totalQuizzes,
      totalAttempts,
      averageScore: Math.round(averageScore * 10) / 10,
      recentQuizzes: facultyQuizzes.slice(-5)
    });
  } catch (error) {
    console.error('Error fetching faculty analytics:', error);
    res.status(500).json({ error: 'Failed to fetch faculty analytics' });
  }
});

module.exports = router;
