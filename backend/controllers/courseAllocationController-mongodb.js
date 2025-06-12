const mongoose = require('mongoose');
const { Faculty, Student, Course, Enrollment } = require('../models/mongodb-models');

/**
 * Get all courses with allocation details - MongoDB version
 */
const getAllocatedCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;    // Build filter
    const filter = {};
    if (req.query.faculty) filter.faculty = req.query.faculty;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.section) filter.section = req.query.section;

    const courses = await Course.find(filter)
      .populate('faculty', 'firstName lastName email department')
      .sort({ createdAt: -1, title: 1 })
      .skip(skip)
      .limit(limit);

    // Get enrollment counts for each course
    const coursesWithEnrollments = await Promise.all(
      courses.map(async (course) => {        const enrollmentCount = await Enrollment.countDocuments({
          courseId: course._id,
          status: { $in: ['active', 'completed'] }
        });

        return {
          ...course.toObject(),
          enrollmentCount,
          availableSlots: course.maxStudents ? course.maxStudents - enrollmentCount : null
        };
      })
    );

    const totalCourses = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: coursesWithEnrollments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        totalItems: totalCourses,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching allocated courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allocated courses',
      error: error.message
    });
  }
};

/**
 * Assign faculty to a course - MongoDB version
 */
const assignFacultytoCourse = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { courseId, facultyId, scheduleData } = req.body;

      // Validate course exists
      const course = await Course.findById(courseId).session(session);
      if (!course) {
        throw new Error('Course not found');
      }

      // Validate faculty exists
      const faculty = await Faculty.findById(facultyId).session(session);
      if (!faculty) {
        throw new Error('Faculty not found');
      }

      // Check for schedule conflicts
      const conflicts = await checkScheduleConflicts(facultyId, scheduleData, courseId, session);
      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Schedule conflicts detected',
          conflicts: conflicts
        });
      }

      // Update course with faculty assignment
      course.facultyId = facultyId;
      if (scheduleData) {
        course.schedule = scheduleData;
      }
      course.lastModified = new Date();

      await course.save({ session });

      await session.commitTransaction();

      // Populate faculty details for response
      await course.populate('facultyId', 'firstName lastName email department');

      res.json({
        success: true,
        message: 'Faculty assigned to course successfully',
        data: course
      });
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error assigning faculty to course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign faculty to course'
    });
  } finally {
    session.endSession();
  }
};

/**
 * Bulk assign faculty to multiple courses - MongoDB version
 */
const bulkAssignFaculty = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { assignments, conflictResolution = 'abort' } = req.body;
      const results = [];
      const conflicts = [];

      // Validate all assignments first
      for (const assignment of assignments) {
        const { courseId, facultyId, scheduleData } = assignment;

        const course = await Course.findById(courseId).session(session);
        if (!course) {
          results.push({
            courseId,
            status: 'error',
            message: 'Course not found'
          });
          continue;
        }

        const faculty = await Faculty.findById(facultyId).session(session);
        if (!faculty) {
          results.push({
            courseId,
            status: 'error',
            message: 'Faculty not found'
          });
          continue;
        }

        // Check for conflicts
        const courseConflicts = await checkScheduleConflicts(facultyId, scheduleData, courseId, session);
        if (courseConflicts.length > 0) {
          conflicts.push({
            courseId,
            facultyId,
            conflicts: courseConflicts
          });

          if (conflictResolution === 'abort') {
            results.push({
              courseId,
              status: 'conflict',
              message: 'Schedule conflict detected',
              conflicts: courseConflicts
            });
            continue;
          }
        }

        results.push({
          courseId,
          facultyId,
          status: 'pending',
          course: course.name,
          faculty: `${faculty.firstName} ${faculty.lastName}`
        });
      }

      // If aborting on conflicts, don't proceed with any assignments
      if (conflictResolution === 'abort' && conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Schedule conflicts detected. No assignments were made.',
          results: results,
          conflicts: conflicts
        });
      }

      // Perform assignments
      for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        const result = results[i];

        if (result.status === 'pending') {
          try {
            const course = await Course.findById(assignment.courseId).session(session);
            course.facultyId = assignment.facultyId;
            if (assignment.scheduleData) {
              course.schedule = assignment.scheduleData;
            }
            course.lastModified = new Date();

            await course.save({ session });

            result.status = 'success';
            result.message = 'Faculty assigned successfully';
          } catch (error) {
            result.status = 'error';
            result.message = error.message;
          }
        }
      }

      const summary = {
        total: assignments.length,
        successful: results.filter(r => r.status === 'success').length,
        errors: results.filter(r => r.status === 'error').length,
        conflicts: conflicts.length
      };

      res.json({
        success: true,
        message: 'Bulk assignment completed',
        results: results,
        conflicts: conflicts,
        summary: summary
      });
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in bulk faculty assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk assignment',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Bulk enroll students in courses - MongoDB version
 */
const bulkEnrollStudents = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { enrollments } = req.body;
      const results = [];

      for (const enrollment of enrollments) {
        const { studentId, courseId } = enrollment;

        try {
          // Check if student exists
          const student = await Student.findById(studentId).session(session);
          if (!student) {
            results.push({
              studentId,
              courseId,
              status: 'error',
              message: 'Student not found'
            });
            continue;
          }

          // Check if course exists
          const course = await Course.findById(courseId).session(session);
          if (!course) {
            results.push({
              studentId,
              courseId,
              status: 'error',
              message: 'Course not found'
            });
            continue;
          }

          // Check if already enrolled
          const existingEnrollment = await Enrollment.findOne({
            studentId,
            courseId,
            status: { $in: ['active', 'completed'] }
          }).session(session);

          if (existingEnrollment) {
            results.push({
              studentId,
              courseId,
              status: 'conflict',
              message: 'Student already enrolled in this course'
            });
            continue;
          }

          // Check course capacity
          const enrollmentCount = await Enrollment.countDocuments({
            courseId,
            status: { $in: ['active', 'completed'] }
          }).session(session);

          if (course.maxCapacity && enrollmentCount >= course.maxCapacity) {
            results.push({
              studentId,
              courseId,
              status: 'error',
              message: 'Course capacity exceeded'
            });
            continue;
          }

          // Create enrollment
          const newEnrollment = new Enrollment({
            studentId,
            courseId,
            enrollmentDate: new Date(),
            status: 'active',
            academicYear: course.academicYear,
            semester: course.semester
          });

          await newEnrollment.save({ session });

          results.push({
            studentId,
            courseId,
            status: 'success',
            message: 'Successfully enrolled',
            studentName: `${student.firstName} ${student.lastName}`,
            courseName: course.name
          });

        } catch (error) {
          results.push({
            studentId,
            courseId,
            status: 'error',
            message: error.message
          });
        }
      }

      const summary = {
        total: enrollments.length,
        successful: results.filter(r => r.status === 'success').length,
        conflicts: results.filter(r => r.status === 'conflict').length,
        errors: results.filter(r => r.status === 'error').length
      };

      res.json({
        success: true,
        message: 'Bulk enrollment completed',
        results: results,
        summary: summary
      });
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in bulk student enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk enrollment',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get allocation statistics - MongoDB version
 */
const getAllocationStats = async (req, res) => {
  try {
    const filter = {};
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.semester) filter.semester = req.query.semester;

    const [
      totalCourses,
      assignedCourses,
      totalFaculty,
      activeFaculty,
      totalStudents,
      enrolledStudents
    ] = await Promise.all([
      Course.countDocuments(filter),
      Course.countDocuments({ ...filter, facultyId: { $ne: null } }),
      Faculty.countDocuments({ status: 'active' }),
      Course.distinct('facultyId', { ...filter, facultyId: { $ne: null } }).then(ids => ids.length),
      Student.countDocuments({ status: 'active' }),
      Enrollment.distinct('studentId', { status: { $in: ['active', 'completed'] } }).then(ids => ids.length)
    ]);

    const stats = {
      courses: {
        total: totalCourses,
        assigned: assignedCourses,
        unassigned: totalCourses - assignedCourses,
        assignmentRate: totalCourses > 0 ? Math.round((assignedCourses / totalCourses) * 100) : 0
      },
      faculty: {
        total: totalFaculty,
        active: activeFaculty,
        available: totalFaculty - activeFaculty,
        utilizationRate: totalFaculty > 0 ? Math.round((activeFaculty / totalFaculty) * 100) : 0
      },
      students: {
        total: totalStudents,
        enrolled: enrolledStudents,
        notEnrolled: totalStudents - enrolledStudents,
        enrollmentRate: totalStudents > 0 ? Math.round((enrolledStudents / totalStudents) * 100) : 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching allocation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allocation statistics',
      error: error.message
    });
  }
};

/**
 * Check for schedule conflicts - MongoDB version
 */
const checkScheduleConflicts = async (facultyId, scheduleData, excludeCourseId = null, session = null) => {
  try {
    if (!scheduleData || !scheduleData.timeSlots) {
      return [];
    }

    const filter = {
      facultyId: facultyId,
      'schedule.timeSlots': { $exists: true }
    };

    if (excludeCourseId) {
      filter._id = { $ne: excludeCourseId };
    }

    const conflictingCourses = await Course.find(filter, null, { session });
    const conflicts = [];

    for (const course of conflictingCourses) {
      if (course.schedule && course.schedule.timeSlots) {
        for (const newSlot of scheduleData.timeSlots) {
          for (const existingSlot of course.schedule.timeSlots) {
            if (isTimeSlotConflict(newSlot, existingSlot)) {
              conflicts.push({
                courseId: course._id,
                courseName: course.name,
                conflictType: 'time_overlap',
                existingSlot: existingSlot,
                newSlot: newSlot
              });
            }
          }
        }
      }
    }

    return conflicts;
  } catch (error) {
    console.error('Error checking schedule conflicts:', error);
    return [];
  }
};

/**
 * Check if two time slots conflict
 */
const isTimeSlotConflict = (slot1, slot2) => {
  // Check if they're on the same day
  if (slot1.day !== slot2.day) {
    return false;
  }

  // Convert times to minutes for easier comparison
  const start1 = timeToMinutes(slot1.startTime);
  const end1 = timeToMinutes(slot1.endTime);
  const start2 = timeToMinutes(slot2.startTime);
  const end2 = timeToMinutes(slot2.endTime);

  // Check for overlap
  return start1 < end2 && end1 > start2;
};

/**
 * Convert time string to minutes
 */
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

module.exports = {
  getAllocatedCourses,
  assignFacultytoCourse,
  bulkAssignFaculty,
  bulkEnrollStudents,
  getAllocationStats
};
