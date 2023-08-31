const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

exports.createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).send(course);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.listCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(200).send(courses);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.updateOwnedCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, authorId: req.body.authorId },
      req.body,
      { new: true }
    );
    if (!course) {
      return res.status(404).send("Course not found or not owned by author");
    }
    res.status(200).send(course);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.deleteOwnedCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      authorId: req.body.authorId,
    });
    if (!course) {
      return res.status(404).send("Course not found or not owned by author");
    }
    res.status(200).send(course);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.listEnrollRequests = async (req, res) => {
  try {
    const enrollRequests = await Enrollment.find({
      courseId: req.body.courseId,
    });
    res.status(200).send(enrollRequests);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.acceptEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: req.params.requestId, status: "Pending" },
      { status: "Accepted" },
      { new: true }
    );
    if (!enrollment) {
      return res
        .status(404)
        .send("Enrollment request not found or not pending");
    }
    res.status(200).send("Enrollment accepted.");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.rejectEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: req.params.requestId, status: "Pending" },
      { status: "Rejected" },
      { new: true }
    );
    if (!enrollment) {
      return res
        .status(404)
        .send("Enrollment request not found or not pending");
    }
    res.status(200).send("Enrollment rejected.");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.updateProfile = async (req, res) => {
  // Assuming you have an Author model, you would update the author's profile here
  res.status(200).send("Profile updated.");
};
