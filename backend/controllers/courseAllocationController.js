const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Get all courses with allocation details
 */
const getAllocatedCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.facultyId) filter.facultyId = req.query.facultyId;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.section) filter.section = req.query.section;

    const courses = await Course.findAll({
      where: filter,
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['id', 'firstName', 'lastName', 'email', 'department']
        }
      ],
      order: [['academicYear', 'DESC'], ['semester', 'ASC'], ['name', 'ASC']],
      offset: skip,
      limit: limit
    });

    // Get enrollment counts for each course
    const coursesWithEnrollments = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.count({
          where: { 
            courseId: course.id,
            status: ['active', 'completed']
          }
        });

        return {
          ...course.toJSON(),
          enrollmentCount,
          availableSlots: course.maxCapacity - enrollmentCount
        };
      })
    );

    const total = await Course.count({ where: filter });

    res.json({
      success: true,
      data: coursesWithEnrollments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error getting allocated courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving course allocations',
      error: error.message
    });
  }
};

/**
 * Assign faculty to course
 */
const assignFacultytoCourse = async (req, res) => {
  try {
    const { courseId, facultyId } = req.body;

    // Validate course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validate faculty exists
    const faculty = await Faculty.findByPk(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Check for scheduling conflicts
    const conflictingCourses = await Course.findAll({
      where: {
        facultyId: facultyId,
        academicYear: course.academicYear,
        semester: course.semester,
        id: { [Op.ne]: courseId }
      }
    });

    // Parse schedule to check for time conflicts
    const newSchedule = course.schedule;
    const conflicts = [];

    for (const existingCourse of conflictingCourses) {
      const existingSchedule = existingCourse.schedule;
      
      // Check if schedules overlap
      if (schedulesOverlap(newSchedule, existingSchedule)) {
        conflicts.push({
          courseId: existingCourse.id,
          courseName: existingCourse.name,
          courseCode: existingCourse.code
        });
      }
    }

    if (conflicts.length > 0 && !req.body.forceAssign) {
      return res.status(400).json({
        success: false,
        message: 'Schedule conflicts detected',
        conflicts: conflicts
      });
    }

    // Assign faculty to course
    await course.update({ facultyId: facultyId });

    const updatedCourse = await Course.findByPk(courseId, {
      include: [
        {
          model: Faculty,
          as: 'faculty',
          attributes: ['id', 'firstName', 'lastName', 'email', 'department']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Faculty assigned to course successfully',
      data: updatedCourse
    });

  } catch (error) {
    console.error('Error assigning faculty to course:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning faculty to course',
      error: error.message
    });
  }
};

/**
 * Bulk assign faculty to multiple courses
 */
const bulkAssignFaculty = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { assignments, forceAssign = false } = req.body;
    // assignments: [{ courseId, facultyId }, ...]

    const results = {
      successful: [],
      failed: [],
      conflicts: []
    };

    for (const assignment of assignments) {
      try {
        const { courseId, facultyId } = assignment;

        const course = await Course.findByPk(courseId, { transaction });
        const faculty = await Faculty.findByPk(facultyId, { transaction });

        if (!course || !faculty) {
          results.failed.push({
            courseId,
            facultyId,
            reason: !course ? 'Course not found' : 'Faculty not found'
          });
          continue;
        }

        // Check conflicts unless forcing
        if (!forceAssign) {
          const conflictingCourses = await Course.findAll({
            where: {
              facultyId: facultyId,
              academicYear: course.academicYear,
              semester: course.semester,
              id: { [Op.ne]: courseId }
            },
            transaction
          });

          const conflicts = [];
          for (const existingCourse of conflictingCourses) {
            if (schedulesOverlap(course.schedule, existingCourse.schedule)) {
              conflicts.push({
                courseId: existingCourse.id,
                courseName: existingCourse.name,
                courseCode: existingCourse.code
              });
            }
          }

          if (conflicts.length > 0) {
            results.conflicts.push({
              courseId,
              facultyId,
              conflicts
            });
            continue;
          }
        }

        await course.update({ facultyId }, { transaction });
        results.successful.push({
          courseId,
          facultyId,
          courseName: course.name,
          courseCode: course.code,
          facultyName: `${faculty.firstName} ${faculty.lastName}`
        });

      } catch (error) {
        results.failed.push({
          courseId: assignment.courseId,
          facultyId: assignment.facultyId,
          reason: error.message
        });
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Bulk faculty assignment completed',
      data: results
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error in bulk faculty assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk faculty assignment',
      error: error.message
    });
  }
};

/**
 * Bulk enroll students in courses
 */
const bulkEnrollStudents = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { enrollments, forceEnroll = false } = req.body;
    // enrollments: [{ studentId, courseId }, ...]

    const results = {
      successful: [],
      failed: [],
      conflicts: []
    };

    for (const enrollment of enrollments) {
      try {
        const { studentId, courseId } = enrollment;

        const student = await Student.findByPk(studentId, { transaction });
        const course = await Course.findByPk(courseId, { transaction });

        if (!student || !course) {
          results.failed.push({
            studentId,
            courseId,
            reason: !student ? 'Student not found' : 'Course not found'
          });
          continue;
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
          where: { studentId, courseId },
          transaction
        });

        if (existingEnrollment) {
          results.failed.push({
            studentId,
            courseId,
            reason: 'Student already enrolled in this course'
          });
          continue;
        }

        // Check course capacity
        const currentEnrollments = await Enrollment.count({
          where: { 
            courseId,
            status: ['active', 'completed']
          },
          transaction
        });

        if (!forceEnroll && currentEnrollments >= course.maxCapacity) {
          results.conflicts.push({
            studentId,
            courseId,
            reason: 'Course at maximum capacity',
            currentEnrollments,
            maxCapacity: course.maxCapacity
          });
          continue;
        }

        // Create enrollment
        await Enrollment.create({
          studentId,
          courseId,
          enrollmentDate: new Date(),
          status: 'active'
        }, { transaction });

        results.successful.push({
          studentId,
          courseId,
          studentName: `${student.firstName} ${student.lastName}`,
          studentRollNumber: student.rollNumber,
          courseName: course.name,
          courseCode: course.code
        });

      } catch (error) {
        results.failed.push({
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          reason: error.message
        });
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Bulk student enrollment completed',
      data: results
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error in bulk student enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk student enrollment',
      error: error.message
    });
  }
};

/**
 * Get allocation statistics
 */
const getAllocationStats = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;

    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    // Course statistics
    const totalCourses = await Course.count({ where: filter });
    const assignedCourses = await Course.count({ 
      where: { 
        ...filter,
        facultyId: { [Op.ne]: null }
      } 
    });
    const unassignedCourses = totalCourses - assignedCourses;

    // Enrollment statistics
    const totalEnrollments = await Enrollment.count({
      include: [{
        model: Course,
        where: filter
      }]
    });

    const totalCapacity = await Course.sum('maxCapacity', { where: filter });
    const utilizationRate = totalCapacity ? (totalEnrollments / totalCapacity * 100).toFixed(2) : 0;

    // Faculty workload
    const facultyWorkload = await Course.findAll({
      where: {
        ...filter,
        facultyId: { [Op.ne]: null }
      },
      attributes: [
        'facultyId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'courseCount']
      ],
      include: [{
        model: Faculty,
        as: 'faculty',
        attributes: ['firstName', 'lastName', 'department']
      }],
      group: ['facultyId', 'faculty.id'],
      order: [[sequelize.literal('courseCount'), 'DESC']]
    });

    res.json({
      success: true,
      data: {
        courses: {
          total: totalCourses,
          assigned: assignedCourses,
          unassigned: unassignedCourses,
          assignmentRate: totalCourses ? (assignedCourses / totalCourses * 100).toFixed(2) : 0
        },
        enrollments: {
          total: totalEnrollments,
          capacity: totalCapacity,
          utilizationRate
        },
        facultyWorkload
      }
    });

  } catch (error) {
    console.error('Error getting allocation statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving allocation statistics',
      error: error.message
    });
  }
};

/**
 * Helper function to check if schedules overlap
 */
function schedulesOverlap(schedule1, schedule2) {
  if (!schedule1 || !schedule2 || !schedule1.days || !schedule2.days) {
    return false;
  }

  // Check if any days overlap
  const days1 = Array.isArray(schedule1.days) ? schedule1.days : [];
  const days2 = Array.isArray(schedule2.days) ? schedule2.days : [];
  
  const daysOverlap = days1.some(day => days2.includes(day));
  
  if (!daysOverlap) {
    return false;
  }

  // Check if times overlap
  if (!schedule1.time || !schedule2.time) {
    return false;
  }

  // Parse time ranges (format: "HH:MM AM/PM - HH:MM AM/PM")
  const parseTimeRange = (timeStr) => {
    const parts = timeStr.split(' - ');
    if (parts.length !== 2) return null;
    
    const start = parseTime(parts[0]);
    const end = parseTime(parts[1]);
    
    return start && end ? { start, end } : null;
  };

  const parseTime = (timeStr) => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes; // Convert to minutes
  };

  const time1 = parseTimeRange(schedule1.time);
  const time2 = parseTimeRange(schedule2.time);

  if (!time1 || !time2) {
    return false;
  }

  // Check if time ranges overlap
  return time1.start < time2.end && time2.start < time1.end;
}

module.exports = {
  getAllocatedCourses,
  assignFacultytoCourse,
  bulkAssignFaculty,
  bulkEnrollStudents,
  getAllocationStats
};
