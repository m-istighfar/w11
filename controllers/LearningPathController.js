// controllers/LearningPathController.js
const LearningPath = require("../models/learningpath");
const Course = require("../models/course");

// Create a new learning path
exports.createLearningPath = async (req, res) => {
  try {
    // Admin or Author can create
    if (["admin"].includes(req.user.role)) {
      const { title, description, courses } = req.body;

      // const createdBy = req.user.id;

      const newLearningPath = new LearningPath({
        title,
        description,
        courses,
        // createdBy,
      });

      await newLearningPath.save();

      res.status(201).send({ message: " succes ", newLearningPath });
    } else {
      res.status(403).send("Permission denied");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// List all learning paths
exports.listLearningPaths = async (req, res) => {
  try {
    // All roles can view
    const learningPaths = await LearningPath.find().populate(
      "courses",
      "title thumbnail description authorId creationDate"
    );
    res.status(200).send(learningPaths);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Update an existing learning path cuma admin
exports.updateLearningPath = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, courses } = req.body;

    const learningPath = await LearningPath.findById(id);
    if (!learningPath) {
      return res.status(404).send("Learning path not found");
    }

    learningPath.title = title;
    learningPath.description = description;
    learningPath.courses = courses;

    await learningPath.save();

    res.status(200).send({ message: " succes ", learningPath });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Delete a learning path
exports.deleteLearningPath = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id);

    const learningPath = await LearningPath.findById(id);
    // populate("createdBy");

    console.log(learningPath);

    if (!learningPath) {
      return res.status(404).send("Learning path not found");
    }

    await LearningPath.deleteOne({ _id: id });
    res.status(200).send("Learning path deleted successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Add a course to an existing learning path
exports.addCourseToPath = async (req, res) => {
  try {
    const { pathId, courseId } = req.body;

    const learningPath = await LearningPath.findById(pathId).populate();

    if (!learningPath) {
      return res.status(404).send("Learning path not found");
    }

    // Assuming 'author' is the role that can only add their own course
    if (req.user.role === "author") {
      // Check if the author owns the course
      const course = await Course.findById(courseId);
      if (!course || course.author !== req.user._id) {
        return res.status(403).send("You can only add your own courses");
      }
    }

    learningPath.courses.push(courseId);
    await learningPath.save();
    res.status(200).send(learningPath);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.deleteCourseFromPath = async (req, res) => {
  try {
    const { pathId, courseId } = req.params;

    const learningPath = await LearningPath.findById(pathId);

    if (!learningPath) {
      return res.status(404).send("Learning path not found");
    }

    if (req.user.role === "author") {
      return res
        .status(403)
        .send("You don't have permission to delete courses");
    }

    const index = learningPath.courses.indexOf(courseId);
    if (index > -1) {
      learningPath.courses.splice(index, 1);
    } else {
      return res.status(404).send("Course not found in the learning path");
    }

    await learningPath.save();
    res.status(200).send("Course deleted from learning path successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};
