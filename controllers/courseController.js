const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const LearningPath = require("../models/learningpath");
const Progress = require("../models/progress");

exports.listCourses = async (req, res) => {
  try {
    // Optional query parameters for search term, sorting, and order
    const { searchTerm, sortBy, order } = req.query;

    // Build the query object
    let queryObj = {};

    // Handle search term if it exists
    if (searchTerm) {
      queryObj.title = new RegExp(searchTerm, "i");
    }

    // Execute the query and handle sorting if it exists
    let query = Course.find(
      queryObj,
      "title description thumbnail authorId creationDate ratingAverage"
    );

    if (sortBy) {
      const sortOrder = order === "desc" ? -1 : 1;
      query = query.sort({ [sortBy]: sortOrder });
    }

    const courses = await query.exec();

    res.status(200).send(courses);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.createCourse = async (req, res) => {
  const { title, thumbnail, description, authorId, creationDate } = req.body;

  try {
    const newCourse = new Course({
      title,
      thumbnail,
      description,
      authorId,
      creationDate,
    });
    await newCourse.save();
    res.status(201).json({ message: "succes", newCourse });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the course" });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, thumbnail, description, authorId } = req.body;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { title, thumbnail, description, authorId },
      { new: true }
    );
    res.status(200).json({ message: "succes", updatedCourse });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the course" });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Delete all enrollments related to this course
    await Enrollment.deleteMany({ courseId: id });

    // Remove this course from all learning paths
    await LearningPath.updateMany({ courses: id }, { $pull: { courses: id } });

    // Delete all progress records related to this course
    await Progress.deleteMany({ courseId: id });

    // Delete the course itself
    await Course.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Course and related records deleted successfully" });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    res
      .status(500)
      .json({ error: "An error occurred while deleting the course" });
  }
};

// author
exports.listOwnCourses = async (req, res) => {
  try {
    const authorId = req.user.id; // Assuming userId is set in middleware
    const { searchTerm, sortBy } = req.query;

    // Build the query object
    let queryObj = { authorId };

    // Handle search term if it exists
    if (searchTerm) {
      queryObj.title = new RegExp(searchTerm, "i");
    }

    // Execute the query and handle sorting if it exists
    let query = Course.find(
      queryObj,
      "title description thumbnail creationDate reviews"
    );
    if (sortBy) {
      const sortOrder = order === "desc" ? -1 : 1;
      query = query.sort({ [sortBy]: sortOrder });
    }

    const courses = await query.exec();

    res.status(200).send(courses);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.createOwnCourse = async (req, res) => {
  const { title, thumbnail, description } = req.body;

  const authorId = req.user.id;

  try {
    const newCourse = new Course({
      title,
      thumbnail,
      description,
      authorId,
      creationDate: new Date(),
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the course" });
  }
};

exports.updateOwnCourse = async (req, res) => {
  const { id } = req.params;
  const { title, thumbnail, description } = req.body;

  const authorId = req.user.id;

  try {
    const course = await Course.findOne({ _id: id, authorId });

    if (!course) return res.status(403).json({ error: "Permission denied" });

    course.title = title;
    course.thumbnail = thumbnail;
    course.description = description;
    await course.save();
    res.status(200).json(course);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the course" });
  }
};

// Delete course
exports.deleteOwnCourse = async (req, res) => {
  const { id } = req.params;
  const authorId = req.user.id;

  try {
    const course = await Course.findOneAndDelete({ _id: id, authorId });

    if (!course) return res.status(403).json({ error: "Permission denied" });

    // Delete all enrollments related to this course
    await Enrollment.deleteMany({ courseId: id });

    // Remove this course from all learning paths
    await LearningPath.updateMany({ courses: id }, { $pull: { courses: id } });

    // Delete all progress records related to this course
    await Progress.deleteMany({ courseId: id });

    res
      .status(200)
      .json({ message: "Course and related records deleted successfully" });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    res
      .status(500)
      .json({ error: "An error occurred while deleting the course" });
  }
};

// khusus student

exports.addReview = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { studentId, rating, review } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).send("Course not found.");
    }

    course.reviews.push({
      studentId,
      rating,
      review,
    });

    // Update average rating
    const totalRatings = course.reviews.reduce(
      (acc, curr) => acc + curr.rating,
      0
    );
    course.ratingAverage = totalRatings / course.reviews.length;

    await course.save();
    res.status(201).send("Review added and average rating updated.");
  } catch (err) {
    console.error("Error:", err); // Log the error for debugging
    res.status(500).send(err.message);
  }
};
