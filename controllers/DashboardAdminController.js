const User = require("../models/user");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");

exports.getAdminDashboardData = async (req, res) => {
  try {
    // Verify if the user is an Admin
    if (req.user.role !== "admin") {
      return res.status(403).send("Permission denied");
    }

    // Count total users
    const totalUsers = await User.countDocuments();

    // Count total courses
    const totalCourses = await Course.countDocuments();

    // Count total enrollments
    const totalEnrollments = await Enrollment.countDocuments();

    // Get latest 5 registered users

    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username email role");

    // get 5 latest courses with average

    // Existing code
    const latestCourses = await Course.find()
      .sort({ creationDate: -1 })
      .limit(5)
      .select(
        "title thumbnail description authorId creationDate ratingAverage"
      );

    // Get latest 5 enrollment requests
    const latestEnrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate(
        "courseId",
        "title thumbnail description authorId creationDate ratingAverage"
      )
      .populate("studentId", "username email");

    // Compile dashboard data
    const dashboardData = {
      totalUsers,
      totalCourses,
      totalEnrollments,
      latestUsers,
      latestCourses,
      latestEnrollments,
    };

    // Send dashboard data
    res.status(200).send(dashboardData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
