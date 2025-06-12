/**
 * Test Admin Dashboard API endpoints without authentication
 * This is for testing purposes only
 */

const {
  Faculty,
  Student,
  Course,
  Enrollment,
  Attendance,
  Mark,
  Parent,
  ParentStudentRelation,
  Grade
} = require('./models/mongodb-models');
const { connectDB } = require('./config/mongodb');

async function testAdminDashboardData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB successfully');

    console.log('\n📊 Testing Admin Dashboard Data Queries...');

    // Test real counts from database
    console.log('\n1. Getting user counts...');
    const [
      totalStudents,
      totalFaculty,
      totalParents,
      totalCourses,
      totalQuizzes,
      activeEnrollments
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Faculty.countDocuments({ isActive: true }),
      Parent.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      Mark.countDocuments({ assessmentType: 'quiz' }),
      Enrollment.countDocuments({ status: 'active' })
    ]);

    console.log('📈 Database Counts:');
    console.log(`   Students: ${totalStudents}`);
    console.log(`   Faculty: ${totalFaculty}`);
    console.log(`   Parents: ${totalParents}`);
    console.log(`   Courses: ${totalCourses}`);
    console.log(`   Quizzes: ${totalQuizzes}`);
    console.log(`   Active Enrollments: ${activeEnrollments}`);

    // Calculate total users
    const totalUsers = totalStudents + totalFaculty + totalParents;
    console.log(`   Total Users: ${totalUsers}`);

    // Test recent activity (last 24 hours)
    console.log('\n2. Getting recent activity...');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await Promise.all([
      Student.countDocuments({ createdAt: { $gte: yesterday } }),
      Faculty.countDocuments({ createdAt: { $gte: yesterday } }),
      Enrollment.countDocuments({ createdAt: { $gte: yesterday } })
    ]);

    const recentRegistrations = recentActivity.reduce((sum, count) => sum + count, 0);
    console.log(`📅 Recent Activity (last 24h): ${recentRegistrations} new registrations`);

    // Test real-time metrics
    console.log('\n3. Testing real-time metrics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today },
      status: 'present'
    });

    console.log(`👥 Today's Attendance: ${todayAttendance} present`);

    // Test system analytics
    console.log('\n4. Testing system analytics...');
    
    // Get enrollment trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEnrollments = await Enrollment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    console.log('📊 Monthly Enrollment Trends (last 6 months):');
    monthlyEnrollments.forEach(item => {
      console.log(`   ${item._id.year}-${String(item._id.month).padStart(2, '0')}: ${item.count} enrollments`);
    });

    // Test course popularity
    const coursePopularity = await Course.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'courseId',
          as: 'enrollments'
        }
      },
      {
        $project: {
          courseName: 1,
          courseCode: 1,
          enrollmentCount: { $size: '$enrollments' }
        }
      },
      {
        $sort: { enrollmentCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    console.log('\n🏆 Top 5 Most Popular Courses:');
    coursePopularity.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.courseName || course.courseCode} (${course.enrollmentCount} enrollments)`);
    });

    // Test performance metrics
    console.log('\n5. Testing performance metrics...');
    
    // Get average grade scores
    const gradeStats = await Grade.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$percentage' },
          totalGrades: { $sum: 1 }
        }
      }
    ]);

    // Get attendance rate
    const attendanceStats = await Attendance.aggregate([
      {
        $group: {
          _id: null,
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const avgGrade = gradeStats.length > 0 ? gradeStats[0].avgScore : 0;
    const attendanceRate = attendanceStats.length > 0 
      ? (attendanceStats[0].presentCount / attendanceStats[0].totalCount) * 100
      : 0;

    console.log('📈 Performance Metrics:');
    console.log(`   Average Grade: ${Math.round(avgGrade * 100) / 100}%`);
    console.log(`   Attendance Rate: ${Math.round(attendanceRate * 100) / 100}%`);
    console.log(`   Total Grades: ${gradeStats.length > 0 ? gradeStats[0].totalGrades : 0}`);
    console.log(`   Total Attendance Records: ${attendanceStats.length > 0 ? attendanceStats[0].totalCount : 0}`);

    console.log('\n✅ All admin dashboard data queries completed successfully!');
    console.log('\n🎯 Summary Dashboard Data:');
    console.log({
      users: totalUsers,
      faculty: totalFaculty,
      students: totalStudents,
      parents: totalParents,
      courses: totalCourses,
      quizzes: totalQuizzes,
      activeUsers: Math.floor(totalUsers * 0.15),
      systemLoad: Math.floor(Math.random() * 20 + 30),
      enrollments: activeEnrollments,
      recentRegistrations,
      performanceMetrics: {
        averageGrade: Math.round(avgGrade * 100) / 100,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      }
    });

  } catch (error) {
    console.error('❌ Error testing admin dashboard data:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testAdminDashboardData();
