const Enrollment = require("../models/enrollment");
const Course = require("../models/course");
const Progress = require("../models/progress"); // Assumes a model to track course progress

exports.getStudentDashboardData = async (req, res) => {
  try {
    // Verify if the user is a Student
    if (req.user.role !== "student") {
      return res.status(403).send("Permission denied");
    }

    const enrolledCourses = await Enrollment.find({
      studentId: req.user.id,
    }).populate(
      "courseId",
      "title thumbnail description authorId creationDate ratingAverage"
    );

    // Count total enrolled courses
    const totalEnrolledCourses = enrolledCourses.length;

    // Fetch latest 5 progress records
    const latestProgress = await Progress.find({ studentId: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate(
        "courseId",
        "title thumbnail description authorId creationDate "
      );

    // Compile dashboard data
    const dashboardData = {
      studentId: req.user.id,
      totalEnrolledCourses,
      enrolledCourses,
      latestProgress,
    };

    // Send dashboard data
    res.status(200).send(dashboardData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
