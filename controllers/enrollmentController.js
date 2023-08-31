const Course = require("../models/course");
const User = require("../models/user");
const Enrollment = require("../models/enrollment");
const LearningPath = require("../models/learningpath");
const Progress = require("../models/progress");

exports.listEnrollRequests = async (req, res) => {
  const authorId = req.user.id;

  try {
    // Fetch all course IDs created by this author
    const courses = await Course.find({ authorId }, "_id");
    const courseIds = courses.map((course) => course._id);

    // Fetch all pending enrollments for these courses
    const enrollments = await Enrollment.find({
      status: "pending",
      courseId: { $in: courseIds },
    }).populate("courseId", "title description thumbnail averageRating");

    res.status(200).json(enrollments);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching enroll requests" });
  }
};

exports.updateEnrollmentStatus = async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).send("Invalid status.");
  }

  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: req.params.requestId, status: "pending" },
      { status },
      { new: true }
    );

    console.log(enrollment);

    if (!enrollment) {
      return res
        .status(404)
        .send("Enrollment request not found or not pending.");
    }

    res.status(200).send(`Enrollment ${status.toLowerCase()}.`);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// studnet

exports.sendEnrollRequest = async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.id;

  try {
    const newEnrollment = new Enrollment({
      courseId,
      studentId,
      status: "pending",
    });
    await newEnrollment.save();
    res.status(201).json(newEnrollment);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while sending the enroll request" });
  }
};

exports.readEnrolledCourseContent = async (req, res) => {
  const studentId = req.user.id;

  try {
    const enrollments = await Enrollment.find({
      studentId,
      status: "accepted",
    }).populate(
      "courseId",
      "title description thumbnail authorId creationDate ratingAverage"
    ); // populate to fetch full course data

    if (enrollments.length === 0) {
      return res.status(403).json({
        error:
          "Not enrolled in any courses or no enrollments have been accepted",
      });
    }

    // Extract just the course information from the enrollments
    const courses = enrollments.map((enrollment) => enrollment.courseId);

    res.status(200).json(courses);
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    res
      .status(500)
      .json({ error: "An error occurred while fetching the course content" });
  }
};

exports.unenrollCourse = async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.id;
  try {
    // Unenroll the student from the course by deleting the enrollment record
    const deletedEnrollment = await Enrollment.findOneAndDelete({
      courseId,
      studentId,
    });

    if (!deletedEnrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Delete the student's progress record for this course
    await Progress.findOneAndDelete({ courseId, studentId });

    res.status(200).json({
      message:
        "Successfully unenrolled from the course and related records deleted",
    });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    res
      .status(500)
      .json({ error: "An error occurred while unenrolling from the course" });
  }
};
